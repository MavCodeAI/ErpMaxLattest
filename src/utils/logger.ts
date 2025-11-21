import { supabase } from "@/integrations/supabase/client";

export type AuditLogDetails = Record<string, unknown> | null | undefined;

export interface AuditLog {
  id?: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: AuditLogDetails;
  timestamp: string;
}

export class Logger {
  static async logAction(
    userId: string,
    action: string,
    entityType: string,
    entityId?: string,
    details?: AuditLogDetails
  ) {
    try {
      const logEntry = {
        user_id: userId,
        action,
        entity_type: entityType,
        entity_id: entityId,
        details,
        timestamp: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("audit_logs")
        .insert([logEntry]);

      if (error) {
        console.error("Failed to log action:", error);
      }
    } catch (error) {
      console.error("Error logging action:", error);
    }
  }

  static async logUserAction(
    userId: string,
    action: string,
    details?: AuditLogDetails
  ) {
    return this.logAction(userId, action, "user", userId, details);
  }

  static async logInvoiceAction(
    userId: string,
    action: string,
    invoiceId?: string,
    details?: AuditLogDetails
  ) {
    return this.logAction(userId, action, "invoice", invoiceId, details);
  }

  static async logInventoryAction(
    userId: string,
    action: string,
    itemId?: string,
    details?: AuditLogDetails
  ) {
    return this.logAction(userId, action, "inventory", itemId, details);
  }

  static async logPurchaseAction(
    userId: string,
    action: string,
    orderId?: string,
    details?: AuditLogDetails
  ) {
    return this.logAction(userId, action, "purchase", orderId, details);
  }

  static async logEmployeeAction(
    userId: string,
    action: string,
    employeeId?: string,
    details?: AuditLogDetails
  ) {
    return this.logAction(userId, action, "employee", employeeId, details);
  }

  static async logProjectAction(
    userId: string,
    action: string,
    projectId?: string,
    details?: AuditLogDetails
  ) {
    return this.logAction(userId, action, "project", projectId, details);
  }

  static async getRecentLogs(limit: number = 50): Promise<AuditLog[]> {
    try {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Failed to fetch audit logs:", error);
        return [];
      }

      return (data ?? []) as AuditLog[];
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      return [];
    }
  }
}
