"use client";

import { useActionState, useId, useRef, useState, useTransition } from "react";
import type { Task, User } from "@/lib/api";
import { STATUS, formatDateTime, formatDay, getInitials } from "@/lib/format";
import { addComment, deleteTask } from "@/lib/tasks";
import ConfirmDialog from "./ConfirmDialog";
import { CalendarIcon, ChevronIcon, DotsIcon } from "./Icons";
import TaskModal from "./TaskModal";
import form from "./Form.module.css";
import people from "./People.module.css";
import status from "./Status.module.css";
import styles from "./TaskCard.module.css";

type Props = {
  task: Task;
  projectId: string;
  members: User[];
  //the connected user, shown next to the new comment field
  userInitials: string;
};

//figma "Tâche liste": one task of the project with its "..." menu and its comments
export default function TaskCard({
  task,
  projectId,
  members,
  userInitials,
}: Props) {
  const id = useId();
  const dots = useRef<HTMLButtonElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [editing, setEditing] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [error, setError] = useState("");
  const [deleting, startDelete] = useTransition();
  const [content, setContent] = useState("");
  const [commentError, commentAction, sending] = useActionState(
    async (prev: string, formData: FormData) => {
      const result = await addComment(projectId, task.id, formData);
      if (!result) {
        setContent("");
      }
      //"Envoyer" was disabled while sending: the focus goes back to the field
      textarea.current?.focus();
      return result;
    },
    "",
  );

  //after "Supprimer" in the confirm modal: it can't be undone
  function remove() {
    startDelete(async () => {
      const result = await deleteTask(projectId, task.id);
      setError(result);
      //the card goes away: the focus goes to the "Tâches" title, not to the page start
      if (!result) {
        document.getElementById("tasks-title")?.focus();
      }
    });
  }

  return (
    <li className={styles.card}>
      {confirming && (
        <ConfirmDialog
          title="Supprimer la tâche ?"
          text={`La tâche « ${task.title} » sera supprimée. Cette action est définitive.`}
          onConfirm={remove}
          onClose={() => {
            setConfirming(false);
            //the menu item is gone: the focus goes back to the "..." button
            dots.current?.focus();
          }}
        />
      )}
      <div className={styles.top}>
        <div className={styles.text}>
          <div className={styles.title}>
            <h3>{task.title}</h3>
            <span className={`${status.tag} ${status[task.status]}`}>
              {STATUS[task.status]}
            </span>
          </div>
          {task.description && <p>{task.description}</p>}
        </div>
        <div
          className={styles.menu}
          //escape closes the menu and gives the focus back to its button
          onKeyDown={(e) => {
            if (e.key === "Escape" && menuOpen) {
              setMenuOpen(false);
              dots.current?.focus();
            }
          }}
          //a click or a tab outside the menu closes it
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) {
              setMenuOpen(false);
            }
          }}
        >
          <button
            ref={dots}
            type="button"
            aria-label={`Actions de la tâche ${task.title}`}
            aria-expanded={menuOpen}
            aria-controls={`${id}-menu`}
            onClick={() => setMenuOpen(!menuOpen)}
            className={styles.dots}
          >
            <DotsIcon />
          </button>
          {menuOpen && (
            <ul id={`${id}-menu`} className={styles.options}>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setEditing(true);
                  }}
                >
                  Modifier
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setConfirming(true);
                  }}
                  disabled={deleting}
                >
                  Supprimer
                </button>
              </li>
            </ul>
          )}
        </div>
      </div>
      {task.dueDate && (
        <p className={styles.row}>
          Échéance :
          <span className={styles.date}>
            <CalendarIcon />
            {formatDay(task.dueDate)}
          </span>
        </p>
      )}
      {task.assignees.length > 0 && (
        <div className={styles.row}>
          <p>Assigné à :</p>
          <ul className={people.list}>
            {task.assignees.map(({ user }) => (
              <li key={user.id}>
                <span className={people.avatar} aria-hidden="true">
                  {getInitials(user)}
                </span>
                <span className={people.tag}>{user.name ?? user.email}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {error && (
        <p role="alert" className={form.error}>
          {error}
        </p>
      )}
      <div className={styles.comments}>
        <button
          type="button"
          aria-expanded={commentsOpen}
          aria-controls={`${id}-comments`}
          onClick={() => setCommentsOpen(!commentsOpen)}
          className={styles.toggle}
        >
          Commentaires ({task.comments.length})
          <ChevronIcon />
        </button>
        {commentsOpen && (
          <div id={`${id}-comments`} className={styles.thread}>
            {task.comments.length > 0 && (
              <ul className={styles.list}>
                {task.comments.map((comment) => (
                  <li key={comment.id} className={styles.comment}>
                    <span className={people.avatar} aria-hidden="true">
                      {getInitials(comment.author)}
                    </span>
                    <div className={styles.bubble}>
                      <p className={styles.author}>
                        {comment.author.name ?? comment.author.email}
                        <time dateTime={comment.createdAt}>
                          {formatDateTime(comment.createdAt)}
                        </time>
                      </p>
                      <p>{comment.content}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <form action={commentAction} className={styles.add}>
              <div className={styles.comment}>
                <span
                  className={`${people.avatar} ${people.orange}`}
                  aria-hidden="true"
                >
                  {userInitials}
                </span>
                <label htmlFor={`${id}-content`} className="sr-only">
                  Ajouter un commentaire
                </label>
                <textarea
                  ref={textarea}
                  id={`${id}-content`}
                  name="content"
                  placeholder="Ajouter un commentaire..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  aria-describedby={
                    commentError ? `${id}-comment-error` : undefined
                  }
                  className={styles.bubble}
                />
              </div>
              {commentError && (
                <p
                  id={`${id}-comment-error`}
                  role="alert"
                  className={form.error}
                >
                  {commentError}
                </p>
              )}
              <button
                type="submit"
                disabled={!content.trim() || sending}
                className={`${form.button} ${styles.send}`}
              >
                Envoyer
              </button>
            </form>
          </div>
        )}
      </div>
      {editing && (
        <TaskModal
          projectId={projectId}
          members={members}
          task={task}
          onClose={() => {
            setEditing(false);
            dots.current?.focus();
          }}
        />
      )}
    </li>
  );
}
