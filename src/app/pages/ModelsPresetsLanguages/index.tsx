import { SplitPageLayout } from '@/components/templates';
import styles from './ModelsPresetsLanguages.module.css';

import ModelsColumn from './components/ModelsColumn';
import FavoritesTable from './components/FavoritesTable';
import PresetsColumn from './components/PresetsColumn';
import LanguagesColumn from './components/LanguagesColumn';

export default function ModelsPresetsLanguages() {

    return (
        <SplitPageLayout
            variant='half'
            titleKey="pages.modelsPresetsLanguages.title"
            leftContent={
                <div key="models" className={styles.modelsStack}>
                    <ModelsColumn />
                    <FavoritesTable />
                </div>
            }
            rightContent={
                <div key="models" className={styles.presetsStack}>
                    <PresetsColumn key="presets" />
                    <LanguagesColumn key="languages" />
                </div>
            }
            layoutClassName={styles.layout}
        />
    );
}