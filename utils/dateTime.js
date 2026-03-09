// Utility functions for handling datetime properly

/**
 * Convert datetime-local input value to ISO string for storage
 * @param {string} localDateTimeString - Value from datetime-local input (YYYY-MM-DDTHH:mm)
 * @returns {string} ISO string
 */
export function localDateTimeToISO(localDateTimeString) {
  if (!localDateTimeString) return '';
  // Create date object from local datetime string
  // This preserves the user's intended time
  const date = new Date(localDateTimeString);
  return date.toISOString();
}

/**
 * Convert ISO string to datetime-local input format
 * @param {string} isoString - ISO date string from database
 * @returns {string} Format for datetime-local input (YYYY-MM-DDTHH:mm)
 */
export function isoToLocalDateTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  // Format: YYYY-MM-DDTHH:mm (required for datetime-local input)
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Get current datetime in format for datetime-local input
 * @returns {string} Current datetime in YYYY-MM-DDTHH:mm format
 */
export function getCurrentLocalDateTime() {
  return isoToLocalDateTime(new Date().toISOString());
}
