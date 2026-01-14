"""
Compliance Improvement Chatbot - RAG-based assistant for improving compliance scores
Uses guidelines embeddings to provide specific improvement recommendations
"""
import json
import numpy as np
import faiss
from pathlib import Path
from typing import List, Dict, Any, Optional
from sentence_transformers import SentenceTransformer
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

try:
    from backend.config import GROQ_API_KEY, DATA_DIR
except ImportError:
    from config import GROQ_API_KEY, DATA_DIR


class GuidelinesRAG:
    """RAG system for retrieving implementation guidelines"""
    
    def __init__(self, shared_embedding_model=None):
        self.index = None
        self.chunks = []
        self.embeddings = None
        self.embedding_model = shared_embedding_model  # Use shared model if provided
        self._loaded = False
        
        # Paths for guidelines
        self.index_path = DATA_DIR / "faiss_en_guidelines.index"
        self.chunks_path = DATA_DIR / "chunks_en_guidelines.jsonl"
        self.embeddings_path = DATA_DIR / "embeddings_en_guidelines.npy"
    
    def load(self, shared_embedding_model=None):
        """Load the guidelines FAISS index and chunks"""
        if self._loaded:
            return
        
        # Use shared model if provided, otherwise load our own
        if shared_embedding_model:
            self.embedding_model = shared_embedding_model
            print("Using shared embedding model for guidelines...")
        elif self.embedding_model is None:
            print("Loading guidelines embedding model...")
            self.embedding_model = SentenceTransformer('BAAI/bge-m3')
        
        # Load FAISS index
        if self.index_path.exists():
            print("Loading guidelines FAISS index...")
            self.index = faiss.read_index(str(self.index_path))
        else:
            print(f"Warning: Guidelines index not found at {self.index_path}")
            return
        
        # Load chunks
        if self.chunks_path.exists():
            print("Loading guidelines chunks...")
            self.chunks = self._load_chunks(self.chunks_path)
        
        # Load embeddings
        if self.embeddings_path.exists():
            self.embeddings = np.load(str(self.embeddings_path))
        
        self._loaded = True
        print(f"Loaded {len(self.chunks)} guideline chunks")
    
    def _load_chunks(self, path: Path) -> List[Dict]:
        """Load chunks from JSONL file"""
        chunks = []
        with open(path, 'r', encoding='utf-8') as f:
            for line in f:
                if line.strip():
                    chunks.append(json.loads(line))
        return chunks
    
    def search(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """Search for relevant guidelines"""
        if not self._loaded:
            self.load()
        
        if self.index is None:
            return []
        
        # Encode query
        query_embedding = self.embedding_model.encode([query], convert_to_numpy=True)
        
        # Search FAISS index
        distances, indices = self.index.search(
            query_embedding.astype(np.float32),
            top_k
        )
        
        results = []
        for dist, idx in zip(distances[0], indices[0]):
            if idx < len(self.chunks) and idx >= 0:
                chunk = self.chunks[idx]
                # Convert L2 distance to similarity score
                similarity = 1 / (1 + dist)
                results.append({
                    "chunk": chunk,
                    "similarity": float(similarity),
                    "text": chunk.get("text", ""),
                    "meta": chunk.get("meta", {})
                })
        
        return results


class ComplianceChatbot:
    """Chatbot for providing compliance improvement recommendations"""
    
    def __init__(self):
        self.guidelines_rag = GuidelinesRAG()
        self.llm = None
        self.conversation_history: Dict[str, List[Dict]] = {}
    
    def _init_llm(self):
        """Initialize the LLM"""
        if self.llm is None:
            # Using the best available model on Groq for chatbot
            self.llm = ChatGroq(
                groq_api_key=GROQ_API_KEY,
                model_name="llama-3.3-70b-versatile",
                temperature=0.3,
                max_tokens=2000
            )
    
    def load(self):
        """Load all components"""
        self.guidelines_rag.load()
        self._init_llm()
    
    def _get_relevant_guidelines(self, control_id: str, control_text: str, score_justification: str) -> List[Dict]:
        """Get relevant guidelines for a specific control"""
        # Search using control ID and text
        query = f"{control_id} {control_text}"
        guidelines = self.guidelines_rag.search(query, top_k=3)
        
        # Also search using the justification to find more specific guidance
        if score_justification:
            justification_results = self.guidelines_rag.search(score_justification, top_k=2)
            guidelines.extend(justification_results)
        
        # Remove duplicates based on text
        seen_texts = set()
        unique_guidelines = []
        for g in guidelines:
            text = g.get("text", "")[:200]  # Use first 200 chars as key
            if text not in seen_texts:
                seen_texts.add(text)
                unique_guidelines.append(g)
        
        return unique_guidelines[:5]
    
    def _format_control_for_context(self, control: Dict) -> str:
        """Format a control result for the chatbot context"""
        return f"""
Control ID: {control.get('control_id', 'N/A')}
Control Text: {control.get('control_text', 'N/A')}
Current Score: {control.get('final_score', 0)}%
Compliance Status: {control.get('compliance_status', 'Unknown')}
Score Justification: {control.get('score_justification', 'No justification provided')}
Risk Level: {control.get('risk_level', 'Unknown')}
"""
    
    def _format_guidelines_for_context(self, guidelines: List[Dict]) -> str:
        """Format guidelines for the chatbot context"""
        if not guidelines:
            return "No specific guidelines found."
        
        formatted = []
        for i, g in enumerate(guidelines, 1):
            meta = g.get("meta", {})
            formatted.append(f"""
Guideline {i}:
Domain: {meta.get('domain_name', 'N/A')} > {meta.get('subdomain_name', 'N/A')}
Control: {meta.get('control_id', 'N/A')}
Implementation Guidance:
{g.get('text', 'No text available')}
""")
        return "\n---\n".join(formatted)
    
    async def get_improvement_recommendations(
        self,
        control: Dict,
        session_id: str = "default",
        language: str = "en"
    ) -> Dict[str, Any]:
        """Get improvement recommendations for a specific control"""
        self.load()
        
        control_id = control.get("control_id", "Unknown")
        control_text = control.get("control_text", "")
        score_justification = control.get("score_justification", "")
        final_score = control.get("final_score", 0)
        
        # Get relevant guidelines
        guidelines = self._get_relevant_guidelines(control_id, control_text, score_justification)
        
        # Format context
        control_context = self._format_control_for_context(control)
        guidelines_context = self._format_guidelines_for_context(guidelines)
        
        # Language instruction
        lang_instruction = ""
        if language == "ar":
            lang_instruction = "\n\nIMPORTANT: Respond entirely in Arabic (العربية). All your recommendations, analysis, and steps should be written in Arabic language."
        
        # Create prompt
        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an expert cybersecurity compliance consultant specializing in NCA (National Cybersecurity Authority) and NIST frameworks. Your role is to help organizations improve their compliance scores.

You have access to the organization's current compliance assessment results and official implementation guidelines. Based on this information, provide specific, actionable recommendations to improve their compliance score.

Be practical, specific, and prioritize recommendations by impact. Focus on:
1. Quick wins that can immediately improve the score
2. Medium-term improvements
3. Long-term strategic changes

Always reference the official guidelines when making recommendations.""" + lang_instruction),
            ("human", """Based on the following compliance assessment result and official implementation guidelines, provide specific recommendations to improve the compliance score.

## Current Assessment Result:
{control_context}

## Official Implementation Guidelines:
{guidelines_context}

## Your Task:
1. Analyze why the current score is {final_score}%
2. Identify specific gaps between current state and requirements
3. Provide 3-5 actionable recommendations with priority levels (High/Medium/Low)
4. Estimate the potential score improvement for each recommendation
5. Include specific implementation steps for each recommendation

Please provide your recommendations in a clear, structured format.""")
        ])
        
        # Generate response
        chain = prompt | self.llm | StrOutputParser()
        
        response = await chain.ainvoke({
            "control_context": control_context,
            "guidelines_context": guidelines_context,
            "final_score": final_score
        })
        
        # Store in conversation history
        if session_id not in self.conversation_history:
            self.conversation_history[session_id] = []
        
        self.conversation_history[session_id].append({
            "type": "improvement_request",
            "control_id": control_id,
            "response": response
        })
        
        return {
            "control_id": control_id,
            "current_score": final_score,
            "recommendations": response,
            "guidelines_used": len(guidelines),
            "session_id": session_id
        }
    
    async def chat(
        self,
        message: str,
        report_context: Dict,
        session_id: str = "default",
        language: str = "en"
    ) -> Dict[str, Any]:
        """General chat about the compliance report"""
        self.load()
        
        # Get conversation history
        history = self.conversation_history.get(session_id, [])
        history_text = ""
        if history:
            recent_history = history[-5:]  # Last 5 interactions
            history_text = "\n".join([
                f"Previous discussion about {h.get('control_id', 'general')}: {h.get('response', '')[:200]}..."
                for h in recent_history
            ])
        
        # Format report summary
        summary = report_context.get("summary", {})
        overall_score = summary.get("overall_score", 0)
        total_controls = summary.get("total_controls_evaluated", 0)
        
        # Get low-scoring controls for context
        frameworks = report_context.get("frameworks", {})
        low_score_controls = []
        for fw_id, fw_data in frameworks.items():
            structure = fw_data.get("structure", {})
            for domain_id, domain in structure.items():
                subdomains = domain.get("subdomains", domain.get("categories", {}))
                for sub_id, sub in subdomains.items():
                    for control in sub.get("controls", []):
                        if control.get("final_score", 100) < 50:
                            low_score_controls.append(control)
        
        low_score_controls = sorted(low_score_controls, key=lambda x: x.get("final_score", 0))[:10]
        
        # Search for relevant guidelines based on user message
        guidelines = self.guidelines_rag.search(message, top_k=3)
        guidelines_context = self._format_guidelines_for_context(guidelines)
        
        # Language instruction
        lang_instruction = ""
        if language == "ar":
            lang_instruction = "\n\nIMPORTANT: Respond entirely in Arabic (العربية). Your entire response should be in Arabic language."
        
        # Create prompt
        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an expert cybersecurity compliance consultant. You have access to:
1. The organization's compliance assessment report
2. Official implementation guidelines from NCA
3. Previous conversation history

Help the user understand their compliance status and provide actionable recommendations.
Be concise, practical, and specific. Reference control IDs when discussing specific areas.""" + lang_instruction),
            ("human", """## Report Summary:
Overall Score: {overall_score}%
Total Controls Evaluated: {total_controls}

## Controls Needing Attention (Score < 50%):
{low_score_summary}

## Relevant Guidelines:
{guidelines_context}

## Previous Conversation:
{history_text}

## User Question:
{message}

Please provide a helpful, specific response.""")
        ])
        
        # Format low score summary
        low_score_summary = "\n".join([
            f"- {c.get('control_id', 'N/A')}: {c.get('final_score', 0)}% - {c.get('control_text', '')[:100]}..."
            for c in low_score_controls[:5]
        ]) if low_score_controls else "All controls scored 50% or above."
        
        # Generate response
        chain = prompt | self.llm | StrOutputParser()
        
        response = await chain.ainvoke({
            "overall_score": overall_score,
            "total_controls": total_controls,
            "low_score_summary": low_score_summary,
            "guidelines_context": guidelines_context,
            "history_text": history_text,
            "message": message
        })
        
        # Update conversation history
        if session_id not in self.conversation_history:
            self.conversation_history[session_id] = []
        
        self.conversation_history[session_id].append({
            "type": "chat",
            "message": message,
            "response": response
        })
        
        return {
            "response": response,
            "session_id": session_id,
            "guidelines_referenced": len(guidelines)
        }
    
    async def get_priority_improvements(
        self,
        report_context: Dict,
        session_id: str = "default",
        language: str = "en"
    ) -> Dict[str, Any]:
        """Get prioritized improvement plan based on the full report"""
        self.load()
        
        # Get all low-scoring controls
        frameworks = report_context.get("frameworks", {})
        all_controls = []
        
        for fw_id, fw_data in frameworks.items():
            structure = fw_data.get("structure", {})
            for domain_id, domain in structure.items():
                subdomains = domain.get("subdomains", domain.get("categories", {}))
                for sub_id, sub in subdomains.items():
                    for control in sub.get("controls", []):
                        all_controls.append({
                            **control,
                            "framework": fw_id,
                            "domain": domain.get("name", domain_id),
                            "subdomain": sub.get("name", sub_id)
                        })
        
        # Sort by score (lowest first)
        critical_controls = [c for c in all_controls if c.get("final_score", 100) < 25]
        poor_controls = [c for c in all_controls if 25 <= c.get("final_score", 100) < 50]
        fair_controls = [c for c in all_controls if 50 <= c.get("final_score", 100) < 75]
        
        # Get guidelines for critical controls
        critical_guidelines = []
        for control in critical_controls[:5]:
            guidelines = self._get_relevant_guidelines(
                control.get("control_id", ""),
                control.get("control_text", ""),
                control.get("score_justification", "")
            )
            critical_guidelines.extend(guidelines)
        
        guidelines_context = self._format_guidelines_for_context(critical_guidelines[:10])
        
        # Language instruction
        lang_instruction = ""
        if language == "ar":
            lang_instruction = "\n\nIMPORTANT: Respond entirely in Arabic (العربية). The entire improvement plan should be written in Arabic language."
        
        # Create prompt
        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are a senior cybersecurity compliance consultant creating a strategic improvement roadmap.
Based on the compliance assessment results, create a prioritized improvement plan that maximizes compliance score improvement with practical, actionable steps.""" + lang_instruction),
            ("human", """## Compliance Assessment Overview:
Overall Score: {overall_score}%
Total Controls: {total_controls}

## Critical Priority (Score < 25%): {critical_count} controls
{critical_summary}

## High Priority (Score 25-49%): {poor_count} controls
{poor_summary}

## Medium Priority (Score 50-74%): {fair_count} controls

## Relevant Implementation Guidelines:
{guidelines_context}

## Create a Strategic Improvement Plan:
1. Executive Summary
2. Quick Wins (can be done in 1-2 weeks)
3. Short-term Improvements (1-3 months)
4. Long-term Strategic Changes (3-6 months)
5. Resource Requirements
6. Expected Score Improvement Timeline

Be specific and reference control IDs.""")
        ])
        
        # Format summaries
        critical_summary = "\n".join([
            f"- {c.get('control_id')}: {c.get('final_score')}% - {c.get('control_text', '')[:80]}..."
            for c in critical_controls[:5]
        ]) if critical_controls else "None"
        
        poor_summary = "\n".join([
            f"- {c.get('control_id')}: {c.get('final_score')}% - {c.get('control_text', '')[:80]}..."
            for c in poor_controls[:5]
        ]) if poor_controls else "None"
        
        summary = report_context.get("summary", {})
        
        # Generate response
        chain = prompt | self.llm | StrOutputParser()
        
        response = await chain.ainvoke({
            "overall_score": summary.get("overall_score", 0),
            "total_controls": summary.get("total_controls_evaluated", 0),
            "critical_count": len(critical_controls),
            "poor_count": len(poor_controls),
            "fair_count": len(fair_controls),
            "critical_summary": critical_summary,
            "poor_summary": poor_summary,
            "guidelines_context": guidelines_context
        })
        
        return {
            "improvement_plan": response,
            "critical_controls_count": len(critical_controls),
            "poor_controls_count": len(poor_controls),
            "fair_controls_count": len(fair_controls),
            "session_id": session_id
        }


# Singleton instance
compliance_chatbot = ComplianceChatbot()
