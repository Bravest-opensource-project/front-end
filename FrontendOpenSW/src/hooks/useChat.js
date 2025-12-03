import { useState, useEffect, useRef, useCallback } from "react";
import socketService from "../services/socketService";

function useChat(entryCode, nickname) {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  // UI 확인용: 임시 더미 데이터 (소켓 연결 전에도 UI 확인 가능)
  const [timeRemaining, setTimeRemaining] = useState(60); // 남은 시간 (초) - 1분
  const [totalTime, setTotalTime] = useState(60); // 총 시간 (초) - 1분
  const [roomStatus, setRoomStatus] = useState("active"); // active, voting, closed
  const messagesEndRef = useRef(null);

  // 메시지 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 시간 자동 감소 (1초마다)
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0 || roomStatus !== "active") {
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining, roomStatus]);

  // 소켓 연결
  useEffect(() => {
    if (entryCode && nickname) {
      // localStorage에서 roomId와 anonymousId 확인
      const roomId = localStorage.getItem('roomId');
      const anonymousId = localStorage.getItem('anonymousProfileId');
      
      if (!roomId || !anonymousId) {
        console.log("채팅방 정보 또는 익명 프로필 ID가 없습니다. 채팅방 참가를 먼저 완료해주세요.");
        return;
      }

      // STOMP 연결 시도
      try {
        socketService.connect();
      } catch (error) {
        console.error("소켓 연결 실패:", error);
      }

      // 연결 상태 리스너
      const handleConnect = () => {
        setIsConnected(true);
      };

      // 메시지 수신 리스너 (다른 사람이 보낸 메시지)
      const handleMessage = (data) => {
        console.log("useChat handleMessage 호출:", data);
        
        // 연결 이벤트는 제외
        if (data.type === "connect") {
          console.log("연결 이벤트이므로 무시");
          return;
        }

        // STOMP 응답 형식: { senderName, content, createdAt }
        console.log("받은 데이터:", data);
        console.log("data.content:", data.content);
        console.log("data.messageContent:", data.messageContent);
        
        const content = data.content || data.messageContent || "";
        const message = {
          content: content,
          isOwn: false, // 소켓에서 받은 메시지는 다른 사람이 보낸 것
        };
        
        console.log("생성된 message 객체:", message);
        
        if (message.content && message.content.trim() !== "") {
          console.log("메시지 추가:", message);
          setMessages((prev) => {
            console.log("이전 메시지 개수:", prev.length);
            const newMessages = [...prev, message];
            console.log("새 메시지 개수:", newMessages.length);
            return newMessages;
          });
        } else {
          console.warn("메시지 content가 비어있어서 추가하지 않음:", message);
        }
      };

      // 시간 업데이트 리스너
      const handleTimeUpdate = (data) => {
        if (data.timeRemaining !== undefined) {
          setTimeRemaining(data.timeRemaining);
        }
        if (data.totalTime !== undefined) {
          setTotalTime(data.totalTime);
        }
      };

      // 방 상태 업데이트 리스너
      const handleRoomStatus = (data) => {
        if (data.status) {
          setRoomStatus(data.status);
        }
      };

      // 투표 시작 리스너
      const handleVoteStart = () => {
        setRoomStatus("voting");
      };

      // 방 마감 리스너
      const handleRoomClose = () => {
        setRoomStatus("closed");
      };

      socketService.on("connect", handleConnect);
      socketService.on("message", handleMessage);
      socketService.on("time-update", handleTimeUpdate);
      socketService.on("room-status", handleRoomStatus);
      socketService.on("vote-start", handleVoteStart);
      socketService.on("room-close", handleRoomClose);

      return () => {
        socketService.off("connect", handleConnect);
        socketService.off("message", handleMessage);
        socketService.off("time-update", handleTimeUpdate);
        socketService.off("room-status", handleRoomStatus);
        socketService.off("vote-start", handleVoteStart);
        socketService.off("room-close", handleRoomClose);
        socketService.disconnect();
      };
    }
  }, [entryCode, nickname]);

  // 메시지 전송
  const sendMessage = useCallback((content) => {
    // 내가 보낸 메시지는 즉시 로컬에 추가 (isOwn: true)
    const ownMessage = {
      content: content,
      isOwn: true, // 내가 보낸 메시지
    };
    setMessages((prev) => [...prev, ownMessage]);

    if (socketService.isConnected()) {
      socketService.sendMessage(content);
    } else {
      // UI 확인용: 소켓 연결이 안 되어 있어도 메시지는 이미 추가됨
      console.log("소켓 연결 없음 - 로컬 메시지 추가 (UI 확인용)");
    }
  }, []);

  return {
    messages,
    isConnected,
    timeRemaining,
    totalTime,
    roomStatus,
    sendMessage,
    messagesEndRef,
  };
}

export default useChat;


