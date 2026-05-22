<div align="center">

![Status](https://img.shields.io/badge/status-active-1D9E75?style=flat-square)
![Python](https://img.shields.io/badge/python-3.10+-D85A30?style=flat-square)
![FastAPI](https://img.shields.io/badge/FastAPI-backend-1D9E75?style=flat-square)

# 🧠 AMICA — *Compassionate* Mental Health AI

**A scalable, safety-focused platform using Machine Learning and Generative AI to detect risk, provide empathetic support, and track emotional well-being.**

[🚀 Live Demo](https://your-vercel-link.vercel.app)
</div>

---

## ✨ Core Features

| Feature | Description |
|---|---|
| 🛡️ **Suicide Risk Detection** | TF-IDF + Logistic Regression with keyword-based self-harm screening |
| 💬 **AI Conversational Support** | RAG-based empathetic responses powered by Grok |
| 😊 **Mood Tracking** | Daily logging, sentiment analysis, and emotional trend visualization |
| 📓 **Private Journaling** | Secure personal journal with privacy-focused architecture |
| 📊 **Admin Dashboard** | Review flagged content, escalate cases, and view analytics |
| 🔒 **JWT Auth + Audit Logs** | Secure authentication and comprehensive audit logging |

---

## 🏗️ System Architecture

```
Frontend (React + MUI)
         │
         ▼
  FastAPI Backend (Python)
         │
   ┌─────┴──────┐
   ▼            ▼
ML Model     RAG + Grok
TF-IDF + LR   xAI API
         │
         ▼
   Database (SQLite / PostgreSQL)
```

---

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| **Frontend** | React, Material UI |
| **Backend** | FastAPI, Python, JWT |
| **Machine Learning** | Scikit-learn, TF-IDF, Logistic Regression |
| **AI Models** | Grok, xAI API, GitHub Models |
| **Database** | SQLite / PostgreSQL |
| **Deployment** | Vercel, Render |

---

## 📦 Key Modules

<details>
<summary><b>🤖 ML Classification Pipeline</b></summary>

- Text preprocessing and tokenization
- TF-IDF feature extraction
- Logistic Regression classifier
- Risk prediction and keyword matching

</details>

<details>
<summary><b>📈 Mood &amp; Journal Tracking</b></summary>

- Daily mood logging
- Personal journal entries
- Sentiment analysis
- Emotional trend visualization

</details>

<details>
<summary><b>📚 RAG Pipeline + Grok</b></summary>

- Context-aware retrieval system
- Trusted mental health resource integration
- Grok-powered empathetic responses

</details>

<details>
<summary><b>🛡️ Admin Dashboard</b></summary>

- Review flagged conversations
- Escalate critical cases
- Analytics and audit logs

</details>

---

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/amica.git
cd amica
```

### 2. Backend setup

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

---

## ☁️ Deployment

### Frontend → Vercel

```bash
npm run build
# Deploy the generated dist/ folder to Vercel
```

### Backend → Render

| | Command |
|---|---|
| **Build** | `pip install -r requirements.txt` |
| **Start** | `uvicorn main:app --host 0.0.0.0 --port 10000` |

---

## 🗺️ Roadmap

- [ ] 📞 Real-time crisis hotline integration
- [ ] 📱 Mobile application support
- [ ] 🩺 Therapist recommendation system
- [ ] 🧠 Advanced deep learning models

---

## ⚠️ Disclaimer

> This project is intended for **educational and support purposes only** and is not a substitute for professional mental health care.
> If you or someone you know is in crisis, please contact a qualified mental health professional.
