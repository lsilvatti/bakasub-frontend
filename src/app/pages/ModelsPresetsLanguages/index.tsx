import { ThreeColumnLayout } from '@/components/templates';
import styles from './ModelsPresetsLanguages.module.css';
import { Card } from '@/components/atoms/Card';
import { clsx } from 'clsx';

export default function ModelsPresetsLanguages () { 

    const openRouterModels = () => {
        return (
            <Card variant="primary" className={clsx(styles.left, styles.fullHeightCard)}>
                <h2>Modelos</h2>
            </Card>
        )
    }

    const translationPresets = () => {
        return (
            <Card variant="secondary" className={clsx(styles.center, styles.fullHeightCard)}>
                <h2>Presets de Tradução</h2>
            </Card>
        )
    }

    const languages = () => {
        return (
            <Card variant="primary" className={clsx(styles.right, styles.fullHeightCard)}>
                <h2>Idiomas disponíveis</h2>
            </Card>
        )
    }

    return (
        <ThreeColumnLayout
            titleKey='pages.modelsPresetsLanguages.title'
            columns={[openRouterModels(), translationPresets(), languages()]}
            layoutClassName={styles.layout}
        />
    )
}