import { useHealthStatus } from './api/useHealthStatus';

export type RequiredVideoTool = 'ffmpeg' | 'mkvmerge' | 'mkvextract';
export type VideoFeature = 'extract' | 'merge';

export const VIDEO_TOOLS_INSTRUCTIONS_PATH = '/config?section=video-tools';

export function useVideoToolRequirements() {
  const { healthStatus, isLoading, isError } = useHealthStatus();

  const availability = {
    ffmpeg: Boolean(healthStatus?.videoTools.ffmpeg.available),
    mkvmerge: Boolean(healthStatus?.videoTools.mkvmerge.available),
    mkvextract: Boolean(healthStatus?.videoTools.mkvextract.available),
  } satisfies Record<RequiredVideoTool, boolean>;

  const getMissingTools = (requiredVideoTools: RequiredVideoTool[] = []) => (
    requiredVideoTools.filter((tool) => !availability[tool])
  );

  const getMissingToolsForFeature = (feature?: VideoFeature) => {
    if (!feature || !healthStatus) {
      return [] as RequiredVideoTool[];
    }

    switch (feature) {
      case 'merge':
        return getMissingTools(['mkvmerge']);
      case 'extract': {
        const missingTools: RequiredVideoTool[] = [];
        if (!availability.mkvmerge) {
          missingTools.push('mkvmerge');
        }
        if (!availability.ffmpeg && !availability.mkvextract) {
          missingTools.push('ffmpeg', 'mkvextract');
        }
        return [...new Set(missingTools)];
      }
      default:
        return [] as RequiredVideoTool[];
    }
  };

  const hasRequiredToolsForFeature = (feature?: VideoFeature) => {
    if (!feature || !healthStatus) {
      return true;
    }

    return getMissingToolsForFeature(feature).length === 0;
  };

  const getMissingToolsForExtractFile = (filePath: string | null) => {
    if (!healthStatus) {
      return [] as RequiredVideoTool[];
    }

    const missingTools: RequiredVideoTool[] = [];
    if (!availability.mkvmerge) {
      missingTools.push('mkvmerge');
    }

    if (!filePath) {
      return missingTools;
    }

    const normalizedPath = filePath.toLowerCase();
    if (normalizedPath.endsWith('.mkv')) {
      if (!availability.mkvextract) {
        missingTools.push('mkvextract');
      }
    } else if (!availability.ffmpeg) {
      missingTools.push('ffmpeg');
    }

    return [...new Set(missingTools)];
  };

  const hasRequiredToolsForExtractFile = (filePath: string | null) => {
    if (!healthStatus) {
      return true;
    }

    return getMissingToolsForExtractFile(filePath).length === 0;
  };

  return {
    isLoading,
    isError,
    healthStatus,
    hasRequiredToolsForFeature,
    hasRequiredToolsForExtractFile,
    getMissingTools,
    getMissingToolsForFeature,
    getMissingToolsForExtractFile,
  };
}