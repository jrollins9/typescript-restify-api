import mongoose = require('mongoose');
import { config } from './config';
import { server } from './restify';
import { logger } from './logger';

// use native ES6 promises instead of mongoose promise library
mongoose.Promise = global.Promise;

// connect to mongodb
const options = { server: { socketOptions: { keepAlive: 1 } } };
const db: mongoose.Connection = mongoose.connect(config.db, options).connection;

// print mongoose logs in debug mode
mongoose.set('debug', config.debug);

// error connecting to db
db.on('error', (err: any) => {
    throw new Error(`Unable to connect to database: ${err}`);
});

// start the server after db connection is made
db.once('open', () => {
    logger.info(`Connected to database: ${config.db}`);
    
    server.listen(config.port, () => {
        logger.info(`${config.name} is running at ${server.url}`);
    });
});

export { server };
