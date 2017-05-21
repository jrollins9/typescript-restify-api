import * as restify from 'restify';
import { WidgetController } from '../controllers/widget.controller';

export default (api: restify.Server) => {
  const controller = new WidgetController();
  const url = controller.resourceUrl;
  
  api.get({path: url, version: ['1.0.0']}, (req, res, next) => controller.list(req, res, next));
  api.post({path: url, version: ['1.0.0']}, (req, res, next) => controller.create(req, res, next));
  api.get({path: `${url}/:id`, version: ['1.0.0']}, (req, res, next) => controller.show(req, res, next));
  api.put({path: `${url}/:id`, version: ['1.0.0']}, (req, res, next) => controller.update(req, res, next));
  api.del({path: `${url}/:id`, version: ['1.0.0']}, (req, res, next) => controller.remove(req, res, next));
};
