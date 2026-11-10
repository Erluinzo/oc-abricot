"use client";

import { useState } from "react";
import type { Task, User } from "@/lib/api";
import { STATUS } from "@/lib/format";
import { CalendarIcon, ListIcon, SearchIcon } from "./Icons";
import TaskCard from "./TaskCard";
import styles from "./TaskList.module.css";

type Props = {
  projectId: string;
  //already sorted by priority
  tasks: Task[];
  members: User[];
  userInitials: string;
};

//"Tâches" block of the project page: status filter and search work in the browser,
//the tasks are already loaded
export default function TaskList({
  projectId,
  tasks,
  members,
  userInitials,
}: Props) {
  const [statusFilter, setStatusFilter] = useState("");
  const [query, setQuery] = useState("");
  const search = query.trim().toLowerCase();
  const shown = tasks.filter(
    (task) =>
      (!statusFilter || task.status === statusFilter) &&
      `${task.title} ${task.description ?? ""}`.toLowerCase().includes(search),
  );

  return (
    <section aria-labelledby="tasks-title" className={styles.section}>
      <div className={styles.header}>
        <div className={styles.heading}>
          <h2 id="tasks-title">Tâches</h2>
          <p>Par ordre de priorité</p>
        </div>
        <div className={styles.controls}>
          <div className={styles.views}>
            <button type="button" aria-pressed="true" className={styles.view}>
              <ListIcon />
              Liste
            </button>
            {/* figma shows a calendar view, it is optional and not built */}
            <button type="button" disabled className={styles.view}>
              <CalendarIcon />
              Calendrier
            </button>
          </div>
          <select
            aria-label="Filtrer par statut"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.select}
          >
            <option value="">Statut</option>
            {Object.entries(STATUS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <div className={styles.search}>
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
      </div>
      {/* tells screen readers how many tasks the filters leave */}
      <p role="status" className="sr-only">
        {shown.length} tâche{shown.length > 1 && "s"}
      </p>
      {shown.length === 0 ? (
        <p className={styles.empty}>
          {tasks.length === 0
            ? "Aucune tâche pour l’instant."
            : "Aucune tâche ne correspond à votre recherche."}
        </p>
      ) : (
        <ul className={styles.list}>
          {shown.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              projectId={projectId}
              members={members}
              userInitials={userInitials}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
