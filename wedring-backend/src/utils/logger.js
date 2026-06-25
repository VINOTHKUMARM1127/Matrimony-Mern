/**
 * Wedring Backend — Structured Logger
 */
const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const CURRENT_LEVEL = LOG_LEVELS[process.env.LOG_LEVEL || 'info'] ?? LOG_LEVELS.info;

function timestamp() {
  return new Date().toISOString();
}

function formatMsg(level, ...args) {
  const msg = args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
  return `[${timestamp()}] [${level.toUpperCase()}] ${msg}`;
}

const logger = {
  debug: (...args) => { if (CURRENT_LEVEL <= LOG_LEVELS.debug) console.debug(formatMsg('debug', ...args)); },
  info:  (...args) => { if (CURRENT_LEVEL <= LOG_LEVELS.info)  console.log(formatMsg('info', ...args)); },
  warn:  (...args) => { if (CURRENT_LEVEL <= LOG_LEVELS.warn)  console.warn(formatMsg('warn', ...args)); },
  error: (...args) => { if (CURRENT_LEVEL <= LOG_LEVELS.error) console.error(formatMsg('error', ...args)); },
};

export default logger;
