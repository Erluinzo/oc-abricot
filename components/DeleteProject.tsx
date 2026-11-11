"use client";

import { useState, useTransition } from "react";
import { deleteProject } from "@/lib/projects";
import form from "./Form.module.css";

type Props = {
  id: string;
  name: string;
};

//not in figma: the spec asks that the owner can delete a project
export default function DeleteProject({ id, name }: Props) {
  const [error, setError] = useState("");
  const [deleting, startDelete] = useTransition();

  function remove() {
    //the browser asks before deleting: it can't be undone
    if (
      !confirm(`Supprimer le projet « ${name} » ? Cette action est définitive.`)
    ) {
      return;
    }
    //on success the action goes back to the projects list
    startDelete(async () => setError(await deleteProject(id)));
  }

  return (
    <>
      <button
        type="button"
        onClick={remove}
        disabled={deleting}
        className={form.link}
      >
        Supprimer
      </button>
      {error && (
        <p role="alert" className={form.error}>
          {error}
        </p>
      )}
    </>
  );
}
