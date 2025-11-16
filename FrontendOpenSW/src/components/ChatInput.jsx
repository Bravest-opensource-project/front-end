import { useState, useEffect, useRef } from "react";
import styles from "./ChatInput.module.css";

function ChatInput({ onSendMessage, disabled = false, onViewList, onDeleteList }) {
  const [message, setMessage] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [listItem, setListItem] = useState("");
  const menuRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuClick = (action) => {
    if (action === "add-item") {
      setIsAddItemOpen(true);
      setIsMenuOpen(false);
    } else if (action === "view-list") {
      if (onViewList) {
        onViewList();
      }
      setIsMenuOpen(false);
    } else if (action === "delete-item") {
      if (onDeleteList) {
        onDeleteList();
      }
      setIsMenuOpen(false);
    } else {
      console.log(`Menu action: ${action}`);
      setIsMenuOpen(false);
    }
  };

  const handleListItemSubmit = async (e) => {
    e.preventDefault();
    if (!listItem.trim()) {
      return;
    }

    try {
      // TODO: 백엔드 API 엔드포인트를 실제 URL로 변경하세요
      const response = await fetch("/api/list-items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          item: listItem.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("리스트 원소 추가에 실패했습니다.");
      }

      // 성공 시 입력 필드 닫기
      setListItem("");
      setIsAddItemOpen(false);
    } catch (error) {
      console.error("리스트 원소 추가 오류:", error);
      alert(error.message || "리스트 원소 추가에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleCloseAddItem = () => {
    setIsAddItemOpen(false);
    setListItem("");
  };

  // 외부 클릭 시 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <div className={styles.chatInputContainer} ref={menuRef}>
      {isAddItemOpen && (
        <div className={styles.addItemInputContainer}>
          <button
            className={styles.closeButton}
            type="button"
            onClick={handleCloseAddItem}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
                fill="currentColor"
              />
            </svg>
          </button>
          <form className={styles.addItemForm} onSubmit={handleListItemSubmit}>
            <input
              type="text"
              className={styles.addItemInput}
              placeholder="리스트 원소를 입력해주세요"
              value={listItem}
              onChange={(e) => setListItem(e.target.value)}
              autoFocus
            />
            <button
              type="submit"
              className={styles.addItemSendButton}
              disabled={!listItem.trim()}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M2 21L23 12L2 3V10L17 12L2 14V21Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </form>
        </div>
      )}
      <div className={styles.menuWrapper}>
        {isMenuOpen && (
          <div className={styles.menu}>
            <button
              className={styles.menuItem}
              onClick={() => handleMenuClick("view-list")}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 6H20V8H4V6ZM4 11H20V13H4V11ZM4 16H20V18H4V16Z"
                  fill="currentColor"
                />
              </svg>
              <span>리스트보기</span>
            </button>
            <button
              className={styles.menuItem}
              onClick={() => handleMenuClick("delete-item")}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z"
                  fill="currentColor"
                />
              </svg>
              <span>리스트 원소 삭제</span>
            </button>
            <button
              className={styles.menuItem}
              onClick={() => handleMenuClick("add-item")}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z"
                  fill="currentColor"
                />
              </svg>
              <span>리스트 원소 추가</span>
            </button>
          </div>
        )}
        <button
          className={styles.menuButton}
          type="button"
          onClick={toggleMenu}
        >
          {isMenuOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
                fill="currentColor"
              />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 18H21M3 6H21M3 12H21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
      </div>
      <form className={styles.inputForm} onSubmit={handleSubmit}>
        <input
          type="text"
          className={styles.input}
          placeholder="입력해주세요"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={disabled}
        />
        <button
          type="submit"
          className={styles.sendButton}
          disabled={!message.trim() || disabled}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M2 21L23 12L2 3V10L17 12L2 14V21Z"
              fill="currentColor"
            />
          </svg>
        </button>
      </form>
    </div>
  );
}

export default ChatInput;


