const crypto = require('crypto');

/**
 * Generate 11-character app signature hash for WhatsApp zero-tap autofill
 * @param {string} packageName - Android package name (e.g., com.cipcagent.app)
 * @param {string} sha256Fingerprint - SHA-256 fingerprint from keystore (with colons)
 * @returns {string} 11-character base64 hash
 */
function generateAppHash(packageName, sha256Fingerprint) {
  // Remove colons and convert to lowercase
  const sha256Hex = sha256Fingerprint.replace(/:/g, '').toLowerCase();
  
  // Format: package_name + " " + sha256 (hex, no colons)
  const data = `${packageName} ${sha256Hex}`;
  
  // Generate SHA-256 hash
  const sha256Hash = crypto.createHash('sha256').update(data, 'utf8').digest();
  
  // Convert to base64 and take first 11 characters
  const base64Hash = sha256Hash.toString('base64').substring(0, 11);
  
  return base64Hash;
}

// CIPC Agent configuration
const CIPC_APP_CONFIG = {
  packageName: 'com.cipcagent.app',
  sha256Fingerprint: '' // To be filled with actual keystore fingerprint
};

// Generate hash for production use
function generateCIPCAppHash(sha256Fingerprint) {
  return generateAppHash(CIPC_APP_CONFIG.packageName, sha256Fingerprint);
}

// Example usage
if (require.main === module) {
  // Example with sample fingerprint
  const sampleFingerprint = "AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99";
  console.log('Sample App Hash:', generateCIPCAppHash(sampleFingerprint));
  console.log('\nTo get your actual fingerprint, run:');
  console.log('keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android');
}

module.exports = {
  generateAppHash,
  generateCIPCAppHash,
  CIPC_APP_CONFIG
};