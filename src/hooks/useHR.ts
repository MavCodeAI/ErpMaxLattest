import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Employee {
  id: string;
  employee_id: string;
  name: string;
  email?: string;
  phone?: string;
  department: string;
  position: string;
  salary: number;
  status: string;
  hire_date: string;
}

export interface Attendance {
  id: string;
  employee_id: string;
  date: string;
  status: string;
  check_in?: string;
  check_out?: string;
}

export const useHR = () => {
  const queryClient = useQueryClient();

  const { data: employees = [], isLoading: employeesLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as Employee[];
    },
  });

  const { data: attendance = [], isLoading: attendanceLoading } = useQuery({
    queryKey: ["attendance"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("attendance")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      return data as Attendance[];
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
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee added successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to add employee: " + error.message);
    },
  });

  const updateEmployee = useMutation({
    mutationFn: async ({ id, ...employee }: Partial<Employee> & { id: string }) => {
      const { data, error } = await supabase
        .from("employees")
        .update(employee)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee updated successfully");
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee deleted successfully");
    },
  });

  return {
    employees,
    attendance,
    isLoading: employeesLoading || attendanceLoading,
    createEmployee: createEmployee.mutate,
    updateEmployee: updateEmployee.mutate,
    deleteEmployee: deleteEmployee.mutate,
  };
};
