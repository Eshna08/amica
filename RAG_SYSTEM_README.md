# Enhanced RAG-Based Suicide Detection System

This document describes the improved RAG (Retrieval Augmented Generation) implementation for Amica's suicide detection and prevention system.

## Overview

The enhanced system combines multiple AI techniques to provide comprehensive suicide risk assessment:

1. **Machine Learning Classification Pipeline (MCP)** - Fast initial classification
2. **Enhanced RAG System** - Context-aware analysis with mental health knowledge base
3. **Pattern Recognition** - Advanced keyword and phrase detection
4. **Contextual Analysis** - Conversation history and escalation pattern detection
5. **Admin Dashboard Integration** - Real-time alerts and case management

## Architecture

### Frontend Integration
- `enhancedSuicideDetection.ts` - TypeScript client for enhanced detection
- `adminDashboard.ts` - Admin alert management system
- `chat.ts` - Integrated with chat service for real-time analysis

### Backend APIs
- `enhanced_suicide_detection_api.py` - Comprehensive RAG-based analysis (Port 8002)
- `mcpapi.py` - Simple ML classification (Port 8001)

## Features

### 1. Multi-Level Risk Assessment
- **Critical**: Immediate intervention required (emergency services)
- **High**: Urgent professional intervention needed
- **Medium**: Professional consultation recommended
- **Low**: Supportive monitoring and resources

### 2. Enhanced Pattern Detection
- Direct suicide threats with specific plans
- Indirect expressions of hopelessness
- Method references and temporal indicators
- Emotional distress patterns
- Contextual risk factors (isolation, access to means, etc.)

### 3. Knowledge Base Integration
- Mental health crisis intervention protocols
- Suicide warning signs and risk factors
- Crisis resources and hotline information
- Safety planning techniques
- Professional intervention guidelines

### 4. Real-Time Admin Alerts
- Automatic escalation for critical cases
- Admin dashboard for case review
- Intervention logging and follow-up tracking
- Risk analytics and reporting

## Setup Instructions

### 1. Backend Setup
```bash
# Navigate to project directory
cd /path/to/Amica

# Make startup script executable
chmod +x start_apis.sh

# Start both APIs
./start_apis.sh
```

### 2. Install Python Dependencies
```bash
cd rag
pip install -r requirements.txt
```

### 3. Frontend Integration
The enhanced detection is automatically integrated into the chat service. No additional setup required for the TypeScript components.

## API Endpoints

### Enhanced RAG API (Port 8002)
- `POST /analyze_suicide_risk` - Comprehensive risk analysis
- `POST /update_knowledge_base` - Update mental health knowledge
- `GET /health` - Health check and system status

### MCP API (Port 8001)
- `POST /classify` - Simple suicide classification

## Usage Examples

### Basic Risk Analysis
```typescript
import { enhancedCheckContent } from './utils/enhancedSuicideDetection';

const analysis = await enhancedCheckContent(
  "I can't go on anymore, life is hopeless",
  {
    messages: conversationHistory,
    userId: "user123",
    conversationId: "conv456"
  }
);

console.log(analysis.riskLevel); // "high", "critical", etc.
console.log(analysis.recommendedAction); // Intervention guidance
```

### Admin Dashboard Integration
```typescript
import { adminDashboard } from './utils/adminDashboard';

// Get pending critical alerts
const criticalCases = adminDashboard.getPendingCriticalAlerts();

// Review an alert
await adminDashboard.reviewAlert(
  alertId, 
  "Dr. Smith", 
  "Patient contacted, safety plan created",
  "resolved"
);
```

## Knowledge Base Categories

1. **Warning Signs** - Behavioral and verbal indicators
2. **Risk Factors** - Demographic and situational factors
3. **Protective Factors** - Resilience and support elements
4. **Crisis Phrases** - Direct and indirect suicidal expressions
5. **Intervention Protocols** - Response procedures and escalation
6. **Resources** - Crisis hotlines and support services
7. **Safety Planning** - Risk mitigation strategies

## Risk Assessment Scoring

The system uses a multi-factor scoring approach:

- **MCP Classification**: 0-10 points (based on ML confidence)
- **Pattern Matching**: 0-15 points (weighted by severity)
- **Contextual Factors**: 0-10 points (conversation patterns)
- **Knowledge Base Relevance**: 0-5 points (expert knowledge matching)

## Intervention Protocols

### Critical Risk (Score ≥12)
- Immediate emergency services contact
- Continuous monitoring required
- Automatic admin escalation
- Crisis resource provision

### High Risk (Score 8-11)
- Urgent mental health professional contact
- Safety planning implementation
- 24-hour follow-up required
- Admin notification

### Medium Risk (Score 4-7)
- Professional consultation within 48 hours
- Crisis resources provided
- Regular monitoring
- Preventive intervention

### Low Risk (Score <4)
- Supportive conversation continuation
- Mental health resources available
- Ongoing observation

## Compliance and Privacy

- All high-risk cases are logged for compliance
- Personal information is anonymized in logs
- HIPAA-compliant data handling procedures
- Audit trails for all interventions
- Secure data transmission and storage

## Integration with Existing Systems

The enhanced RAG system integrates seamlessly with:
- Existing content monitoring system
- User storage and conversation management
- Admin dashboard and flagged content system
- GitHub Models API for AI responses

## Future Enhancements

1. **Real-time sentiment analysis** - Continuous mood tracking
2. **Predictive modeling** - Risk pattern prediction
3. **Multi-language support** - International crisis detection
4. **Integration with EHR systems** - Healthcare provider alerts
5. **Mobile crisis response** - GPS-based emergency services
6. **Family notification systems** - Emergency contact alerts

## Testing

Run the test suite to validate the detection system:

```bash
# Test basic functionality
python -m pytest tests/test_suicide_detection.py

# Test admin dashboard
npm test -- --testPathPattern=adminDashboard

# Integration tests
npm run test:integration
```

## Monitoring and Maintenance

- Monitor API health endpoints regularly
- Update knowledge base with latest mental health research
- Review and update risk scoring algorithms
- Analyze false positive/negative rates
- Conduct regular staff training on system capabilities

## Support and Documentation

For technical support or questions about the enhanced RAG system:
- Review system logs for error diagnostics
- Check API health endpoints for service status
- Consult mental health professionals for clinical guidance
- Follow crisis intervention protocols for emergency situations

## Emergency Contacts

- National Suicide Prevention Lifeline: 988
- Crisis Text Line: Text HOME to 741741
- Emergency Services: 911
- Local Crisis Intervention Team: [Your local number]
