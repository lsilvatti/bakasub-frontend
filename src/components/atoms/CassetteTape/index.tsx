import clsx from 'clsx';
import styles from './CassetteTape.module.css';

export interface CassetteTapeProps {
  label?: string;
  sublabel?: string;
  spinning?: boolean;
  status?: 'active' | 'completed' | 'error' | 'idle';
  className?: string;
}

export function CassetteTape({
  label = 'BAKASUB',
  sublabel,
  spinning = false,
  status = 'idle',
  className,
}: CassetteTapeProps) {
  const reelClass = spinning
    ? status === 'active' ? styles.spinning : styles.spinningFast
    : undefined;

  return (
    <div className={clsx(styles.cassette, status === 'completed' && styles.completed, status === 'error' && styles.error, className)}>
      <svg viewBox="0 0 200 126" xmlns="http://www.w3.org/2000/svg">
        {/* Main body */}
        <rect className={styles.cassetteBody} x="4" y="4" width="192" height="118" rx="8" />

        {/* Screw holes */}
        <circle className={styles.screwHole} cx="16" cy="16" />
        <circle className={styles.screwHole} cx="184" cy="16" />
        <circle className={styles.screwHole} cx="16" cy="110" />
        <circle className={styles.screwHole} cx="184" cy="110" />

        {/* Inner panel */}
        <rect className={styles.cassetteInner} x="20" y="20" width="160" height="56" rx="4" />

        {/* Label text */}
        <text className={styles.label} x="100" y="35">{label}</text>
        {sublabel && <text className={styles.labelSub} x="100" y="45">{sublabel}</text>}

        {/* Horizontal detail lines */}
        <line className={styles.lineDetail} x1="30" y1="52" x2="170" y2="52" />
        <line className={styles.lineDetail} x1="30" y1="55" x2="170" y2="55" />
        <line className={styles.lineDetail} x1="30" y1="58" x2="170" y2="58" />
        <line className={styles.lineDetail} x1="30" y1="61" x2="170" y2="61" />
        <line className={styles.lineDetail} x1="30" y1="64" x2="170" y2="64" />
        <line className={styles.lineDetail} x1="30" y1="67" x2="170" y2="67" />

        {/* Tape window */}
        <rect className={styles.tapeWindow} x="40" y="82" width="120" height="28" rx="4" />

        {/* Left reel */}
        <g style={{ transformOrigin: '72px 96px' }} className={reelClass}>
          <circle className={styles.reel} cx="72" cy="96" r="10" />
          <circle className={styles.reelCenter} cx="72" cy="96" r="3" />
          <line className={styles.reelSpoke} x1="72" y1="86" x2="72" y2="90" />
          <line className={styles.reelSpoke} x1="62.3" y1="91" x2="65.7" y2="93" />
          <line className={styles.reelSpoke} x1="62.3" y1="101" x2="65.7" y2="99" />
          <line className={styles.reelSpoke} x1="72" y1="106" x2="72" y2="102" />
          <line className={styles.reelSpoke} x1="81.7" y1="101" x2="78.3" y2="99" />
          <line className={styles.reelSpoke} x1="81.7" y1="91" x2="78.3" y2="93" />
        </g>

        {/* Right reel */}
        <g style={{ transformOrigin: '128px 96px' }} className={reelClass}>
          <circle className={styles.reel} cx="128" cy="96" r="10" />
          <circle className={styles.reelCenter} cx="128" cy="96" r="3" />
          <line className={styles.reelSpoke} x1="128" y1="86" x2="128" y2="90" />
          <line className={styles.reelSpoke} x1="118.3" y1="91" x2="121.7" y2="93" />
          <line className={styles.reelSpoke} x1="118.3" y1="101" x2="121.7" y2="99" />
          <line className={styles.reelSpoke} x1="128" y1="106" x2="128" y2="102" />
          <line className={styles.reelSpoke} x1="137.7" y1="101" x2="134.3" y2="99" />
          <line className={styles.reelSpoke} x1="137.7" y1="91" x2="134.3" y2="93" />
        </g>

        {/* Tape path */}
        <path className={styles.tape} d="M62 96 Q52 88 44 96 Q52 104 62 96" />
        <path className={styles.tape} d="M138 96 Q148 88 156 96 Q148 104 138 96" />
        <line className={styles.tape} x1="44" y1="96" x2="40" y2="96" />
        <line className={styles.tape} x1="156" y1="96" x2="160" y2="96" />
      </svg>
    </div>
  );
}
