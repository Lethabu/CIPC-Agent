import crypto from 'crypto';

export interface AppHashConfig {
  packageName: string;
  sha256Fingerprint: string;
}

export class AndroidHashGenerator {
  /**
   * Generate 11-character app signature hash for WhatsApp zero-tap autofill
   * @param packageName - Android package name (e.g., com.cipcagent.app)
   * @param sha256Fingerprint - SHA-256 fingerprint from keystore (with colons)
   * @returns 11-character base64 hash
   */
  static generateAppHash(packageName: string, sha256Fingerprint: string): string {
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

  /**
   * Validate package name format
   */
  static validatePackageName(packageName: string): boolean {
    const packageRegex = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/;
    return packageRegex.test(packageName);
  }

  /**
   * Validate SHA-256 fingerprint format
   */
  static validateSHA256Fingerprint(fingerprint: string): boolean {
    const sha256Regex = /^([A-Fa-f0-9]{2}:){31}[A-Fa-f0-9]{2}$/;
    return sha256Regex.test(fingerprint);
  }
}

// Example usage for CIPC Agent
export const CIPC_APP_CONFIG: AppHashConfig = {
  packageName: 'com.cipcagent.app',
  sha256Fingerprint: '' // To be filled with actual keystore fingerprint
};

// Generate hash for production use
export function generateCIPCAppHash(sha256Fingerprint: string): string {
  if (!AndroidHashGenerator.validateSHA256Fingerprint(sha256Fingerprint)) {
    throw new Error('Invalid SHA-256 fingerprint format');
  }
  
  return AndroidHashGenerator.generateAppHash(CIPC_APP_CONFIG.packageName, sha256Fingerprint);
}