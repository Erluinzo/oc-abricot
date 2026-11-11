"use client";

import { useState } from "react";
import type { Project } from "@/lib/api";
import ProjectModal from "./ProjectModal";
import form from "./Form.module.css";
import modal from "./Modal.module.css";

type Props = {
  ownerId: string;
  //given: the "Modifier" link of the project page, missing: "+ Créer un projet"
  project?: Project;
};

//opens the project modal
export default function ProjectButton({ ownerId, project }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          project ? form.link : `${form.button} ${modal.createProject}`
        }
      >
        {project ? "Modifier" : "+ Créer un projet"}
      </button>
      {open && (
        <ProjectModal
          ownerId={ownerId}
          project={project}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
