import type { ConfigContext, ExpoConfig } from 'expo/config';

const iosClientSuffix = '.apps.googleusercontent.com';

function getIosUrlScheme(iosClientId: string | undefined) {
  if (!iosClientId?.endsWith(iosClientSuffix)) return null;

  return `com.googleusercontent.apps.${iosClientId.slice(0, -iosClientSuffix.length)}`;
}

export default ({ config }: ConfigContext): ExpoConfig => {
  const iosUrlScheme = getIosUrlScheme(process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID);
  const plugins = [...(config.plugins ?? [])];

  if (iosUrlScheme) {
    plugins.push(['react-native-nitro-google-signin', { iosUrlScheme }]);
  }

  return {
    ...config,
    name: config.name ?? 'LangEx',
    slug: config.slug ?? 'langEx',
    plugins,
  };
};
