import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import TimerBar from "../components/TimerBar";
import ChatInput from "../components/ChatInput";
import ListView from "../components/ListView";
import DeleteListView from "../components/DeleteListView";
import useChat from "../hooks/useChat";
import styles from "./ChatRoom.module.css";

function ChatRoom() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const entryCode = searchParams.get("code");
  const nickname = searchParams.get("nickname");
  const [isListViewOpen, setIsListViewOpen] = useState(false);
  const [isDeleteListViewOpen, setIsDeleteListViewOpen] = useState(false);

  // entryCode와 nickname이 없으면 채팅방 참가 페이지로 리다이렉트
  useEffect(() => {
    if (!entryCode || !nickname) {
      navigate("/join-chat");
    }
  }, [entryCode, nickname, navigate]);

  const { messages, isConnected, timeRemaining, totalTime, roomStatus, sendMessage, messagesEndRef } =
    useChat(entryCode, nickname);

  // 시간이 다되면 투표 시작
  useEffect(() => {
    if (timeRemaining === 0 && roomStatus === "active") {
      // 투표 시작 로직 (나중에 구현)
      console.log("시간 종료 - 투표 시작");
    }
  }, [timeRemaining, roomStatus]);

  if (!entryCode || !nickname) {
    return null;
  }

  return (
    <Layout>
      <div className={styles.chatRoomContainer}>
        <div className={styles.timerBarWrapper}>
          <TimerBar
            timeRemaining={timeRemaining}
            totalTime={totalTime}
          />
        </div>

        <div className={styles.messagesContainer}>
          {messages.length === 0 ? (
            <div className={styles.emptyState}>
              <p>채팅 메시지가 없습니다.</p>
            </div>
          ) : (
            <div className={styles.messagesList}>
              {messages.map((message, index) => (
                <div key={index} className={styles.message}>
                  <span className={styles.messageContent}>{message.content}</span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <ChatInput
          onSendMessage={sendMessage}
          disabled={roomStatus === "closed"}
          onViewList={() => setIsListViewOpen(true)}
          onDeleteList={() => setIsDeleteListViewOpen(true)}
        />
      </div>

      {isListViewOpen && (
        <ListView
          entryCode={entryCode}
          onClose={() => setIsListViewOpen(false)}
        />
      )}

      {isDeleteListViewOpen && (
        <DeleteListView
          entryCode={entryCode}
          onClose={() => setIsDeleteListViewOpen(false)}
          onDelete={() => {
            // 삭제 성공 시 리스트 새로고침 등 필요한 작업 수행
            console.log("리스트 원소 삭제 완료");
          }}
        />
      )}
    </Layout>
  );
}

export default ChatRoom;


