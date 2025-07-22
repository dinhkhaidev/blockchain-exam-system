/* global BigInt */
// Utility functions for handling BigInt values safely

/**
 * Convert BigInt to Number safely
 * @param {BigInt|number|string} value - The value to convert
 * @returns {number} - The converted number
 */
export const bigIntToNumber = (value) => {
  if (value === null || value === undefined) {
    return 0;
  }
  if (typeof value === 'bigint') {
    return Number(value);
  }
  if (typeof value === 'string') {
    try {
      return Number(BigInt(value));
    } catch {
      return Number(value);
    }
  }
  return Number(value);
};

/**
 * Convert timestamp from blockchain to Date object
 * @param {BigInt|number|string} timestamp - The timestamp from blockchain
 * @returns {Date} - The Date object
 */
export const blockchainTimestampToDate = (timestamp) => {
  const timestampNumber = bigIntToNumber(timestamp);
  return new Date(timestampNumber * 1000);
};

/**
 * Format blockchain timestamp to locale string
 * @param {BigInt|number|string} timestamp - The timestamp from blockchain
 * @param {string} locale - The locale (default: 'vi-VN')
 * @returns {string} - The formatted date string
 */
export const formatBlockchainTimestamp = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleString('vi-VN');
};

/**
 * Safe number conversion for display
 * @param {any} value - The value to convert
 * @returns {string} - The safe string representation
 */
export const safeNumberDisplay = (value) => {
  if (value === null || value === undefined) {
    return '0';
  }
  
  if (typeof value === 'bigint') {
    return value.toString();
  }
  
  if (typeof value === 'number') {
    return value.toString();
  }
  
  if (typeof value === 'string') {
    return value;
  }
  
  return String(value);
}; 