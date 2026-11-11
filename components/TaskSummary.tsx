import Link from "next/link";
import type { Task } from "@/lib/api";
import { STATUS, formatDay } from "@/lib/format";
import { CalendarIcon, CommentIcon, FolderIcon } from "./Icons";
import form from "./Form.module.css";
import status from "./Status.module.css";
import styles from "./TaskSummary.module.css";

type Props = {
  task: Task;
  //kanban card: narrower, the tag is next to the title and "Voir" under the text
  kanban?: boolean;
};

//figma "Tâche liste" (thumbnail) and "Tâche Kanban": a task of the dashboard
export default function TaskSummary({ task, kanban }: Props) {
  const tag = (
    <span className={`${status.tag} ${status[task.status]}`}>
      {STATUS[task.status]}
    </span>
  );

  return (
    <li className={`${styles.card} ${kanban ? styles.kanban : ""}`}>
      <div className={styles.main}>
        <div className={styles.head}>
          <div className={styles.text}>
            <h3>{task.title}</h3>
            {task.description && <p>{task.description}</p>}
          </div>
          {kanban && tag}
        </div>
        <p className={styles.meta}>
          <span>
            <FolderIcon />
            {/* title: the full name when it is cut with "..." */}
            <span className={styles.project} title={task.project?.name}>
              {task.project?.name}
            </span>
          </span>
          {task.dueDate && (
            <span>
              <CalendarIcon />
              {formatDay(task.dueDate)}
            </span>
          )}
          <span>
            <CommentIcon />
            {task.comments.length}
            <span className="sr-only">
              commentaire{task.comments.length > 1 && "s"}
            </span>
          </span>
        </p>
      </div>
      <div className={styles.side}>
        {!kanban && tag}
        {/* the task is shown on its project page */}
        <Link
          href={`/projects/${task.projectId}`}
          className={`${form.button} ${styles.see}`}
        >
          Voir<span className="sr-only"> la tâche {task.title}</span>
        </Link>
      </div>
    </li>
  );
}
