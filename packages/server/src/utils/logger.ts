const getTimestamp = () => new Date().toISOString();

export const logger = {
  info: (message: string, ...args: unknown[]) => {
    console.log(`[${getTimestamp()}] INFO: ${message}`, ...args);
  },

  error: (message: string, ...args: unknown[]) => {
    console.error(`[${getTimestamp()}] ERROR: ${message}`, ...args);
  },

  warn: (message: string, ...args: unknown[]) => {
    console.warn(`[${getTimestamp()}] WARN: ${message}`, ...args);
  },

  debug: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[${getTimestamp()}] DEBUG: ${message}`, ...args);
    }
  },
};
