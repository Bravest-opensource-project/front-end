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
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim() || !validityPeriod.trim()) {
      alert("모든 필드를 입력해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: {
          "accept": "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: description.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "채팅방 생성에 실패했습니다.");
      }

      const responseData = await response.json();
      
      // 응답 형식: { isSuccess, code, message, data: { id, roomCode, title, createdAt }, success }
      if (!responseData.isSuccess || !responseData.data) {
        throw new Error(responseData.message || "채팅방 생성에 실패했습니다.");
      }

      const roomCode = responseData.data.roomCode;
      
      if (!roomCode) {
        console.warn("API 응답 데이터:", responseData);
        throw new Error("입장코드를 받지 못했습니다.");
      }

      setChatRoomCode(roomCode);
      setShowPopup(true);
    } catch (error) {
      console.error("채팅방 생성 오류:", error);
      alert(error.message || "채팅방 생성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
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

          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? "생성 중..." : "제출"}
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

