"""
Multi-Layer LLM Evaluator using Groq
Implements a 3-layer evaluation pipeline for compliance assessment
"""
import json
from typing import List, Dict, Any, Optional
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import HumanMessage, SystemMessage
from tenacity import retry, stop_after_attempt, wait_exponential

try:
    from backend.config import GROQ_API_KEY, GROQ_MODELS, SCORING_CONFIG
except ImportError:
    from config import GROQ_API_KEY, GROQ_MODELS, SCORING_CONFIG


class MultiLayerEvaluator:
    """
    Multi-layer LLM evaluation pipeline:
    - Layer 1 (Fast): Quick relevance check and initial categorization
    - Layer 2 (Balanced): Detailed compliance analysis
    - Layer 3 (Precise): Final scoring and recommendations
    """
    
    def __init__(self):
        self.models = {}
        self._initialize_models()
    
    def _initialize_models(self):
        """Initialize Groq LLM instances for each layer"""
        if not GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY not set in environment")
        
        for layer, model_name in GROQ_MODELS.items():
            self.models[layer] = ChatGroq(
                groq_api_key=GROQ_API_KEY,
                model_name=model_name,
                temperature=0.1 if layer == "precise" else 0.3,
                max_tokens=2048
            )
    
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    async def _call_llm(self, model_key: str, messages: List[Dict]) -> str:
        """Call LLM with retry logic"""
        try:
            model = self.models[model_key]
            response = await model.ainvoke(messages)
            return response.content
        except Exception as e:
            print(f"LLM Error ({model_key}): {str(e)}")
            raise
    
    async def layer1_relevance_check(
        self, 
        document_chunk: str, 
        control_text: str,
        control_id: str
    ) -> Dict[str, Any]:
        """
        Layer 1: Fast relevance check
        Determines if the document chunk is relevant to the control
        """
        prompt = f"""You are a compliance relevance analyzer. Quickly determine if the following document excerpt is relevant to the given compliance control.

COMPLIANCE CONTROL ({control_id}):
{control_text}

DOCUMENT EXCERPT:
{document_chunk}

Respond in JSON format:
{{
    "is_relevant": true/false,
    "relevance_score": 0.0-1.0,
    "relevant_keywords": ["list", "of", "matching", "keywords"],
    "quick_assessment": "one sentence summary"
}}

JSON Response:"""

        messages = [
            SystemMessage(content="You are a fast compliance relevance analyzer. Respond only in valid JSON."),
            HumanMessage(content=prompt)
        ]
        
        try:
            response = await self._call_llm("fast", messages)
            # Parse JSON response
            result = self._parse_json_response(response)
            result["control_id"] = control_id
            return result
        except Exception as e:
            return {
                "control_id": control_id,
                "is_relevant": False,
                "relevance_score": 0.0,
                "error": str(e)
            }
    
    async def layer2_detailed_analysis(
        self,
        document_text: str,
        control_text: str,
        control_id: str,
        control_meta: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Layer 2: Detailed compliance analysis
        Analyzes how well the document addresses each aspect of the control
        """
        framework = "NCA" if "domain" in str(control_meta) else "NIST"
        
        prompt = f"""You are an expert compliance analyst specializing in {framework} framework.

CONTROL REQUIREMENT ({control_id}):
{control_text}

ORGANIZATION'S DOCUMENT:
{document_text}

Analyze the document against this control requirement. Evaluate:
1. Does the document address this control requirement?
2. What specific clauses/sections address it?
3. Are there any gaps or missing elements?
4. What is the level of detail and specificity?

Respond in JSON format:
{{
    "addresses_control": true/false,
    "coverage_level": "full|partial|minimal|none",
    "addressed_aspects": [
        {{"aspect": "description", "evidence": "quote from document"}}
    ],
    "missing_aspects": [
        {{"aspect": "description", "importance": "critical|high|medium|low"}}
    ],
    "document_quotes": ["relevant quotes from the document"],
    "gap_analysis": "detailed description of gaps",
    "preliminary_score": 0-100
}}

JSON Response:"""

        messages = [
            SystemMessage(content=f"You are an expert {framework} compliance analyst. Provide detailed, accurate analysis. Respond only in valid JSON."),
            HumanMessage(content=prompt)
        ]
        
        try:
            response = await self._call_llm("balanced", messages)
            result = self._parse_json_response(response)
            result["control_id"] = control_id
            result["framework"] = framework
            return result
        except Exception as e:
            return {
                "control_id": control_id,
                "framework": framework,
                "addresses_control": False,
                "coverage_level": "none",
                "preliminary_score": 0,
                "error": str(e)
            }
    
    async def layer3_final_scoring(
        self,
        control_id: str,
        control_text: str,
        layer2_analysis: Dict[str, Any],
        document_context: str
    ) -> Dict[str, Any]:
        """
        Layer 3: Final scoring and recommendations
        Provides definitive score and actionable improvement recommendations
        """
        framework = layer2_analysis.get("framework", "Unknown")
        
        prompt = f"""You are a senior compliance auditor providing final assessment for {framework} compliance.

CONTROL ({control_id}):
{control_text}

PRELIMINARY ANALYSIS:
{json.dumps(layer2_analysis, indent=2, ensure_ascii=False)}

DOCUMENT CONTEXT:
{document_context[:2000]}

Provide your FINAL compliance assessment:

1. FINAL SCORE (0-100%):
   - 100%: Fully compliant - all requirements met with evidence
   - 75-99%: Mostly compliant - minor gaps or documentation issues
   - 50-74%: Partially compliant - significant gaps but foundation exists
   - 25-49%: Minimally compliant - major gaps, only basic coverage
   - 0-24%: Non-compliant - control not addressed

2. Provide specific, actionable recommendations for improvement.

Respond in JSON format:
{{
    "final_score": 0-100,
    "compliance_status": "fully_compliant|mostly_compliant|partially_compliant|minimally_compliant|non_compliant",
    "confidence": 0.0-1.0,
    "score_justification": "detailed explanation of the score",
    "key_findings": [
        {{"finding": "description", "type": "strength|weakness|gap"}}
    ],
    "recommendations": [
        {{
            "priority": "critical|high|medium|low",
            "recommendation": "specific action to take",
            "expected_impact": "how this improves compliance"
        }}
    ],
    "evidence_summary": "summary of evidence found in document",
    "risk_level": "low|medium|high|critical"
}}

JSON Response:"""

        messages = [
            SystemMessage(content=f"You are a senior {framework} compliance auditor. Provide accurate, well-justified final assessments. Respond only in valid JSON."),
            HumanMessage(content=prompt)
        ]
        
        try:
            response = await self._call_llm("precise", messages)
            result = self._parse_json_response(response)
            result["control_id"] = control_id
            return result
        except Exception as e:
            # Fallback to layer 2 score if layer 3 fails
            return {
                "control_id": control_id,
                "final_score": layer2_analysis.get("preliminary_score", 0),
                "compliance_status": self._score_to_status(layer2_analysis.get("preliminary_score", 0)),
                "confidence": 0.5,
                "score_justification": "Score based on preliminary analysis (Layer 3 error)",
                "error": str(e)
            }
    
    async def evaluate_control(
        self,
        document_text: str,
        control: Dict[str, Any],
        relevant_chunks: List[str]
    ) -> Dict[str, Any]:
        """
        Full 3-layer evaluation pipeline for a single control
        """
        control_id = control.get("meta", {}).get("control_id", control.get("id", "unknown"))
        control_text = control.get("text", "")
        control_meta = control.get("meta", {})
        
        # Combine relevant chunks for analysis
        combined_text = "\n\n---\n\n".join(relevant_chunks[:5])  # Limit to top 5 chunks
        
        # Layer 1: Quick relevance check
        layer1_result = await self.layer1_relevance_check(
            combined_text[:1500],  # Limit size for fast layer
            control_text,
            control_id
        )
        
        # If not relevant at all, skip deeper analysis
        if not layer1_result.get("is_relevant", False) and layer1_result.get("relevance_score", 0) < 0.2:
            return {
                "control_id": control_id,
                "control_text": control_text,
                "control_meta": control_meta,
                "final_score": 0,
                "compliance_status": "non_compliant",
                "confidence": 0.8,
                "score_justification": "Document does not appear to address this control requirement.",
                "recommendations": [{
                    "priority": "critical",
                    "recommendation": f"Add policies and procedures to address control {control_id}",
                    "expected_impact": "Establishes baseline compliance for this control"
                }],
                "risk_level": "high",
                "layer1": layer1_result,
                "skipped_deeper_analysis": True
            }
        
        # Layer 2: Detailed analysis
        layer2_result = await self.layer2_detailed_analysis(
            combined_text,
            control_text,
            control_id,
            control_meta
        )
        
        # Layer 3: Final scoring
        layer3_result = await self.layer3_final_scoring(
            control_id,
            control_text,
            layer2_result,
            document_text[:3000]  # Provide document context
        )
        
        # Combine all results
        return {
            "control_id": control_id,
            "control_text": control_text,
            "control_meta": control_meta,
            "final_score": layer3_result.get("final_score", 0),
            "compliance_status": layer3_result.get("compliance_status", "non_compliant"),
            "confidence": layer3_result.get("confidence", 0.5),
            "score_justification": layer3_result.get("score_justification", ""),
            "key_findings": layer3_result.get("key_findings", []),
            "recommendations": layer3_result.get("recommendations", []),
            "evidence_summary": layer3_result.get("evidence_summary", ""),
            "risk_level": layer3_result.get("risk_level", "medium"),
            "layer1": layer1_result,
            "layer2": layer2_result,
            "layer3": layer3_result
        }
    
    def _parse_json_response(self, response: str) -> Dict[str, Any]:
        """Parse JSON from LLM response, handling common issues"""
        # Clean up response
        response = response.strip()
        
        # Try to find JSON in response
        if "```json" in response:
            start = response.find("```json") + 7
            end = response.find("```", start)
            response = response[start:end].strip()
        elif "```" in response:
            start = response.find("```") + 3
            end = response.find("```", start)
            response = response[start:end].strip()
        
        # Find JSON object boundaries
        if "{" in response:
            start = response.find("{")
            end = response.rfind("}") + 1
            response = response[start:end]
        
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            # Return a minimal valid response
            return {"parse_error": True, "raw_response": response[:500]}
    
    def _score_to_status(self, score: int) -> str:
        """Convert numeric score to compliance status"""
        if score >= 100:
            return "fully_compliant"
        elif score >= 75:
            return "mostly_compliant"
        elif score >= 50:
            return "partially_compliant"
        elif score >= 25:
            return "minimally_compliant"
        else:
            return "non_compliant"


# Singleton instance
evaluator = MultiLayerEvaluator() if GROQ_API_KEY else None
