import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projet",
};

export default async function ProjectPage({
  params,
}: PageProps<"/projects/[id]">) {
  const { id } = await params;

  return (
    <main>
      <h1>Projet {id}</h1>
    </main>
  );
}
