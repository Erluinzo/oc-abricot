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
      const result = await apiFetch(
        `${path}/${encodeURIComponent(data.data.task.id)}`,
        {
          method: "PUT",
          body: JSON.stringify({ status: values.status }),
        },
      );
      if (!result.success) {
        //no half saved task: the user can send the form again
        await apiFetch(`${path}/${encodeURIComponent(data.data.task.id)}`, {
          method: "DELETE",
        });
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
  return { ...values, error: "" };
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

//creates the tasks proposed by the AI ("to do", no date, nobody assigned).
//"created" tells how many were saved before an error: they are not sent twice
export async function addTasks(
  projectId: string,
  tasks: { title: string; description: string }[],
) {
  let created = 0;
  let error = "";
  try {
    for (const task of Array.isArray(tasks) ? tasks.slice(0, 100) : []) {
      const data = await apiFetch(
        `/projects/${encodeURIComponent(projectId)}/tasks`,
        {
          method: "POST",
          body: JSON.stringify({
            title: String(task?.title ?? ""),
            description: String(task?.description ?? ""),
          }),
        },
      );
      if (!data.success) {
        error = getErrorMessage(data);
        break;
      }
      created++;
    }
  } catch (err) {
    unstable_rethrow(err);
    console.log(err);
    error = "Erreur de connexion au serveur";
  }
  revalidatePath("/projects", "layout");
  return { error, created };
}
