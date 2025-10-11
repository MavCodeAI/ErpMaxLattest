import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { useHR } from "@/hooks/useHR";
import { AddEmployeeDialog } from "@/components/AddEmployeeDialog";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const HR = () => {
  const { employees, isLoading, createEmployee } = useHR();

  const activeEmployees = employees.filter(emp => emp.status === "Active").length;
  const totalSalary = employees
    .filter(emp => emp.status === "Active")
    .reduce((sum, emp) => sum + Number(emp.salary), 0);

  return (
    <Layout>
      <div className="p-4 md:p-8 space-y-4 md:space-y-6">
        <Breadcrumbs />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Human Resources</h1>
            <p className="text-sm md:text-base text-muted-foreground mt-1">Manage employees and attendance</p>
          </div>
          <AddEmployeeDialog onAdd={createEmployee} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Total Employees"
            value={employees.length.toString()}
            icon={Users}
          />
          <StatCard
            title="Active Employees"
            value={activeEmployees.toString()}
            icon={UserCheck}
          />
          <StatCard
            title="Total Payroll"
            value={`Rs ${totalSalary.toLocaleString()}`}
            icon={Users}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Employee List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Salary</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">Loading...</TableCell>
                    </TableRow>
                  ) : employees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No employees yet. Add your first employee!
                      </TableCell>
                    </TableRow>
                  ) : (
                    employees.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell className="font-medium">{employee.employee_id}</TableCell>
                        <TableCell>{employee.name}</TableCell>
                        <TableCell>{employee.department}</TableCell>
                        <TableCell>{employee.position}</TableCell>
                        <TableCell>Rs {Number(employee.salary).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={employee.status === "Active" ? "default" : "secondary"}>
                            {employee.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default HR;
