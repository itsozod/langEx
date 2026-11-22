import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import type { AuthUser } from '@/screens/auth/types';
import { getLanguageLabel } from '@/screens/onboarding/data';
import { ListRow, ListSection } from '@/shared/components/ui/grouped-list';
import { getInterestLabel, InterestIcon } from '@/shared/components/ui/interest-icon';
import { ThemedText } from '@/shared/components/ui/themed-text';
import { getLevelLabel } from '@/shared/constants/language-levels';

import { useProfileStyles } from '../styles/profile-styles';
import { LanguageFlag } from './language-flag';

/** Separator inset for rows that start with a 30pt flag (16 padding + flag + 12 gap). */
const FLAG_ROW_INSET = 58;

type LanguageUser = Pick<AuthUser, 'nativeLanguage' | 'learningLanguage' | 'proficiencyLevel'>;

export function ProfileLanguages({ user }: { user: LanguageUser }) {
  const styles = useProfileStyles();
  const { t } = useTranslation('profile');

  return (
    <ListSection title={t('sections.languages')} inset={FLAG_ROW_INSET}>
      <ListRow
        leading={<LanguageFlag language={user.nativeLanguage} />}
        subtitle={t('sections.nativeLanguage')}
        title={getLanguageLabel(user.nativeLanguage) || t('sections.notAdded')}
      />
      <ListRow
        leading={<LanguageFlag language={user.learningLanguage} />}
        subtitle={t('sections.learning')}
        title={getLanguageLabel(user.learningLanguage) || t('sections.notAdded')}
        trailing={
          user.proficiencyLevel ? (
            <ThemedText style={styles.levelText}>{getLevelLabel(user.proficiencyLevel)}</ThemedText>
          ) : undefined
        }
      />
    </ListSection>
  );
}

export function ProfileDetails({ user }: { user: AuthUser }) {
  const styles = useProfileStyles();
  const { t } = useTranslation('profile');

  return (
    <>
      {user.interests?.length ? (
        <ListSection title={t('sections.interests')}>
          <View style={[styles.sectionBody, styles.interests]}>
            {user.interests.map((interest) => (
              <View key={interest} style={styles.interestPill}>
                <InterestIcon
                  color={styles.interestIconColor.color}
                  interest={interest}
                  size={14}
                />
                <ThemedText style={styles.interestText}>{getInterestLabel(interest)}</ThemedText>
              </View>
            ))}
          </View>
        </ListSection>
      ) : null}
      {user.bio ? (
        <ListSection title={t('sections.aboutMe')}>
          <View style={styles.sectionBody}>
            <ThemedText style={styles.bio}>{user.bio}</ThemedText>
          </View>
        </ListSection>
      ) : null}
    </>
  );
}
