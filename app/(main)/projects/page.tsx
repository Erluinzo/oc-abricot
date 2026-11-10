import type { Metadata } from "next";
import Link from "next/link";
import ProjectModal from "@/components/ProjectModal";
import { apiFetch, getUser, type Project, type Task } from "@/lib/api";
import { getInitials } from "@/lib/format";
import people from "@/components/People.module.css";
import styles from "./projects.module.css";

export const metadata: Metadata = {
  title: "Mes projets",
};

export default async function ProjectsPage() {
  const user = await getUser();
  const data = await apiFetch("/projects");
  const projects: Project[] = data.data.projects;
  //the list has no task status: ask the tasks of each project, all at the same time
  const tasks: Task[][] = await Promise.all(
    projects.map(
      async (project) =>
        (await apiFetch(`/projects/${project.id}/tasks`)).data.tasks,
    ),
  );

  return (
    <main className={styles.page}>
      <div className={styles.top}>
        <div className={styles.title}>
          <h1>Mes projets</h1>
          <p>Gérez vos projets</p>
        </div>
        <ProjectModal ownerId={user.id} />
      </div>
      {projects.length === 0 ? (
        <p className={styles.empty}>Aucun projet pour l’instant.</p>
      ) : (
        <ul className={styles.grid}>
          {projects.map((project, i) => {
            const done = tasks[i].filter(
              (task) => task.status === "DONE",
            ).length;
            const total = tasks[i].length;
            const members = project.members.filter(
              (member) => member.user.id !== project.ownerId,
            );
            return (
              <li key={project.id} className={styles.card}>
                <div className={styles.text}>
                  <h2>
                    {/* the link covers the whole card (see .link::after) */}
                    <Link
                      href={`/projects/${project.id}`}
                      className={styles.link}
                    >
                      {project.name}
                    </Link>
                  </h2>
                  <p className={styles.description}>{project.description}</p>
                </div>
                <div className={styles.progress}>
                  <p className={styles.row}>
                    Progression
                    <span>{total ? Math.round((done * 100) / total) : 0}%</span>
                  </p>
                  <div className={styles.bar}>
                    {/* the texts already give the value to screen readers */}
                    <progress
                      value={done}
                      max={total || 1}
                      aria-hidden="true"
                    />
                    <p>
                      {done}/{total} tâches terminées
                    </p>
                  </div>
                </div>
                <div className={styles.team}>
                  <p className={styles.teamTitle}>
                    <svg
                      width="12"
                      height="11"
                      viewBox="0 0 11.58 11"
                      aria-hidden="true"
                    >
                      <path
                        fill="currentColor"
                        d="M7.52637 6.94727C9.78424 6.94727 11.579 8.74215 11.5791 11L3.47363 11C3.47372 8.74222 5.2686 6.94738 7.52637 6.94727ZM3.87891 5.21094C4.11047 5.73187 4.45811 6.19468 4.86328 6.54199C3.99485 7.06305 3.2998 7.81614 2.89453 8.68457L0 8.68457C0 6.77405 1.56313 5.21099 3.47363 5.21094L3.87891 5.21094ZM7.52637 0.579102C9.12507 0.579102 10.4208 1.87494 10.4209 3.47363C10.4209 5.07238 9.12511 6.36816 7.52637 6.36816C5.92769 6.36809 4.63184 5.07233 4.63184 3.47363C4.63189 1.87499 5.92772 0.579177 7.52637 0.579102ZM3.47363 0C3.99467 0 4.45802 0.173434 4.86328 0.462891C3.99488 1.15761 3.47367 2.25787 3.47363 3.47363C3.47363 3.8789 3.53167 4.28446 3.64746 4.63184L3.47363 4.63184C2.19994 4.63182 1.1582 3.58913 1.1582 2.31543C1.15843 1.04192 2.20008 1.19457e-05 3.47363 0Z"
                      />
                    </svg>
                    Équipe ({members.length + 1})
                  </p>
                  <div className={styles.people}>
                    <p className={styles.owner}>
                      <span
                        className={`${people.avatar} ${people.owner}`}
                        aria-hidden="true"
                      >
                        {getInitials(project.owner)}
                      </span>
                      <span className="sr-only">
                        {project.owner.name ?? project.owner.email},
                      </span>
                      <span className={`${people.tag} ${people.owner}`}>
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
      )}
    </main>
  );
}
