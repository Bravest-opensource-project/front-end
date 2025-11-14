import { Link } from "react-router-dom";
// CSS Module 파일을 사용하기 위해 import 합니다.
//css import 하기
import styles from "./Logo.module.css";

function Logo() {
  return (
    <Link to="/" className={styles.logoContainer}>
      {/* 각 요소에 맞는 클래스 이름을 적용합니다. */}
      <div className={styles.shape1}></div>
      <div className={styles.shape2}></div>
      <div className={styles.text}>Bravest</div>
    </Link>
  );
}

export default Logo;
