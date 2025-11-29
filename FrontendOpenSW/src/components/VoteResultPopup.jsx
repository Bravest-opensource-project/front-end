import styles from "./VoteResultPopup.module.css";

function VoteResultPopup({ result, onClose }) {
  if (!result) {
    return null;
  }

  // voteCount가 가장 큰 옵션 찾기
  const options = result.options || [];
  const maxVoteCount = Math.max(...options.map(opt => opt.voteCount || 0), 0);
  const winningOption = options.find(opt => opt.voteCount === maxVoteCount);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
        <div className={styles.content}>
          <div className={styles.iconContainer}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"
                fill="#1D1B20"
              />
            </svg>
          </div>
          <h2 className={styles.title}>투표 결과</h2>
          {winningOption ? (
            <>
              <p className={styles.label}>최다 득표</p>
              <div className={styles.resultContainer}>
                <p className={styles.resultText}>{winningOption.messageContent}</p>
                <p className={styles.voteCount}>{winningOption.voteCount}표</p>
              </div>
            </>
          ) : (
            <p className={styles.emptyMessage}>투표 결과가 없습니다.</p>
          )}
        </div>
        <div className={styles.actions}>
          <button className={styles.closeButton} onClick={onClose}>
            <div className={styles.closeButtonContent}>
              <div className={styles.closeButtonStateLayer}>
                <span className={styles.closeButtonText}>확인</span>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default VoteResultPopup;

