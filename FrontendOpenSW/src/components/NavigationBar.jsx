import { Link, useLocation } from "react-router-dom";
import styles from "./NavigationBar.module.css";

function NavigationBar() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <nav className={styles.navigationBar}>
      <Link
        to="/"
        className={`${styles.navItem} ${currentPath === "/" ? styles.active : ""}`}
      >
        <div className={styles.iconContainer}>
          <div className={styles.stateLayer}>
            <div className={styles.icon}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9.55228 21 10 20.5523 10 20V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V20C14 20.5523 14.4477 21 15 21M9 21H15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
        <span className={styles.navText}>홈</span>
      </Link>

      <Link
        to="/create-chat"
        className={`${styles.navItem} ${currentPath === "/create-chat" ? styles.active : ""}`}
      >
        <div className={styles.iconContainer}>
          <div className={styles.stateLayer}>
            <div className={styles.icon}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 10H16M8 14H16M6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
        <span className={styles.navText}>채팅방 생성</span>
      </Link>

      <Link
        to="/join-chat"
        className={`${styles.navItem} ${currentPath === "/join-chat" ? styles.active : ""}`}
      >
        <div className={styles.iconContainer}>
          <div className={styles.stateLayer}>
            <div className={styles.icon}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="11"
                  cy="11"
                  r="8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M21 21L16.65 16.65"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
        <span className={styles.navText}>채팅방 참가</span>
      </Link>
    </nav>
  );
}

export default NavigationBar;

