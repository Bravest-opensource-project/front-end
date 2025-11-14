import { useState } from "react";
import Layout from "../components/Layout";
import TextField from "../components/TextField";
import ChatRoomCreatedPopup from "../components/ChatRoomCreatedPopup";
import styles from "./CreateChatRoom.module.css";

function CreateChatRoom() {
  const [description, setDescription] = useState("");
  const [validityPeriod, setValidityPeriod] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [chatRoomCode, setChatRoomCode] = useState("");

  const generateChatRoomCode = () => {
    // 임시로 랜덤 코드 생성 (나중에 API 연동)
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    return code;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim() || !validityPeriod.trim()) {
      alert("모든 필드를 입력해주세요.");
      return;
    }
    const code = generateChatRoomCode();
    setChatRoomCode(code);
    setShowPopup(true);
  };

  return (
    <>
      <Layout>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <TextField
              label="채팅방 설명"
              placeholder="채팅방에 대한 설명을 써주세요"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <TextField
              label="채팅 유효시간"
              placeholder="분 단위로 써주세요"
              value={validityPeriod}
              onChange={(e) => setValidityPeriod(e.target.value)}
              type="number"
            />
          </div>

          <button type="submit" className={styles.submitButton}>
            제출
          </button>
        </form>
      </Layout>

      {showPopup && (
        <ChatRoomCreatedPopup
          chatRoomCode={chatRoomCode}
          onClose={() => setShowPopup(false)}
        />
      )}
    </>
  );
}

export default CreateChatRoom;

