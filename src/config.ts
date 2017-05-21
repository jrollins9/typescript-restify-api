import * as path from 'path';

/**
 * Interface for application configuration settings
 * 
 * @interface Config
 */
interface Config {
    root: string;
    name: string;
    port: number;
    env: string;
    db: string;
    debug: boolean;
    version: string;
}

// environment
const env: string = process.env.NODE_ENV || 'development';

// default settings are for development environment
const config: Config = {
    name: 'API Server',
    env: env,
    debug: process.env.DEBUG || true,
    root: path.join(__dirname, '/'),
    port: 8888,
    db: 'mongodb://localhost:27017/dev',
    version: '1.0.0',
};

// test environment settings
if (env === 'test') {
    config.db = 'mongodb://localhost:27017/test';
}

// production environment settings
if (env === 'production') {
    config.port = 8822;
    config.db = 'mongodb://localhost:27017/prod';
    config.debug = false;
}

export { config };
