import Link from "next/link";
import { notFound } from "next/navigation";
import CreateTask from "@/components/CreateTask";
import DeleteProject from "@/components/DeleteProject";
import ProjectModal from "@/components/ProjectModal";
import TaskList from "@/components/TaskList";
import { apiFetch, getProject, getUser, type Task } from "@/lib/api";
import { getInitials } from "@/lib/format";
import people from "@/components/People.module.css";
import styles from "./project.module.css";

//"Par ordre de priorité": most urgent first, then the nearest due date
const PRIORITY = ["URGENT", "HIGH", "MEDIUM", "LOW"];
function byPriority(a: Task, b: Task) {
  return (
    PRIORITY.indexOf(a.priority) - PRIORITY.indexOf(b.priority) ||
    (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999")
  );
}

//the tab shows the project name
export async function generateMetadata({
  params,
}: PageProps<"/projects/[id]">) {
  const project = await getProject((await params).id);
  return { title: project?.name ?? "Projet" };
}

export default async function ProjectPage({
  params,
}: PageProps<"/projects/[id]">) {
  const { id } = await params;
  const [user, project] = await Promise.all([getUser(), getProject(id)]);
  //unknown project or not one of the user's projects
  if (!project) {
    notFound();
  }
  //only the owner (the admin) can edit or delete the project
  const isOwner = project.ownerId === user.id;
  const members = project.members.filter(
    (member) => member.user.id !== project.ownerId,
  );
  const count = members.length + 1;
  //the project data has no assignees and no comments: the tasks route has them
  const data = await apiFetch(`/projects/${encodeURIComponent(id)}/tasks`);
  const tasks: Task[] = data.data.tasks.sort(byPriority);
  //everyone who can get a task: the owner and the contributors
  const users = [project.owner, ...members.map((member) => member.user)];

  return (
    <main className={styles.page}>
      <div className={styles.top}>
        <Link
          href="/projects"
          aria-label="Retour aux projets"
          className={styles.back}
        >
          <svg
            width="16"
            height="8"
            viewBox="-0.6 -3.8 15.6 7.6"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              d="M-0.353553 -0.353553C-0.548816 -0.158291 -0.548816 0.158291 -0.353553 0.353553L2.82843 3.53553C3.02369 3.7308 3.34027 3.7308 3.53553 3.53553C3.7308 3.34027 3.7308 3.02369 3.53553 2.82843L0.707107 0L3.53553 -2.82843C3.7308 -3.02369 3.7308 -3.34027 3.53553 -3.53553C3.34027 -3.7308 3.02369 -3.7308 2.82843 -3.53553L-0.353553 -0.353553ZM0 0L0 0.5L15 0.5L15 0L15 -0.5L0 -0.5L0 0Z"
            />
          </svg>
        </Link>
        <div className={styles.title}>
          <div className={styles.name}>
            <h1>{project.name}</h1>
            {isOwner && (
              <>
                <ProjectModal ownerId={user.id} project={project} />
                <DeleteProject id={project.id} name={project.name} />
              </>
            )}
          </div>
          <p>{project.description}</p>
        </div>
        <div className={styles.actions}>
          <CreateTask projectId={project.id} members={users} />
        </div>
      </div>
      <section
        aria-labelledby="contributors-title"
        className={styles.contributors}
      >
        <h2 id="contributors-title">
          Contributeurs
          <span>
            {count} personne{count > 1 && "s"}
          </span>
        </h2>
        <ul className={styles.people}>
          <li>
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
          </li>
          {members.map(({ user }) => (
            <li key={user.id}>
              <span className={people.avatar} aria-hidden="true">
                {getInitials(user)}
              </span>
              <span className={people.tag}>{user.name ?? user.email}</span>
            </li>
          ))}
        </ul>
      </section>
      <TaskList
        projectId={project.id}
        tasks={tasks}
        members={users}
        userInitials={getInitials(user)}
      />
    </main>
  );
}
