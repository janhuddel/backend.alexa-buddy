const { format } = require("date-fns");
const pino = require("pino");

module.exports = pino({
  level: "info",
  timestamp: () => `,"time":"${format(new Date(), "yyyy-MM-dd HH:mm:ss.SSS")}"`,
  prettyPrint: {
    levelFirst: true,
  },
});
