import { View } from 'react-native';

import type { AuthUser } from '@/screens/auth/types';
import { getInterestLabel, InterestIcon } from '@/shared/components/ui/interest-icon';
import { ThemedText } from '@/shared/components/ui/themed-text';

import { useProfileStyles } from '../styles/profile-styles';
import { LanguageFlag } from './language-flag';
import { useTranslation } from 'react-i18next';
import { getLanguageLabel } from '@/screens/onboarding/data';
import { getLevelLabel } from '@/shared/constants/language-levels';

export function ProfileLanguages({ user }: { user: AuthUser }) {
  const styles = useProfileStyles();
  const { t } = useTranslation('profile');
  return (
    <View style={[styles.sectionCard, styles.elevatedSectionCard]}>
      <ThemedText type="bold" style={styles.sectionTitle}>
        {t('sections.languages')}
      </ThemedText>
      <View style={styles.languageRow}>
        <LanguageFlag language={user.nativeLanguage} />
        <View style={styles.languageCopy}>
          <ThemedText themeColor="textSecondary" style={styles.eyebrow}>
            {t('sections.nativeLanguage')}
          </ThemedText>
          <ThemedText type="bold" style={styles.languageName}>
            {getLanguageLabel(user.nativeLanguage) || t('sections.notAdded')}
          </ThemedText>
        </View>
      </View>
      <View style={styles.divider} />
      <View style={styles.languageRow}>
        <LanguageFlag language={user?.learningLanguage} />
        <View style={styles.languageCopy}>
          <ThemedText themeColor="textSecondary" style={styles.eyebrow}>
            {t('sections.learning')}
          </ThemedText>
          <ThemedText type="bold" style={styles.languageName}>
            {getLanguageLabel(user.learningLanguage) || t('sections.notAdded')}
          </ThemedText>
        </View>
        {user.proficiencyLevel ? (
          <View style={styles.levelPill}>
            <ThemedText style={styles.levelText}>{getLevelLabel(user.proficiencyLevel)}</ThemedText>
          </View>
        ) : null}
      </View>
    </View>
  );
}

export function ProfileDetails({ user }: { user: AuthUser }) {
  const styles = useProfileStyles();
  const { t } = useTranslation('profile');
  return (
    <>
      {user.interests?.length ? (
        <View style={[styles.sectionCard, styles.elevatedSectionCard]}>
          <ThemedText type="bold" style={styles.sectionTitle}>
            {t('sections.interests')}
          </ThemedText>
          <View style={styles.interests}>
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
        </View>
      ) : null}
      {user.bio ? (
        <View style={[styles.sectionCard, styles.elevatedSectionCard]}>
          <ThemedText type="bold" style={styles.sectionTitle}>
            {t('sections.aboutMe')}
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.bio}>
            {user.bio}
          </ThemedText>
        </View>
      ) : null}
    </>
  );
}
