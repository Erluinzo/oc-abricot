"use client";

import { useId, useRef, useState } from "react";
import type { User } from "@/lib/api";
import { ChevronIcon } from "./Icons";
import styles from "./Picker.module.css";

type Props = {
  //the project members: only they can get the task
  users: User[];
  selectedIds?: string[];
};

//figma "Assigné à" dropdown: the same look as the contributors list, with a checkbox per member
export default function AssigneePicker({ users, selectedIds }: Props) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(selectedIds ?? []);
  const button = useRef<HTMLButtonElement>(null);

  function toggle(userId: string) {
    setSelected(
      selected.includes(userId)
        ? selected.filter((item) => item !== userId)
        : [...selected, userId],
    );
  }

  return (
    <div
      className={styles.picker}
      //escape closes the list only (not the whole modal), the focus goes back to its button
      onKeyDown={(e) => {
        if (e.key === "Escape" && open) {
          e.preventDefault();
          setOpen(false);
          button.current?.focus();
        }
      }}
    >
      <span id={`${id}-label`}>Assigné à :</span>
      <button
        ref={button}
        type="button"
        id={`${id}-button`}
        aria-labelledby={`${id}-label ${id}-button`}
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        onClick={() => setOpen(!open)}
        className={styles.button}
      >
        {selected.length === 0
          ? "Choisir un ou plusieurs collaborateurs"
          : `${selected.length} collaborateur${selected.length > 1 ? "s" : ""}`}
        <ChevronIcon />
      </button>
      {open && (
        <div id={`${id}-panel`} className={styles.panel}>
          <ul className={styles.list}>
            {users.map((user) => (
              <li key={user.id}>
                <label className={styles.option}>
                  <input
                    type="checkbox"
                    checked={selected.includes(user.id)}
                    onChange={() => toggle(user.id)}
                  />
                  {user.name ? `${user.name} (${user.email})` : user.email}
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* what the form really sends: one id per selected member */}
      {selected.map((userId) => (
        <input key={userId} type="hidden" name="assigneeIds" value={userId} />
      ))}
    </div>
  );
}
