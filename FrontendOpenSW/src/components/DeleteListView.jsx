import { useState, useEffect } from "react";
import styles from "./DeleteListView.module.css";

function DeleteListView({ entryCode, onClose, onDelete }) {
  const [listItems, setListItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      
      // 응답 형식: { isSuccess, code, message, data: [...], success }
      if (!responseData.isSuccess || !responseData.data) {
        throw new Error(responseData.message || "리스트를 불러오는데 실패했습니다.");
      }

      const items = Array.isArray(responseData.data) ? responseData.data : [];
      setListItems(items);
    } catch (error) {
      console.error("리스트 불러오기 오류:", error);
      setError(error.message || "리스트를 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleItemSelection = (index) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleSubmit = async () => {
    if (selectedItems.size === 0) {
      alert("삭제할 항목을 선택해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 선택된 항목들의 ID 가져오기 (리스트 보기 응답의 data.id)
      const selectedIndices = Array.from(selectedItems);
      const itemsToDelete = selectedIndices.map((index) => {
        const item = listItems[index];
        // 리스트 보기 응답의 data.id 사용
        return item.id;
      }).filter(id => id !== undefined && id !== null);

      if (itemsToDelete.length === 0) {
        throw new Error("삭제할 항목의 ID를 찾을 수 없습니다.");
      }

      // 각 아이템을 DELETE /api/chatlists/{id}로 삭제
      const deletePromises = itemsToDelete.map((id) =>
        fetch(`/api/chatlists/${id}`, {
          method: "DELETE",
          headers: {
            "accept": "*/*",
            "Content-Type": "application/json",
          },
        })
      );

      const results = await Promise.all(deletePromises);
      
      // 모든 삭제 요청이 성공했는지 확인
      const failedResults = results.filter((response) => !response.ok);
      if (failedResults.length > 0) {
        throw new Error("일부 항목 삭제에 실패했습니다.");
      }

      // 성공 시 리스트 새로고침 및 콜백 호출
      await fetchListItems();
      if (onDelete) {
        onDelete();
      }
      // 선택 초기화
      setSelectedItems(new Set());
    } catch (error) {
      console.error("리스트 원소 삭제 오류:", error);
      alert(error.message || "리스트 원소 삭제에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
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
            listItems.map((item, index) => {
              const isSelected = selectedItems.has(index);
              const itemText = typeof item === "string" 
                ? item 
                : item.content || item.text || item.item || item.name || JSON.stringify(item);
              
              return (
                <div
                  key={index}
                  className={`${styles.listItem} ${isSelected ? styles.listItemSelected : ""}`}
                  onClick={() => toggleItemSelection(index)}
                >
                  <div className={styles.listItemContent}>
                    <p className={styles.listItemText}>{itemText}</p>
                  </div>
                  <div className={styles.checkboxContainer}>
                    <div className={`${styles.checkbox} ${isSelected ? styles.checkboxChecked : ""}`}>
                      {isSelected && (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"
                            fill="white"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        {listItems.length > 0 && (
          <div className={styles.footer}>
            <button
              className={styles.submitButton}
              onClick={handleSubmit}
              disabled={selectedItems.size === 0 || isSubmitting}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M2 21L23 12L2 3V10L17 12L2 14V21Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default DeleteListView;

