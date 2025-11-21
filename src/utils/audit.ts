// Audit logging utilities
export type AuditLogDetails = Record<string, unknown>;

export interface AuditLog {
  id?: string;
  user_id?: string;
  action: string;
  entity: string;
  entity_id?: string;
  details: AuditLogDetails;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
}

class AuditLogger {
  private logs: AuditLog[] = [];

  log(action: string, entity: string, details: AuditLogDetails = {}, entityId?: string) {
    const auditLog: AuditLog = {
      user_id: this.getCurrentUserId(),
      action,
      entity,
      entity_id: entityId,
      details: {
        ...details,
        timestamp: new Date().toISOString(),
        url: window.location.href
      },
      ip_address: '', // Would need server-side implementation
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };

    this.logs.push(auditLog);

    // In a real implementation, this would send to the server
    console.log('Audit Log:', auditLog);

    // Keep only last 1000 logs in memory
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }

    return auditLog;
  }

  getLogs(): AuditLog[] {
    return this.logs;
  }

  getLogsByEntity(entity: string): AuditLog[] {
    return this.logs.filter(log => log.entity === entity);
  }

  private getCurrentUserId(): string | undefined {
    // In a real implementation, this would get from auth context
    return 'current-user-id';
  }
}

export const auditLogger = new AuditLogger();

// Common audit actions
export const AuditActions = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  VIEW: 'VIEW',
  EXPORT: 'EXPORT',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT'
};

// Helper function for common audit scenarios
export const logUserAction = (action: string, details: AuditLogDetails) => {
  return auditLogger.log(action, 'USER', details);
};

export const logEntityAction = (action: string, entity: string, entityId: string, details: AuditLogDetails = {}) => {
  return auditLogger.log(action, entity, details, entityId);
};

// Specific logging functions for different entities
export const logInvoiceAction = (action: string, invoiceId: string, details: AuditLogDetails = {}) => {
  return logEntityAction(action, 'INVOICE', invoiceId, details);
};

export const logPurchaseOrderAction = (action: string, orderId: string, details: AuditLogDetails = {}) => {
  return logEntityAction(action, 'PURCHASE_ORDER', orderId, details);
};

export const logInventoryAction = (action: string, itemId: string, details: AuditLogDetails = {}) => {
  return logEntityAction(action, 'INVENTORY_ITEM', itemId, details);
};

export const logTransactionAction = (action: string, transactionId: string, details: AuditLogDetails = {}) => {
  return logEntityAction(action, 'TRANSACTION', transactionId, details);
};
