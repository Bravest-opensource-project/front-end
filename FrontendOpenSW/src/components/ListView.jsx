import { useState, useEffect } from "react";
import styles from "./ListView.module.css";

function ListView({ entryCode, onClose }) {
  const [listItems, setListItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchListItems();
  }, []);

  const fetchListItems = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // localStorage에서 roomId 가져오기 (익명 프로필 응답의 data.roomId)
      const roomId = localStorage.getItem('anonymousProfileRoomId') || localStorage.getItem('roomId');

      if (!roomId) {
        throw new Error("채팅방 정보를 찾을 수 없습니다.");
      }

      const response = await fetch(`/api/chatlists/room/${roomId}`, {
        method: "GET",
        headers: {
          "accept": "*/*",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "리스트를 불러오는데 실패했습니다.");
      }

      const responseData = await response.json();
      
      console.log("리스트 응답 데이터:", responseData);
      
      // 응답 형식: { isSuccess, code, message, data: [...], success }
      if (!responseData.isSuccess || !responseData.data) {
        throw new Error(responseData.message || "리스트를 불러오는데 실패했습니다.");
      }

      const items = Array.isArray(responseData.data) ? responseData.data : [];
      
      console.log("파싱된 리스트 아이템:", items);
      
      // 응답 결과를 localStorage에 저장 (나중에 사용)
      localStorage.setItem('chatlists', JSON.stringify(items));
      
      setListItems(items);
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
                    {typeof item === "string" 
                      ? item 
                      : item.content || item.text || item.item || item.name || JSON.stringify(item)}
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

