#!/usr/bin/env node

const { generateCIPCAppHash } = require('../server/utils/generate-app-hash');

const args = process.argv.slice(2);
const fingerprint = args[0];

if (!fingerprint) {
  console.log('Usage: node generate-hash.js <SHA256_FINGERPRINT>');
  console.log('Example: node generate-hash.js "AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99"');
  process.exit(1);
}

try {
  const hash = generateCIPCAppHash(fingerprint);
  console.log('Generated App Hash:', hash);
  console.log('\nAdd to .env.local:');
  console.log(`ANDROID_SHA256_FINGERPRINT="${fingerprint}"`);
  console.log(`ANDROID_APP_HASH="${hash}"`);
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}