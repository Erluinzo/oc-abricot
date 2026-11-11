"use client";

import { useState, useTransition } from "react";
import { deleteProject } from "@/lib/projects";
import ConfirmDialog from "./ConfirmDialog";
import form from "./Form.module.css";

type Props = {
  id: string;
  name: string;
};

//not in figma: the spec asks that the owner can delete a project
export default function DeleteProject({ id, name }: Props) {
  const [error, setError] = useState("");
  const [deleting, startDelete] = useTransition();
  const [confirming, setConfirming] = useState(false);

  //after "Supprimer" in the confirm modal: it can't be undone
  function remove() {
    //on success the action goes back to the projects list
    startDelete(async () => setError(await deleteProject(id)));
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        disabled={deleting}
        className={form.link}
      >
        Supprimer
      </button>
      {confirming && (
        <ConfirmDialog
          title="Supprimer le projet ?"
          text={`Le projet « ${name} » et toutes ses tâches seront supprimés. Cette action est définitive.`}
          onConfirm={remove}
          onClose={() => setConfirming(false)}
        />
      )}
      {error && (
        <p role="alert" className={form.error}>
          {error}
        </p>
      )}
    </>
  );
}
