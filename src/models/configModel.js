const mongoose = require("mongoose");
const defaultConfig = require("../config");
const parseRole = require("../utils/Parse/parseRole");
const parseGuild = require("../utils/Parse/parseGuild");
const { state } = require("./appModel");

const rolesSchema = new mongoose.Schema({
  mod: { type: String, default: null, validate: roleValidator },
  admin: { type: String, default: null, validate: roleValidator },
});

const configSchema = new mongoose.Schema({
  guildID: {
    type: String,
    required: [true, "A guild id must be provided"],
    unique: [true, "A guild id must be unique"],
  },
  prefix: {
    type: String,
    default: defaultConfig.prefix,
    validate: prefixValidator,
  },
  roles: {
    type: rolesSchema,
    default: () => ({}),
  },
});

configSchema.index({ guildID: 1 });

configSchema.post("save", async function (doc) {
  const guildID = doc.guildID;
  const stateConfig = state.client.config;

  stateConfig?.set(guildID, doc);
});

const Config = mongoose.model("Config", configSchema);
exports.Config = Config;

function prefixValidator(val) {
  if (val.length > 3)
    throw new Error("Prefix too long. Keep it 3 characters or lower.");

  if (val.length === 0) throw new Error(`No prefix found!`);

  return val;
}
async function roleValidator(val) {
  if (val === null) return true;

  const configs = await Config.findOne({
    "roles._id": mongoose.Types.ObjectId("6127ffdebdbf81822001ccbc"),
  });

  const guild = await parseGuild(configs.guildID);
  const role = await parseRole(val, guild);

  if (!role) return false;
  return true;
}
