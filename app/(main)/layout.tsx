import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { getUser } from "@/lib/api";
import styles from "./layout.module.css";

//shared by every page of the (main) group: menu on top, footer at the bottom
export default async function MainLayout({ children }: LayoutProps<"/">) {
  const user = await getUser();
  //"Alice Martin" -> "AM", no name -> the first 2 letters of the email
  const initials = (
    user.name
      ? user.name
          .split(" ")
          .map((word) => word[0])
          .join("")
      : user.email
  )
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={styles.page}>
      <Header initials={initials} />
      <div className={styles.content}>{children}</div>
      <Footer />
    </div>
  );
}
