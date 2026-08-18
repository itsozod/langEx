import { View } from 'react-native';

import type { AuthUser } from '@/screens/auth/types';
import { ThemedText } from '@/shared/components/ui/themed-text';

import { useProfileStyles } from '../styles/profile-styles';
import { LanguageFlag } from './language-flag';

export function ProfileLanguages({ user }: { user: AuthUser }) {
  const styles = useProfileStyles();
  return (
    <View style={styles.sectionCard}>
      <ThemedText type="bold" style={styles.sectionTitle}>
        Languages
      </ThemedText>
      <View style={styles.languageRow}>
        <LanguageFlag language={user.nativeLanguage} />
        <View style={styles.languageCopy}>
          <ThemedText themeColor="textSecondary" style={styles.eyebrow}>
            Native language
          </ThemedText>
          <ThemedText type="bold" style={styles.languageName}>
            {user.nativeLanguage || 'Not added'}
          </ThemedText>
        </View>
      </View>
      <View style={styles.divider} />
      <View style={styles.languageRow}>
        <LanguageFlag language={user?.learningLanguage} />
        <View style={styles.languageCopy}>
          <ThemedText themeColor="textSecondary" style={styles.eyebrow}>
            Learning
          </ThemedText>
          <ThemedText type="bold" style={styles.languageName}>
            {user.learningLanguage || 'Not added'}
          </ThemedText>
        </View>
        {user.proficiencyLevel ? (
          <View style={styles.levelPill}>
            <ThemedText style={styles.levelText}>
              {user.proficiencyLevel[0].toUpperCase() + user.proficiencyLevel.slice(1)}
            </ThemedText>
          </View>
        ) : null}
      </View>
    </View>
  );
}

export function ProfileDetails({ user }: { user: AuthUser }) {
  const styles = useProfileStyles();
  return (
    <>
      {user.interests?.length ? (
        <View style={styles.sectionCard}>
          <ThemedText type="bold" style={styles.sectionTitle}>
            Interests
          </ThemedText>
          <View style={styles.interests}>
            {user.interests.map((interest) => (
              <View key={interest} style={styles.interestPill}>
                <ThemedText style={styles.interestText}>{interest}</ThemedText>
              </View>
            ))}
          </View>
        </View>
      ) : null}
      {user.bio ? (
        <View style={styles.sectionCard}>
          <ThemedText type="bold" style={styles.sectionTitle}>
            About me
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.bio}>
            {user.bio}
          </ThemedText>
        </View>
      ) : null}
    </>
  );
}
