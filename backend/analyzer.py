"""
Compliance Analyzer - Main RAG pipeline orchestrator
"""
import asyncio
from typing import List, Dict, Any, Optional
from pathlib import Path

from backend.vector_store import vector_store
from backend.document_processor import document_processor
from backend.evaluator import MultiLayerEvaluator
from backend.config import GROQ_API_KEY, RAG_CONFIG


class ComplianceAnalyzer:
    """
    Main orchestrator for compliance analysis
    Combines document processing, vector search, and multi-layer LLM evaluation
    """
    
    def __init__(self):
        self.vector_store = vector_store
        self.evaluator = None
        self._initialized = False
    
    def initialize(self):
        """Initialize all components"""
        if self._initialized:
            return
        
        print("Initializing Compliance Analyzer...")
        
        # Load vector stores
        self.vector_store.load_all()
        
        # Initialize evaluator
        if GROQ_API_KEY:
            self.evaluator = MultiLayerEvaluator()
        else:
            print("WARNING: GROQ_API_KEY not set. LLM evaluation will be disabled.")
        
        self._initialized = True
        print("Compliance Analyzer ready!")
    
    async def analyze_document(
        self,
        file_path: Path,
        frameworks: List[str] = None,
        max_controls: int = None,
        progress_callback: callable = None
    ) -> Dict[str, Any]:
        """
        Analyze a document against compliance frameworks
        
        Args:
            file_path: Path to the uploaded document
            frameworks: List of frameworks to check (default: all)
            max_controls: Limit number of controls to evaluate (for testing)
            progress_callback: Optional callback for progress updates
        
        Returns:
            Complete analysis results
        """
        if not self._initialized:
            self.initialize()
        
        # Extract text from document
        document_text = document_processor.extract_text(file_path)
        document_chunks = document_processor.chunk_text(document_text)
        
        # Determine frameworks to analyze
        if frameworks is None:
            frameworks = list(self.vector_store.indexes.keys())
        
        results = {
            "document_info": {
                "filename": file_path.name,
                "total_chars": len(document_text),
                "total_chunks": len(document_chunks)
            },
            "frameworks": {},
            "summary": {}
        }
        
        for framework in frameworks:
            framework_result = await self._analyze_framework(
                document_text,
                document_chunks,
                framework,
                max_controls,
                progress_callback
            )
            results["frameworks"][framework] = framework_result
        
        # Generate summary
        results["summary"] = self._generate_summary(results["frameworks"])
        
        return results
    
    async def _analyze_framework(
        self,
        document_text: str,
        document_chunks: List[Dict],
        framework: str,
        max_controls: int = None,
        progress_callback: callable = None
    ) -> Dict[str, Any]:
        """Analyze document against a single framework"""
        
        # Get all controls for this framework
        all_controls = self.vector_store.get_all_controls(framework)
        
        if max_controls:
            all_controls = all_controls[:max_controls]
        
        total_controls = len(all_controls)
        evaluated_controls = []
        
        # Evaluate each control
        for i, control in enumerate(all_controls):
            if progress_callback:
                progress_callback(framework, i + 1, total_controls, control.get("meta", {}).get("control_id"))
            
            # Find relevant document sections for this control
            relevant_chunks = self._find_relevant_chunks(
                control.get("text", ""),
                document_chunks
            )
            
            # Evaluate the control
            if self.evaluator:
                evaluation = await self.evaluator.evaluate_control(
                    document_text,
                    control,
                    relevant_chunks
                )
            else:
                # Mock evaluation when no LLM available
                evaluation = self._mock_evaluation(control)
            
            evaluated_controls.append(evaluation)
            
            # Small delay to avoid rate limiting
            await asyncio.sleep(0.1)
        
        # Calculate framework statistics
        stats = self._calculate_framework_stats(evaluated_controls)
        
        return {
            "framework": framework,
            "total_controls": total_controls,
            "controls": evaluated_controls,
            "statistics": stats,
            "structure": self._organize_by_structure(framework, evaluated_controls)
        }
    
    def _find_relevant_chunks(
        self,
        control_text: str,
        document_chunks: List[Dict],
        top_k: int = 5
    ) -> List[str]:
        """Find document chunks most relevant to a control"""
        # Simple keyword-based relevance for now
        # In production, you could use the embedding model for semantic search
        
        control_words = set(control_text.lower().split())
        
        scored_chunks = []
        for chunk in document_chunks:
            chunk_text = chunk.get("text", "")
            chunk_words = set(chunk_text.lower().split())
            
            # Calculate word overlap
            overlap = len(control_words & chunk_words)
            if overlap > 0:
                scored_chunks.append((overlap, chunk_text))
        
        # Sort by relevance and return top chunks
        scored_chunks.sort(key=lambda x: x[0], reverse=True)
        return [text for _, text in scored_chunks[:top_k]]
    
    def _mock_evaluation(self, control: Dict) -> Dict[str, Any]:
        """Mock evaluation when LLM is not available"""
        control_id = control.get("meta", {}).get("control_id", "unknown")
        return {
            "control_id": control_id,
            "control_text": control.get("text", ""),
            "control_meta": control.get("meta", {}),
            "final_score": 0,
            "compliance_status": "not_evaluated",
            "confidence": 0,
            "score_justification": "LLM evaluation not available. Set GROQ_API_KEY to enable.",
            "recommendations": [],
            "mock": True
        }
    
    def _calculate_framework_stats(
        self,
        evaluated_controls: List[Dict]
    ) -> Dict[str, Any]:
        """Calculate statistics for a framework"""
        total = len(evaluated_controls)
        if total == 0:
            return {"error": "No controls evaluated"}
        
        scores = [c.get("final_score", 0) for c in evaluated_controls]
        statuses = [c.get("compliance_status", "non_compliant") for c in evaluated_controls]
        
        status_counts = {}
        for status in statuses:
            status_counts[status] = status_counts.get(status, 0) + 1
        
        avg_score = sum(scores) / total if total > 0 else 0
        
        # Calculate by risk level
        risk_counts = {}
        for c in evaluated_controls:
            risk = c.get("risk_level", "unknown")
            risk_counts[risk] = risk_counts.get(risk, 0) + 1
        
        return {
            "total_controls": total,
            "average_score": round(avg_score, 1),
            "overall_compliance": self._score_to_percentage_label(avg_score),
            "status_breakdown": status_counts,
            "risk_breakdown": risk_counts,
            "fully_compliant_count": status_counts.get("fully_compliant", 0),
            "non_compliant_count": status_counts.get("non_compliant", 0),
            "needs_attention": sum(1 for s in scores if s < 50)
        }
    
    def _organize_by_structure(
        self,
        framework: str,
        evaluated_controls: List[Dict]
    ) -> Dict[str, Any]:
        """Organize evaluated controls by framework structure"""
        structure = {}
        
        for control in evaluated_controls:
            meta = control.get("control_meta", {})
            
            if framework.startswith("nca"):
                domain_id = meta.get("domain_id", "0")
                domain_name = meta.get("domain_name", "Unknown")
                subdomain_id = meta.get("subdomain_id", "0-0")
                subdomain_name = meta.get("subdomain_name", "Unknown")
                
                if domain_id not in structure:
                    structure[domain_id] = {
                        "name": domain_name,
                        "subdomains": {},
                        "avg_score": 0,
                        "control_count": 0
                    }
                
                if subdomain_id not in structure[domain_id]["subdomains"]:
                    structure[domain_id]["subdomains"][subdomain_id] = {
                        "name": subdomain_name,
                        "controls": [],
                        "avg_score": 0
                    }
                
                structure[domain_id]["subdomains"][subdomain_id]["controls"].append(control)
                
            elif framework.startswith("nist"):
                func_id = meta.get("function_id", "0")
                func_name = meta.get("function_name", "Unknown")
                cat_id = meta.get("category_id", "0-0")
                cat_name = meta.get("category_name", "Unknown")
                
                if func_id not in structure:
                    structure[func_id] = {
                        "name": func_name,
                        "categories": {},
                        "avg_score": 0,
                        "control_count": 0
                    }
                
                if cat_id not in structure[func_id]["categories"]:
                    structure[func_id]["categories"][cat_id] = {
                        "name": cat_name,
                        "controls": [],
                        "avg_score": 0
                    }
                
                structure[func_id]["categories"][cat_id]["controls"].append(control)
        
        # Calculate averages
        for domain_id, domain in structure.items():
            all_scores = []
            sub_key = "subdomains" if "subdomains" in domain else "categories"
            
            for sub_id, sub in domain.get(sub_key, {}).items():
                scores = [c.get("final_score", 0) for c in sub["controls"]]
                sub["avg_score"] = round(sum(scores) / len(scores), 1) if scores else 0
                all_scores.extend(scores)
            
            domain["avg_score"] = round(sum(all_scores) / len(all_scores), 1) if all_scores else 0
            domain["control_count"] = len(all_scores)
        
        return structure
    
    def _generate_summary(
        self,
        framework_results: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate overall summary across all frameworks"""
        all_scores = []
        all_recommendations = []
        critical_gaps = []
        
        for framework, result in framework_results.items():
            for control in result.get("controls", []):
                score = control.get("final_score", 0)
                all_scores.append(score)
                
                # Collect high-priority recommendations
                for rec in control.get("recommendations", []):
                    if rec.get("priority") in ["critical", "high"]:
                        rec["control_id"] = control.get("control_id")
                        rec["framework"] = framework
                        all_recommendations.append(rec)
                
                # Identify critical gaps
                if score < 25:
                    critical_gaps.append({
                        "control_id": control.get("control_id"),
                        "framework": framework,
                        "score": score,
                        "risk_level": control.get("risk_level", "unknown")
                    })
        
        avg_score = sum(all_scores) / len(all_scores) if all_scores else 0
        
        return {
            "overall_score": round(avg_score, 1),
            "overall_status": self._score_to_percentage_label(avg_score),
            "total_controls_evaluated": len(all_scores),
            "frameworks_analyzed": list(framework_results.keys()),
            "critical_gaps": critical_gaps[:10],  # Top 10 critical gaps
            "top_recommendations": sorted(
                all_recommendations,
                key=lambda x: {"critical": 0, "high": 1, "medium": 2, "low": 3}.get(x.get("priority"), 4)
            )[:15],  # Top 15 recommendations
            "score_distribution": {
                "excellent": sum(1 for s in all_scores if s >= 90),
                "good": sum(1 for s in all_scores if 75 <= s < 90),
                "fair": sum(1 for s in all_scores if 50 <= s < 75),
                "poor": sum(1 for s in all_scores if 25 <= s < 50),
                "critical": sum(1 for s in all_scores if s < 25)
            }
        }
    
    def _score_to_percentage_label(self, score: float) -> str:
        """Convert score to human-readable label"""
        if score >= 90:
            return "Excellent"
        elif score >= 75:
            return "Good"
        elif score >= 50:
            return "Fair"
        elif score >= 25:
            return "Poor"
        else:
            return "Critical"
    
    async def analyze_single_control(
        self,
        document_text: str,
        framework: str,
        control_id: str
    ) -> Dict[str, Any]:
        """Analyze document against a single specific control"""
        if not self._initialized:
            self.initialize()
        
        # Get the control
        control = self.vector_store.get_control_by_id(framework, control_id)
        if not control:
            return {"error": f"Control {control_id} not found in {framework}"}
        
        # Chunk the document
        document_chunks = document_processor.chunk_text(document_text)
        
        # Find relevant chunks
        relevant_chunks = self._find_relevant_chunks(
            control.get("text", ""),
            document_chunks
        )
        
        # Evaluate
        if self.evaluator:
            return await self.evaluator.evaluate_control(
                document_text,
                control,
                relevant_chunks
            )
        else:
            return self._mock_evaluation(control)


# Singleton instance
compliance_analyzer = ComplianceAnalyzer()
