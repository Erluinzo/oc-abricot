import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

const API_URL = "http://localhost:8000";

//calls the backend from the next.js server, never from the browser:
//the token stays in an httpOnly cookie and the backend cors is not a problem
export async function apiFetch(path: string, options: RequestInit = {}) {
  //an id "." or ".." would change the backend route (encodeURIComponent keeps dots)
  const parts = path.split("?")[0].split("/");
  if (parts.includes(".") || parts.includes("..")) {
    return { success: false, message: "Requête invalide" };
  }
  const token = (await cookies()).get("token")?.value;
  const res = await fetch(API_URL + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  //expired or wrong token: remove the cookie and go back to the login page
  if (data.error === "Authentication failed") {
    let target = "/login";
    try {
      //allowed in a server action (form submit)
      (await cookies()).delete("token");
    } catch {
      //not allowed while a page renders: proxy.ts deletes it on /logout
      target = "/logout";
    }
    redirect(target);
  }
  return data;
}

//the backend sends one message, plus one message per wrong field
export function getErrorMessage(data: {
  message: string;
  data?: { errors?: { message: string }[] };
}) {
  const errors = data.data?.errors;
  return errors ? errors.map((err) => err.message).join(". ") : data.message;
}

export type User = { id: string; email: string; name: string | null };

export type Project = {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  owner: User;
  members: { user: User }[];
};

export type Task = {
  id: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate: string | null;
  assignees: { user: User }[];
  comments: { id: string; content: string; createdAt: string; author: User }[];
  projectId: string;
  //only in the dashboard answers
  project?: { id: string; name: string };
};

//cache: the layout and the page ask for the user, the backend is called once per page
export const getUser = cache(async () => {
  const data = await apiFetch("/auth/profile");
  return data.data.user as User;
});

//the project data has no assignees and no comments: this route has them
export async function getTasks(projectId: string) {
  const data = await apiFetch(
    `/projects/${encodeURIComponent(projectId)}/tasks`,
  );
  return data.data.tasks as Task[];
}

export type ProjectWithTasks = Project & { tasks: Task[] };

//every project of the user with its tasks (they give the progress)
//the projects list has no task status: the tasks are asked for each project, all at the same time
export async function getProjectsWithTasks() {
  const data = await apiFetch("/projects");
  const projects: Project[] = data.data.projects;
  return Promise.all(
    projects.map(async (project): Promise<ProjectWithTasks> => ({
      ...project,
      tasks: await getTasks(project.id),
    })),
  );
}

//null when the project doesn't exist or the user isn't in it (the backend says "forbidden" for both)
//cache: the page title and the page ask for the same project
export const getProject = cache(async (id: string) => {
  const data = await apiFetch("/projects/" + encodeURIComponent(id));
  return data.success ? (data.data.project as Project) : null;
});
