import { SplitPageLayout } from '@/components/templates/SplitPageLayout';
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
        <SplitPageLayout
            titleKey='pages.modelsPresetsLanguages.title'
            leftContent={renderLeft()}
            rightContent={renderRight()}
        />
    )
}