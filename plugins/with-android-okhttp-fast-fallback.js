const path = require('node:path');
const fs = require('node:fs');

const { withDangerousMod, withMainApplication } = require('expo/config-plugins');

const DNS_CLASS_NAME = 'FastFallbackDns';

// React Native 0.86 bundles OkHttp 4.9.2. Happy Eyeballs ("fast fallback") is an OkHttp 5.x
// feature - it is absent from 4.12 as well - so OkHttp tries a host's resolved addresses strictly
// in sequence and waits out the entire connect timeout on any address that silently drops SYN
// packets. iOS never stalls that way because NSURLSession implements RFC 8305 and races the
// addresses in parallel.
//
// Rather than force an OkHttp major upgrade under React Native, this resolver reaches the same
// outcome one layer earlier: it probes a multi-address host's candidates concurrently and returns
// the first address to complete a TCP handshake, so OkHttp's real connection goes straight to a
// live endpoint. Every failure path returns the plain system order, making the worst case
// identical to stock behaviour.
const dnsSource = (packageName) => `package ${packageName}

import java.net.InetAddress
import java.net.InetSocketAddress
import java.net.Socket
import java.util.concurrent.Callable
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.ExecutorCompletionService
import java.util.concurrent.Executors
import java.util.concurrent.Future
import java.util.concurrent.TimeUnit
import okhttp3.Dns

/**
 * Orders resolved addresses so that a reachable one is attempted first.
 *
 * OkHttp 4.9.2, bundled with React Native 0.86, has no Happy Eyeballs support: it walks a host's
 * addresses in sequence and burns the full connect timeout on any address that blackholes SYN
 * packets. This resolver probes the candidates in parallel and promotes the first one to complete
 * a TCP handshake.
 *
 * Safety: probing is bounded by [PROBE_DEADLINE_MS], results are cached for [CACHE_TTL_NANOS], and
 * every failure path falls back to the unmodified system order.
 */
object ${DNS_CLASS_NAME} : Dns {
  private const val PROBE_PORT = 443
  private const val PROBE_DEADLINE_MS = 1_000L
  private const val MAX_PROBED_ADDRESSES = 4
  private val CACHE_TTL_NANOS = TimeUnit.MINUTES.toNanos(5)

  private class Ordering(val addresses: List<InetAddress>, val createdAtNanos: Long)

  private val cache = ConcurrentHashMap<String, Ordering>()

  private val probeExecutor =
      Executors.newCachedThreadPool { runnable ->
        Thread(runnable, "fast-fallback-dns").apply { isDaemon = true }
      }

  override fun lookup(hostname: String): List<InetAddress> {
    val resolved = Dns.SYSTEM.lookup(hostname)
    // A single address leaves nothing to choose between, so stay out of the way entirely.
    if (resolved.size < 2) return resolved

    cachedOrdering(hostname, resolved)?.let { return it }

    val ordered =
        try {
          probe(resolved)
        } catch (throwable: Throwable) {
          resolved
        }

    cache[hostname] = Ordering(ordered, System.nanoTime())
    return ordered
  }

  private fun cachedOrdering(hostname: String, resolved: List<InetAddress>): List<InetAddress>? {
    val ordering = cache[hostname] ?: return null

    if (System.nanoTime() - ordering.createdAtNanos >= CACHE_TTL_NANOS) {
      cache.remove(hostname)
      return null
    }

    // DNS may have returned a different set since the probe; keep only what is still valid and
    // append anything new so no address is silently dropped.
    val preferred = ordering.addresses.filter { resolved.contains(it) }
    if (preferred.isEmpty()) return null

    return preferred + resolved.filterNot { preferred.contains(it) }
  }

  private fun probe(resolved: List<InetAddress>): List<InetAddress> {
    val candidates = resolved.take(MAX_PROBED_ADDRESSES)
    val completionService = ExecutorCompletionService<InetAddress?>(probeExecutor)
    val futures = mutableListOf<Future<InetAddress?>>()
    val deadline = System.nanoTime() + TimeUnit.MILLISECONDS.toNanos(PROBE_DEADLINE_MS)

    try {
      candidates.forEach { address ->
        futures += completionService.submit(Callable { if (isReachable(address)) address else null })
      }

      repeat(candidates.size) {
        val remainingNanos = deadline - System.nanoTime()
        if (remainingNanos <= 0) return resolved

        val finished =
            completionService.poll(remainingNanos, TimeUnit.NANOSECONDS) ?: return resolved
        val winner =
            try {
              finished.get()
            } catch (throwable: Throwable) {
              null
            }

        if (winner != null) return listOf(winner) + resolved.filterNot { it == winner }
      }

      return resolved
    } finally {
      futures.forEach { it.cancel(true) }
    }
  }

  private fun isReachable(address: InetAddress): Boolean =
      try {
        Socket().use { socket ->
          socket.connect(InetSocketAddress(address, PROBE_PORT), PROBE_DEADLINE_MS.toInt())
        }
        true
      } catch (throwable: Throwable) {
        false
      }
}
`;

const IMPORTS = [
  'import com.facebook.react.modules.network.OkHttpClientProvider',
  'import java.util.concurrent.TimeUnit',
];

// The connect timeout stays as a backstop for the case where every probe fails and OkHttp still
// has to walk the addresses itself. Read and write timeouts remain at React Native's 0 so
// Socket.IO long-polling and large uploads are untouched - only the TCP connect phase is bounded.
const FACTORY_SNIPPET = `    OkHttpClientProvider.setOkHttpClientFactory {
      OkHttpClientProvider.createClientBuilder(this@MainApplication)
          .dns(${DNS_CLASS_NAME})
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

const withDnsSourceFile = (config) =>
  withDangerousMod(config, [
    'android',
    (modConfig) => {
      const packageName = modConfig.android?.package;
      if (!packageName) {
        throw new Error('with-android-okhttp-fast-fallback requires android.package to be set.');
      }

      const packageDir = path.join(
        modConfig.modRequest.platformProjectRoot,
        'app',
        'src',
        'main',
        'java',
        ...packageName.split('.'),
      );

      fs.mkdirSync(packageDir, { recursive: true });
      fs.writeFileSync(
        path.join(packageDir, `${DNS_CLASS_NAME}.kt`),
        dnsSource(packageName),
        'utf8',
      );

      return modConfig;
    },
  ]);

const withOkHttpFactory = (config) =>
  withMainApplication(config, (modConfig) => {
    const { modResults } = modConfig;

    if (modResults.language !== 'kt') {
      throw new Error(
        `with-android-okhttp-fast-fallback expects a Kotlin MainApplication, found "${modResults.language}".`,
      );
    }

    if (modResults.contents.includes('setOkHttpClientFactory')) {
      return modConfig;
    }

    if (!modResults.contents.includes(ANCHOR)) {
      throw new Error(
        `with-android-okhttp-fast-fallback could not find "${ANCHOR}" in MainApplication.kt.`,
      );
    }

    let contents = addImports(modResults.contents);
    contents = contents.replace(ANCHOR, `${FACTORY_SNIPPET.trimStart()}    ${ANCHOR}`);

    return { ...modConfig, modResults: { ...modResults, contents } };
  });

const withAndroidOkHttpFastFallback = (config) => withOkHttpFactory(withDnsSourceFile(config));

module.exports = withAndroidOkHttpFastFallback;
