import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { getUser } from "@/lib/api";
import { getInitials } from "@/lib/format";
import styles from "./layout.module.css";

//shared by every page of the (main) group: menu on top, footer at the bottom
export default async function MainLayout({ children }: LayoutProps<"/">) {
  const user = await getUser();

  return (
    <div className={styles.page}>
      <Header initials={getInitials(user)} />
      <div className={styles.content}>{children}</div>
      <Footer />
    </div>
  );
}
