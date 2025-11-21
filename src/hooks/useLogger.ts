import { Logger, AuditLogDetails } from "@/utils/logger";
import { useAuth } from "./useAuth";

export const useLogger = () => {
  const { user } = useAuth();

  const logAction = (
    action: string,
    entityType: string,
    entityId?: string,
    details?: AuditLogDetails
  ) => {
    if (user) {
      Logger.logAction(user.id, action, entityType, entityId, details);
    }
  };

  const logUserAction = (action: string, details?: AuditLogDetails) => {
    if (user) {
      Logger.logUserAction(user.id, action, details);
    }
  };

  const logInvoiceAction = (
    action: string,
    invoiceId?: string,
    details?: AuditLogDetails
  ) => {
    if (user) {
      Logger.logInvoiceAction(user.id, action, invoiceId, details);
    }
  };

  const logInventoryAction = (
    action: string,
    itemId?: string,
    details?: AuditLogDetails
  ) => {
    if (user) {
      Logger.logInventoryAction(user.id, action, itemId, details);
    }
  };

  const logPurchaseAction = (
    action: string,
    orderId?: string,
    details?: AuditLogDetails
  ) => {
    if (user) {
      Logger.logPurchaseAction(user.id, action, orderId, details);
    }
  };

  const logEmployeeAction = (
    action: string,
    employeeId?: string,
    details?: AuditLogDetails
  ) => {
    if (user) {
      Logger.logEmployeeAction(user.id, action, employeeId, details);
    }
  };

  const logProjectAction = (
    action: string,
    projectId?: string,
    details?: AuditLogDetails
  ) => {
    if (user) {
      Logger.logProjectAction(user.id, action, projectId, details);
    }
  };

  const getRecentLogs = async (limit: number = 50) => {
    return Logger.getRecentLogs(limit);
  };

  return {
    logAction,
    logUserAction,
    logInvoiceAction,
    logInventoryAction,
    logPurchaseAction,
    logEmployeeAction,
    logProjectAction,
    getRecentLogs,
  };
};