import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import TimerBar from "../components/TimerBar";
import ChatInput from "../components/ChatInput";
import ListView from "../components/ListView";
import DeleteListView from "../components/DeleteListView";
import VotePopup from "../components/VotePopup";
import VoteResultPopup from "../components/VoteResultPopup";
import useChat from "../hooks/useChat";
import styles from "./ChatRoom.module.css";

function ChatRoom() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const entryCode = searchParams.get("code");
  const nickname = searchParams.get("nickname");
  const [isListViewOpen, setIsListViewOpen] = useState(false);
  const [isDeleteListViewOpen, setIsDeleteListViewOpen] = useState(false);
  const [isVotePopupOpen, setIsVotePopupOpen] = useState(false);
  const [isVoteResultPopupOpen, setIsVoteResultPopupOpen] = useState(false);
  const [voteOptions, setVoteOptions] = useState([]);
  const [voteId, setVoteId] = useState(null);
  const [voteResult, setVoteResult] = useState(null);
  const voteCreatedRef = useRef(false); // 투표 생성 여부 추적

  // 디버깅: 투표 팝업 상태 확인
  useEffect(() => {
    console.log("투표 팝업 상태:", { isVotePopupOpen, voteOptionsCount: voteOptions.length, voteId });
  }, [isVotePopupOpen, voteOptions, voteId]);

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
    if (timeRemaining === 0 && roomStatus === "active" && !voteCreatedRef.current) {
      voteCreatedRef.current = true; // 투표 생성 시작 표시
      createVote();
    }
  }, [timeRemaining, roomStatus]);

  const createVote = async () => {
    try {
      // 1. chatlists API 호출하여 roomId와 content 가져오기
      const roomId = localStorage.getItem('anonymousProfileRoomId') || localStorage.getItem('roomId');
      
      if (!roomId) {
        console.error("채팅방 정보를 찾을 수 없습니다.");
        return;
      }

      const listResponse = await fetch(`/api/chatlists/room/${roomId}`, {
        method: "GET",
        headers: {
          "accept": "*/*",
          "Content-Type": "application/json",
        },
      });

      if (!listResponse.ok) {
        throw new Error("리스트를 불러오는데 실패했습니다.");
      }

      const listData = await listResponse.json();
      
      if (!listData.isSuccess || !listData.data) {
        throw new Error(listData.message || "리스트를 불러오는데 실패했습니다.");
      }

      const chatlists = Array.isArray(listData.data) ? listData.data : [];
      
      if (chatlists.length === 0) {
        console.log("투표할 리스트가 없습니다.");
        return;
      }

      // 2. roomId와 messages 추출
      // roomId: 첫 번째 아이템의 roomId (모든 아이템이 같은 roomId를 가짐)
      // messages: 모든 아이템의 content 배열 (문자열 배열)
      const voteRoomId = chatlists[0].roomId;
      const messages = chatlists
        .map(item => item.content)
        .filter(content => content !== null && content !== undefined && content !== '')
        .map(content => String(content)); // 명시적으로 문자열로 변환

      console.log("chatlists 데이터:", chatlists);
      console.log("추출된 roomId:", voteRoomId);
      console.log("추출된 messages:", messages);
      console.log("messages 타입 확인:", messages.map(m => ({ value: m, type: typeof m })));

      if (!voteRoomId || messages.length === 0) {
        console.log("투표 생성에 필요한 데이터가 없습니다.", { voteRoomId, messagesLength: messages.length });
        return;
      }

      // 3. 투표 생성 API 호출
      const requestBody = {
        roomId: parseInt(voteRoomId, 10),
        messages: messages, // 문자열 배열: ["ㅎㅎㅎ", "ㅁㅁㅁ"]
      };

      console.log("투표 생성 요청:", requestBody);
      console.log("JSON 직렬화 결과:", JSON.stringify(requestBody));

      const voteResponse = await fetch("/api/votes", {
        method: "POST",
        headers: {
          "accept": "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("투표 생성 응답 상태:", voteResponse.status);

      if (!voteResponse.ok) {
        const errorData = await voteResponse.json().catch(() => ({}));
        console.error("투표 생성 에러 응답:", errorData);
        throw new Error(errorData.message || `투표 생성에 실패했습니다. (${voteResponse.status})`);
      }

      const voteData = await voteResponse.json();
      
      console.log("투표 생성 응답:", voteData);
      
      if (!voteData.isSuccess || !voteData.data) {
        throw new Error(voteData.message || "투표 생성에 실패했습니다.");
      }

      // 4. 응답 데이터 저장 및 투표 팝업 표시
      const createdVoteId = voteData.data.id;
      const options = voteData.data.options || [];
      
      console.log("투표 ID:", createdVoteId);
      console.log("투표 옵션 전체:", options);
      console.log("투표 옵션 상세:", options.map(opt => ({ id: opt.id, type: typeof opt.id, content: opt.content || opt.text })));
      
      if (createdVoteId) {
        localStorage.setItem('voteId', createdVoteId.toString());
        setVoteId(createdVoteId);
      }
      
      if (options.length > 0) {
        const optionIds = options.map(option => option.id);
        console.log("옵션 ID들:", optionIds);
        localStorage.setItem('voteOptionIds', JSON.stringify(optionIds));
        setVoteOptions(options);
        console.log("투표 팝업 표시 시도");
        setIsVotePopupOpen(true); // 투표 팝업 표시
      } else {
        console.warn("투표 옵션이 없습니다. options:", options);
      }

      console.log("투표 생성 완료:", voteData);
    } catch (error) {
      console.error("투표 생성 오류:", error);
    }
  };

  const handleVote = async (voteOptionId) => {
    try {
      const currentVoteId = voteId || localStorage.getItem('voteId');
      const anonymousProfileId = localStorage.getItem('anonymousProfileId');

      console.log("투표 참여 시작:", { voteOptionId, currentVoteId, anonymousProfileId });
      console.log("voteOptionId 타입:", typeof voteOptionId);

      if (!currentVoteId || !anonymousProfileId) {
        throw new Error("투표 정보를 찾을 수 없습니다.");
      }

      // voteOptionId가 이미 숫자인지 확인
      const voteOptionIdNum = typeof voteOptionId === 'number' ? voteOptionId : parseInt(voteOptionId, 10);
      const anonymousProfileIdNum = parseInt(anonymousProfileId, 10);

      console.log("변환된 값:", { voteOptionIdNum, anonymousProfileIdNum });

      if (isNaN(voteOptionIdNum) || isNaN(anonymousProfileIdNum)) {
        throw new Error("유효하지 않은 ID 값입니다.");
      }

      const requestBody = {
        voteOptionId: voteOptionIdNum,
        anonymousProfileId: anonymousProfileIdNum,
      };

      console.log("투표 참여 요청:", requestBody);

      const response = await fetch(`/api/votes/${currentVoteId}/cast`, {
        method: "POST",
        headers: {
          "accept": "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("투표 참여 응답 상태:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("투표 참여 에러 응답:", errorData);
        throw new Error(errorData.message || "투표 참여에 실패했습니다.");
      }

      const voteData = await response.json();
      
      if (!voteData.isSuccess) {
        throw new Error(voteData.message || "투표 참여에 실패했습니다.");
      }

      console.log("투표 참여 완료:", voteData);
      
      // 투표 참여 성공 후 투표 종료 호출
      await endVote(currentVoteId);
      
      // 투표 팝업 닫기
      setIsVotePopupOpen(false);
    } catch (error) {
      console.error("투표 참여 오류:", error);
      throw error; // 상위로 에러 전달
    }
  };

  const endVote = async (voteIdToEnd) => {
    try {
      const currentVoteId = voteIdToEnd || voteId || localStorage.getItem('voteId');

      if (!currentVoteId) {
        console.error("투표 ID를 찾을 수 없습니다.");
        return;
      }

      console.log("투표 종료 시작:", currentVoteId);

      const response = await fetch(`/api/votes/${currentVoteId}/end`, {
        method: "POST",
        headers: {
          "accept": "*/*",
          "Content-Type": "application/json",
        },
      });

      console.log("투표 종료 응답 상태:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("투표 종료 에러 응답:", errorData);
        throw new Error(errorData.message || "투표 종료에 실패했습니다.");
      }

      const endData = await response.json();
      
      if (!endData.isSuccess) {
        throw new Error(endData.message || "투표 종료에 실패했습니다.");
      }

      console.log("투표 종료 완료:", endData);
      
      // 투표 종료 후 결과 조회
      await fetchVoteResult(currentVoteId);
    } catch (error) {
      console.error("투표 종료 오류:", error);
      // 투표 종료 실패해도 투표 참여는 성공했으므로 에러를 던지지 않음
    }
  };

  const fetchVoteResult = async (voteIdToFetch) => {
    try {
      const currentVoteId = voteIdToFetch || voteId || localStorage.getItem('voteId');

      if (!currentVoteId) {
        console.error("투표 ID를 찾을 수 없습니다.");
        return;
      }

      console.log("투표 결과 조회 시작:", currentVoteId);

      const response = await fetch(`/api/votes/${currentVoteId}/result`, {
        method: "GET",
        headers: {
          "accept": "*/*",
          "Content-Type": "application/json",
        },
      });

      console.log("투표 결과 조회 응답 상태:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("투표 결과 조회 에러 응답:", errorData);
        throw new Error(errorData.message || "투표 결과 조회에 실패했습니다.");
      }

      const resultData = await response.json();
      
      if (!resultData.isSuccess || !resultData.data) {
        throw new Error(resultData.message || "투표 결과 조회에 실패했습니다.");
      }

      console.log("투표 결과:", resultData.data);
      
      // voteCount가 가장 큰 옵션만 찾기
      const options = resultData.data.options || [];
      const maxVoteCount = Math.max(...options.map(opt => opt.voteCount || 0), 0);
      const winningOption = options.find(opt => opt.voteCount === maxVoteCount);
      
      console.log("최다 득표 옵션:", winningOption);
      
      // 결과 저장 및 팝업 표시
      setVoteResult(resultData.data);
      setIsVoteResultPopupOpen(true);
    } catch (error) {
      console.error("투표 결과 조회 오류:", error);
    }
  };

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
              {messages.map((message, index) => {
                const isOwnMessage = message.isOwn === true;
                return (
                  <div
                    key={index}
                    className={`${styles.message} ${
                      isOwnMessage ? styles.messageOwn : styles.messageOther
                    }`}
                  >
                    <span className={styles.messageContent}>{message.content}</span>
                  </div>
                );
              })}
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

      {isVotePopupOpen && (
        <VotePopup
          voteOptions={voteOptions}
          onVote={handleVote}
          onClose={() => {
            console.log("투표 팝업 닫기");
            setIsVotePopupOpen(false);
          }}
        />
      )}

      {isVoteResultPopupOpen && (
        <VoteResultPopup
          result={voteResult}
          onClose={() => setIsVoteResultPopupOpen(false)}
        />
      )}
    </Layout>
  );
}

export default ChatRoom;


