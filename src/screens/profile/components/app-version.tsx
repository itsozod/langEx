import * as Application from 'expo-application';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/shared/components/ui/themed-text';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
const configuredVersion = Constants.expoConfig?.version ?? 'development';
const applicationVersion =
  !isExpoGo && Application.nativeApplicationVersion
    ? Application.nativeApplicationVersion
    : configuredVersion;
const buildVersion = !isExpoGo ? Application.nativeBuildVersion : null;

export function AppVersion() {
  return (
    <ThemedText
      accessibilityLabel={`LangEx version ${applicationVersion}${buildVersion ? `, build ${buildVersion}` : ''}`}
      themeColor="textSecondary"
      style={styles.text}>
      Version {applicationVersion}
      {buildVersion ? ` (${buildVersion})` : ''}
    </ThemedText>
  );
}

const styles = StyleSheet.create({
  text: {
    paddingTop: 4,
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
  },
});
