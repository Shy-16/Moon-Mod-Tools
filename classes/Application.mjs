import * as fs from 'node:fs/promises';
import * as path from 'node:path';

/**
 * Contains methods that pertain to any Node.js application, regardless of what the application's purpose is.
 */
export default class Application {
  /**
   * Object with keys as flags, and values are the option(s) of those flags in the command line.
   * @type {Object.<string, string>}
   */
  static options = {};
  
  /**
   * Parses the command line via which this Node.js application was started into an object whose keys are option flags, and their associated values are the argument that followed the flag. Assumes the first argument is a flag, and the next is an option value, alternating until all arguments are iterated through. If there are an odd number of arguments, the last one will be stored in the options object with the `_last` key.
   * @param {Object} options - Additional instructions on how certain flags should be handled.
   * @param {string[]} options.multiples - Array of flags that will be stored as arrays in the returned object, and repeats of that flag in the command line will be added to the corresponding array.
   * @param {Object.<string, string[]>} options.aliases - Object with each key being a flag, and the value is an array of flags that will be considered duplicates of the flag in the key.
   */
  static loadOptions({multiples=[], aliases={}}={}) {
    let flag;
    for (let arg of process.argv.slice(2)) {
      if (!flag) {
        for (let baseFlag in aliases) {
          if (aliases[baseFlag].includes(arg))
            arg = baseFlag;
        }
        flag = arg;
      }
      else {
        if (multiples.includes(flag)) {
          if (!this.options[flag])
            this.options[flag] = [arg];
          else
            this.options[flag].push(arg);
        }
        else
          this.options[flag] = arg;
        flag = null;
      }
    }
    if (flag)
      this.options._last = flag;
  }
  
  /**
   * Log a message to the console with added formatting.
   */
  static log(type, ...args) {
    let func;
    let opener = "";
    let closer = "";
    if (type === 'error') {
      func = console.error;
      if (process.title === "Windows PowerShell") {
        opener = "\x1b[30m\x1b[101m";
        closer = "\x1b[0m";
      }
    }
    else if (type === 'warn') {
      func = console.warn;
      if (process.title === "Windows PowerShell") {
        opener = "\x1b[30m\x1b[103m";
        closer = "\x1b[0m";
      }
    }
    else if (type === 'debug') {
      func = console.debug;
      if (process.title === "Windows PowerShell") {
        opener = "\x1b[30m\x1b[100m";
        closer = "\x1b[0m";
      }
      else
        return;
    }
    else
      func = console.log;
    if (func)
      func(`${opener}[${(new Date()).toUTCString()}]${closer}`, ...args);
  }
  
  /**
   * Shortcut function for reporting an error. Errors should be reported when the current operation cannot be completed.
   */
  static logError(...args) {
    this.log('error', ...args);
  }
  
  /**
   * Shortcut function for reporting a warning. Warnings should be reported when the current operation can still be completed, but might not work exactly as the user intended.
   */
  static logWarn(...args) {
    this.log('warn', ...args);
  }
  
  /**
   * Shortcut function for logging a message. Messages should be logged occasionally to give the owner feedback to verify that the bot is working.
   */
  static logInfo(...args) {
    this.log('info', ...args);
  }
  
  /**
   * Shortcut function for logging a debug message. Will only output the message in a development environment.
   */
  static logDebug(...args) {
    this.log('debug', ...args);
  }
  
  /**
   * Import JSON data. Note that for some utterly baffling reason, EMCAScript *still* has no official method for importing a JSON file, so this "experimental" method will result in a warning in the application console.
   */
  static async importJSON(filename) {
    return (await this.safeImport(filename, {with: {type: 'json'}}))?.default;
  }
  
  /**
   * A wrapper for the native import operation that catches errors to prevent the application from crashing when trying to import non-essential modules.
   */
  static async safeImport(filename, options={}) {
    try {
      await fs.access(filename);
    }
    catch(err) {
      this.logError(`File '${filename}' is not accessible for import.`, err);
      return;
    }
    
    let append = '';
    if ('reload' in options) {
      if (options.reload)
        append = '?t='+Date.now();
      delete options.reload;
    }
    
    try {
      let filepath = this.toModulePath(filename, append);
      this.logDebug(`Importing module '${filepath}'.`);
      return await import(filepath, options);
    }
    catch(err) {
      this.logError(`File '${filename}${append}' cannot be imported by Node.js.`, err);
      return;
    }
  }
  
  /**
   * Converts any file path into a path that the native import operation will accept.
   */
  static toModulePath(filename, append='') {
    return "file:" + path.resolve(filename) + append;
  }
}