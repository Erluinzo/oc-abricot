"use client";

import { useState } from "react";
import type { ProjectWithTasks, Task } from "@/lib/api";
import { CalendarIcon, FolderIcon, ListIcon, SearchIcon } from "./Icons";
import ProjectList from "./ProjectList";
import TaskSummary from "./TaskSummary";
import chips from "./Chips.module.css";
import panel from "./Panel.module.css";
import people from "./People.module.css";
import styles from "./Dashboard.module.css";

type Props = {
  //the tasks assigned to the user, most urgent first
  tasks: Task[];
  //the same tasks, only the ones due this month (kanban)
  monthTasks: Task[];
  //the projects where the user has tasks, most urgent first
  projects: ProjectWithTasks[];
};

const VIEWS = [
  { id: "list", label: "Liste", icon: <ListIcon /> },
  { id: "kanban", label: "Kanban", icon: <CalendarIcon /> },
  //not in the figma pages: the chip comes from the figma components
  { id: "projects", label: "Mes projets", icon: <FolderIcon /> },
];

const COLUMNS: { status: Task["status"]; title: string }[] = [
  { status: "TODO", title: "À faire" },
  { status: "IN_PROGRESS", title: "En cours" },
  { status: "DONE", title: "Terminées" },
];

//the 3 views of the dashboard asked by the spec: list, kanban, projects
export default function Dashboard({ tasks, monthTasks, projects }: Props) {
  const [view, setView] = useState("list");
  const [query, setQuery] = useState("");
  const search = query.trim().toLowerCase();
  const shown = tasks.filter((task) =>
    `${task.title} ${task.description ?? ""}`.toLowerCase().includes(search),
  );

  return (
    <>
      <div className={`${chips.views} ${styles.views}`}>
        {VIEWS.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={view === item.id}
            onClick={() => setView(item.id)}
            className={chips.view}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>

      {view === "list" && (
        <section
          aria-labelledby="assigned-title"
          className={`${panel.section} ${styles.section}`}
        >
          <div className={styles.header}>
            <div className={panel.heading}>
              <h2 id="assigned-title">Mes tâches assignées</h2>
              <p>Par ordre de priorité</p>
            </div>
            <div className={`${panel.search} ${styles.search}`}>
              <input
                type="search"
                aria-label="Rechercher une tâche"
                placeholder="Rechercher une tâche"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <SearchIcon />
            </div>
          </div>
          {/* tells screen readers how many tasks the search leaves */}
          <p role="status" className="sr-only">
            {shown.length} tâche{shown.length > 1 && "s"}
          </p>
          {shown.length === 0 ? (
            <p className={panel.empty}>
              {tasks.length === 0
                ? "Aucune tâche ne vous est assignée."
                : "Aucune tâche ne correspond à votre recherche."}
            </p>
          ) : (
            <ul className={styles.list}>
              {shown.map((task) => (
                <TaskSummary key={task.id} task={task} />
              ))}
            </ul>
          )}
        </section>
      )}

      {view === "kanban" && (
        <div className={styles.kanban}>
          {COLUMNS.map((column) => {
            const columnTasks = monthTasks.filter(
              (task) => task.status === column.status,
            );
            return (
              <section
                key={column.status}
                aria-labelledby={`column-${column.status}`}
                className={styles.column}
              >
                <h2 id={`column-${column.status}`}>
                  {column.title}
                  <span className={people.tag}>{columnTasks.length}</span>
                </h2>
                {columnTasks.length === 0 ? (
                  <p className={panel.empty}>Aucune tâche ce mois-ci.</p>
                ) : (
                  <ul className={styles.list}>
                    {columnTasks.map((task) => (
                      <TaskSummary key={task.id} task={task} kanban />
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}

      {view === "projects" &&
        (projects.length === 0 ? (
          <p className={`${panel.empty} ${styles.projects}`}>
            Aucun projet avec des tâches qui vous sont assignées.
          </p>
        ) : (
          <div className={styles.projects}>
            <ProjectList projects={projects} />
          </div>
        ))}
    </>
  );
}
