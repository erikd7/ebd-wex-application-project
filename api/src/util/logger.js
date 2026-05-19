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
};

const config = process.stdout.isTTY //https://github.com/pinojs/pino-pretty#programmatic-integration
  ? { ...baseConfig, ...terminalConfig }
  : baseConfig;

const log = pino(config);

const httpLog = pinoHttp(config);

export { httpLog };
export default log;
