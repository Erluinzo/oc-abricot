import Image from "next/image";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <Image src="/logo-black.svg" alt="Abricot" width={101} height={13} />
      <p>Abricot 2025</p>
    </footer>
  );
}
