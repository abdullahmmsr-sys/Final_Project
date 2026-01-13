"""
Backend package for Compliance Checker
"""
from backend.config import *
from backend.vector_store import vector_store
from backend.document_processor import document_processor
from backend.evaluator import MultiLayerEvaluator
from backend.analyzer import compliance_analyzer
