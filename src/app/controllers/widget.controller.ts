import { ResourceController } from './resource.controller';
import { Widget } from '../models/widget.model';
import * as restify from 'restify';

class WidgetController extends ResourceController {

    /* Abstract implementation */
    protected model = Widget;
    public resourceUrl = '/api/widgets';

    // maximum number of records that can be returned
    protected maxRecords = 20;

    // fields that results can be filtered by
    public filterable = ['current', 'name', 'rank'];

    // fields that results can be sorted by
    public sortable = ['name', 'updatedAt', 'rank'];

    /**
     * Soft delete resource
     * 
     * @param {restify.Request} req 
     * @param {restify.Response} res 
     * @param {restify.Next} next 
     * @returns Promise
     * 
     * @memberof ResourceController
     */
    public remove(req: restify.Request, res: restify.Response, next: restify.Next) {
        const timestamp = new Date();
        return this.model
            .findByIdAndUpdate(req.params.id, {deleted: true, deletedAt: timestamp}, {new: false})
            .exec()
            .then(() => {
                res.json(204, 'Widget soft deleted');
                return next();
            })
            .catch((err: any) => next(
                new restify.NotFoundError({
                    body: {
                        code: (err.name === 'CastError') ? 404 : res.statusCode,
                        type: (err.name === 'CastError') ? 'NotFoundError' : err.name,
                        message: (err.name === 'CastError') ? 'Resource not found' : res.statusMessage,
                        detail: err
                    }
                })
            ));
    }
}

export { WidgetController };
