import pino from "pino";
import pinoHttp from "pino-http";

// Base config
const baseConfig = {};

// Pretty output for terminal
const terminalConfig = {
  transport: { target: "pino-pretty" },
  options: {
    colorize: true,
  },
  level: "debug",
};

const config =
  process.env.PRETTY_LOGS || process.env.VITEST || process.stdout.isTTY //https://github.com/pinojs/pino-pretty#programmatic-integration
    ? { ...baseConfig, ...terminalConfig }
    : baseConfig;

const log = pino(config);

const httpLog = pinoHttp(config);

const loggingMiddleware = async (req, _res, next) => {
  req.log.info("New Request");

  next();
};

export { httpLog, loggingMiddleware };
export default log;
