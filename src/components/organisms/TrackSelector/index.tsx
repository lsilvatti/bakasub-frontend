import React from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, Badge } from '@/components/atoms';
import { Table } from '@/components/atoms';
import type { SubtitleTrack } from '@/types/api';
import styles from './TrackSelector.module.css';

export interface TrackSelectorProps {
    tracks: SubtitleTrack[];
    selectedTrackIndex: number | null;
    onSelectTrack: (track: SubtitleTrack) => void;
}

export const TrackSelector: React.FC<TrackSelectorProps> = ({
    tracks,
    selectedTrackIndex,
    onSelectTrack,
}) => {
    const { t } = useTranslation();

    if (!tracks || tracks.length === 0) {
        return (
            <div className={styles.container}>
                <Typography variant="muted">
                    {t('components.trackSelector.noTracksFound')}
                </Typography>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <Table density="compact">
                <Table.Header>
                    <Table.Column>ID</Table.Column>
                    <Table.Column>{t('components.trackSelector.language', 'Idioma')}</Table.Column>
                    <Table.Column>Codec</Table.Column>
                    <Table.Column>{t('components.trackSelector.trackTitle', 'Título Original')}</Table.Column>
                </Table.Header>

                <Table.Body>
                    {tracks.map((track) => {
                        const isSelected = selectedTrackIndex === track.id;

                        return (
                            <Table.Row
                                key={track.id}
                                className={`${styles.row} ${isSelected ? styles.selected : ''}`}
                                onClick={() => onSelectTrack(track)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && onSelectTrack(track)}
                            >
                                <Table.Cell>
                                    <span className={styles.index}>#{track.id}</span>
                                </Table.Cell>

                                <Table.Cell>
                                    <span className={styles.language}>{track.language || 'Unknown'}</span>
                                </Table.Cell>

                                <Table.Cell>
                                    <Badge variant="primary" className={styles.codec}>
                                        {track.codec || 'unknown'}
                                    </Badge>
                                </Table.Cell>

                                <Table.Cell>
                                    <span className={styles.title} title={track.name || ''}>
                                        {track.name || '-'}
                                    </span>
                                </Table.Cell>
                            </Table.Row>
                        );
                    })}
                </Table.Body>
            </Table>
        </div>
    );
};