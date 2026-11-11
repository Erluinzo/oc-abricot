"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
  type FormEvent,
} from "react";
import { generateTasks, type AiTask } from "@/lib/ai";
import { addTasks } from "@/lib/tasks";
import { CloseIcon, PencilIcon, StarIcon, TrashIcon } from "./Icons";
import form from "./Form.module.css";
import modal from "./Modal.module.css";
import styles from "./AiTasks.module.css";

//"IA" button of the project page and its modal
export default function AiTasks({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`${form.button} ${styles.ai}`}
      >
        <StarIcon size={21} />
        IA
      </button>
      {open && <AiModal projectId={projectId} onClose={() => setOpen(false)} />}
    </>
  );
}

//a proposed task, with an id so each card keeps its own state
type Item = AiTask & { id: number };

//figma "Modale création de tâche IA", then "Modale liste de tâche IA" once claude
//has answered. It exists only while it is open: each opening starts empty
function AiModal({
  projectId,
  onClose,
}: {
  projectId: string;
  onClose: () => void;
}) {
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const [tasks, setTasks] = useState<Item[]>([]);
  const nextId = useRef(0);
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState("");
  //read by screen readers when the new cards appear
  const [message, setMessage] = useState("");
  //the card being edited: one at a time
  const [editing, setEditing] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();
  const [adding, startAdding] = useTransition();
  const title = useRef<HTMLHeadingElement>(null);

  //opened once, when it appears (the dev mode runs effects twice: open only if closed)
  useEffect(() => {
    if (!dialog.current?.open) {
      dialog.current?.showModal();
    }
  }, []);

  //the button is not disabled while claude answers: the focus would be lost
  function send(e: FormEvent) {
    e.preventDefault();
    if (pending || adding) {
      return;
    }
    setMessage("");
    startTransition(async () => {
      const result = await generateTasks(
        projectId,
        prompt,
        tasks.map((task) => task.title),
      );
      setError(result.error);
      if (!result.error) {
        //a new request adds tasks to the list
        const items = result.tasks.map((task) => ({
          ...task,
          id: nextId.current++,
        }));
        //"current": the list may have changed while claude was answering
        setTasks((current) => [...current, ...items]);
        setMessage(
          `${items.length} tâche${items.length > 1 ? "s" : ""} proposée${items.length > 1 ? "s" : ""}`,
        );
        setPrompt("");
      }
    });
  }

  //"+ Ajouter les tâches": creates them all in the project, then closes
  function add() {
    if (pending || adding) {
      return;
    }
    const sent = tasks;
    startAdding(async () => {
      const result = await addTasks(
        projectId,
        sent.map(({ title, description }) => ({ title, description })),
      );
      if (result.error) {
        //the saved ones leave the list: a new try does not create them twice
        const saved = sent.slice(0, result.created).map((task) => task.id);
        setTasks((current) =>
          current.filter((task) => !saved.includes(task.id)),
        );
        setError(result.error);
      } else {
        dialog.current?.close();
      }
    });
  }

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      aria-labelledby={`${id}-title`}
      className={`${modal.dialog} ${styles.dialog} ${tasks.length > 0 ? styles.full : ""}`}
    >
      <button
        type="button"
        onClick={() => dialog.current?.close()}
        aria-label="Fermer"
        className={modal.close}
      >
        <CloseIcon />
      </button>
      <h2 id={`${id}-title`} ref={title} tabIndex={-1} className={styles.title}>
        <StarIcon size={21} />
        {tasks.length > 0 ? "Vos tâches..." : "Créer une tâche"}
      </h2>
      <div className={styles.body}>
        {tasks.length > 0 && (
          <ul className={styles.list}>
            {tasks.map((task) => (
              <AiCard
                key={task.id}
                task={task}
                editing={editing === task.id}
                onEdit={() => setEditing(task.id)}
                onCancel={() => setEditing(null)}
                onDelete={() => {
                  setTasks((current) =>
                    current.filter((other) => other.id !== task.id),
                  );
                  //the button is gone: the focus goes back to the title
                  title.current?.focus();
                }}
                onSave={(changed) => {
                  setTasks((current) =>
                    current.map((other) =>
                      other.id === task.id ? changed : other,
                    ),
                  );
                  setEditing(null);
                }}
              />
            ))}
          </ul>
        )}
      </div>
      {/* always in the page: screen readers read what appears in them */}
      <p role="status" className={styles.status}>
        {pending && "Génération des tâches en cours..."}
        {adding && "Ajout des tâches en cours..."}
      </p>
      <p role="status" className="sr-only">
        {message}
      </p>
      {error && (
        <p role="alert" className={`${form.error} ${styles.alert}`}>
          {error}
        </p>
      )}
      {tasks.length > 0 && (
        //grey while a card is edited: its new text is not saved yet
        <button
          type="button"
          onClick={add}
          disabled={editing !== null}
          className={`${form.button} ${styles.add}`}
        >
          + Ajouter les tâches
        </button>
      )}
      <form onSubmit={send} className={styles.prompt}>
        <div className={styles.pill}>
          <label htmlFor={`${id}-prompt`} className="sr-only">
            Décrivez les tâches que vous souhaitez ajouter
          </label>
          <input
            id={`${id}-prompt`}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Décrivez les tâches que vous souhaitez ajouter..."
            required
            minLength={3}
            maxLength={500}
            autoComplete="off"
          />
          <button type="submit" aria-label="Générer les tâches">
            <StarIcon size={8.4} />
          </button>
        </div>
      </form>
    </dialog>
  );
}

//a proposed task: text with "Supprimer | Modifier", or its 2 fields while edited
function AiCard({
  task,
  editing,
  onEdit,
  onCancel,
  onDelete,
  onSave,
}: {
  task: Item;
  editing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onSave: (task: Item) => void;
}) {
  const id = useId();
  //after a save, "Modifier" gets the focus back
  const [saved, setSaved] = useState(false);

  function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    onSave({
      id: task.id,
      title: String(data.get("title")).trim(),
      description: String(data.get("description")).trim(),
    });
    setSaved(true);
  }

  if (editing) {
    return (
      <li className={styles.card}>
        <form
          onSubmit={save}
          //escape leaves the edit only, not the whole modal
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.preventDefault();
              setSaved(true);
              onCancel();
            }
          }}
          className={styles.edit}
        >
          <div className={form.field}>
            <label htmlFor={`${id}-title`}>Titre</label>
            <input
              id={`${id}-title`}
              name="title"
              defaultValue={task.title}
              required
              maxLength={200}
              //at least 2 letters, spaces alone do not count
              pattern=".*\S.*\S.*"
              title="Au moins 2 caractères"
              autoFocus
            />
          </div>
          <div className={form.field}>
            <label htmlFor={`${id}-description`}>Description</label>
            <input
              id={`${id}-description`}
              name="description"
              defaultValue={task.description}
              maxLength={1000}
            />
          </div>
          <button type="submit" className={form.button}>
            Enregistrer
          </button>
        </form>
      </li>
    );
  }

  return (
    <li className={styles.card}>
      <div className={styles.text}>
        <h3>{task.title}</h3>
        <p>{task.description}</p>
      </div>
      <div className={styles.actions}>
        <button type="button" onClick={onDelete}>
          <TrashIcon />
          Supprimer
          <span className="sr-only"> {task.title}</span>
        </button>
        <span aria-hidden="true" />
        <button type="button" onClick={onEdit} autoFocus={saved}>
          <PencilIcon />
          Modifier
          <span className="sr-only"> {task.title}</span>
        </button>
      </div>
    </li>
  );
}
