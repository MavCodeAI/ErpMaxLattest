import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLogger } from "./useLogger";

export interface Employee {
  id: string;
  employee_id: string;
  name: string;
  email: string;
  phone?: string;
  position: string;
  department: string;
  salary: number;
  date_of_birth?: string;
  hire_date: string;
  status: string;
  address?: string;
  emergency_contact?: string;
  created_at?: string;
  updated_at?: string;
}

export const useHR = () => {
  const queryClient = useQueryClient();
  const { logEmployeeAction } = useLogger();

  const { data: employees = [], isLoading, isError } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .order("name")
        .limit(50); // Limit to 50 employees for better performance
      if (error) throw error;
      return data as Employee[];
    },
  });

  const createEmployee = useMutation({
    mutationFn: async (employee: Omit<Employee, "id">) => {
      const { data, error } = await supabase
        .from("employees")
        .insert(employee)
        .select()
        .single();
      if (error) throw error;
      return data as Employee;
    },
    onMutate: () => {
      toast.loading("Adding employee...");
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee added successfully");
      logEmployeeAction("CREATE", data.id, { 
        name: data.name,
        position: data.position,
        department: data.department
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to add employee: " + error.message);
    },
  });

  const updateEmployee = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Employee> & { id: string }) => {
      const { data, error } = await supabase
        .from("employees")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as Employee;
    },
    onMutate: () => {
      toast.loading("Updating employee...");
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee updated successfully");
      logEmployeeAction("UPDATE", data.id, { 
        name: data.name,
        position: data.position,
        department: data.department
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to update employee: " + error.message);
    },
  });

  const deleteEmployee = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("employees")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onMutate: () => {
      toast.loading("Deleting employee...");
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee deleted successfully");
      logEmployeeAction("DELETE", variables);
    },
    onError: (error: Error) => {
      toast.error("Failed to delete employee: " + error.message);
    },
  });

  return {
    employees,
    isLoading,
    isError,
    createEmployee: createEmployee.mutate,
    updateEmployee: updateEmployee.mutate,
    deleteEmployee: deleteEmployee.mutate,
  };
};
