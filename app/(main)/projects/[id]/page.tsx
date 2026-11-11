import Link from "next/link";
import { notFound } from "next/navigation";
import CreateTask from "@/components/CreateTask";
import DeleteProject from "@/components/DeleteProject";
import { ArrowIcon } from "@/components/Icons";
import ProjectButton from "@/components/ProjectButton";
import TaskList from "@/components/TaskList";
import { getProject, getTasks, getUser } from "@/lib/api";
import { byPriority, getInitials } from "@/lib/format";
import people from "@/components/People.module.css";
import styles from "./project.module.css";

//the tab shows the project name
export async function generateMetadata({
  params,
}: PageProps<"/projects/[id]">) {
  const project = await getProject((await params).id);
  //unknown project: the 404 page and its title
  if (!project) {
    notFound();
  }
  return { title: project.name };
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
  const contributors = project.members
    .map((member) => member.user)
    .filter((user) => user.id !== project.ownerId);
  //everyone in the project, who can get a task: the owner and the contributors
  const members = [project.owner, ...contributors];
  const tasks = (await getTasks(id)).sort(byPriority);

  return (
    <main className={styles.page}>
      <div className={styles.top}>
        <Link
          href="/projects"
          aria-label="Retour aux projets"
          className={styles.back}
        >
          <ArrowIcon />
        </Link>
        <div className={styles.title}>
          <div className={styles.name}>
            <h1>{project.name}</h1>
            {isOwner && (
              <>
                <ProjectButton ownerId={user.id} project={project} />
                <DeleteProject id={project.id} name={project.name} />
              </>
            )}
          </div>
          {project.description && <p>{project.description}</p>}
        </div>
        <div className={styles.actions}>
          <CreateTask projectId={project.id} members={members} />
        </div>
      </div>
      <section
        aria-labelledby="contributors-title"
        className={styles.contributors}
      >
        <h2 id="contributors-title">
          Contributeurs
          <span>
            {members.length} personne{members.length > 1 && "s"}
          </span>
        </h2>
        <ul className={people.list}>
          <li>
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
          </li>
          {contributors.map((contributor) => (
            <li key={contributor.id}>
              <span className={people.avatar} aria-hidden="true">
                {getInitials(contributor)}
              </span>
              <span className={people.tag}>
                {contributor.name ?? contributor.email}
              </span>
            </li>
          ))}
        </ul>
      </section>
      <TaskList
        projectId={project.id}
        tasks={tasks}
        members={members}
        userInitials={getInitials(user)}
      />
    </main>
  );
}
