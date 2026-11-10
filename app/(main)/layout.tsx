import Footer from "@/components/Footer";
import Header from "@/components/Header";
import styles from "./layout.module.css";

//shared by every page of the (main) group: menu on top, footer at the bottom
export default function MainLayout({ children }: LayoutProps<"/">) {
  return (
    <div className={styles.page}>
      <Header />
      <div className={styles.content}>{children}</div>
      <Footer />
    </div>
  );
}
