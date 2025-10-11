import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderKanban, CheckCircle2 } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { useProjects } from "@/hooks/useProjects";
import { AddProjectDialog } from "@/components/AddProjectDialog";
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

const Projects = () => {
  const { projects, tasks, isLoading, createProject } = useProjects();

  const activeProjects = projects.filter(p => p.status === "Active").length;
  const completedTasks = tasks.filter(t => t.status === "Completed").length;

  return (
    <Layout>
      <div className="p-4 md:p-8 space-y-4 md:space-y-6">
        <Breadcrumbs />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Projects</h1>
            <p className="text-sm md:text-base text-muted-foreground mt-1">Manage projects and tasks</p>
          </div>
          <AddProjectDialog onAdd={createProject} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Total Projects"
            value={projects.length.toString()}
            icon={FolderKanban}
          />
          <StatCard
            title="Active Projects"
            value={activeProjects.toString()}
            icon={FolderKanban}
          />
          <StatCard
            title="Completed Tasks"
            value={completedTasks.toString()}
            icon={CheckCircle2}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Budget</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">Loading...</TableCell>
                    </TableRow>
                  ) : projects.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No projects yet. Create your first project!
                      </TableCell>
                    </TableRow>
                  ) : (
                    projects.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell className="font-medium">{project.project_id}</TableCell>
                        <TableCell>{project.name}</TableCell>
                        <TableCell>
                          <Badge variant={project.status === "Active" ? "default" : "secondary"}>
                            {project.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(project.start_date).toLocaleDateString()}</TableCell>
                        <TableCell>Rs {Number(project.budget || 0).toLocaleString()}</TableCell>
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

export default Projects;
