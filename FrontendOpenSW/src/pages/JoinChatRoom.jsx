import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import TextField from "../components/TextField";
import socketService from "../services/socketService";
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
      // 기존 소켓 연결 끊기
      if (socketService.isConnected()) {
        socketService.disconnect();
      }

      // 기존 localStorage 값 초기화 (새로운 참가를 위해)
      // 같은 탭에서 다른 채팅방에 참가할 수 있도록
      localStorage.removeItem('anonymousProfileId');
      localStorage.removeItem('anonymousProfileRoomId');
      localStorage.removeItem('roomId');
      localStorage.removeItem('voteId');
      localStorage.removeItem('voteOptionIds');
      localStorage.removeItem('chatlists');

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

      // 2단계: 익명 프로필 생성 (또는 기존 프로필 재사용)
      console.log("=== 익명 프로필 생성 시작 ===");
      console.log("roomId:", roomId);
      console.log("nickname:", nickname.trim());
      
      let anonymousProfileId = null;
      let profileRoomId = null;
      let profileData = null;

      // realUserId를 랜덤 값으로 생성 (1 ~ 1000000 범위)
      const randomRealUserId = Math.floor(Math.random() * 1000000) + 1;
      console.log("생성된 랜덤 realUserId:", randomRealUserId);

      const requestBody = {
        realUserId: randomRealUserId,
        anonymousName: nickname.trim(),
      };
      console.log("익명 프로필 생성 요청:", requestBody);

      const profileResponse = await fetch(`/api/anonymous-profiles/rooms/${roomId}`, {
        method: "POST",
        headers: {
          "accept": "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("익명 프로필 생성 응답 상태:", profileResponse.status, profileResponse.statusText);

      if (!profileResponse.ok) {
        let errorData = {};
        try {
          const responseText = await profileResponse.text();
          console.error("익명 프로필 생성 에러 응답 (텍스트):", responseText);
          if (responseText) {
            errorData = JSON.parse(responseText);
          }
        } catch (parseError) {
          console.error("에러 응답 파싱 실패:", parseError);
          errorData = {};
        }
        console.error("익명 프로필 생성 에러 응답:", errorData);
        console.error("에러 상태 코드:", profileResponse.status);
        
        // "이미 있는 사용자" 에러인 경우, 기존 프로필을 찾아서 재사용
        const errorMessage = errorData.message || errorData.error || "";
        if (errorMessage && (errorMessage.includes("이미") || errorMessage.includes("존재") || errorMessage.includes("already") || errorMessage.includes("중복"))) {
          // 에러 응답에 기존 프로필 정보가 포함되어 있는지 확인
          if (errorData.data && errorData.data.id) {
            // 에러 응답에 기존 프로필 정보가 있는 경우
            anonymousProfileId = errorData.data.id;
            profileRoomId = errorData.data.roomId || roomId;
            profileData = errorData.data;
            console.log("기존 익명 프로필 재사용:", { anonymousProfileId, profileRoomId });
          } else {
            // 기존 프로필 정보가 없는 경우, 사용자에게 알림
            throw new Error("이미 해당 닉네임으로 참가한 사용자가 있습니다. 다른 닉네임을 사용해주세요.");
          }
        } else {
          throw new Error(errorMessage || "익명 프로필 생성에 실패했습니다.");
        }
      } else {
        // 성공적으로 생성된 경우
        profileData = await profileResponse.json();
        console.log("익명 프로필 생성 성공 응답:", profileData);
        
        // 응답 형식: { isSuccess, code, message, data: { id, roomId, nickname }, success }
        if (!profileData.isSuccess || !profileData.data) {
          throw new Error(profileData.message || "익명 프로필 생성에 실패했습니다.");
        }

        anonymousProfileId = profileData.data.id;
        profileRoomId = profileData.data.roomId; // anonymous-profiles 응답의 roomId
        
        console.log("생성된 익명 프로필 정보:");
        console.log("  - anonymousProfileId:", anonymousProfileId);
        console.log("  - profileRoomId:", profileRoomId);
        console.log("  - nickname:", profileData.data.nickname || profileData.data.anonymousName);
        
        if (!anonymousProfileId) {
          console.warn("익명 프로필 생성 응답 데이터:", profileData);
          throw new Error("익명 프로필 ID를 받지 못했습니다.");
        }
      }

      // anonymousProfileId와 roomId를 localStorage에 저장
      // registeredBy: data.id (anonymousProfileId)
      // roomId: data.roomId (익명 프로필 응답의 roomId)
      console.log("=== localStorage 저장 ===");
      console.log("anonymousProfileId:", anonymousProfileId);
      console.log("anonymousProfileRoomId:", profileRoomId ? profileRoomId.toString() : roomId.toString());
      console.log("roomId:", roomId.toString());
      
      localStorage.setItem('anonymousProfileId', anonymousProfileId.toString());
      localStorage.setItem('anonymousProfileRoomId', profileRoomId ? profileRoomId.toString() : roomId.toString());
      localStorage.setItem('roomId', roomId.toString());
      
      console.log("=== 익명 프로필 생성 완료 ===");

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

