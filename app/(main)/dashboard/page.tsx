import type { Metadata } from "next";
import Dashboard from "@/components/Dashboard";
import ProjectButton from "@/components/ProjectButton";
import { apiFetch, getProjectsWithTasks, getUser, type Task } from "@/lib/api";
import { byPriority } from "@/lib/format";
import styles from "./dashboard.module.css";

export const metadata: Metadata = {
  title: "Tableau de bord",
};

export default async function DashboardPage() {
  const [user, data, projects] = await Promise.all([
    getUser(),
    apiFetch("/dashboard/assigned-tasks"),
    getProjectsWithTasks(),
  ]);
  //the backend sorts the priorities as text (HIGH, LOW, MEDIUM...): sorted again here
  const tasks: Task[] = data.data.tasks.sort(byPriority);
  //"tâches du mois": due this month in France ("sv-SE" writes the date as "2026-11-30")
  const month = new Date()
    .toLocaleDateString("sv-SE", { timeZone: "Europe/Paris" })
    .slice(0, 7);
  //projects where the user has tasks, in the order of their most urgent task
  const order = [...new Set(tasks.map((task) => task.projectId))];

  return (
    <main className={styles.page}>
      <div className={styles.top}>
        <div className={styles.title}>
          <h1>Tableau de bord</h1>
          <p>
            Bonjour {user.name ?? user.email}, voici un aperçu de vos projets et
            tâches
          </p>
        </div>
        <ProjectButton ownerId={user.id} />
      </div>
      <Dashboard
        tasks={tasks}
        monthTasks={tasks.filter((task) => task.dueDate?.startsWith(month))}
        projects={projects
          .filter((project) => order.includes(project.id))
          .sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id))}
      />
    </main>
  );
}
