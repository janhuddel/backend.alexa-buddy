const mongoose = require("mongoose");
const logger = require("../util/logging");

const mongoUri = process.env.MONGO_DB;

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));

db.once("open", () => {
  logger.info("Connected to mongodb");
});

const userSchema = new mongoose.Schema({
  _id: String,
  created: Date,
  updated: Date,
  name: String,
  email: String,
  apikey: String,
  accessToken: String,
  refreshToken: String,
});

const deviceSchema = new mongoose.Schema({
  userid: String,
  name: String,
  description: String,
  type: String,
  capabilities: Object,
});

const requestLogSchema = new mongoose.Schema({
  userid: String,
  timestamp: Date,
  namespace: String,
  operation: String,
  responseStatus: String,
});

const User = mongoose.model("user", userSchema);
const Device = mongoose.model("device", deviceSchema);
const RequestLog = mongoose.model("requestlog", requestLogSchema);

module.exports = db;

module.exports.User = User;

module.exports.findUserById = async (userid) => {
  return await User.findById(userid);
};

module.exports.findUserByApiKey = async (apikey) => {
  return await User.findOne({ apikey: apikey });
};

module.exports.findUserDevices = async (userid) => {
  return await Device.find({ userid: userid, enabled: true });
};

module.exports.findDeviceById = async (deviceId) => {
  return await Device.findById(deviceId);
};

module.exports.logRequest = async (directive, user, responseStatus) => {
  await new RequestLog({
    userid: user.id,
    timestamp: new Date(),
    namespace: directive.header.namespace,
    operation: directive.header.name,
    responseStatus: responseStatus,
  }).save();
};
