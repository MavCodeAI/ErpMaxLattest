import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLogger } from "@/hooks/useLogger";
import { useQuery } from "@tanstack/react-query";
import { Loader2, FileText, Calendar, User, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AuditLogs = () => {
  const { getRecentLogs } = useLogger();
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: () => getRecentLogs(100),
  });

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      searchTerm === "" ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.entity_id && log.entity_id.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesAction = actionFilter === "all" || log.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  const getActionBadge = (action: string) => {
    if (action === "CREATE") return <Badge className="bg-green-500">Create</Badge>;
    if (action === "UPDATE") return <Badge className="bg-blue-500">Update</Badge>;
    if (action === "DELETE") return <Badge className="bg-red-500">Delete</Badge>;
    return <Badge>{action}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>Loading audit logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Audit Logs
          </h1>
          <p className="text-muted-foreground mt-1">
            Track all system activities and changes
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search audit logs"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-full sm:w-32" aria-label="Filter by action">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="CREATE">Create</SelectItem>
                <SelectItem value="UPDATE">Update</SelectItem>
                <SelectItem value="DELETE">Delete</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logs List */}
      <Card>
        <CardHeader className="border-b bg-muted/50">
          <CardTitle>Activity Log</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="mx-auto h-12 w-12 opacity-50 mb-2" />
                No audit logs found
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-4 pb-4 border-b last:border-b-0 hover:bg-muted/50 p-3 rounded-lg transition-colors"
                >
                  <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                    <Activity className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getActionBadge(log.action)}
                      <span className="font-medium">{log.entity_type}</span>
                      {log.entity_id && (
                        <span className="text-sm text-muted-foreground">
                          ID: {log.entity_id}
                        </span>
                      )}
                    </div>
                    {log.details && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        {Object.entries(log.details).map(([key, value]) => (
                          <div key={key}>
                            <span className="font-medium">{key}:</span>{" "}
                            {typeof value === "object" ? JSON.stringify(value) : String(value)}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {log.user_id}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLogs;
