"""
Compliance Checker API - FastAPI Backend
Multi-layer LLM-based compliance analysis for NCA and NIST frameworks
"""
import os
import uuid
import asyncio
from datetime import datetime
from pathlib import Path
from typing import List, Optional, Dict, Any

from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from backend.config import UPLOAD_DIR, ALLOWED_EXTENSIONS
from backend.document_processor import document_processor
from backend.vector_store import vector_store
from backend.analyzer import compliance_analyzer
from backend.chatbot import compliance_chatbot


# ============================================================================
# Pydantic Models
# ============================================================================

class EvaluationRequest(BaseModel):
    """Request model for starting an evaluation"""
    job_id: str = Field(..., description="Job ID from file upload")
    frameworks: List[str] = Field(
        default=["nca_en"],
        description="Frameworks to evaluate against"
    )
    max_controls: Optional[int] = Field(
        default=None,
        description="Limit controls to evaluate (for testing)"
    )


class SingleControlRequest(BaseModel):
    """Request for single control evaluation"""
    document_text: str = Field(..., description="Document text to analyze")
    framework: str = Field(..., description="Framework ID")
    control_id: str = Field(..., description="Control ID")


class ChatbotMessageRequest(BaseModel):
    """Request for chatbot message"""
    message: str = Field(..., description="User message")
    job_id: str = Field(..., description="Job ID with completed compliance results")
    session_id: Optional[str] = Field(default="default", description="Session ID for conversation history")
    language: Optional[str] = Field(default="en", description="Response language: 'en' for English, 'ar' for Arabic")


class ControlImprovementRequest(BaseModel):
    """Request for control improvement recommendations"""
    job_id: str = Field(..., description="Job ID with completed compliance results")
    control_id: str = Field(..., description="Control ID to get improvements for")
    framework_id: str = Field(..., description="Framework ID")
    session_id: Optional[str] = Field(default="default", description="Session ID")
    language: Optional[str] = Field(default="en", description="Response language: 'en' for English, 'ar' for Arabic")


class PriorityImprovementsRequest(BaseModel):
    """Request for priority improvements plan"""
    job_id: str = Field(..., description="Job ID with completed compliance results")
    session_id: Optional[str] = Field(default="default", description="Session ID")
    language: Optional[str] = Field(default="en", description="Response language: 'en' for English, 'ar' for Arabic")


class ProgressUpdate(BaseModel):
    """Progress update during evaluation"""
    job_id: str
    status: str
    framework: Optional[str] = None
    current_control: Optional[int] = None
    total_controls: Optional[int] = None
    control_id: Optional[str] = None
    percentage: Optional[float] = None


# ============================================================================
# Application Setup
# ============================================================================

app = FastAPI(
    title="Compliance Checker API",
    description="""
    A multi-layer LLM-based compliance checking system.
    
    Features:
    - Document upload (PDF, DOCX, TXT)
    - Multi-framework compliance analysis (NCA Arabic/English, NIST)
    - Percentage-based scoring per control
    - Detailed recommendations for improvement
    - 3-layer LLM evaluation for accuracy
    """,
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for job status and results
# In production, use Redis or a database
job_storage: Dict[str, Dict[str, Any]] = {}


# ============================================================================
# Startup Events
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """Initialize components on startup"""
    print("=" * 60)
    print("COMPLIANCE CHECKER API")
    print("=" * 60)
    
    # Ensure upload directory exists
    Path(UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
    
    # Initialize vector stores
    try:
        vector_store.load_all()
        print(f"Loaded frameworks: {list(vector_store.indexes.keys())}")
    except Exception as e:
        print(f"Warning: Could not load vector stores: {e}")
    
    print("API ready!")
    print("=" * 60)


# ============================================================================
# API Endpoints
# ============================================================================

@app.get("/")
async def root():
    """API health check"""
    return {
        "status": "healthy",
        "message": "Compliance Checker API is running",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }


@app.get("/api/frameworks")
async def list_frameworks():
    """List available compliance frameworks"""
    frameworks = []
    
    framework_info = {
        "nca_en": {
            "id": "nca_en",
            "name": "NCA Essential Cybersecurity Controls",
            "name_full": "National Cybersecurity Authority Essential Cybersecurity Controls",
            "language": "English",
            "country": "Saudi Arabia",
            "version": "1.0"
        },
        "nca_ar": {
            "id": "nca_ar",
            "name": "الضوابط الأساسية للأمن السيبراني",
            "name_full": "الضوابط الأساسية للأمن السيبراني - الهيئة الوطنية للأمن السيبراني",
            "language": "Arabic",
            "country": "Saudi Arabia",
            "version": "1.0"
        },
        "nist_en": {
            "id": "nist_en",
            "name": "NIST Cybersecurity Framework",
            "name_full": "NIST Cybersecurity Framework (CSF)",
            "language": "English",
            "country": "USA",
            "version": "2.0"
        }
    }
    
    for fw_id in vector_store.indexes.keys():
        info = framework_info.get(fw_id, {
            "id": fw_id,
            "name": fw_id.upper(),
            "language": "Unknown"
        })
        
        # Add control count
        controls = vector_store.get_all_controls(fw_id)
        info["control_count"] = len(controls)
        
        frameworks.append(info)
    
    return {
        "frameworks": frameworks,
        "total": len(frameworks)
    }


@app.get("/api/frameworks/{framework_id}")
async def get_framework_details(framework_id: str):
    """Get detailed information about a framework"""
    if framework_id not in vector_store.indexes:
        raise HTTPException(
            status_code=404,
            detail=f"Framework '{framework_id}' not found"
        )
    
    structure = vector_store.get_framework_structure(framework_id)
    controls = vector_store.get_all_controls(framework_id)
    
    return {
        "framework_id": framework_id,
        "total_controls": len(controls),
        "structure": structure,
        "controls": controls
    }


@app.get("/api/controls/{framework_id}")
async def get_framework_controls(framework_id: str):
    """Get all controls for a framework"""
    if framework_id not in vector_store.indexes:
        raise HTTPException(
            status_code=404,
            detail=f"Framework '{framework_id}' not found"
        )
    
    controls = vector_store.get_all_controls(framework_id)
    
    return {
        "framework_id": framework_id,
        "total_controls": len(controls),
        "controls": controls
    }


@app.post("/api/upload")
async def upload_document(file: UploadFile = File(...)):
    """
    Upload a compliance document for analysis
    
    Supported formats: PDF, DOCX, TXT
    """
    # Validate file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Generate job ID
    job_id = str(uuid.uuid4())
    
    # Save file
    try:
        file_path = await document_processor.save_upload(file, file.filename)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save file: {str(e)}"
        )
    
    # Extract text
    try:
        text = document_processor.extract_text(file_path)
        char_count = len(text)
        word_count = len(text.split())
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to extract text from document: {str(e)}"
        )
    
    # Store job info
    job_storage[job_id] = {
        "job_id": job_id,
        "status": "uploaded",
        "filename": file.filename,
        "file_path": str(file_path),
        "char_count": char_count,
        "word_count": word_count,
        "created_at": datetime.utcnow().isoformat(),
        "results": None,
        "progress": None
    }
    
    return {
        "job_id": job_id,
        "filename": file.filename,
        "status": "uploaded",
        "document_info": {
            "char_count": char_count,
            "word_count": word_count
        },
        "message": "Document uploaded successfully. Use /api/evaluate to start analysis."
    }


@app.post("/api/evaluate")
async def start_evaluation(
    request: EvaluationRequest,
    background_tasks: BackgroundTasks
):
    """
    Start compliance evaluation for an uploaded document
    
    This runs asynchronously in the background. Poll /api/jobs/{job_id} for status.
    """
    job_id = request.job_id
    
    # Validate job exists
    if job_id not in job_storage:
        raise HTTPException(
            status_code=404,
            detail=f"Job '{job_id}' not found. Upload a document first."
        )
    
    job = job_storage[job_id]
    
    # Check job status
    if job["status"] == "processing":
        raise HTTPException(
            status_code=400,
            detail="Evaluation already in progress"
        )
    
    if job["status"] == "completed":
        return {
            "job_id": job_id,
            "status": "completed",
            "message": "Evaluation already completed. Use /api/results/{job_id} to get results."
        }
    
    # Validate frameworks
    for fw in request.frameworks:
        if fw not in vector_store.indexes:
            raise HTTPException(
                status_code=400,
                detail=f"Framework '{fw}' not available. Use /api/frameworks to list available frameworks."
            )
    
    # Update job status
    job["status"] = "processing"
    job["frameworks"] = request.frameworks
    job["started_at"] = datetime.utcnow().isoformat()
    
    # Start background evaluation
    background_tasks.add_task(
        run_evaluation,
        job_id,
        Path(job["file_path"]),
        request.frameworks,
        request.max_controls
    )
    
    return {
        "job_id": job_id,
        "status": "processing",
        "frameworks": request.frameworks,
        "message": "Evaluation started. Poll /api/jobs/{job_id} for progress."
    }


async def run_evaluation(
    job_id: str,
    file_path: Path,
    frameworks: List[str],
    max_controls: Optional[int] = None
):
    """Background task to run compliance evaluation"""
    job = job_storage.get(job_id)
    if not job:
        return
    
    def progress_callback(framework, current, total, control_id):
        job["progress"] = {
            "framework": framework,
            "current_control": current,
            "total_controls": total,
            "control_id": control_id,
            "percentage": round((current / total) * 100, 1)
        }
    
    try:
        results = await compliance_analyzer.analyze_document(
            file_path=file_path,
            frameworks=frameworks,
            max_controls=max_controls,
            progress_callback=progress_callback
        )
        
        job["status"] = "completed"
        job["completed_at"] = datetime.utcnow().isoformat()
        job["results"] = results
        
    except Exception as e:
        job["status"] = "failed"
        job["error"] = str(e)
        job["failed_at"] = datetime.utcnow().isoformat()


@app.get("/api/jobs/{job_id}")
async def get_job_status(job_id: str):
    """Get status and progress of an evaluation job"""
    if job_id not in job_storage:
        raise HTTPException(
            status_code=404,
            detail=f"Job '{job_id}' not found"
        )
    
    job = job_storage[job_id]
    
    return {
        "job_id": job_id,
        "status": job["status"],
        "filename": job["filename"],
        "progress": job.get("progress"),
        "created_at": job["created_at"],
        "started_at": job.get("started_at"),
        "completed_at": job.get("completed_at"),
        "error": job.get("error")
    }


@app.get("/api/results/{job_id}")
async def get_results(job_id: str):
    """Get evaluation results for a completed job"""
    if job_id not in job_storage:
        raise HTTPException(
            status_code=404,
            detail=f"Job '{job_id}' not found"
        )
    
    job = job_storage[job_id]
    
    if job["status"] != "completed":
        raise HTTPException(
            status_code=400,
            detail=f"Job not completed. Current status: {job['status']}"
        )
    
    return {
        "job_id": job_id,
        "status": "completed",
        "document_info": job["results"]["document_info"],
        "summary": job["results"]["summary"],
        "frameworks": job["results"]["frameworks"]
    }


@app.get("/api/results/{job_id}/summary")
async def get_results_summary(job_id: str):
    """Get summary of evaluation results"""
    if job_id not in job_storage:
        raise HTTPException(
            status_code=404,
            detail=f"Job '{job_id}' not found"
        )
    
    job = job_storage[job_id]
    
    if job["status"] != "completed":
        raise HTTPException(
            status_code=400,
            detail=f"Job not completed. Current status: {job['status']}"
        )
    
    return {
        "job_id": job_id,
        "summary": job["results"]["summary"]
    }


@app.get("/api/results/{job_id}/framework/{framework_id}")
async def get_framework_results(job_id: str, framework_id: str):
    """Get results for a specific framework"""
    if job_id not in job_storage:
        raise HTTPException(
            status_code=404,
            detail=f"Job '{job_id}' not found"
        )
    
    job = job_storage[job_id]
    
    if job["status"] != "completed":
        raise HTTPException(
            status_code=400,
            detail=f"Job not completed. Current status: {job['status']}"
        )
    
    frameworks = job["results"]["frameworks"]
    
    if framework_id not in frameworks:
        raise HTTPException(
            status_code=404,
            detail=f"Framework '{framework_id}' not found in results"
        )
    
    return {
        "job_id": job_id,
        "framework": framework_id,
        "results": frameworks[framework_id]
    }


@app.get("/api/results/{job_id}/control/{framework_id}/{control_id}")
async def get_control_result(job_id: str, framework_id: str, control_id: str):
    """Get result for a specific control"""
    if job_id not in job_storage:
        raise HTTPException(
            status_code=404,
            detail=f"Job '{job_id}' not found"
        )
    
    job = job_storage[job_id]
    
    if job["status"] != "completed":
        raise HTTPException(
            status_code=400,
            detail=f"Job not completed. Current status: {job['status']}"
        )
    
    frameworks = job["results"]["frameworks"]
    
    if framework_id not in frameworks:
        raise HTTPException(
            status_code=404,
            detail=f"Framework '{framework_id}' not found"
        )
    
    controls = frameworks[framework_id].get("controls", [])
    
    for control in controls:
        if control.get("control_id") == control_id:
            return {
                "job_id": job_id,
                "framework": framework_id,
                "control": control
            }
    
    raise HTTPException(
        status_code=404,
        detail=f"Control '{control_id}' not found"
    )


@app.post("/api/evaluate-single")
async def evaluate_single_control(request: SingleControlRequest):
    """
    Evaluate document against a single control
    
    Useful for testing or re-evaluating specific controls
    """
    if not compliance_analyzer.evaluator:
        raise HTTPException(
            status_code=503,
            detail="LLM evaluator not available. Set GROQ_API_KEY."
        )
    
    if request.framework not in vector_store.indexes:
        raise HTTPException(
            status_code=404,
            detail=f"Framework '{request.framework}' not found"
        )
    
    result = await compliance_analyzer.analyze_single_control(
        document_text=request.document_text,
        framework=request.framework,
        control_id=request.control_id
    )
    
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    
    return result


@app.delete("/api/jobs/{job_id}")
async def delete_job(job_id: str):
    """Delete a job and its associated files"""
    if job_id not in job_storage:
        raise HTTPException(
            status_code=404,
            detail=f"Job '{job_id}' not found"
        )
    
    job = job_storage[job_id]
    
    # Delete file
    try:
        file_path = Path(job["file_path"])
        if file_path.exists():
            file_path.unlink()
    except Exception:
        pass
    
    # Remove from storage
    del job_storage[job_id]
    
    return {"message": f"Job '{job_id}' deleted successfully"}


# ============================================================================
# Chatbot Endpoints
# ============================================================================

@app.post("/api/chatbot/chat")
async def chatbot_chat(request: ChatbotMessageRequest):
    """
    Chat with the compliance improvement assistant.
    
    The chatbot uses RAG with implementation guidelines to provide
    specific recommendations based on the compliance report.
    """
    job_id = request.job_id
    
    # Validate job exists and is completed
    if job_id not in job_storage:
        raise HTTPException(
            status_code=404,
            detail=f"Job '{job_id}' not found"
        )
    
    job = job_storage[job_id]
    
    if job["status"] != "completed":
        raise HTTPException(
            status_code=400,
            detail=f"Job not completed. Current status: {job['status']}"
        )
    
    try:
        result = await compliance_chatbot.chat(
            message=request.message,
            report_context=job["results"],
            session_id=request.session_id or "default",
            language=request.language or "en"
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Chatbot error: {str(e)}"
        )


@app.post("/api/chatbot/improve-control")
async def get_control_improvement(request: ControlImprovementRequest):
    """
    Get specific improvement recommendations for a control.
    
    Uses the compliance result and implementation guidelines to provide
    actionable steps to improve the control's compliance score.
    """
    job_id = request.job_id
    
    # Validate job exists and is completed
    if job_id not in job_storage:
        raise HTTPException(
            status_code=404,
            detail=f"Job '{job_id}' not found"
        )
    
    job = job_storage[job_id]
    
    if job["status"] != "completed":
        raise HTTPException(
            status_code=400,
            detail=f"Job not completed. Current status: {job['status']}"
        )
    
    # Find the control in results
    results = job["results"]
    control = None
    
    frameworks = results.get("frameworks", {})
    if request.framework_id in frameworks:
        structure = frameworks[request.framework_id].get("structure", {})
        for domain_id, domain in structure.items():
            subdomains = domain.get("subdomains", domain.get("categories", {}))
            for sub_id, sub in subdomains.items():
                for c in sub.get("controls", []):
                    if c.get("control_id") == request.control_id:
                        control = c
                        break
                if control:
                    break
            if control:
                break
    
    if not control:
        raise HTTPException(
            status_code=404,
            detail=f"Control '{request.control_id}' not found in framework '{request.framework_id}'"
        )
    
    try:
        result = await compliance_chatbot.get_improvement_recommendations(
            control=control,
            session_id=request.session_id or "default",
            language=request.language or "en"
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error getting improvements: {str(e)}"
        )


@app.post("/api/chatbot/priority-plan")
async def get_priority_improvements(request: PriorityImprovementsRequest):
    """
    Get a prioritized improvement plan for the entire report.
    
    Analyzes all low-scoring controls and creates a strategic
    improvement roadmap with quick wins and long-term recommendations.
    """
    job_id = request.job_id
    
    # Validate job exists and is completed
    if job_id not in job_storage:
        raise HTTPException(
            status_code=404,
            detail=f"Job '{job_id}' not found"
        )
    
    job = job_storage[job_id]
    
    if job["status"] != "completed":
        raise HTTPException(
            status_code=400,
            detail=f"Job not completed. Current status: {job['status']}"
        )
    
    try:
        result = await compliance_chatbot.get_priority_improvements(
            report_context=job["results"],
            session_id=request.session_id or "default",
            language=request.language or "en"
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error getting priority plan: {str(e)}"
        )


@app.get("/api/chatbot/report-summary/{job_id}")
async def get_report_for_chatbot(job_id: str):
    """
    Get a summary of the compliance report for the chatbot interface.
    
    Returns key metrics and low-scoring controls for display.
    """
    if job_id not in job_storage:
        raise HTTPException(
            status_code=404,
            detail=f"Job '{job_id}' not found"
        )
    
    job = job_storage[job_id]
    
    if job["status"] != "completed":
        raise HTTPException(
            status_code=400,
            detail=f"Job not completed. Current status: {job['status']}"
        )
    
    results = job["results"]
    summary = results.get("summary", {})
    
    # Get all controls with their scores
    all_controls = []
    frameworks = results.get("frameworks", {})
    
    for fw_id, fw_data in frameworks.items():
        structure = fw_data.get("structure", {})
        for domain_id, domain in structure.items():
            subdomains = domain.get("subdomains", domain.get("categories", {}))
            for sub_id, sub in subdomains.items():
                for control in sub.get("controls", []):
                    all_controls.append({
                        "control_id": control.get("control_id"),
                        "control_text": control.get("control_text", "")[:200],
                        "final_score": control.get("final_score", 0),
                        "compliance_status": control.get("compliance_status"),
                        "score_justification": control.get("score_justification", ""),
                        "framework": fw_id,
                        "domain": domain.get("name", domain_id),
                        "subdomain": sub.get("name", sub_id)
                    })
    
    # Sort by score (lowest first)
    all_controls.sort(key=lambda x: x.get("final_score", 100))
    
    # Categorize
    critical = [c for c in all_controls if c.get("final_score", 100) < 25]
    poor = [c for c in all_controls if 25 <= c.get("final_score", 100) < 50]
    fair = [c for c in all_controls if 50 <= c.get("final_score", 100) < 75]
    good = [c for c in all_controls if c.get("final_score", 100) >= 75]
    
    return {
        "job_id": job_id,
        "filename": job.get("filename"),
        "summary": {
            "overall_score": summary.get("overall_score", 0),
            "total_controls": summary.get("total_controls_evaluated", 0),
            "score_distribution": summary.get("score_distribution", {}),
            "critical_count": len(critical),
            "poor_count": len(poor),
            "fair_count": len(fair),
            "good_count": len(good)
        },
        "controls": {
            "critical": critical[:10],
            "poor": poor[:10],
            "all": all_controls
        }
    }


# ============================================================================
# Error Handlers
# ============================================================================

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "detail": str(exc)
        }
    )


# ============================================================================
# Main
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
