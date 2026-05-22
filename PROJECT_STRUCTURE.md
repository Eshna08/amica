# Amica Project Structure

## 📁 Clean Project Organization

```
Amica/
├── 📋 Documentation
│   ├── README.md                          # Main project documentation
│   ├── CRISIS_RESPONSE_README.md          # Crisis intervention system docs
│   ├── GITHUB_MODELS_SETUP.md            # GitHub Models API setup guide
│   └── RAG_SYSTEM_README.md               # RAG implementation details
│
├── 🖥️ Frontend (React + TypeScript)
│   ├── src/
│   │   ├── components/                    # React components
│   │   │   ├── chat/                      # Chat interface components
│   │   │   ├── journal/                   # Journal functionality
│   │   │   ├── layout/                    # Layout components
│   │   │   ├── mood/                      # Mood tracking
│   │   │   └── ui/                        # Reusable UI components
│   │   ├── pages/                         # Application pages
│   │   ├── types/                         # TypeScript definitions
│   │   ├── utils/                         # Utility functions
│   │   │   ├── chat.ts                    # GitHub Models integration
│   │   │   ├── enhancedSuicideDetection.ts # Crisis detection
│   │   │   ├── adminDashboard.ts          # Admin functionality
│   │   │   └── storage.ts                 # Local storage management
│   │   ├── App.tsx                        # Main App component
│   │   └── main.tsx                       # App entry point
│   ├── index.html                         # HTML template
│   └── vite.config.ts                     # Vite configuration
│
├── 🤖 Backend APIs (Python + FastAPI)
│   ├── MCP/                               # Machine Learning Classification Pipeline
│   │   ├── mcpapi.py                      # TF-IDF + Logistic Regression API
│   │   ├── vectorizer.joblib              # Trained TF-IDF vectorizer
│   │   ├── logreg_model.joblib            # Trained logistic regression model
│   │   └── venv_mcp/                      # Python virtual environment
│   │
│   └── rag/                               # RAG Suicide Detection System
│       ├── simplified_suicide_detection_api.py # Enhanced risk analysis API
│       ├── minimal_requirements.txt       # Python dependencies
│       └── venv_rag/                      # Python virtual environment
│
├── ⚙️ Configuration
│   ├── package.json                       # Node.js dependencies
│   ├── tsconfig.json                      # TypeScript configuration
│   ├── tailwind.config.js                # Tailwind CSS configuration
│   ├── eslint.config.js                  # ESLint configuration
│   ├── postcss.config.js                 # PostCSS configuration
│   ├── .env.example                      # Environment variables template
│   └── .gitignore                        # Git ignore rules
│
├── 🚀 Deployment
│   ├── start_apis.sh                     # API startup script
│   └── venv/                             # Main Python virtual environment
│
└── 🔒 Security
    └── .env                              # Environment variables (private)
```

## 🧹 Cleaned Up Files

### ❌ Removed Unnecessary Files:
- `djsajhjhsaj.py` - Random filename file
- `app.py` - Unused application file  
- `rag.py` - Old RAG implementation
- `enhanced_suicide_detection_api.py` - Complex version replaced by simplified
- `requirements.txt` - Old requirements (kept minimal_requirements.txt)
- `file.py` - Unused MCP file
- `model.py` - Unused MCP file
- `start_simplified_apis.sh` - Duplicate startup script
- `Amica-data-2025-05-03.json` - Old data file
- `__pycache__/` directories - Python cache files

### ✅ Kept Essential Files:
- **Frontend**: Complete React + TypeScript application
- **Backend**: Working MCP and RAG APIs  
- **Models**: Trained ML models (vectorizer.joblib, logreg_model.joblib)
- **Documentation**: All README files
- **Configuration**: All config files
- **Environment**: Working virtual environments

## 🎯 Current Status
- **Clean codebase** with only essential files
- **Working APIs** on ports 8001 (MCP) and 8002 (RAG)
- **Frontend** running on port 5174
- **Crisis detection** system fully operational
- **GitHub Models integration** complete
- **Updated .gitignore** to prevent future clutter

The project is now optimized and ready for production deployment! 🚀
