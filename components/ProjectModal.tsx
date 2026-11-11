"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import type { Project } from "@/lib/api";
import {
  createProject,
  updateProject,
  type ProjectState,
} from "@/lib/projects";
import ContributorPicker from "./ContributorPicker";
import { CloseIcon } from "./Icons";
import form from "./Form.module.css";
import modal from "./Modal.module.css";

type Props = {
  ownerId: string;
  //given: "Modifier un projet" with its values, missing: "Créer un projet"
  project?: Project;
  onClose: () => void;
};

//figma "Modale création projet" / "Modale modifier projet" (native <dialog>: focus,
//escape key and screen readers are handled by the browser, no library needed).
//It exists only while it is open: each opening starts with the saved values
export default function ProjectModal({ ownerId, project, onClose }: Props) {
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  //the button stays grey until the required fields are filled (figma)
  const [ready, setReady] = useState(Boolean(project?.description));
  const [state, formAction, pending] = useActionState(
    async (prev: ProjectState, formData: FormData) => {
      const result = project
        ? await updateProject(project.id, formData)
        : await createProject(formData);
      if (!result.error) {
        dialog.current?.close();
      }
      return result;
    },
    {
      error: "",
      name: project?.name ?? "",
      description: project?.description ?? "",
    },
  );
  const describedBy = state.error ? `${id}-error` : undefined;
  const errorText = useRef<HTMLParagraphElement>(null);

  //the button was disabled while saving: the focus goes to the error text
  useEffect(() => {
    if (state.error) {
      errorText.current?.focus();
    }
  }, [state]);

  //opened once, when it appears (the dev mode runs effects twice: open only if closed)
  useEffect(() => {
    if (!dialog.current?.open) {
      dialog.current?.showModal();
    }
  }, []);

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
      <h2 id={`${id}-title`}>
        {project ? "Modifier un projet" : "Créer un projet"}
      </h2>
      <form
        action={formAction}
        onChange={(e) => setReady(e.currentTarget.checkValidity())}
        className={modal.form}
      >
        <div className={modal.fields}>
          <div className={form.field}>
            <label htmlFor={`${id}-name`}>Titre*</label>
            <input
              id={`${id}-name`}
              name="name"
              defaultValue={state.name}
              required
              aria-describedby={describedBy}
            />
          </div>
          <div className={form.field}>
            <label htmlFor={`${id}-description`}>Description*</label>
            <input
              id={`${id}-description`}
              name="description"
              defaultValue={state.description}
              required
              aria-describedby={describedBy}
            />
          </div>
          <ContributorPicker
            ownerId={ownerId}
            selectedUsers={project?.members
              .map((member) => member.user)
              .filter((user) => user.id !== ownerId)}
          />
          {state.error && (
            <p
              id={`${id}-error`}
              role="alert"
              tabIndex={-1}
              ref={errorText}
              className={form.error}
            >
              {state.error}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={!ready || pending}
          className={form.button}
        >
          {project ? "Enregistrer" : "Ajouter un projet"}
        </button>
      </form>
    </dialog>
  );
}
