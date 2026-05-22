# Amica Crisis Response System

## Overview
Amica now includes an enhanced crisis response system that automatically detects suicide-related content and provides immediate crisis resources instead of sending concerning messages to the AI model.

## How It Works

### 1. Risk Detection
- **Pattern Matching**: Scans for direct threats, indirect indicators, method references, and temporal patterns
- **Machine Learning**: Uses TF-IDF vectorization and logistic regression for suicide classification
- **Context Analysis**: Considers conversation history and escalating patterns

### 2. Risk Levels
- **Critical**: Direct threats, specific plans, immediate timeframes
- **High**: Strong indirect indicators, concerning method references
- **Medium**: General distress with some concerning language
- **Low**: Normal conversation, minimal risk indicators

### 3. Crisis Response
When **critical** or **high** risk messages are detected:
- ❌ Message is **NOT** sent to GitHub Models API
- ✅ User receives **immediate crisis resources** instead
- 🚨 Admin alerts are automatically generated
- 💬 Crisis hotlines and support information are displayed

### 4. Crisis Resources Provided
- **National Suicide Prevention Lifeline**: 988
- **Crisis Text Line**: Text HOME to 741741
- **International Crisis Lines**: UK, Canada, Australia
- **Emergency Services**: 911 guidance
- **Local Mental Health Resources**: 211

### 5. Visual Indicators
Crisis resource messages are highlighted with:
- 🔴 Red alert icon
- 💝 Heart symbol for compassion
- 🎨 Special red-bordered styling
- ⚠️ "Crisis Support Resources" header

## Testing the System

### Test Messages
- **High Risk**: "I want to end my life"
- **Medium Risk**: "I feel hopeless and trapped"
- **Normal**: "I had a good day today"

### Expected Behavior
1. **High-risk messages** → Crisis resources displayed immediately
2. **Normal messages** → Regular AI therapy response
3. **All concerning messages** → Logged for admin review

## API Endpoints
- **MCP Classification**: `http://localhost:8001/classify`
- **Enhanced Risk Analysis**: `http://localhost:8002/analyze_suicide_risk`
- **Frontend**: `http://localhost:5174`

## Safety Features
- Real-time risk assessment
- Immediate crisis intervention
- Admin dashboard alerts
- Conversation logging for high-risk cases
- Professional helpline integration

## Technical Implementation
- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: FastAPI + Python + scikit-learn
- **Detection**: Pattern matching + ML classification + RAG analysis
- **Response**: Conditional crisis resources vs. AI therapy

This system ensures that users in crisis receive immediate, appropriate support while maintaining therapeutic conversation for general mental health support.
