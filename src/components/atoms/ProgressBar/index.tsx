import clsx from 'clsx';
import styles from './ProgressBar.module.css';

export interface ProgressBarProps {
  progress: number;
  label?: string;
  showValue?: boolean;
  status?: 'active' | 'success' | 'error';
  animated?: boolean;
  className?: string;
}

export function ProgressBar({ 
  progress, 
  label, 
  showValue = true, 
  status = 'active', 
  animated = true,
  className 
}: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={clsx(styles.container, className)}>
      {(label || showValue) && (
        <div className={styles.header}>
          {label && <span className={styles.label}>{label}</span>}
          {showValue && <span className={styles.value}>{Math.round(clampedProgress)}%</span>}
        </div>
      )}
      
      <div className={styles.track}>
        <div 
          className={clsx(
            styles.fill, 
            styles[status],
            animated && status === 'active' && styles.animated
          )} 
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
}