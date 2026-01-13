import { supabase, TABLES } from '../config/supabase';

// Helper function to add timeout to any promise
const withTimeout = (promise, timeoutMs = 10000, errorMessage = 'Operation timed out') => {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    )
  ]);
};

// Generate a document fingerprint based on filename and size
const generateDocumentFingerprint = (filename) => {
  // Simple hash based on filename - in production, use actual file hash
  return btoa(filename).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
};

// Save a compliance report to Supabase
export const saveReport = async (userId, uploadData, results) => {
  console.log('=== saveReport called ===');
  
  try {
    // First verify we have an active session
    console.log('Checking session...');
    const { data: { session }, error: sessionError } = await withTimeout(
      supabase.auth.getSession(),
      5000,
      'Session check timed out'
    );
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      return { success: false, error: 'Session error: ' + sessionError.message };
    }
    
    console.log('Session status:', session ? 'Active' : 'None');
    
    if (!session) {
      return { success: false, error: 'No active session - please log in again' };
    }
    
    // Use the session user ID to ensure it matches
    const actualUserId = session.user.id;
    console.log('User ID:', actualUserId);
    
    const { job_id, filename } = uploadData;
    const { summary, frameworks } = results;
    
    // Create the report record
    const reportData = {
      user_id: actualUserId,
      job_id: job_id,
      filename: filename,
      overall_score: summary?.overall_score || 0,
      total_controls_evaluated: summary?.total_controls_evaluated || 0,
      frameworks: Object.keys(frameworks || {}),
      summary: summary,
      document_fingerprint: generateDocumentFingerprint(filename)
    };

    console.log('Inserting report...');

    const { data: report, error: reportError } = await withTimeout(
      supabase
        .from(TABLES.REPORTS)
        .insert(reportData)
        .select()
        .single(),
      15000,
      'Save timed out - please try again'
    );
    
    if (reportError) {
      console.error('Supabase insert error:', reportError);
      return { success: false, error: reportError.message };
    }
    
    console.log('Report saved successfully:', report?.id);

    // Extract and save individual control results in background
    const controlRecords = [];
    
    for (const [frameworkId, frameworkData] of Object.entries(frameworks || {})) {
      const structure = frameworkData.structure || {};
      
      for (const [domainId, domain] of Object.entries(structure)) {
        const subKey = domain.subdomains ? 'subdomains' : 'categories';
        
        for (const [subId, subdomain] of Object.entries(domain[subKey] || {})) {
          for (const control of (subdomain.controls || [])) {
            controlRecords.push({
              report_id: report.id,
              framework_id: frameworkId,
              control_id: control.control_id,
              control_text: control.control_text,
              final_score: control.final_score,
              compliance_status: control.compliance_status,
              score_justification: control.score_justification,
              layer_scores: control.layer_scores,
              recommendations: control.recommendations,
              risk_level: control.risk_level,
              domain_name: domain.name,
              subdomain_name: subdomain.name
            });
          }
        }
      }
    }

    // Insert controls in background (don't wait)
    if (controlRecords.length > 0) {
      (async () => {
        const batchSize = 100;
        for (let i = 0; i < controlRecords.length; i += batchSize) {
          const batch = controlRecords.slice(i, i + batchSize);
          try {
            await supabase.from(TABLES.REPORT_CONTROLS).insert(batch);
          } catch (err) {
            console.error('Error inserting controls batch:', err);
          }
        }
      })();
    }

    return { success: true, report };
    
  } catch (error) {
    console.error('Error saving report:', error);
    return { success: false, error: error.message || 'Failed to save report' };
  }
};

// Get all reports for a user
export const getUserReports = async (userId) => {
  try {
    console.log('Fetching reports for user:', userId);
    
    const { data, error } = await withTimeout(
      supabase
        .from(TABLES.REPORTS)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
      10000,
      'Fetch reports timed out'
    );

    if (error) {
      console.error('Supabase fetch error:', error);
      // If table doesn't exist, return empty array instead of error
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.log('Reports table does not exist yet.');
        return { success: true, reports: [] };
      }
      throw error;
    }
    
    console.log('Fetched reports:', data?.length || 0);
    return { success: true, reports: data || [] };
  } catch (error) {
    console.error('Error fetching reports:', error);
    // On timeout or error, return empty array so UI doesn't hang
    return { success: true, reports: [], error: error.message };
  }
};

// Get a single report with its controls
export const getReportDetails = async (reportId) => {
  try {
    // Get report with timeout
    const { data: report, error: reportError } = await withTimeout(
      supabase
        .from(TABLES.REPORTS)
        .select('*')
        .eq('id', reportId)
        .single(),
      10000,
      'Fetch report timed out'
    );

    if (reportError) throw reportError;

    // Get controls with timeout
    const { data: controls, error: controlsError } = await withTimeout(
      supabase
        .from(TABLES.REPORT_CONTROLS)
        .select('*')
        .eq('report_id', reportId)
        .order('control_id'),
      10000,
      'Fetch controls timed out'
    );

    if (controlsError) throw controlsError;

    return { success: true, report, controls };
  } catch (error) {
    console.error('Error fetching report details:', error);
    return { success: false, error: error.message };
  }
};

// Get reports for the same document (for comparison)
export const getRelatedReports = async (userId, documentFingerprint) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.REPORTS)
      .select('*')
      .eq('user_id', userId)
      .eq('document_fingerprint', documentFingerprint)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return { success: true, reports: data };
  } catch (error) {
    console.error('Error fetching related reports:', error);
    return { success: false, error: error.message };
  }
};

// Compare two reports
export const compareReports = async (reportId1, reportId2) => {
  try {
    // Get both reports with controls
    const [result1, result2] = await Promise.all([
      getReportDetails(reportId1),
      getReportDetails(reportId2)
    ]);

    if (!result1.success || !result2.success) {
      throw new Error('Failed to fetch reports for comparison');
    }

    // Build comparison data
    const controlsMap1 = new Map();
    const controlsMap2 = new Map();

    result1.controls.forEach(c => {
      controlsMap1.set(`${c.framework_id}:${c.control_id}`, c);
    });

    result2.controls.forEach(c => {
      controlsMap2.set(`${c.framework_id}:${c.control_id}`, c);
    });

    // Compare controls
    const comparison = [];
    const allKeys = new Set([...controlsMap1.keys(), ...controlsMap2.keys()]);

    for (const key of allKeys) {
      const control1 = controlsMap1.get(key);
      const control2 = controlsMap2.get(key);

      if (control1 && control2) {
        const scoreDiff = control2.final_score - control1.final_score;
        comparison.push({
          control_id: control1.control_id,
          framework_id: control1.framework_id,
          control_text: control1.control_text,
          score_before: control1.final_score,
          score_after: control2.final_score,
          score_diff: scoreDiff,
          improved: scoreDiff > 0,
          status_before: control1.compliance_status,
          status_after: control2.compliance_status
        });
      }
    }

    // Sort by improvement (biggest improvements first)
    comparison.sort((a, b) => b.score_diff - a.score_diff);

    // Calculate summary statistics
    const totalImproved = comparison.filter(c => c.score_diff > 0).length;
    const totalDeclined = comparison.filter(c => c.score_diff < 0).length;
    const totalUnchanged = comparison.filter(c => c.score_diff === 0).length;
    const avgImprovement = comparison.length > 0 
      ? comparison.reduce((sum, c) => sum + c.score_diff, 0) / comparison.length 
      : 0;

    return {
      success: true,
      comparison: {
        report1: result1.report,
        report2: result2.report,
        controls: comparison,
        summary: {
          total_controls: comparison.length,
          improved: totalImproved,
          declined: totalDeclined,
          unchanged: totalUnchanged,
          avg_improvement: avgImprovement.toFixed(2),
          overall_score_before: result1.report.overall_score,
          overall_score_after: result2.report.overall_score,
          overall_improvement: (result2.report.overall_score - result1.report.overall_score).toFixed(2)
        }
      }
    };
  } catch (error) {
    console.error('Error comparing reports:', error);
    return { success: false, error: error.message };
  }
};

// Delete a report
export const deleteReport = async (reportId) => {
  try {
    const { error } = await supabase
      .from(TABLES.REPORTS)
      .delete()
      .eq('id', reportId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting report:', error);
    return { success: false, error: error.message };
  }
};

// Get control history across reports for the same document
export const getControlHistory = async (userId, documentFingerprint, controlId, frameworkId) => {
  try {
    // Get all reports for this document
    const { data: reports, error: reportsError } = await supabase
      .from(TABLES.REPORTS)
      .select('id, created_at')
      .eq('user_id', userId)
      .eq('document_fingerprint', documentFingerprint)
      .order('created_at', { ascending: true });

    if (reportsError) throw reportsError;

    // Get control data for each report
    const reportIds = reports.map(r => r.id);
    
    const { data: controls, error: controlsError } = await supabase
      .from(TABLES.REPORT_CONTROLS)
      .select('*, compliance_reports!inner(created_at)')
      .in('report_id', reportIds)
      .eq('control_id', controlId)
      .eq('framework_id', frameworkId)
      .order('compliance_reports(created_at)', { ascending: true });

    if (controlsError) throw controlsError;

    return { success: true, history: controls };
  } catch (error) {
    console.error('Error fetching control history:', error);
    return { success: false, error: error.message };
  }
};
