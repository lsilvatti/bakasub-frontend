import styles from './PentagramLoader.module.css';

export const PentagramLoader = () => {
  return (
    <div className={styles.container}>
      <svg className={styles.svg} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="brilliantGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: 'var(--primary-300, #ffc1d9)', stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: '#ffffff', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: 'var(--primary-500, #ff8fbb)', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        
        <path
          className={styles.path}
          style={{ stroke: 'url(#brilliantGradient)' }}
          d="M50,2.5 L64.7,34.4 L97.5,39.1 L73.8,63 L79.4,97.5 L50,81.2 L20.6,97.5 L26.2,63 L2.5,39.1 L35.3,34.4 Z"
        />

        <circle className={styles.spark} cx="10" cy="20" r="1.5" style={{ animationDelay: '0.1s' }} />
        <circle className={styles.spark} cx="85" cy="15" r="1.2" style={{ animationDelay: '0.5s' }} />
        <circle className={styles.spark} cx="5" cy="80" r="1" style={{ animationDelay: '0.3s' }} />
        <circle className={styles.spark} cx="95" cy="85" r="1.8" style={{ animationDelay: '0.7s' }} />
        <circle className={styles.spark} cx="50" cy="50" r="0.8" style={{ animationDelay: '0s' }} />
        <circle className={styles.spark} cx="20" cy="60" r="1.1" style={{ animationDelay: '0.2s' }} />
        <circle className={styles.spark} cx="80" cy="40" r="1.3" style={{ animationDelay: '0.6s' }} />
      </svg>
    </div>
  );
};