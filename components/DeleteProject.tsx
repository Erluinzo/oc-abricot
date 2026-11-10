"use client";

import { useActionState } from "react";
import { deleteProject } from "@/lib/projects";
import form from "./Form.module.css";

//not in figma: the spec asks that the owner can delete a project
export default function DeleteProject({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const [error, formAction, pending] = useActionState(
    async () => deleteProject(id),
    "",
  );

  return (
    <form
      action={formAction}
      //the browser asks before deleting: it can't be undone
      onSubmit={(e) => {
        if (
          !confirm(
            `Supprimer le projet « ${name} » ? Cette action est définitive.`,
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <button type="submit" disabled={pending} className={form.link}>
        Supprimer
      </button>
      {error && (
        <p role="alert" className={form.error}>
          {error}
        </p>
      )}
    </form>
  );
}
