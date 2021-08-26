const { state } = require("../models/appModel");
const { Mute } = require("../models/muteModel");
const { Ban } = require("../models/banModel");
const DBConnection = require("../classes/DBConnection");
const { cycleID } = require("../config");
const lt = require("long-timeout");
const muteController = require("../controllers/muteController");
const banController = require("../controllers/banController");

exports.resumeTimeouts = async () =>
  await Promise.all([resumeBans(), resumeMutes(), botCycle()]);

const resumeBans = async () => {
  const activeBans = await Ban.find({ active: true });
  const { bans } = state.client;

  activeBans.forEach((ban) => {
    if (!ban.endDate) return;
    const length = ban.endDate - Date.now();

    const unban = () => {
      banController.autoUnban(ban._id);
    };
    if (length <= 0) return unban();

    const unbanTimer = lt.setTimeout(unban, length);
    bans.set(`${ban._id}`, unbanTimer);
  });
};

const botCycle = async () => {
  // ?Requires cure controller "post many"
  // let cycle = await BotCycle.findOne({ cycleID });
  // if (!cycle) cycle = await BotCycle.create({ cycleID });
  // const timeFromLastScan = Date.now() - cycle.lastScan;
  // const requiredScans = Math.floor(timeFromLastScan / cycle.scanInterval);
  // const newLastScan = timeFromLastScan - requiredScans * cycle.scanInterval;
  // const timeTillNextScan = cycle.scanInterval - newLastScan;
  // const damageCuredPerScan = 1;
  // if (requiredScans > 0) this.cureMembers(damageCuredPerScan * requiredScans);
  // await DBConnection.updateBotCycle(config.cycleID, Date.now() - newLastScan);
  // lt.setTimeout(botCycle, timeTillNextScan);
};

const resumeMutes = async () => {
  const activeMutes = await Mute.find({ active: true });
  const { mutes } = state.client;

  activeMutes.forEach((mute) => {
    if (!mute.endDate) return;
    const length = mute.endDate - Date.now();

    const unmute = () => {
      muteController.autoUnmute(mute._id);
    };
    if (length < 0) return unmute();

    const unmuteTimer = lt.setTimeout(unmute, length);
    mutes.set(`${mute._id}`, unmuteTimer);
  });
};

exports.removeMute = (muteID) => {
  const unmuteTimer = state.client.mutes?.get?.(`${muteID}`);

  lt.clearTimeout(unmuteTimer);
  state.client.mutes?.delete?.(`${muteID}`);
};

exports.addMute = (muteID, time) => {
  const unmute = () => {
    muteController.autoUnmute(muteID);
    this.removeMute(muteID);
  };
  const unmuteTimer = lt.setTimeout(unmute, time);

  state.client.mutes.set(`${muteID}`, unmuteTimer);
};

exports.removeBan = (banID) => {
  const unbanTimer = state.client.bans?.get?.(`${banID}`);

  lt.clearTimeout(unbanTimer);
  state.client.mutes?.delete?.(`${banID}`);
};

exports.addBan = (banID, time) => {
  const unban = () => {
    banController.autoUnban(banID);
    this.removeBan(banID);
  };
  const unbanTimer = lt.setTimeout(unban, time);

  state.client.bans.set(`${banID}`, unbanTimer);
};
