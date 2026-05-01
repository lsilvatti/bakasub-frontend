import { useEffect } from 'react';
import { PageTitle } from "@/components/atoms";
import { VIDEO_TOOLS_INSTRUCTIONS_PATH, useToast, useVideoToolRequirements } from '@/hooks';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function formatMissingTools(tools: string[]) {
    return tools.map((tool) => tool === 'ffmpeg' ? 'FFmpeg' : tool).join(', ');
}

export default function Merge () {
    const navigate = useNavigate();
    const toast = useToast();
    const { t } = useTranslation();
    const { hasRequiredToolsForFeature, getMissingToolsForFeature, isLoading } = useVideoToolRequirements();
    const mergeLocked = !isLoading && !hasRequiredToolsForFeature('merge');
    const missingToolsLabel = formatMissingTools(getMissingToolsForFeature('merge'));

    useEffect(() => {
        if (!mergeLocked) {
            return;
        }

        toast.warning(
            t('pages.merge.videoToolsRequiredToast', { tools: missingToolsLabel }),
            t('pages.settings.videoTools.title')
        );
        navigate(VIDEO_TOOLS_INSTRUCTIONS_PATH, { replace: true });
    }, [mergeLocked, missingToolsLabel, navigate, t, toast]);

    return (
        <>
            <PageTitle titleKey={"pages.merge.title"} />
        </>
    )
}