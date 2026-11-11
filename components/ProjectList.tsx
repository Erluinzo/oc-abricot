import Link from "next/link";
import type { ProjectWithTasks } from "@/lib/api";
import { getInitials } from "@/lib/format";
import { TeamIcon } from "./Icons";
import people from "./People.module.css";
import styles from "./ProjectList.module.css";

type Props = {
  projects: ProjectWithTasks[];
};

//figma "Card projet" grid: used by the projects page and the dashboard
export default function ProjectList({ projects }: Props) {
  return (
    <ul className={styles.grid}>
      {projects.map((project) => {
        const done = project.tasks.filter(
          (task) => task.status === "DONE",
        ).length;
        const total = project.tasks.length;
        const members = project.members.filter(
          (member) => member.user.id !== project.ownerId,
        );
        return (
          <li key={project.id} className={styles.card}>
            <div className={styles.text}>
              <h2>
                {/* the link covers the whole card (see .link::after) */}
                <Link href={`/projects/${project.id}`} className={styles.link}>
                  {project.name}
                </Link>
              </h2>
              {project.description && (
                <p className={styles.description}>{project.description}</p>
              )}
            </div>
            <div className={styles.progress}>
              <p className={styles.row}>
                Progression
                <span>{total ? Math.round((done * 100) / total) : 0}%</span>
              </p>
              <div className={styles.bar}>
                {/* the texts already give the value to screen readers */}
                <progress value={done} max={total || 1} aria-hidden="true" />
                <p>
                  {done}/{total} tâches terminées
                </p>
              </div>
            </div>
            <div className={styles.team}>
              <p className={styles.teamTitle}>
                <TeamIcon />
                Équipe ({members.length + 1})
              </p>
              <div className={styles.people}>
                <p className={styles.owner}>
                  <span
                    className={`${people.avatar} ${people.orange}`}
                    aria-hidden="true"
                  >
                    {getInitials(project.owner)}
                  </span>
                  <span className="sr-only">
                    {project.owner.name ?? project.owner.email},
                  </span>
                  <span className={`${people.tag} ${people.orange}`}>
                    Propriétaire
                  </span>
                </p>
                {members.length > 0 && (
                  <ul className={styles.members}>
                    {members.map(({ user }) => (
                      <li key={user.id} className={people.avatar}>
                        <span aria-hidden="true">{getInitials(user)}</span>
                        <span className="sr-only">
                          {user.name ?? user.email}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
