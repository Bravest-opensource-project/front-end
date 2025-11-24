// socketService.js
// 소켓 연결 및 통신 관리

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  // 소켓 연결
  connect(entryCode, nickname) {
    // TODO: 실제 소켓 서버 URL로 변경
    const socketUrl = process.env.REACT_APP_SOCKET_URL || "ws://localhost:3001";
    
    this.socket = new WebSocket(`${socketUrl}?entryCode=${entryCode}&nickname=${nickname}`);

    this.socket.onopen = () => {
      console.log("소켓 연결 성공");
      this.emit("join-room", { entryCode, nickname });
      // connect 이벤트 발생
      this.handleMessage({ type: "connect" });
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (error) {
        console.error("메시지 파싱 오류:", error);
      }
    };

    this.socket.onerror = (error) => {
      console.error("소켓 오류:", error);
    };

    this.socket.onclose = () => {
      console.log("소켓 연결 종료");
      this.socket = null;
    };
  }

  // 메시지 전송
  sendMessage(message) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: "message",
        content: message,
      }));
    } else {
      console.error("소켓이 연결되지 않았습니다.");
    }
  }

  // 이벤트 발생
  emit(eventType, data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: eventType,
        ...data,
      }));
    }
  }

  // 메시지 핸들링
  handleMessage(data) {
    const { type } = data;
    
    if (this.listeners.has(type)) {
      const callbacks = this.listeners.get(type);
      callbacks.forEach((callback) => callback(data));
    }
  }

  // 이벤트 리스너 등록
  on(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType).push(callback);
  }

  // 이벤트 리스너 제거
  off(eventType, callback) {
    if (this.listeners.has(eventType)) {
      const callbacks = this.listeners.get(eventType);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // 소켓 연결 해제
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.listeners.clear();
  }

  // 연결 상태 확인
  isConnected() {
    return this.socket && this.socket.readyState === WebSocket.OPEN;
  }
}

// 싱글톤 인스턴스
const socketService = new SocketService();

export default socketService;
