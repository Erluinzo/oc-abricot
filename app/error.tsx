"use client";

//shown when a page can't load its data (backend stopped for example)
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="message-page">
      <h1>Erreur</h1>
      <p>Les données n’ont pas pu être chargées.</p>
      <button type="button" onClick={reset} className="message-button">
        Réessayer
      </button>
    </main>
  );
}
