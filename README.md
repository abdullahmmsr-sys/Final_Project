# 🛡️ Compliance Checker

<p align="center">
  <img src="frontend/public/logo.png" alt="Compliance Checker Logo" width="200"/>
</p>

<p align="center">
  <strong>AI-Powered Compliance Analysis System for NCA and NIST Frameworks</strong>
</p>

<p align="center">
  Final Project at Tuwaiq Academy
</p>

---

## 📋 Overview

A sophisticated RAG (Retrieval-Augmented Generation) based compliance checking system that analyzes company policies and compliance documents against internationally recognized cybersecurity frameworks:

- **NCA ECC** (National Cybersecurity Authority Essential Cybersecurity Controls) - Saudi Arabia 🇸🇦
  - English version
  - Arabic version (الضوابط الأساسية للأمن السيبراني)
- **NIST CSF** (Cybersecurity Framework) - USA 🇺🇸

### ✨ Key Features

- **Multi-Layer LLM Evaluation**: Uses 3-layer Groq LLM architecture for accurate analysis
  - Layer 1: Fast initial relevance check (llama-3.1-8b-instant)
  - Layer 2: Detailed compliance analysis (llama-3.1-70b-versatile)
  - Layer 3: Final scoring and recommendations (llama-3.3-70b-specdec)
  
- **Percentage-Based Scoring**: Each control receives a 0-100% compliance score
- **Interactive UI**: Dynamic React frontend with clickable controls showing detailed analysis
- **Bilingual Support**: Full Arabic and English interface with RTL support
- **User Authentication**: Secure login/signup with Supabase
- **Report Management**: Save, view, compare, and export compliance reports
- **AI Chatbot**: Interactive improvement advisor for compliance guidance
- **Policy Templates**: Ready-to-use security policy templates
- **Actionable Recommendations**: Priority-ranked suggestions for improvement
- **Multi-Framework Support**: Analyze against multiple frameworks simultaneously

---

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    React Frontend (SPA)                              │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │    │
│  │  │ Landing  │ │Compliance│ │  Policy  │ │Improvement│ │Dashboard │  │    │
│  │  │  Pages   │ │ Checker  │ │Templates │ │  Advisor  │ │& Reports │  │    │
│  │  │ (EN/AR)  │ │          │ │          │ │ (Chatbot) │ │          │  │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │    │
│  │                                                                      │    │
│  │  ┌──────────────────────────────────────────────────────────────┐   │    │
│  │  │  Context Providers: AuthContext | LanguageContext (i18n)     │   │    │
│  │  └──────────────────────────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         BACKEND API LAYER                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    FastAPI Application                               │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │    │
│  │  │   Document   │  │  Compliance  │  │     Chatbot API         │  │    │
│  │  │   Upload     │  │  Evaluation  │  │   (Streaming SSE)       │  │    │
│  │  │   Endpoint   │  │   Endpoints  │  │                          │  │    │
│  │  └──────────────┘  └──────────────┘  └──────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
┌──────────────────────┐ ┌──────────────────┐ ┌────────────────────────┐
│   PROCESSING LAYER   │ │   VECTOR LAYER   │ │   EVALUATION LAYER     │
│  ┌────────────────┐  │ │  ┌────────────┐  │ │  ┌──────────────────┐  │
│  │   Document     │  │ │  │   FAISS    │  │ │  │  3-Layer LLM     │  │
│  │   Processor    │  │ │  │   Vector   │  │ │  │   Evaluator      │  │
│  │                │  │ │  │   Store    │  │ │  │                  │  │
│  │ • PDF Parser   │  │ │  │            │  │ │  │  Layer 1: Fast   │  │
│  │ • DOCX Parser  │  │ │  │ • EN NCA   │  │ │  │  Layer 2: Detail │  │
│  │ • TXT Parser   │  │ │  │ • AR NCA   │  │ │  │  Layer 3: Precise│  │
│  │ • Chunking     │  │ │  │ • NIST CSF │  │ │  │                  │  │
│  └────────────────┘  │ │  │ • Guidelines│ │ │  └──────────────────┘  │
└──────────────────────┘ │  └────────────┘  │ └────────────────────────┘
                         └──────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EXTERNAL SERVICES                                    │
│  ┌──────────────────────┐  ┌──────────────────────┐                         │
│  │      Supabase        │  │      Groq API        │                         │
│  │                      │  │                      │                         │
│  │ • Authentication     │  │ • llama-3.1-8b       │                         │
│  │ • PostgreSQL DB      │  │ • llama-3.1-70b      │                         │
│  │ • Row Level Security │  │ • llama-3.3-70b      │                         │
│  │ • User Profiles      │  │                      │                         │
│  │ • Reports Storage    │  │                      │                         │
│  └──────────────────────┘  └──────────────────────┘                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Component Details

#### Frontend Architecture
| Component | Description |
|-----------|-------------|
| **LandingPage (EN/AR)** | Bilingual landing pages with feature showcase |
| **ComplianceChecker** | Document upload, framework selection, real-time analysis |
| **PolicyTemplates** | Pre-built security policy templates |
| **ImprovementAdvisor** | AI chatbot for compliance guidance |
| **Dashboard** | Report management, statistics, comparisons |
| **ProfilePage** | User settings, password change, data export |
| **AuthContext** | Global authentication state management |
| **LanguageContext** | i18n support with RTL handling |

#### Backend Services
| Service | Description |
|---------|-------------|
| **DocumentProcessor** | Extracts text from PDF/DOCX/TXT, chunks content |
| **VectorStore** | FAISS-based semantic search across frameworks |
| **Evaluator** | 3-layer LLM pipeline for compliance scoring |
| **Chatbot** | Context-aware AI assistant with streaming responses |

#### Data Flow
```
User Upload → Document Processing → Text Chunking → FAISS Retrieval
     ↓                                                    ↓
  Framework                                         Relevant Chunks
  Selection                                               ↓
     ↓                                            3-Layer Evaluation
     └──────────────────→ Control Matching ←──────────────┘
                               ↓
                         Score & Analysis
                               ↓
                    ┌──────────┴──────────┐
                    ▼                     ▼
              Display Results      Save to Supabase
```

---

## 📁 Project Structure

```
Final_Project/
├── backend/
│   ├── __init__.py           # Package initialization
│   ├── config.py              # Configuration settings
│   ├── main.py                # FastAPI application & endpoints
│   ├── analyzer.py            # Main RAG orchestrator
│   ├── evaluator.py           # Multi-layer LLM evaluator
│   ├── chatbot.py             # AI chatbot with streaming
│   ├── document_processor.py  # PDF/DOCX text extraction
│   └── vector_store.py        # FAISS vector store manager
│
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   ├── logo.png           # Application logo
│   │   └── templates/         # PDF policy templates
│   └── src/
│       ├── index.js           # React entry point
│       ├── index.css          # Global styles
│       ├── App.js             # Router & providers
│       ├── config/
│       │   └── supabase.js    # Supabase client config
│       ├── context/
│       │   ├── AuthContext.js     # Authentication state
│       │   └── LanguageContext.js # i18n support
│       ├── components/
│       │   ├── Navbar.js          # Navigation bar
│       │   └── ProtectedRoute.js  # Auth guard
│       ├── services/
│       │   └── reportService.js   # Report CRUD operations
│       ├── pages/
│       │   ├── LandingPageEN.js   # English landing
│       │   ├── LandingPageAR.js   # Arabic landing
│       │   ├── LoginPage.js       # Authentication
│       │   ├── SignupPage.js      # Registration
│       │   ├── ProfilePage.js     # User settings
│       │   ├── DashboardPage.js   # Report management
│       │   ├── ComplianceCheckerPageNew.js  # Main analyzer
│       │   ├── PolicyTemplatesPage.js       # Templates
│       │   ├── ImprovementAdvisorPage.js    # AI chatbot
│       │   ├── ReportDetailPage.js  # Report details
│       │   └── ComparePage.js       # Report comparison
│       └── data/
│           └── policyTemplates.js   # Template definitions
│
├── uploads/                   # Uploaded documents (auto-created)
│
├── chunks_en_nca.jsonl        # NCA English control chunks
├── chunks_ar_nca.jsonl        # NCA Arabic control chunks
├── chunks_en_nist.jsonl       # NIST control chunks
├── chunks_en_guidelines.jsonl # General guidelines chunks
├── embeddings_en_nca.npy     # NCA English embeddings
├── embeddings_ar_nca.npy     # NCA Arabic embeddings
├── embeddings_en_nist.npy    # NIST embeddings
├── faiss_en_nca.index        # NCA English FAISS index
├── faiss_ar_nca.index        # NCA Arabic FAISS index
├── faiss_en_nist.index       # NIST FAISS index
│
├── requirements.txt          # Python dependencies
├── .env.example              # Environment template
├── run.sh                    # Full stack runner
├── run_backend.sh            # Backend only runner
├── run_frontend.sh           # Frontend only runner
└── README.md
```

---


## 🎯 How It Works

### 1. Document Upload
User uploads their company's compliance policy document (PDF, DOCX, or TXT).

### 2. Text Extraction & Chunking
The document is processed and split into manageable chunks for analysis.

### 3. Multi-Layer LLM Evaluation
For each control in the selected framework(s):

**Layer 1 - Quick Relevance Check (Fast Model)**
- Determines if the document addresses the control
- Provides initial relevance score (0-100)

**Layer 2 - Detailed Analysis (Balanced Model)**
- Performs in-depth compliance analysis
- Identifies specific gaps and strengths
- Generates preliminary score

**Layer 3 - Final Scoring (Precise Model)**
- Synthesizes all layers' analyses
- Produces final compliance score
- Generates prioritized recommendations

### 4. Results Presentation
- Overall compliance score with breakdown by framework/domain
- Interactive clickable controls showing detailed analysis
- Color-coded scores (Green: Excellent, Blue: Good, Yellow: Fair, Orange: Poor, Red: Critical)
- Actionable recommendations with priority levels

---



## 📊 Scoring Interpretation

| Score Range | Status | Color | Description |
|-------------|--------|-------|-------------|
| 90-100% | Excellent | 🟢 Green | Fully compliant, minor improvements possible |
| 75-89% | Good | 🔵 Blue | Mostly compliant, some gaps to address |
| 50-74% | Fair | 🟡 Yellow | Partially compliant, significant work needed |
| 25-49% | Poor | 🟠 Orange | Largely non-compliant, major gaps |
| 0-24% | Critical | 🔴 Red | Not compliant, requires immediate attention |

---


## 📝 License

This project is part of Tuwaiq Academy's final project requirements.

---



## 🔧 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, React Router, CSS3 |
| **Backend** | Python 3.9+, FastAPI, Uvicorn |
| **AI/ML** | Groq LLM API, FAISS, Sentence Transformers |
| **Database** | Supabase (PostgreSQL), Row Level Security |
| **Auth** | Supabase Auth (JWT) |
| **File Processing** | PyPDF2, python-docx |
| **Styling** | Custom CSS with animations, RTL support |

---

## �👥 Contributors

- Abdullah - Tuwaiq Academy
