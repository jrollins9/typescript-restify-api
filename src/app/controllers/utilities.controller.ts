import * as restify from 'restify';
import { logger } from '../../logger';

/* Utility functions */
/* Protected routes */
function ping(req: restify.Request, res: restify.Response, next: restify.Next) {
  res.json(200, 'OK');
  return next();
}

function health(req: restify.Request, res: restify.Response, next: restify.Next) {
  // TODO: Return health server health
  res.json(200, 'OK');
  return next();
}

function information(req: restify.Request, res: restify.Response, next: restify.Next) {
  // TODO: Return REST API app info (name, version, description, etc.)
  res.json(200, 'OK');
  return next();
}

function configuration(req: restify.Request, res: restify.Response, next: restify.Next) {
  // TODO: Return config settings
  res.json(200, 'OK');
  return next();
}

function environment(req: restify.Request, res: restify.Response, next: restify.Next) {
  // TODO: Return environment settings
  res.json(200, 'OK');
  return next();
}

export { ping, health, information, configuration, environment }
