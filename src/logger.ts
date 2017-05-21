import * as bunyan from 'bunyan';
import * as stream from 'stream';
import * as path from 'path';
import { config } from './config';

/**
 * Interface for bunyan logger configuration settings
 * 
 * @interface Logger
 */
interface Logger {
    name: string;
    streams: Array<Object>;
}

// path to log files
const pathToLogs: string = path.join(config.root, '/logs');

// stream
const infoStream = new stream.Writable();
infoStream.writable = true;
infoStream.write = (info: any): boolean => {
    console.log(JSON.parse(info).msg);
    return true;
};

// logger settings
let settings: Logger = {
    name: config.env,
    streams: [{ level: 'error', path: `${pathToLogs}/error.log` }]
};

if (config.env === 'development') {
    settings.streams.push({ level: 'info', stream: infoStream });
}

if (config.debug) {
    settings.streams.push({ level: 'trace', stream: infoStream });
    settings.streams.push({ level: 'debug', path: `${pathToLogs}/debug.log` });
}

// create logger
const logger = bunyan.createLogger(settings);

export { logger };
