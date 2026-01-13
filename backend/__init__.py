"""
Backend package for Compliance Checker
"""
try:
    from backend.config import *
    from backend.vector_store import vector_store
    from backend.document_processor import document_processor
    from backend.evaluator import MultiLayerEvaluator
    from backend.analyzer import compliance_analyzer
except ImportError:
    from config import *
    from vector_store import vector_store
    from document_processor import document_processor
    from evaluator import MultiLayerEvaluator
    from analyzer import compliance_analyzer
