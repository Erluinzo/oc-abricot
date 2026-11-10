"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Header.module.css";

const links = [
  {
    href: "/dashboard",
    label: "Tableau de bord",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M9.25 0L1.75 0C0.785 0 0 0.785 0 1.75L0 6.25C0 7.215 0.785 8 1.75 8L9.25 8C10.215 8 11 7.215 11 6.25L11 1.75C11 0.785 10.215 0 9.25 0Z" />
        <path
          transform="translate(0.000 10.000)"
          d="M9.25 0L1.75 0C0.785 0 0 0.785 0 1.75L0 12.25C0 13.215 0.785 14 1.75 14L9.25 14C10.215 14 11 13.215 11 12.25L11 1.75C11 0.785 10.215 0 9.25 0Z"
        />
        <path
          transform="translate(13.000 16.000)"
          d="M9.25 0L1.75 0C0.785 0 0 0.785 0 1.75L0 6.25C0 7.215 0.785 8 1.75 8L9.25 8C10.215 8 11 7.215 11 6.25L11 1.75C11 0.785 10.215 0 9.25 0Z"
        />
        <path
          transform="translate(13.000 0.000)"
          d="M9.25 0L1.75 0C0.785 0 0 0.785 0 1.75L0 12.25C0 13.215 0.785 14 1.75 14L9.25 14C10.215 14 11 13.215 11 12.25L11 1.75C11 0.785 10.215 0 9.25 0Z"
        />
      </svg>
    ),
  },
  {
    href: "/projects",
    label: "Projets",
    icon: (
      <svg
        width="29"
        height="22.5"
        viewBox="0 0 29 22.487"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M26.5791 9.08691C27.4428 9.08698 28.2214 9.51204 28.6621 10.2227C29.0726 10.8866 29.1117 11.6992 28.7646 12.3965L24.3672 21.209C23.9765 21.9918 23.1766 22.4873 22.3018 22.4873L1.83984 22.4873C0.970986 22.4873 0.240875 21.9031 0.0488281 21.1221L5.13672 10.4561C5.52599 9.62428 6.3926 9.08699 7.3457 9.08691L26.5791 9.08691ZM8.66699 0C9.25766 6.22332e-05 9.81079 0.279265 10.1455 0.748047L12.0352 3.39062C12.0391 3.3935 12.05 3.39843 12.0654 3.39844L22.626 3.39844C23.616 3.39852 24.4219 4.17503 24.4219 5.12988L24.4219 7.44629L6.31055 7.44629C5.35695 7.44629 4.48933 7.9845 4.10059 8.81641L0 17.4141L0 1.73145C2.66478e-05 0.776583 0.805427 6.71615e-05 1.7959 0L8.66699 0Z" />
      </svg>
    ),
  },
];

//client component: it needs the current url to show the active link
export default function Header({ initials }: { initials: string }) {
  const pathname = usePathname();

  return (
    <header className={styles.header}>
      <Image
        className={styles.logo}
        src="/logo.svg"
        alt="Abricot"
        width={147}
        height={19}
        priority
      />
      <nav className={styles.nav} aria-label="Navigation principale">
        {links.map((link) => {
          //"/projects/12" keeps "Projets" active
          const active = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={
                active ? `${styles.link} ${styles.active}` : styles.link
              }
              aria-current={active ? "page" : undefined}
            >
              {link.icon}
              <span className={styles.label}>{link.label}</span>
            </Link>
          );
        })}
      </nav>
      <Link
        href="/profile"
        className={
          pathname === "/profile"
            ? `${styles.avatar} ${styles.active}`
            : styles.avatar
        }
        //the name starts with the visible text (wcag "label in name")
        aria-label={`${initials} - Mon compte`}
        aria-current={pathname === "/profile" ? "page" : undefined}
      >
        {initials}
      </Link>
    </header>
  );
}
