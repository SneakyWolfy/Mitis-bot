require("dotenv").config();

const server = require("./server.js");
const App = require("./src/models/appModel.js");
const client = App.state.client;
const commandMessageHandler = require("./src/controllers/commandMessageHandler");

process.on("unhandledRejection", (err) => {
  console.log("Uncaught Rejection!");
  console.warn(err);
});

const loadCommands = () => {
  try {
    const commandFiles = App.getJSFiles("/../commands");

    commandFiles.forEach((file) => App.addCommand("../commands", file));
  } catch (error) {
    console.error(error);
    console.error(`Issue with Reading and loading commands: ${error}`);
  }
};

const finalize = () => {
  console.log("Bot Ready");
};

const init = async () => {
  client.once("ready", finalize);
  await server.init();
  loadCommands();

  console.log("Loading commands successful");
  client.on("message", commandMessageHandler);
};
init();
