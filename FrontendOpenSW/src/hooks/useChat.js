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
      // UI 확인용: 소켓 연결 시도 (실패해도 UI는 표시됨)
      try {
        socketService.connect(entryCode, nickname);
      } catch (error) {
        console.log("소켓 연결 실패 (UI 확인용):", error);
        // UI 확인을 위해 연결 실패해도 계속 진행
      }

      // 연결 상태 리스너
      const handleConnect = () => {
        setIsConnected(true);
      };

      // 메시지 수신 리스너 (다른 사람이 보낸 메시지)
      const handleMessage = (data) => {
        const message = {
          content: data.content || data.message || data,
          isOwn: false, // 소켓에서 받은 메시지는 다른 사람이 보낸 것
        };
        setMessages((prev) => [...prev, message]);
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


