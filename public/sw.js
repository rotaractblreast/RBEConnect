/**
 * RBE Connect — Unified Service Worker (Fallback Alias)
 * Scope: /
 */
try {
  importScripts("/OneSignalSDKWorker.js");
} catch (e) {
  // Silent fallback
}
