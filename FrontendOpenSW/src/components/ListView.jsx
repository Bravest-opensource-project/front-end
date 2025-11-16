import { useState, useEffect } from "react";
import styles from "./ListView.module.css";

function ListView({ entryCode, onClose }) {
  const [listItems, setListItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchListItems();
  }, [entryCode]);

  const fetchListItems = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: 백엔드 API 엔드포인트를 실제 URL로 변경하세요
      const response = await fetch(`/api/list-items?entryCode=${encodeURIComponent(entryCode)}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("리스트를 불러오는데 실패했습니다.");
      }

      const data = await response.json();
      // 백엔드 응답 형식에 맞게 조정 (예: data.items 또는 data)
      setListItems(data.items || data || []);
    } catch (error) {
      console.error("리스트 불러오기 오류:", error);
      setError(error.message || "리스트를 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.listContainer} onClick={(e) => e.stopPropagation()}>
          <div className={styles.header}>
            <button className={styles.closeButton} onClick={onClose}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>
          <div className={styles.loading}>
            <p>리스트를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.listContainer} onClick={(e) => e.stopPropagation()}>
          <div className={styles.header}>
            <button className={styles.closeButton} onClick={onClose}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>
          <div className={styles.error}>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.listContainer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <button className={styles.closeButton} onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
        <div className={styles.list}>
          {listItems.length === 0 ? (
            <div className={styles.emptyState}>
              <p>리스트가 비어있습니다.</p>
            </div>
          ) : (
            listItems.map((item, index) => (
              <div key={index} className={styles.listItem}>
                <div className={styles.listItemContent}>
                  <p className={styles.listItemText}>
                    {typeof item === "string" ? item : item.text || item.item || item.name}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ListView;

