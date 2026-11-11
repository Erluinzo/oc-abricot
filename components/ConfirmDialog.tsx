"use client";

import { useEffect, useId, useRef } from "react";
import form from "./Form.module.css";
import modal from "./Modal.module.css";
import styles from "./ConfirmDialog.module.css";

type Props = {
  title: string;
  text: string;
  onConfirm: () => void;
  //called after "Annuler", escape and "Supprimer"
  onClose: () => void;
};

//asks before a delete (not in figma: it replaces the browser confirm box).
//It exists only while it is open. The focus starts on "Annuler", the safe choice
export default function ConfirmDialog({
  title,
  text,
  onConfirm,
  onClose,
}: Props) {
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);

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
      aria-describedby={`${id}-text`}
      className={`${modal.dialog} ${styles.confirm}`}
    >
      <h2 id={`${id}-title`}>{title}</h2>
      <p id={`${id}-text`}>{text}</p>
      <div className={styles.buttons}>
        <button
          type="button"
          onClick={() => dialog.current?.close()}
          className={form.outline}
        >
          Annuler
        </button>
        <button
          type="button"
          onClick={() => {
            onConfirm();
            dialog.current?.close();
          }}
          className={form.button}
        >
          Supprimer
        </button>
      </div>
    </dialog>
  );
}
