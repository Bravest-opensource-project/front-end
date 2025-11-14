import { useNavigate } from "react-router-dom";
import styles from "./ChatRoomCreatedPopup.module.css";

function ChatRoomCreatedPopup({ chatRoomCode, onClose }) {
  const navigate = useNavigate();

  const handleJoinChat = () => {
    onClose();
    navigate("/join-chat");
  };

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
          <h2 className={styles.title}>채팅방 생성완료</h2>
          <p className={styles.label}>채팅방 코드</p>
          <div className={styles.codeContainer}>
            <p className={styles.code}>{chatRoomCode}</p>
          </div>
        </div>
        <div className={styles.actions}>
          <button className={styles.joinButton} onClick={handleJoinChat}>
            <div className={styles.joinButtonContent}>
              <div className={styles.joinButtonStateLayer}>
                <span className={styles.joinButtonText}>채팅방 참가</span>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatRoomCreatedPopup;

