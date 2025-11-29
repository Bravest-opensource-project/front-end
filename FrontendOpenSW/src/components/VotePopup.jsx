import { useState } from "react";
import styles from "./VotePopup.module.css";

function VotePopup({ voteOptions, onVote, onClose }) {
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedOptionId) {
      alert("옵션을 선택해주세요.");
      return;
    }

    console.log("선택된 옵션 ID:", selectedOptionId, "타입:", typeof selectedOptionId);
    console.log("전체 옵션들:", voteOptions);

    setIsSubmitting(true);
    try {
      await onVote(selectedOptionId);
    } catch (error) {
      console.error("투표 참여 오류:", error);
      alert(error.message || "투표 참여에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>투표하기</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
        <div className={styles.content}>
          {voteOptions.length === 0 ? (
            <p className={styles.emptyMessage}>투표 옵션이 없습니다.</p>
          ) : (
            <div className={styles.optionsList}>
              {voteOptions.map((option) => (
                <div
                  key={option.id}
                  className={`${styles.optionItem} ${
                    selectedOptionId === option.id ? styles.optionItemSelected : ""
                  }`}
                  onClick={() => setSelectedOptionId(option.id)}
                >
                  <div className={styles.optionContent}>
                    <p className={styles.optionText}>
                      {(() => {
                        // 문자열 필드 찾기
                        const text = option.messageContent || option.content || option.text || option.name;
                        // 문자열이면 그대로, 아니면 첫 번째 요소나 빈 문자열
                        if (typeof text === 'string') {
                          return text;
                        } else if (Array.isArray(text) && text.length > 0) {
                          return String(text[0]);
                        } else {
                          return String(text || '');
                        }
                      })()}
                    </p>
                  </div>
                  <div className={styles.radioContainer}>
                    <div
                      className={`${styles.radio} ${
                        selectedOptionId === option.id ? styles.radioSelected : ""
                      }`}
                    >
                      {selectedOptionId === option.id && (
                        <div className={styles.radioInner} />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {voteOptions.length > 0 && (
          <div className={styles.footer}>
            <button
              className={styles.submitButton}
              onClick={handleSubmit}
              disabled={!selectedOptionId || isSubmitting}
            >
              {isSubmitting ? "투표 중..." : "투표하기"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default VotePopup;

