import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import TextField from "../components/TextField";
import styles from "./JoinChatRoom.module.css";

function JoinChatRoom() {
  const navigate = useNavigate();
  const [entryCode, setEntryCode] = useState("");
  const [nickname, setNickname] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!entryCode.trim() || !nickname.trim()) {
      alert("모든 필드를 입력해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      // 1단계: 채팅방 참가 (roomCode로 참가)
      const joinResponse = await fetch("/api/rooms/join", {
        method: "POST",
        headers: {
          "accept": "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomCode: entryCode.trim(),
        }),
      });

      if (!joinResponse.ok) {
        const errorData = await joinResponse.json().catch(() => ({}));
        throw new Error(errorData.message || "채팅방 참가에 실패했습니다.");
      }

      const joinData = await joinResponse.json();
      
      // 응답 형식: { isSuccess, code, message, data: { id, roomCode, title, createdAt }, success }
      if (!joinData.isSuccess || !joinData.data) {
        throw new Error(joinData.message || "채팅방 참가에 실패했습니다.");
      }

      const roomId = joinData.data.id;
      
      if (!roomId) {
        console.warn("채팅방 참가 응답 데이터:", joinData);
        throw new Error("채팅방 ID를 받지 못했습니다.");
      }

      // 2단계: 익명 프로필 생성
      const profileResponse = await fetch(`/api/anonymous-profiles/rooms/${roomId}`, {
        method: "POST",
        headers: {
          "accept": "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          realUserId: 0,
          anonymousName: nickname.trim(),
        }),
      });

      if (!profileResponse.ok) {
        const errorData = await profileResponse.json().catch(() => ({}));
        throw new Error(errorData.message || "익명 프로필 생성에 실패했습니다.");
      }

      const profileData = await profileResponse.json();
      
      // 응답 형식: { isSuccess, code, message, data: { id, roomId, nickname }, success }
      if (!profileData.isSuccess || !profileData.data) {
        throw new Error(profileData.message || "익명 프로필 생성에 실패했습니다.");
      }

      const anonymousProfileId = profileData.data.id;
      const profileRoomId = profileData.data.roomId; // anonymous-profiles 응답의 roomId
      
      if (!anonymousProfileId) {
        console.warn("익명 프로필 생성 응답 데이터:", profileData);
        throw new Error("익명 프로필 ID를 받지 못했습니다.");
      }

      // anonymousProfileId와 roomId를 localStorage에 저장
      // registeredBy: data.id (anonymousProfileId)
      // roomId: data.roomId (익명 프로필 응답의 roomId)
      localStorage.setItem('anonymousProfileId', anonymousProfileId.toString());
      localStorage.setItem('anonymousProfileRoomId', profileRoomId ? profileRoomId.toString() : roomId.toString());
      localStorage.setItem('roomId', roomId.toString());

      // 성공 시 채팅방으로 이동
      navigate(`/chat-room?code=${encodeURIComponent(entryCode.trim())}&nickname=${encodeURIComponent(nickname.trim())}`);
    } catch (error) {
      console.error("채팅방 참가 오류:", error);
      alert(error.message || "채팅방 참가에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          <TextField
            label="입장 코드"
            placeholder="채팅방 입장 코드 입력해주세요"
            value={entryCode}
            onChange={(e) => setEntryCode(e.target.value)}
          />
        </div>

        <div className={styles.inputGroup}>
          <TextField
            label="닉네임"
            placeholder="닉네임 작성해주세요"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        </div>

        <button 
          type="submit" 
          className={styles.submitButton}
          disabled={isLoading}
        >
          {isLoading ? "참가 중..." : "제출"}
        </button>
      </form>
    </Layout>
  );
}

export default JoinChatRoom;

