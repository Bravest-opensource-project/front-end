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
      const items = data.items || data || [];
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
      // 선택된 항목들의 ID 또는 인덱스를 백엔드로 전송
      const selectedIndices = Array.from(selectedItems);
      const itemsToDelete = selectedIndices.map((index) => {
        const item = listItems[index];
        return typeof item === "string" ? item : item.id || item.item || item.text || item.name;
      });

      // TODO: 백엔드 API 엔드포인트를 실제 URL로 변경하세요
      const response = await fetch("/api/list-items/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          entryCode,
          items: itemsToDelete,
        }),
      });

      if (!response.ok) {
        throw new Error("리스트 원소 삭제에 실패했습니다.");
      }

      // 성공 시 콜백 호출 및 닫기
      if (onDelete) {
        onDelete();
      }
      onClose();
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
              const itemText = typeof item === "string" ? item : item.text || item.item || item.name;
              
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

