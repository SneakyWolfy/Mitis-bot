const defaultConfig = require("../config");
const { Config } = require("../models/configModel");
const { state } = require("../models/appModel");
const Discord = require("discord.js");
const { successEmbed, defaultEmbed } = require("../utils/Provider/embed");
const View = require("../utils/View");
const AppError = require("../utils/AppError");

const metaData = {
  prefix: {
    description: `The guild's prefix`,
    default: defaultConfig.prefix,
  },
  admin: {
    description: `The role indicating a server admin. They are granted special privileges above moderators.`,
  },
  mod: {
    description: `The role indicating a server admin. They have extended access to moderation commands.`,
  },
};

exports.fetchConfig = async (guildID) => {
  const stateConfig = state.client.config;
  const guildConfig = stateConfig.get(guildID);

  if (guildConfig) return guildConfig;

  const config = await Config.findOne({ guildID });
  if (config) return config;

  const newConfig = Config.create({ guildID });
  stateConfig.set(guildID, newConfig);

  return newConfig;
};

exports.getPrefix = async (guildID) => {
  if (!guildID) return defaultConfig.prefix;

  const config = await this.fetchConfig(guildID);
  return config.prefix;
};

exports.getRoles = async (guildID) => {
  const { mod, admin } = (await this.fetchConfig(guildID)).roles;

  return { mod, admin };
};

exports.getAll = async (guildID) => {
  const out = [];

  out.push({ name: "Prefix", value: await this.getPrefix(guildID) });
  out.push({ name: "Roles", value: await this.getRoles(guildID) });

  return out;
};

exports.getAllFlat = async (guildID) => {
  const out = [];
  const configs = await this.getAll(guildID);

  for (config of configs) {
    if (!(config.value instanceof Object)) {
      out.push({ name: config.name, value: config.value, parent: null });
      continue;
    }

    Object.entries(config.value).forEach(([name, value]) =>
      out.push({ name, value, parent: config.name })
    );
  }
  return out;
};

exports.renderAll = async (guild) => {
  const embed = successEmbed()
    .setTitle(`Config for ${guild.name}`)
    .setThumbnail(View.getGuildIcon(guild));

  const configs = await this.getAll(guild.id);

  for (config of configs) {
    const name = config.name;
    let value = "";

    if (config.value instanceof Object) {
      const values = Object.entries(config.value);
      const longestName = values.reduce(
        (a, [name]) => (a > name.length ? a : name.length),
        0
      );
      const formatName = (name) =>
        (name[0].toUpperCase() + name.substring(1)).padStart(longestName, " ");

      const formatValue = (value) => `${value ?? "*Not Set*"}`;

      value = values.reduce(
        (out, [name, value]) =>
          `${out}\n\`${formatName(name)} \` ${formatValue(value)}`,
        ""
      );
    } else {
      value = config.value;
    }
    embed.addField(name, value, true);
  }

  return embed;
};

exports.getOne = async (guild, value) => {
  const config = await this.fetchConfig(guild.id);

  let configValue = "";
  const configName = value.name;
  const configMeta = metaData?.[configName.toLowerCase()];

  if (value.parent) {
    configValue =
      config[value.parent.toLowerCase()]?.[value.name.toLowerCase()];
  } else {
    configValue = config[value.name.toLowerCase()];
  }

  return {
    value: configValue,
    name: configName,
    meta: configMeta,
    parent: value.parent,
  };
};

exports.renderOne = async (guild, value) => {
  const config = await this.getOne(guild, value);
  const defaultValue = config?.meta?.default;

  const embed = defaultEmbed()
    .setTitle(`${config.name}`)
    .setThumbnail(View.getGuildIcon(guild))
    .setDescription(config?.meta?.description ?? "")
    .addField(
      "Current value",
      config.value || config?.meta?.default || "Not set",
      true
    )
    .setFooter(
      `Change ${config.name} with ${await this.getPrefix(guild.id)}config ${
        config.name
      } <value>`
    );

  if (defaultValue && defaultValue !== config.value)
    embed.addField("Default value", defaultValue, true);

  return embed;
};

exports.updateOne = async (guild, original, value) => {
  const originalConfig = await this.getOne(guild, original);

  const config = await this.fetchConfig(guild.id);

  if (originalConfig.parent) {
    config[originalConfig.parent.toLowerCase()][
      originalConfig.name.toLowerCase()
    ] = value;
  } else {
    config[originalConfig.name.toLowerCase()] = value;
  }

  await config.save({ validateBeforeSave: true }).catch((error) => {
    throw new AppError(`Invalid Data`, `${error.message}`);
  });

  return successEmbed()
    .setTitle(`Config Updated`)
    .setDescription(`${originalConfig.name} has been set to \`${value}\``);
};
