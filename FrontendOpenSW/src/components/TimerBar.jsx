import styles from "./TimerBar.module.css";

function TimerBar({ timeRemaining, totalTime }) {
  // 시간이 없으면 표시하지 않음
  if (timeRemaining === null || totalTime === null) {
    return null;
  }

  const percentage = (timeRemaining / totalTime) * 100;

  return (
    <div className={styles.timerBarContainer}>
      <div className={styles.timerBar}>
        {/* Active track (왼쪽, 보라색) */}
        <div
          className={styles.activeTrack}
          style={{ width: `${percentage}%` }}
        />
        {/* Handle (중간, 세로 막대) - activeTrack의 끝에 위치 */}
        <div 
          className={styles.handle}
          style={{ left: `${percentage}%` }}
        />
        {/* Inactive track (오른쪽, 연한 보라색) */}
        <div className={styles.inactiveTrack}>
          <div className={styles.trackStop} />
        </div>
      </div>
    </div>
  );
}

export default TimerBar;


