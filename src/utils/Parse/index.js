const Argument = require("../Argument");
const { parseChannel } = require("./parseChannel");
const parseEnum = require("./parseEnum");

const parseMember = require("./parseMember");
const parseUser = require("./parseUser");
const parseMessage = require("./parseMessage");
const parseTime = require("./parseTime");

class Parse {
  #outArgs = [];
  #inArgs;
  #message;
  #channel;
  #guild;
  #prefix;
  #command;

  #inputBuffer;
  /**
   *
   * @param {Argument} args
   */
  constructor(args) {
    this.#message = args.message;
    this.#channel = args.channel;
    this.#guild = args.guild;
    this.#prefix = args.prefix;
    this.#command = args.command;
    this.#inArgs = [...args.args];
  }

  get #input() {
    this.#inputBuffer = this.#inArgs.shift();
    return this.#inputBuffer;
  }

  get #restInput() {
    this.#inputBuffer = this.#inArgs.splice(0, this.#inArgs.length);
    return this.#inputBuffer;
  }
  /**
   * @param {Function} func
   */
  set #output(func) {
    this.#outArgs.push(func);
  }

  #param(name, func, args, options) {
    this.#output = {
      func,
      args,
      name,
      input: this.#inputBuffer,
      ...this.#applyOptions(options),
    };

    return this;
  }

  #applyOptions(options = {}) {
    if (!this.#isObject(options)) return { default: options, required: true };

    const obj = {};
    obj.required = options.required ?? true;
    obj.default = options.default ?? null;

    return obj;
  }

  member(options) {
    return this.#param(
      "Member",
      parseMember,
      [this.#input, this.#guild],
      options
    );
  }

  enum(enums, options) {
    return this.#param("Enum", parseEnum, [enums, this.#input], options);
  }

  channel(options) {
    return this.#param(
      "Channel",
      parseChannel,
      [this.#input, this.#guild],
      options
    );
  }

  message(options = {}) {
    return this.#param("Message", parseMessage, [this.#restInput], options);
  }

  user(options) {
    return this.#param("User", parseUser, [this.#input], options);
  }

  time(options) {
    return this.#param("Time", parseTime, [this.#input], options);
  }

  #generateErrorUsageString(i) {
    const name = `${this.#prefix}${this.#command.name}`;

    const params = this.#outArgs.reduce((output, value) => {
      return `${output} ${value.required ? "<" : "["}${value.name}${
        value.required ? ">" : "]"
      }`;
    }, "");

    const usage = `${name}${params}`;

    const errorName = `${this.#outArgs[i].required ? "<" : "["}${
      this.#outArgs[i].name
    }${this.#outArgs[i].required ? ">" : "]"}`;
    const errorIndex = params.indexOf(errorName);

    const leftSideSpace = errorIndex;
    const arrowAmount = errorName.length;
    const rightSideSpace = params.length - leftSideSpace - arrowAmount;

    const arrowString =
      " ".repeat(name.length) +
      " ".repeat(leftSideSpace) +
      "^".repeat(arrowAmount) +
      " ".repeat(rightSideSpace);

    return `\`${usage}\`\n\`${arrowString}\`\n\n`;
  }

  #isObject(value) {
    return (
      typeof value === "object" &&
      Object.getPrototypeOf(value)?.constructor?.name === "Object"
    );
  }
  #isEmpty(value) {
    if (value instanceof Array) return value.length === 0;
    return !Boolean(value);
  }

  /**
   *
   * @param {Object} options
   * @param {Boolean} [options.ignoreErrors=false]
   * @param {Boolean} [options.abortOnError=false]
   * @returns {Promise<Array>}
   */
  async execute(options = {}) {
    const ignoreErrors = options.ignoreErrors ?? false;
    const abortOnError = options.abortOnError ?? false;

    const output = [];

    for (const [i, value] of Object.entries(this.#outArgs)) {
      try {
        if (value.default !== null && this.#isEmpty(value.input)) {
          output.push(value.default);
          continue;
        }
        output.push(await value.func(...value.args));
      } catch (error) {
        if (abortOnError) return false;

        if (ignoreErrors || !value.required) {
          output.push(null);
          continue;
        }

        if (error.isOperational) 
          error.message = `${this.#generateErrorUsageString(i)}${error.message}`; // prettier-ignore

        throw error;
      }
    }

    return output;
  }
}

module.exports = (args) => new Parse(args);
