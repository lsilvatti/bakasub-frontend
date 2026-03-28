import { ThreeColumnLayout } from '@/components/templates';
import styles from './ModelsPresetsLanguages.module.css';

export default function ModelsPresetsLanguages () { 

    const renderLeft = () => {
        return (
            <div className={styles.left}>
                <h2>Modelos</h2>
            </div>
        )
    }

    const renderRight = () => {
        return (
            <div className={styles.right}>
                <h2>Detalhes</h2>
            </div>
        )
    }

    return (
        <ThreeColumnLayout
            titleKey='pages.modelsPresetsLanguages.title'
            columns={[renderLeft(), null, renderRight()]}
        />
    )
}