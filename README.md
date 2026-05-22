AI-Powered Mental Health Support System

A scalable and safety-focused platform that leverages Machine Learning and Generative AI to detect suicide risk, provide empathetic conversational support, and enable mood tracking and journaling.

---



---

Overview

This project combines Machine Learning, Retrieval Augmented Generation (RAG), and Generative AI to support mental health monitoring and assistance.

The platform is designed to:
- Detect potentially harmful or suicidal text
- Generate empathetic and context-aware responses
- Track moods and emotional patterns
- Maintain private journal entries
- Provide moderation and escalation support through an admin dashboard

---

Features

- Suicide risk detection using TF-IDF and Logistic Regression
- Keyword-based self-harm screening
- RAG-based contextual response generation
- AI conversational support using GitHub Models API
- Mood tracking and sentiment analysis
- Personal journaling system
- Admin dashboard for flagged content review
- JWT-based authentication
- Audit logging and privacy-focused architecture

---

System Architecture

```text
Frontend (React)
       │
       ▼
FastAPI Backend
       │
 ┌─────┴─────┐
 ▼           ▼
ML Model    RAG + LLM API
       │
       ▼
Database
```

---

Tech Stack

| Category | Technologies |
|----------|--------------|
| Frontend | React, Material UI |
| Backend | FastAPI, Python |
| ML | Scikit-learn, TF-IDF, Logistic Regression |
| AI Models | GitHub Models API, GPT-4, Claude |
| Database | SQLite / PostgreSQL |
| Authentication | JWT |
| Deployment | Vercel, Render |

---

Key Modules

ML Classification Pipeline
- Text preprocessing and tokenization
- TF-IDF feature extraction
- Logistic Regression classifier
- Risk prediction and keyword matching

Mood and Journal Tracking
- Daily mood logging
- Personal journal entries
- Sentiment analysis
- Emotional trend visualization

RAG Pipeline
- Context-aware retrieval system
- Trusted mental health resource integration

Admin Dashboard
- Review flagged conversations
- Escalate critical cases
- View analytics and logs

---

Installation

Clone Repository

```bash
git clone https://github.com/your-username/amica.git
cd amica
```

Backend Setup

```bash
cd backend

pip install -r requirements.txt

uvicorn main:app --reload
```

Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

---

Deployment

Frontend Deployment (Vercel)

```bash
npm run build
```

Deploy the generated `dist` folder to Vercel.

Backend Deployment (Render)

Build Command

```bash
pip install -r requirements.txt
```

Start Command

```bash
uvicorn main:app --host 0.0.0.0 --port 10000
```

---

Future Improvements

- Real-time crisis hotline integration
- Mobile application support
- Therapist recommendation system
- Multi-language support
- Advanced deep learning models

---

Disclaimer

This project is intended for educational and support purposes only and is not a substitute for professional mental health care.
