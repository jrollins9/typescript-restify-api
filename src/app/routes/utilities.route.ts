import * as restify from 'restify';
import * as controller from '../controllers/utilities.controller';

export default (api: restify.Server) => {
  const path = '/api';
  
  api.get({path: `${path}/ping`, version: ['1.0.0']}, (req, res, next) => controller.ping(req, res, next));
  api.get({path: `${path}/health`, version: ['1.0.0']}, (req, res, next) => controller.health(req, res, next));
  api.get({path: `${path}/info`, version: ['1.0.0']}, (req, res, next) => controller.information(req, res, next));
  api.get({path: `${path}/config`, version: ['1.0.0']}, (req, res, next) => controller.configuration(req, res, next));
  api.get({path: `${path}/env`, version: ['1.0.0']}, (req, res, next) => controller.environment(req, res, next));
};
