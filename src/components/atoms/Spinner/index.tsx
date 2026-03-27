import styles from './Spinner.module.css';

interface SpinnerProps {
  size?: 'sm' | 'md';
  variant?: 'default' | 'onAction';
}

export function Spinner ({ size = 'sm', variant = 'default' }: SpinnerProps) {
  const className = `${styles.base} ${styles[size]} ${styles[variant]}`;

  return (
    <span className={className} role="status" aria-hidden="true" />
  );
};