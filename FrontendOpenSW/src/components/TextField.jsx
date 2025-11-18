import styles from "./TextField.module.css";

function TextField({ label, placeholder, value, onChange, type = "text" }) {
  return (
    <div className={styles.textFieldContainer}>
      <div className={styles.textField}>
        <div className={styles.stateLayer}>
          <div className={styles.content}>
            <div className={styles.inputTextContainer}>
              <input
                type={type}
                className={styles.input}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
              />
            </div>
            <div className={styles.labelContainer}>
              <label className={styles.label}>{label}</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TextField;

