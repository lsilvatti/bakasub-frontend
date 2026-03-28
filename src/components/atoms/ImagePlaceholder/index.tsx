import React from 'react';
import clsx from 'clsx';
import styles from './ImagePlaceholder.module.css';

interface ImagePlaceholderProps {
    aspectRatio?: 'poster' | 'still' | 'square';
    className?: string;
}

export const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({
    aspectRatio = 'poster',
    className,
}) => {
    
    const GeometricPentagram = () => (
        <svg 
            viewBox="0 0 100 100" 
            className={styles.svg} 
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <circle cx="50" cy="50" r="45" />
            
            <polygon 
                points="
                    50,5 
                    60.1,36.1 
                    92.8,36.1 
                    66.3,55.3 
                    76.5,86.4 
                    50,67.2 
                    23.5,86.4 
                    33.7,55.3 
                    7.2,36.1 
                    39.9,36.1
                " 
            />
            
            <circle cx="50" cy="50" r="5" />
        </svg>
    );

    return (
        <div 
            className={clsx(
                styles.container, 
                styles[aspectRatio],
                className
            )}
            role="img"
            aria-label="Placeholder de imagem geometrico"
        >
            <GeometricPentagram />
        </div>
    );
};