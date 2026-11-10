"use client";

import { useActionState, useRef, useState } from "react";
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
};

//"Créer un projet" / "Modifier un projet" button and its modal (native <dialog>:
//focus, escape key and screen readers are handled by the browser, no library needed)
export default function ProjectModal({ ownerId, project }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  //the button stays grey until the required fields are filled (figma)
  const [ready, setReady] = useState(Boolean(project?.description));
  const [state, formAction, pending] = useActionState(
    async (prev: ProjectState & { saves: number }, formData: FormData) => {
      const result = project
        ? await updateProject(project.id, prev, formData)
        : await createProject(prev, formData);
      if (result.error) {
        return { ...result, saves: prev.saves };
      }
      dialog.current?.close();
      setReady(Boolean(project));
      //one more save: the form (its key) is drawn again with the saved values
      return { ...result, saves: prev.saves + 1 };
    },
    {
      error: "",
      name: project?.name ?? "",
      description: project?.description ?? "",
      saves: 0,
    },
  );
  const describedBy = state.error ? "project-error" : undefined;

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        className={project ? form.link : `${form.button} ${modal.open}`}
      >
        {project ? "Modifier" : "+ Créer un projet"}
      </button>
      <dialog
        ref={dialog}
        aria-labelledby="project-modal-title"
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
        <h2 id="project-modal-title">
          {project ? "Modifier un projet" : "Créer un projet"}
        </h2>
        <form
          key={state.saves}
          action={formAction}
          onChange={(e) => setReady(e.currentTarget.checkValidity())}
          className={modal.form}
        >
          <div className={modal.fields}>
            <div className={form.field}>
              <label htmlFor="project-name">Titre*</label>
              <input
                id="project-name"
                name="name"
                defaultValue={state.name}
                required
                aria-describedby={describedBy}
              />
            </div>
            <div className={form.field}>
              <label htmlFor="project-description">Description*</label>
              <input
                id="project-description"
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
              <p id="project-error" role="alert" className={form.error}>
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
    </>
  );
}
