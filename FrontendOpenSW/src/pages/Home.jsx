import Layout from "../components/Layout";
import styles from "./Home.module.css";

function Home() {
  return (
    <Layout>
      <h1 className={styles.title}>홈 페이지</h1>
    </Layout>
  );
}

export default Home;

