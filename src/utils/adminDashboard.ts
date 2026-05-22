import { SuicideRiskAnalysis } from './enhancedSuicideDetection';

interface AdminAlert {
  id: string;
  timestamp: number;
  userId: string;
  conversationId: string;
  messageContent: string;
  riskAnalysis: SuicideRiskAnalysis;
  status: 'pending' | 'reviewed' | 'escalated' | 'resolved';
  assignedTo?: string;
  notes?: string;
  followUpRequired: boolean;
}

interface CrisisInterventionLog {
  alertId: string;
  timestamp: number;
  action: string;
  performedBy: string;
  outcome?: string;
  nextSteps?: string;
}

class AdminDashboardIntegration {
  private static instance: AdminDashboardIntegration;
  private alerts: Map<string, AdminAlert> = new Map();
  private interventionLogs: CrisisInterventionLog[] = [];

  public static getInstance(): AdminDashboardIntegration {
    if (!AdminDashboardIntegration.instance) {
      AdminDashboardIntegration.instance = new AdminDashboardIntegration();
    }
    return AdminDashboardIntegration.instance;
  }

  public async createAlert(
    userId: string,
    conversationId: string,
    messageContent: string,
    riskAnalysis: SuicideRiskAnalysis
  ): Promise<string> {
    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const alert: AdminAlert = {
      id: alertId,
      timestamp: Date.now(),
      userId,
      conversationId,
      messageContent,
      riskAnalysis,
      status: 'pending',
      followUpRequired: riskAnalysis.riskLevel === 'high' || riskAnalysis.riskLevel === 'critical'
    };

    this.alerts.set(alertId, alert);

    // Auto-escalate critical cases
    if (riskAnalysis.riskLevel === 'critical') {
      await this.escalateCriticalCase(alertId);
    }

    // Store in persistent storage (integrate with your existing storage)
    this.persistAlert(alert);

    return alertId;
  }

  private async escalateCriticalCase(alertId: string): Promise<void> {
    const alert = this.alerts.get(alertId);
    if (!alert) return;

    alert.status = 'escalated';
    
    // Log the escalation
    this.logIntervention(alertId, 'CRITICAL_ESCALATION', 'system', 
      'Automatically escalated due to critical suicide risk level');

    // In a real implementation, this would:
    // 1. Send immediate notifications to mental health professionals
    // 2. Alert emergency response teams
    // 3. Display urgent notifications in admin dashboard
    // 4. Potentially trigger automated crisis response protocols

    console.error('CRITICAL CASE ESCALATED:', {
      alertId,
      userId: alert.userId,
      conversationId: alert.conversationId,
      riskLevel: alert.riskAnalysis.riskLevel,
      confidence: alert.riskAnalysis.confidence,
      timestamp: new Date(alert.timestamp).toISOString()
    });
  }

  public async reviewAlert(
    alertId: string, 
    reviewedBy: string, 
    notes?: string, 
    newStatus: 'reviewed' | 'escalated' | 'resolved' = 'reviewed'
  ): Promise<boolean> {
    const alert = this.alerts.get(alertId);
    if (!alert) return false;

    alert.status = newStatus;
    alert.assignedTo = reviewedBy;
    alert.notes = notes;

    this.logIntervention(alertId, 'ADMIN_REVIEW', reviewedBy, notes || 'Alert reviewed by admin');

    // Update persistent storage
    this.persistAlert(alert);

    return true;
  }

  private logIntervention(
    alertId: string, 
    action: string, 
    performedBy: string, 
    notes?: string
  ): void {
    const log: CrisisInterventionLog = {
      alertId,
      timestamp: Date.now(),
      action,
      performedBy,
      outcome: notes
    };

    this.interventionLogs.push(log);
    this.persistInterventionLog(log);
  }

  public getAlerts(status?: 'pending' | 'reviewed' | 'escalated' | 'resolved'): AdminAlert[] {
    const alerts = Array.from(this.alerts.values());
    
    if (status) {
      return alerts.filter(alert => alert.status === status);
    }
    
    return alerts.sort((a, b) => {
      // Sort by urgency: critical first, then by timestamp
      const urgencyOrder: { [key: string]: number } = { critical: 4, high: 3, medium: 2, low: 1 };
      const urgencyA = urgencyOrder[a.riskAnalysis.riskLevel] || 0;
      const urgencyB = urgencyOrder[b.riskAnalysis.riskLevel] || 0;
      
      if (urgencyA !== urgencyB) {
        return urgencyB - urgencyA;
      }
      
      return b.timestamp - a.timestamp;
    });
  }

  public getPendingCriticalAlerts(): AdminAlert[] {
    return this.getAlerts('pending').filter(
      alert => alert.riskAnalysis.riskLevel === 'critical'
    );
  }

  public getAlertById(alertId: string): AdminAlert | undefined {
    return this.alerts.get(alertId);
  }

  public getInterventionLogs(alertId?: string): CrisisInterventionLog[] {
    if (alertId) {
      return this.interventionLogs.filter(log => log.alertId === alertId);
    }
    return this.interventionLogs.sort((a, b) => b.timestamp - a.timestamp);
  }

  public generateRiskReport(timeRangeHours: number = 24): {
    totalAlerts: number;
    criticalAlerts: number;
    highRiskAlerts: number;
    resolvedAlerts: number;
    averageResponseTime: number;
    riskTrends: { [key: string]: number };
  } {
    const cutoffTime = Date.now() - (timeRangeHours * 60 * 60 * 1000);
    const recentAlerts = Array.from(this.alerts.values())
      .filter(alert => alert.timestamp >= cutoffTime);

    const criticalAlerts = recentAlerts.filter(a => a.riskAnalysis.riskLevel === 'critical').length;
    const highRiskAlerts = recentAlerts.filter(a => a.riskAnalysis.riskLevel === 'high').length;
    const resolvedAlerts = recentAlerts.filter(a => a.status === 'resolved').length;

    // Calculate average response time for resolved alerts
    const resolvedWithLogs = recentAlerts.filter(a => a.status === 'resolved');
    let totalResponseTime = 0;
    let responseCount = 0;

    resolvedWithLogs.forEach(alert => {
      const logs = this.getInterventionLogs(alert.id);
      const firstResponse = logs.find(log => log.action === 'ADMIN_REVIEW');
      if (firstResponse) {
        totalResponseTime += firstResponse.timestamp - alert.timestamp;
        responseCount++;
      }
    });

    const averageResponseTime = responseCount > 0 ? totalResponseTime / responseCount : 0;

    // Risk trends by hour
    const riskTrends: { [key: string]: number } = {};
    recentAlerts.forEach(alert => {
      const hour = new Date(alert.timestamp).getHours();
      const key = `${hour}:00`;
      riskTrends[key] = (riskTrends[key] || 0) + 1;
    });

    return {
      totalAlerts: recentAlerts.length,
      criticalAlerts,
      highRiskAlerts,
      resolvedAlerts,
      averageResponseTime: Math.round(averageResponseTime / (1000 * 60)), // Convert to minutes
      riskTrends
    };
  }

  private persistAlert(alert: AdminAlert): void {
    // In a real implementation, this would save to your database
    // For now, we'll use localStorage as a fallback
    try {
      const existingAlerts = JSON.parse(localStorage.getItem('adminAlerts') || '[]');
      const alertIndex = existingAlerts.findIndex((a: AdminAlert) => a.id === alert.id);
      
      if (alertIndex >= 0) {
        existingAlerts[alertIndex] = alert;
      } else {
        existingAlerts.push(alert);
      }
      
      localStorage.setItem('adminAlerts', JSON.stringify(existingAlerts));
    } catch (error) {
      console.error('Failed to persist alert:', error);
    }
  }

  private persistInterventionLog(log: CrisisInterventionLog): void {
    try {
      const existingLogs = JSON.parse(localStorage.getItem('interventionLogs') || '[]');
      existingLogs.push(log);
      localStorage.setItem('interventionLogs', JSON.stringify(existingLogs));
    } catch (error) {
      console.error('Failed to persist intervention log:', error);
    }
  }

  public loadPersistedData(): void {
    try {
      // Load alerts
      const persistedAlerts = JSON.parse(localStorage.getItem('adminAlerts') || '[]');
      persistedAlerts.forEach((alert: AdminAlert) => {
        this.alerts.set(alert.id, alert);
      });

      // Load intervention logs
      const persistedLogs = JSON.parse(localStorage.getItem('interventionLogs') || '[]');
      this.interventionLogs = persistedLogs;
    } catch (error) {
      console.error('Failed to load persisted data:', error);
    }
  }
}

// Export singleton instance
export const adminDashboard = AdminDashboardIntegration.getInstance();

// Initialize with persisted data
adminDashboard.loadPersistedData();

export default {
  adminDashboard,
  AdminDashboardIntegration
};

export type { AdminAlert, CrisisInterventionLog };
