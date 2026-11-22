import { useTranslation } from 'react-i18next';

import { type ThemePreference, useAppTheme } from '@/providers/theme-provider';
import { ICON_ROW_INSET, ListRow, ListSection } from '@/shared/components/ui/grouped-list';
import { SymbolView, type SymbolViewProps } from '@/shared/components/ui/symbol-view';

import { useProfileStyles } from '../styles/profile-styles';

const OPTIONS: {
  value: ThemePreference;
  labelKey: 'theme.system' | 'theme.light' | 'theme.dark';
  icon: SymbolViewProps['name'];
}[] = [
  {
    value: 'system',
    labelKey: 'theme.system',
    icon: { ios: 'circle.lefthalf.filled', android: 'contrast', web: 'contrast' },
  },
  {
    value: 'light',
    labelKey: 'theme.light',
    icon: { ios: 'sun.max', android: 'light_mode', web: 'light_mode' },
  },
  {
    value: 'dark',
    labelKey: 'theme.dark',
    icon: { ios: 'moon', android: 'dark_mode', web: 'dark_mode' },
  },
];

/** System / Light / Dark as a single-choice list with a checkmark, like the system settings. */
export function ProfileAppearance() {
  const styles = useProfileStyles();
  const { preference, setPreference } = useAppTheme();
  const { t } = useTranslation('profile');

  return (
    <ListSection footer={t('theme.description')} inset={ICON_ROW_INSET}>
      {OPTIONS.map((option) => {
        const selected = preference === option.value;
        const label = t(option.labelKey);
        return (
          <ListRow
            key={option.value}
            accessibilityLabel={t('theme.optionLabel', { option: label })}
            icon={option.icon}
            onPress={() => setPreference(option.value)}
            showChevron={false}
            title={label}
            trailing={
              selected ? (
                <SymbolView
                  name={{ ios: 'checkmark', android: 'check', web: 'check' }}
                  size={17}
                  weight="semibold"
                  tintColor={styles.check.color}
                />
              ) : undefined
            }
          />
        );
      })}
    </ListSection>
  );
}
