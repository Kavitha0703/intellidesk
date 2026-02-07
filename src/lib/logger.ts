/**
 * Development-only logger utility.
 * 
 * This utility wraps console methods to only log in development mode,
 * preventing sensitive error details from being exposed in production.
 * 
 * In production, error objects may contain:
 * - Database table/column names
 * - Query structures and SQL fragments
 * - Internal error codes and stack traces
 * 
 * By restricting logs to development only, we prevent information
 * disclosure to users who inspect browser developer tools.
 */

const isDev = import.meta.env.DEV;

/**
 * Log error messages only in development mode.
 * Use this instead of console.error() throughout the application.
 */
export function logError(message: string, ...args: unknown[]): void {
  if (isDev) {
    console.error(message, ...args);
  }
}

/**
 * Log warning messages only in development mode.
 * Use this instead of console.warn() throughout the application.
 */
export function logWarn(message: string, ...args: unknown[]): void {
  if (isDev) {
    console.warn(message, ...args);
  }
}

/**
 * Log info messages only in development mode.
 * Use this instead of console.log() for debugging throughout the application.
 */
export function logInfo(message: string, ...args: unknown[]): void {
  if (isDev) {
    console.log(message, ...args);
  }
}

/**
 * Log debug messages only in development mode.
 * Use this instead of console.debug() throughout the application.
 */
export function logDebug(message: string, ...args: unknown[]): void {
  if (isDev) {
    console.debug(message, ...args);
  }
}
