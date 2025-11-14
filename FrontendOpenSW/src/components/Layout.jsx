import Logo from "./Logo";
import NavigationBar from "./NavigationBar";
import styles from "./Layout.module.css";

function Layout({ children }) {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.logoContainer}>
          <Logo />
        </div>
        {children}
      </div>
      <NavigationBar />
    </div>
  );
}

export default Layout;

