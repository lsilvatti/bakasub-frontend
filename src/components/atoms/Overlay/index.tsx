import styles from './Overlay.module.css';

export function Overlay ({ onClick }: { onClick: () => void }) {
  return (
    <div className={styles.overlay} onClick={onClick} />
  )
}