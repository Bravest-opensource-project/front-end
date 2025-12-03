// socketService.js
// 소켓 연결 및 통신 관리 (STOMP WebSocket)

import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

class SocketService {
  constructor() {
    this.stompClient = null;
    this.listeners = new Map();
    this.roomId = null;
    this.anonymousId = null;
  }

  // 소켓 연결
  connect() {
    // localStorage에서 roomId와 anonymousId 가져오기
    const roomId = localStorage.getItem('roomId');
    const anonymousId = localStorage.getItem('anonymousProfileId');
    
    if (!roomId || !anonymousId) {
      console.error("채팅방 정보 또는 익명 프로필 ID가 없습니다.");
      return;
    }

    // 문서 참고: roomId는 Number, anonymousId는 String
    this.roomId = Number(roomId);
    this.anonymousId = String(anonymousId);

    const endpoint = "http://localhost:8080/ws-connect";
    // 문서 참고: 구독 경로는 /subs/chat-rooms/{room-id} (복수형)
    const subDest = `/subs/chat-rooms/${this.roomId}`;

    console.log("SockJS 연결 시도:", endpoint);
    console.log("구독 destination:", subDest);
    console.log("roomId (Number):", this.roomId);
    console.log("anonymousId (String):", this.anonymousId);

    // SockJS 연결
    const sock = new SockJS(endpoint);
    
    // STOMP 클라이언트 생성
    this.stompClient = Stomp.over(sock);
    
    // 디버그 모드 끄기
    this.stompClient.debug = null;

    // CONNECT 헤더 구성 (anonymousId 전달) - 문서 참고: anonymousId는 String
    const headers = {
      anonymousId: this.anonymousId
    };

    // 연결
    this.stompClient.connect(
      headers,
      (frame) => {
        console.log("STOMP 연결 성공:", frame);
        console.log("CONNECT 헤더 anonymousId=" + this.anonymousId);
        
        // 연결 후 구독 (문서 참고: /subs/chat-rooms/{room-id})
        if (subDest) {
          console.log("구독: " + subDest);
          this.stompClient.subscribe(subDest, (message) => {
            try {
              console.log("수신: destination=" + message.headers.destination + ", body=" + message.body);
              
              // 문서 참고: 응답 형식 { isSuccess, code, message, data: { senderName, content, createdAt }, success }
              const data = JSON.parse(message.body);
              console.log("메시지 수신 (파싱됨):", data);
              
              if (data.isSuccess && data.data) {
                // data.data에 { senderName, content, createdAt }가 있음
                console.log("메시지 data 추출:", data.data);
                this.handleMessage(data.data);
              } else {
                console.warn("메시지 형식이 예상과 다름:", data);
              }
            } catch (error) {
              console.error("메시지 파싱 오류:", error);
              console.error("원본 메시지:", message.body);
            }
          });
        }

        // 연결 이벤트 발생
        this.handleMessage({ type: "connect" });
      },
      (error) => {
        console.error("STOMP 연결 실패 / 에러:", error);
      }
    );
  }

  // 메시지 전송
  sendMessage(content) {
    if (!this.stompClient || !this.stompClient.connected) {
      console.error("소켓이 연결되지 않았습니다.");
      return;
    }

    // 문서 참고: roomId는 Number, chatRoomId 필드명 사용
    const roomId = this.roomId || Number(localStorage.getItem('roomId'));
    
    if (!roomId) {
      console.error("채팅방 ID가 없습니다.");
      return;
    }

    // 문서 참고: 전송 경로는 /pubs/send, payload는 { chatRoomId: Number, content: String }
    const dest = "/pubs/send";
    const payload = {
      chatRoomId: roomId,
      content: content,
    };

    console.log("전송 → destination=" + dest + ", payload=" + JSON.stringify(payload));

    this.stompClient.send(dest, {}, JSON.stringify(payload));
  }

  // 메시지 핸들링
  handleMessage(data) {
    console.log("=== socketService handleMessage 호출 ===");
    console.log("받은 data:", data);
    console.log("data 타입:", typeof data);
    console.log("data 키들:", Object.keys(data || {}));
    
    // 연결 이벤트
    if (data.type === "connect") {
      console.log("연결 이벤트 처리");
      if (this.listeners.has("connect")) {
        const callbacks = this.listeners.get("connect");
        console.log("connect 리스너 개수:", callbacks.length);
        callbacks.forEach((callback) => callback(data));
      } else {
        console.warn("connect 리스너가 등록되지 않음");
      }
    } else {
      // 일반 메시지 (data: { senderName, content, createdAt })
      console.log("일반 메시지 처리");
      console.log("data.content:", data.content);
      console.log("data.messageContent:", data.messageContent);
      console.log("data.senderName:", data.senderName);
      
      if (this.listeners.has("message")) {
        const callbacks = this.listeners.get("message");
        console.log("message 리스너 개수:", callbacks.length);
        callbacks.forEach((callback, index) => {
          console.log(`message 리스너[${index}] 호출 시작`);
          try {
            callback(data);
            console.log(`message 리스너[${index}] 호출 완료`);
          } catch (error) {
            console.error(`message 리스너[${index}] 호출 중 에러:`, error);
          }
        });
      } else {
        console.warn("message 리스너가 등록되지 않음");
        console.log("등록된 리스너 타입들:", Array.from(this.listeners.keys()));
      }
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
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.disconnect(() => {
        console.log("STOMP 연결 해제");
      });
      this.stompClient = null;
    }
    this.listeners.clear();
    this.roomId = null;
    this.anonymousId = null;
  }

  // 연결 상태 확인
  isConnected() {
    return this.stompClient && this.stompClient.connected;
  }
}

// 싱글톤 인스턴스
const socketService = new SocketService();

export default socketService;
