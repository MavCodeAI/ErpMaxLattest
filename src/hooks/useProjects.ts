import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLogger } from "./useLogger";

export interface Project {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date?: string;
  budget?: number;
  status: string;
  priority?: string;
  manager?: string;
  team_members?: string[];
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  assigned_to?: string;
  status: string;
  priority: string;
  due_date?: string;
  created_at?: string;
  updated_at?: string;
}

export const useProjects = () => {
  const queryClient = useQueryClient();
  const { logProjectAction } = useLogger();

  const { data: projects = [], isLoading: projectsLoading, isError: projectsError } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Project[];
    },
  });

  const { data: tasks = [], isLoading: tasksLoading, isError: tasksError } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Task[];
    },
  });

  const createProject = useMutation({
    mutationFn: async (project: Omit<Project, "id">) => {
      const { data, error } = await supabase
        .from("projects")
        .insert(project)
        .select()
        .single();
      if (error) throw error;
      return data as Project;
    },
    onMutate: () => {
      toast.loading("Creating project...");
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project created successfully");
      logProjectAction("CREATE", data.id, { 
        name: data.name,
        status: data.status,
        budget: data.budget
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to create project: " + error.message);
    },
  });

  const updateProject = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Project> & { id: string }) => {
      const { data, error } = await supabase
        .from("projects")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as Project;
    },
    onMutate: () => {
      toast.loading("Updating project...");
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project updated successfully");
      logProjectAction("UPDATE", data.id, { 
        name: data.name,
        status: data.status,
        budget: data.budget
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to update project: " + error.message);
    },
  });

  const deleteProject = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onMutate: () => {
      toast.loading("Deleting project...");
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project deleted successfully");
      logProjectAction("DELETE", variables);
    },
    onError: (error: Error) => {
      toast.error("Failed to delete project: " + error.message);
    },
  });

  return {
    projects,
    tasks,
    isLoading: projectsLoading || tasksLoading,
    isError: projectsError || tasksError,
    createProject: createProject.mutate,
    updateProject: updateProject.mutate,
    deleteProject: deleteProject.mutate,
  };
};