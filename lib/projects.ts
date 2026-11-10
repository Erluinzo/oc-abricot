"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { apiFetch, getErrorMessage, type Project, type User } from "./api";

//name and description are sent back so the fields keep them after an error
export type ProjectState = { error: string; name: string; description: string };

export async function createProject(state: ProjectState, formData: FormData) {
  const name = String(formData.get("name"));
  const description = String(formData.get("description"));
  try {
    const data = await apiFetch("/projects", {
      method: "POST",
      //the contributors are sent by email, the backend adds them to the project
      body: JSON.stringify({
        name,
        description,
        contributors: formData.getAll("contributors"),
      }),
    });
    if (!data.success) {
      return { error: getErrorMessage(data), name, description };
    }
  } catch (err) {
    //a refused token redirects to the login page: let it through
    unstable_rethrow(err);
    console.log(err);
    return { error: "Erreur de connexion au serveur", name, description };
  }
  revalidatePath("/projects");
  return { error: "", name: "", description: "" };
}

export async function updateProject(
  id: string,
  state: ProjectState,
  formData: FormData,
) {
  const name = String(formData.get("name"));
  const description = String(formData.get("description"));
  const emails = formData.getAll("contributors").map(String);
  const path = "/projects/" + encodeURIComponent(id);
  try {
    const data = await apiFetch(path, {
      method: "PUT",
      body: JSON.stringify({ name, description }),
    });
    if (!data.success) {
      return { error: getErrorMessage(data), name, description };
    }
    //the backend changes contributors one by one: compare the saved list with the new one
    const project: Project = data.data.project;
    const members = project.members
      .map((member) => member.user)
      .filter((user) => user.id !== project.ownerId);
    const added = emails.filter(
      (email) => !members.some((user) => user.email === email),
    );
    const removed = members.filter((user) => !emails.includes(user.email));
    for (const email of added) {
      const result = await apiFetch(path + "/contributors", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      if (!result.success) {
        return { error: getErrorMessage(result), name, description };
      }
    }
    for (const user of removed) {
      const result = await apiFetch(`${path}/contributors/${user.id}`, {
        method: "DELETE",
      });
      if (!result.success) {
        return { error: getErrorMessage(result), name, description };
      }
    }
  } catch (err) {
    unstable_rethrow(err);
    console.log(err);
    return { error: "Erreur de connexion au serveur", name, description };
  }
  //"layout": the projects list and the project page both show the change
  revalidatePath("/projects", "layout");
  return { error: "", name, description };
}

//returns an error text, or goes back to the projects list
export async function deleteProject(id: string) {
  try {
    const data = await apiFetch("/projects/" + encodeURIComponent(id), {
      method: "DELETE",
    });
    if (!data.success) {
      return getErrorMessage(data);
    }
  } catch (err) {
    unstable_rethrow(err);
    console.log(err);
    return "Erreur de connexion au serveur";
  }
  revalidatePath("/projects");
  redirect("/projects");
}

//called by the contributors list while the user types (2 letters minimum)
export async function searchUsers(query: string) {
  try {
    const data = await apiFetch(
      "/users/search?query=" + encodeURIComponent(query),
    );
    return (data.data?.users ?? []) as User[];
  } catch (err) {
    unstable_rethrow(err);
    console.log(err);
    return [];
  }
}
