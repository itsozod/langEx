const { withMainApplication } = require('expo/config-plugins');

const IMPORTS = [
  'import com.facebook.react.modules.network.OkHttpClientProvider',
  'import java.util.concurrent.TimeUnit',
];

// React Native 0.86 bundles OkHttp 4.9.2 and builds its client with connectTimeout(0) - infinite.
// OkHttp gained Happy Eyeballs ("fast fallback") only in 4.12, so it tries a host's resolved
// addresses strictly in sequence. When a host resolves to several A records and one of them
// blackholes SYN packets, Android waits on that dead address forever, while iOS recovers in
// milliseconds because NSURLSession implements RFC 8305 and races the addresses.
//
// A finite connect timeout is what makes retryOnConnectionFailure move to the next address. Read
// and write timeouts stay at React Native's 0 so Socket.IO long-polling and large uploads are
// unaffected - only the TCP connect phase is bounded.
const FACTORY_SNIPPET = `    OkHttpClientProvider.setOkHttpClientFactory {
      OkHttpClientProvider.createClientBuilder(this@MainApplication)
          .connectTimeout(8, TimeUnit.SECONDS)
          .retryOnConnectionFailure(true)
          .build()
    }
`;

const ANCHOR = 'loadReactNative(this)';

function addImports(contents) {
  return IMPORTS.reduce((source, statement) => {
    if (source.includes(statement)) return source;
    return source.replace(/^(package .*\n)/m, (match) => `${match}\n${statement}\n`);
  }, contents);
}

const withAndroidOkHttpConnectTimeout = (config) =>
  withMainApplication(config, (modConfig) => {
    const { modResults } = modConfig;

    if (modResults.language !== 'kt') {
      throw new Error(
        `with-android-okhttp-connect-timeout expects a Kotlin MainApplication, found "${modResults.language}".`,
      );
    }

    if (modResults.contents.includes('setOkHttpClientFactory')) {
      return modConfig;
    }

    if (!modResults.contents.includes(ANCHOR)) {
      throw new Error(
        `with-android-okhttp-connect-timeout could not find "${ANCHOR}" in MainApplication.kt.`,
      );
    }

    let contents = addImports(modResults.contents);
    contents = contents.replace(ANCHOR, `${FACTORY_SNIPPET.trimStart()}    ${ANCHOR}`);

    return { ...modConfig, modResults: { ...modResults, contents } };
  });

module.exports = withAndroidOkHttpConnectTimeout;
