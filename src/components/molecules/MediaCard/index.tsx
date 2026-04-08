import { Typography } from '@/components/atoms';
import { ImagePlaceholder } from '@/components/atoms/ImagePlaceholder';
import styles from './MediaCard.module.css';

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

export interface MediaCardProps {
    title: string;
    meta: string;
    overview: string;
    posterPath?: string | null;
    backdropPath?: string | null;
    stillPath?: string | null;
    posterAlt?: string;
    stillAlt?: string;
    variant?: 'poster' | 'still';
}

export function MediaCard({
    title,
    meta,
    overview,
    posterPath,
    backdropPath,
    stillPath,
    posterAlt = '',
    stillAlt = '',
    variant = 'poster',
}: MediaCardProps) {
    const isPoster = variant === 'poster';
    const titleVariant = isPoster ? 'h2' : 'h3';
    const titleAs = isPoster ? 'h1' : 'h2';

    return (
        <div className={styles.mediaCard}>
            {isPoster && backdropPath && (
                <div
                    className={styles.mediaBackdrop}
                    style={{ backgroundImage: `url(${TMDB_IMAGE_BASE_URL}w500${backdropPath})` }}
                />
            )}
            <div className={styles.visuals}>
                {isPoster ? (
                    posterPath ? (
                        <img src={`${TMDB_IMAGE_BASE_URL}w500${posterPath}`} className={styles.posterImage} alt={posterAlt} />
                    ) : (
                        <ImagePlaceholder aspectRatio="poster" className={styles.posterImage} />
                    )
                ) : (
                    stillPath ? (
                        <img src={`${TMDB_IMAGE_BASE_URL}w300${stillPath}`} className={styles.stillImage} alt={stillAlt} />
                    ) : (
                        <ImagePlaceholder aspectRatio="still" className={styles.stillImage} />
                    )
                )}
            </div>
            <div className={styles.mediaInfo}>
                <Typography variant={titleVariant} as={titleAs} className={styles.mediaTitle}>
                    {title}
                </Typography>
                <Typography variant="muted" className={styles.mediaMeta}>
                    {meta}
                </Typography>
                <Typography variant="body" className={styles.mediaOverview}>
                    {overview}
                </Typography>
            </div>
        </div>
    );
}
