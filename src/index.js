/** Import generics dependences */
import pino from 'pino';
import path from 'path';
import { watch, readFileSync } from 'fs';
import { spawn } from 'child_process';
import EventEmitter from 'events';

// Set pino for get pretty logs.
const pinoConfig = { prettyPrint: { colorize: true } };
const logger = pino(pinoConfig);

class Watch extends EventEmitter {
  /**
   * @name constructor
   * @description To generate a watcher with which to obtain when a file changes and
   *              to be able to restart the process with the NodeJS application
   */
  constructor () {
    super();
    // Get configuration for this demon.
    const { rootDirectory, mainApplication, extensionsFile } = this.checkEnvironment();
    // Create the first process.
    let spawnProcess = this.createSpawn(mainApplication);
    // Init the watch instance with which to obtain when a file changes.
    watch(rootDirectory, { recursive: true }, (eventType, fileName) => {
      if (!extensionsFile || extensionsFile && this.checkExtension(extensionsFile, fileName)) {
        // Broadcast the event so you can do what you need.
        this.emit(eventType, fileName);
        // Kill and create again the process.
        spawnProcess = spawnProcess && this.destroySpawn(spawnProcess) && this.createSpawn(mainApplication);
      }
    })
  };
  /**
   * @name checkEnvironment
   * @description For load the watch configuration obtained from the package.json file.
   * @returns {object} Object with configuration.
   */
  checkEnvironment = () => {
    // Get configuration for this demon.
    const { demon } = JSON.parse(readFileSync(`${path.resolve()}/package.json`).toString());
    // Return configuration object.
    return demon;
  }
  /**
   * @name checkExtension
   * @description Check extension file for compare into array extensions.
   * @param {array<string>} extensionsFile Extensions files to review.
   * @param {string} fileName File name to compare extension.
   * @returns {boolean} Return true if find the extension into array or false if not.
   */
  checkExtension = (extensionsFile, fileName) => extensionsFile.includes(`${path.extname(fileName).split('.')[1]}`);
  /**
   * @name createSpawn
   * @description For create a spawn to generate a new process with the main application.
   * @param {string} mainApplication Command for execute the main application.
   * @returns {object} Return the instantiation of the process. 
   */
  createSpawn = (mainApplication) => {
    // Create array and destructuring it for get command and arguments.
    const [command, ...args] = mainApplication.split(' ');
    // Init spawn instance with command and arguments.
    const spawnProcess = spawn(command, args);
    // Get all streams and show via log.
    spawnProcess.stdout.on('data', (data) => console.log(data.toString().replace('\n', '')));
    spawnProcess.stderr.on('data', (data) => console.log(data.toString().replace('\n', '')));
    return spawnProcess;
  }
  /**
   * @name destroySpawn
   * @description For kill a spawn.
   * @param {object} spawnProcess Spawn instance process
   * @returns {boolean} Return true if kill the process or false if not.
   */
  destroySpawn = (spawnProcess) => spawnProcess.kill();
}

// Create an instance of the class for run a singleton demon.
const demon = new Watch();

// Add listeners for get all changed or renamed files. 
// (More info of this event types: https://nodejs.org/docs/latest/api/fs.html#fs_fs_watch_filename_options_listener)
demon.on('change', filename => logger.info(`[Change] ${filename}`));
demon.on('rename', filename => logger.info(`[Other] ${filename}`));