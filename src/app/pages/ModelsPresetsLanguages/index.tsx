import { ThreeColumnLayout } from '@/components/templates';
import styles from './ModelsPresetsLanguages.module.css';

import ModelsColumn from './components/ModelsColumn';

export default function ModelsPresetsLanguages() {

    return (
        <ThreeColumnLayout
            titleKey="pages.modelsPresetsLanguages.title"
            columns={[
                <ModelsColumn key="models" />,
                null,
                null
            ]}
            layoutClassName={styles.layout}
        />
    );
}