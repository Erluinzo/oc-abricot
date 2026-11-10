"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import type { Task, User } from "@/lib/api";
import { STATUS } from "@/lib/format";
import { saveTask, type TaskState } from "@/lib/tasks";
import AssigneePicker from "./AssigneePicker";
import { CloseIcon } from "./Icons";
import form from "./Form.module.css";
import modal from "./Modal.module.css";
import status from "./Status.module.css";
import styles from "./TaskModal.module.css";

type Props = {
  projectId: string;
  members: User[];
  //given: "Modifier" with the task values, missing: "Créer une tâche"
  task?: Task;
  onClose: () => void;
};

//figma "Modale création de tâche" / "Modale modifier une tâche".
//It exists only while it is open: each opening starts with fresh values
export default function TaskModal({
  projectId,
  members,
  task,
  onClose,
}: Props) {
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  //the button stays grey until the required fields are filled (figma)
  const [ready, setReady] = useState(
    Boolean(task?.description && task.dueDate),
  );
  const [state, formAction, pending] = useActionState(
    async (prev: TaskState, formData: FormData) => {
      const result = await saveTask(projectId, task?.id, prev, formData);
      if (!result.error) {
        dialog.current?.close();
      }
      return result;
    },
    {
      error: "",
      title: task?.title ?? "",
      description: task?.description ?? "",
      //the date field wants "2024-03-09"
      dueDate: task?.dueDate?.slice(0, 10) ?? "",
      status: task?.status ?? "TODO",
    },
  );
  const describedBy = state.error ? `${id}-error` : undefined;

  //opened once, when it appears (the dev mode runs effects twice: open only if closed)
  useEffect(() => {
    if (!dialog.current?.open) {
      dialog.current?.showModal();
    }
  }, []);

  //the edit modal labels have no star in figma
  const star = task ? "" : "*";

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      aria-labelledby={`${id}-title`}
      className={modal.dialog}
    >
      <button
        type="button"
        onClick={() => dialog.current?.close()}
        aria-label="Fermer"
        className={modal.close}
      >
        <CloseIcon />
      </button>
      <h2 id={`${id}-title`}>{task ? "Modifier" : "Créer une tâche"}</h2>
      <form
        action={formAction}
        onChange={(e) => setReady(e.currentTarget.checkValidity())}
        className={modal.form}
      >
        <div className={modal.fields}>
          <div className={form.field}>
            <label htmlFor={`${id}-name`}>Titre{star}</label>
            <input
              id={`${id}-name`}
              name="title"
              defaultValue={state.title}
              required
              aria-describedby={describedBy}
            />
          </div>
          <div className={form.field}>
            <label htmlFor={`${id}-description`}>Description{star}</label>
            <input
              id={`${id}-description`}
              name="description"
              defaultValue={state.description}
              required
              aria-describedby={describedBy}
            />
          </div>
          <div className={form.field}>
            <label htmlFor={`${id}-date`}>Échéance{star}</label>
            <input
              id={`${id}-date`}
              name="dueDate"
              type="date"
              defaultValue={state.dueDate}
              required
              aria-describedby={describedBy}
              className={styles.date}
            />
          </div>
          <AssigneePicker
            users={members}
            selectedIds={task?.assignees.map(({ user }) => user.id)}
          />
          <fieldset className={styles.status}>
            <legend>Statut :</legend>
            <div>
              {(["TODO", "IN_PROGRESS", "DONE"] as const).map((value) => (
                <label key={value} className={`${status.tag} ${status[value]}`}>
                  <input
                    type="radio"
                    name="status"
                    value={value}
                    defaultChecked={state.status === value}
                  />
                  {STATUS[value]}
                </label>
              ))}
            </div>
          </fieldset>
          {state.error && (
            <p id={`${id}-error`} role="alert" className={form.error}>
              {state.error}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={!ready || pending}
          className={`${form.button} ${task ? styles.save : ""}`}
        >
          {task ? "Enregistrer" : "+ Ajouter une tâche"}
        </button>
      </form>
    </dialog>
  );
}
