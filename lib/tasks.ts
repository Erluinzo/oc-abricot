"use server";

import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { apiFetch, getErrorMessage } from "./api";

//the values are sent back so the fields keep them after an error
export type TaskState = {
  error: string;
  title: string;
  description: string;
  dueDate: string;
  status: string;
};

//creates the task, or updates it when taskId is given
export async function saveTask(
  projectId: string,
  taskId: string | undefined,
  state: TaskState,
  formData: FormData,
) {
  const values = {
    title: String(formData.get("title")),
    description: String(formData.get("description")),
    dueDate: String(formData.get("dueDate")),
    status: String(formData.get("status")),
  };
  const path = `/projects/${encodeURIComponent(projectId)}/tasks`;
  const body = { ...values, assigneeIds: formData.getAll("assigneeIds") };
  try {
    const data = taskId
      ? await apiFetch(`${path}/${encodeURIComponent(taskId)}`, {
          method: "PUT",
          body: JSON.stringify(body),
        })
      : await apiFetch(path, { method: "POST", body: JSON.stringify(body) });
    if (!data.success) {
      return { ...values, error: getErrorMessage(data) };
    }
    //the backend creates every task "to do": another status is saved in a second call
    if (!taskId && values.status !== "TODO") {
      const result = await apiFetch(`${path}/${data.data.task.id}`, {
        method: "PUT",
        body: JSON.stringify({ status: values.status }),
      });
      if (!result.success) {
        return { ...values, error: getErrorMessage(result) };
      }
    }
  } catch (err) {
    //a refused token redirects to the login page: let it through
    unstable_rethrow(err);
    console.log(err);
    return { ...values, error: "Erreur de connexion au serveur" };
  }
  //"layout": the project page and the progress on the projects list change
  revalidatePath("/projects", "layout");
  return taskId
    ? { ...values, error: "" }
    : { error: "", title: "", description: "", dueDate: "", status: "TODO" };
}

//returns an error text, empty when the task is deleted
export async function deleteTask(projectId: string, taskId: string) {
  try {
    const data = await apiFetch(
      `/projects/${encodeURIComponent(projectId)}/tasks/${encodeURIComponent(taskId)}`,
      { method: "DELETE" },
    );
    if (!data.success) {
      return getErrorMessage(data);
    }
  } catch (err) {
    unstable_rethrow(err);
    console.log(err);
    return "Erreur de connexion au serveur";
  }
  revalidatePath("/projects", "layout");
  return "";
}

//returns an error text, empty when the comment is saved
export async function addComment(
  projectId: string,
  taskId: string,
  formData: FormData,
) {
  try {
    const data = await apiFetch(
      `/projects/${encodeURIComponent(projectId)}/tasks/${encodeURIComponent(taskId)}/comments`,
      {
        method: "POST",
        body: JSON.stringify({ content: formData.get("content") }),
      },
    );
    if (!data.success) {
      return getErrorMessage(data);
    }
  } catch (err) {
    unstable_rethrow(err);
    console.log(err);
    return "Erreur de connexion au serveur";
  }
  revalidatePath("/projects", "layout");
  return "";
}
