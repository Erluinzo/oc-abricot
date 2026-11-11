import type { Metadata } from "next";
import ProjectList from "@/components/ProjectList";
import ProjectButton from "@/components/ProjectButton";
import { getProjectsWithTasks, getUser } from "@/lib/api";
import styles from "./projects.module.css";

export const metadata: Metadata = {
  title: "Mes projets",
};

export default async function ProjectsPage() {
  const user = await getUser();
  const projects = await getProjectsWithTasks();

  return (
    <main className={styles.page}>
      <div className={styles.top}>
        <div className={styles.title}>
          <h1>Mes projets</h1>
          <p>Gérez vos projets</p>
        </div>
        <ProjectButton ownerId={user.id} />
      </div>
      {projects.length === 0 ? (
        <p className={styles.empty}>Aucun projet pour l’instant.</p>
      ) : (
        <ProjectList projects={projects} />
      )}
    </main>
  );
}
