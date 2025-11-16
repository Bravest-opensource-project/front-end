import { useState } from "react";
import Layout from "../components/Layout";
import TextField from "../components/TextField";
import styles from "./JoinChatRoom.module.css";

function JoinChatRoom() {
  const [entryCode, setEntryCode] = useState("");
  const [nickname, setNickname] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!entryCode.trim() || !nickname.trim()) {
      alert("모든 필드를 입력해주세요.");
      return;
    }

    // TODO: 백엔드 API 연동
    try {
      // const response = await fetch('/api/join-chat', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     entryCode: entryCode.trim(),
      //     nickname: nickname.trim(),
      //   }),
      // });
      // 
      // if (!response.ok) {
      //   throw new Error('채팅방 참가에 실패했습니다.');
      // }
      // 
      // const data = await response.json();
      // // 성공 시 처리 (예: 채팅방으로 이동)
      // console.log('채팅방 참가 성공:', data);

      // 임시로 콘솔에 출력
      console.log("제출 데이터:", {
        entryCode: entryCode.trim(),
        nickname: nickname.trim(),
      });
      alert(`입장 코드: ${entryCode}\n닉네임: ${nickname}\n\n(백엔드 연동 준비됨)`);
    } catch (error) {
      console.error("채팅방 참가 오류:", error);
      alert("채팅방 참가에 실패했습니다. 다시 시도해주세요.");
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

        <button type="submit" className={styles.submitButton}>
          제출
        </button>
      </form>
    </Layout>
  );
}

export default JoinChatRoom;

