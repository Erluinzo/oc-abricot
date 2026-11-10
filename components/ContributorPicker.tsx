"use client";

import { useRef, useState } from "react";
import type { User } from "@/lib/api";
import { searchUsers } from "@/lib/projects";
import { ChevronIcon } from "./Icons";
import form from "./Form.module.css";
import styles from "./ContributorPicker.module.css";

type Props = {
  //the owner is already in the project: not shown in the results
  ownerId: string;
  //edit modal: the contributors already in the project
  selectedUsers?: User[];
};

//figma "Contributeurs" dropdown. The backend can't list every user, only search them,
//so the list opens on a search field with a checkbox per user found
export default function ContributorPicker({ ownerId, selectedUsers }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  //the users found and the search they answer (empty while waiting for the backend)
  const [results, setResults] = useState({ query: "", users: [] as User[] });
  const [selected, setSelected] = useState(selectedUsers ?? []);
  //the users on top of the list: an unchecked one stays until the next search
  const [shown, setShown] = useState(selectedUsers ?? []);
  const lastQuery = useRef("");

  async function search(text: string) {
    setQuery(text);
    setShown(selected);
    lastQuery.current = text;
    if (text.trim().length < 2) {
      return;
    }
    const users = await searchUsers(text.trim());
    //an old answer can arrive after a newer one: keep only the last search
    if (lastQuery.current === text) {
      setResults({ query: text, users });
    }
  }

  function toggle(user: User) {
    const isSelected = selected.some((item) => item.id === user.id);
    setSelected(
      isSelected
        ? selected.filter((item) => item.id !== user.id)
        : [...selected, user],
    );
    if (!shown.some((item) => item.id === user.id)) {
      setShown([...shown, user]);
    }
  }

  //the selected users stay on top of the list, so they can be removed
  const list = [
    ...shown,
    ...(results.query === query ? results.users : []).filter(
      (user) =>
        user.id !== ownerId && !shown.some((item) => item.id === user.id),
    ),
  ];
  let status = "";
  if (query.trim().length < 2) {
    status = "Tapez au moins 2 lettres.";
  } else if (results.query === query && list.length === shown.length) {
    status = "Aucun collaborateur trouvé.";
  }

  return (
    <div className={styles.picker}>
      <span id="contributors-label">Contributeurs</span>
      <button
        type="button"
        id="contributors-button"
        aria-labelledby="contributors-label contributors-button"
        aria-expanded={open}
        aria-controls="contributors-panel"
        onClick={() => setOpen(!open)}
        className={styles.button}
      >
        {selected.length === 0
          ? "Choisir un ou plusieurs collaborateurs"
          : `${selected.length} collaborateur${selected.length > 1 ? "s" : ""}`}
        <ChevronIcon />
      </button>
      {open && (
        <div id="contributors-panel" className={styles.panel}>
          <div className={form.field}>
            <label htmlFor="contributors-search" className="sr-only">
              Rechercher un collaborateur
            </label>
            <input
              id="contributors-search"
              type="search"
              autoComplete="off"
              placeholder="Rechercher un nom ou un email"
              value={query}
              onChange={(e) => search(e.target.value)}
              //enter must not send the whole form
              onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
            />
          </div>
          {list.length > 0 && (
            <ul className={styles.list}>
              {list.map((user) => (
                <li key={user.id}>
                  <label className={styles.option}>
                    <input
                      type="checkbox"
                      checked={selected.some((item) => item.id === user.id)}
                      onChange={() => toggle(user)}
                    />
                    {user.name ? `${user.name} (${user.email})` : user.email}
                  </label>
                </li>
              ))}
            </ul>
          )}
          <p role="status" className={form.hint}>
            {status}
          </p>
        </div>
      )}
      {/* what the form really sends: one email per selected user */}
      {selected.map((user) => (
        <input
          key={user.id}
          type="hidden"
          name="contributors"
          value={user.email}
        />
      ))}
    </div>
  );
}
