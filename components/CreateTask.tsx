"use client";

import { useState } from "react";
import type { User } from "@/lib/api";
import TaskModal from "./TaskModal";
import form from "./Form.module.css";
import styles from "./TaskModal.module.css";

//"Créer une tâche" button of the project page and its modal
export default function CreateTask({
  projectId,
  members,
}: {
  projectId: string;
  members: User[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`${form.button} ${styles.create}`}
      >
        Créer une tâche
      </button>
      {open && (
        <TaskModal
          projectId={projectId}
          members={members}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
