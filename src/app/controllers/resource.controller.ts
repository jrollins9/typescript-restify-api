import * as restify from 'restify';
import * as mongoose from 'mongoose';
import { logger } from '../../logger';


/**
 * Interface for links object
 * 
 * @interface Links
 */
interface Links {
  self: string;
  next: string;
  prev: string;
  first: string;
  last: string;
}

/**
 * Interface for paged response object
 *
 * @interface PagedResponse
 */
interface PagedResponse {
  totalItems: number;
  totalPages: number;
  page: number;
  limit: number;
  links: Links;
  items: Array<Object>;
}

/**
 * Abstract base resource controller class
 *
 * @abstract
 * @class ResourceController
 */
abstract class ResourceController {

  /* Abstract properties */
  protected abstract model: mongoose.Model<mongoose.Document>;
  protected abstract maxRecords: number;
  public abstract filterable: Array<string>;
  public abstract sortable: Array<string>;
  public abstract resourceUrl: string;

  /* Constructor */
  constructor() {

  }

  /* Public methods */

  /**
   * List resources with support for paging, sorting, filtering
   *
   * @param {restify.Request} req
   * @param {restify.Response} res
   * @param {restify.Next} next
   * @returns Promise
   *
   * @memberof ResourceController
   */
  public list(req: restify.Request, res: restify.Response, next: restify.Next) {

    let filter: any = this.getFilter(req); console.log(filter);
    let sort: string = this.getSort(req);
    let fields: string = this.getSelectFields(req);

    // get total count
    // then fetch data as paged response
    return this.model
      .count(filter)
      .then((total) => {

        // Generate HATEOAS links for navigation/paging
        // threshold set to lower value of total record count or maxRecords
        const threshold = (total < this.maxRecords) ? total : this.maxRecords;

        // get url parameters: page and limit
        let page: any = parseInt(req.query.page, 10);
        let limit: any = parseInt(req.query.limit, 10);

        // calculate paging parameters
        limit = !isNaN(limit) && limit < threshold ? limit : this.maxRecords;
        const pages: number = Math.floor(total / limit) + ((total % limit === 0) ? 0 : 1); // total pages
        page = !isNaN(page) && page <= pages ? page : 1; // default first page
        const skip: number = (page <= pages) ? (page - 1) * limit : 0; // default 0

        // capture additional query string parameters
        // remove page parameter, since it will be different for each link
        let queryParams: string = req.getQuery();
        queryParams = queryParams.replace(/&page(\=[^&]*)?(?=&|$)|^page(\=[^&]*)?(&|$)/, '');

        // base url
        const url = `${this.resourceUrl}?${queryParams}`;

        // fetch records
        return this.model.find(filter)
          .select(fields)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .exec()
          .then((records) => {
            const data: PagedResponse = {
              totalItems: total,
              totalPages: pages,
              page: (total === 0) ? total : page,
              limit: limit,
              links: {
                self: (total === 0) ? '' : `${url}&page=${page}`,
                next: (total === 0 || page === pages) ? '' : `${url}&page=${page + 1}`,
                prev: (total === 0 || page === 1) ? '' : `${url}&page=${page - 1}`,
                first: (total === 0) ? '' : `${url}&page=1`,
                last: (total === 0) ? '' : `${url}&page=${pages}`
              },
              items: records
            };
            return Promise.resolve(data);
          });
      })
      .then((data) => {
        res.json(200, data);
        return next();
      })
      .catch((err: any) => next(err));
  }

  /**
   * Show one resource by id
   * 
   * @param {restify.Request} req 
   * @param {restify.Response} res 
   * @param {restify.Next} next 
   * @returns Promise
   * 
   * @memberof ResourceController
   */
  public show(req: restify.Request, res: restify.Response, next: restify.Next) {

    return this.model
      .findById(req.params.id)
      .exec()
      .then((resource) => {
        let link: string = `<${(req.isSecure()) ? 'https' : 'http'}://${req.headers.host}${req.url}>; rel="self"`;
        res.setHeader('Link', link);
        res.json(200, resource);
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

  /**
   * Create a new resource
   * 
   * @param {restify.Request} req 
   * @param {restify.Response} res 
   * @param {restify.Next} next 
   * @returns Promise
   * 
   * @memberof ResourceController
   */
  public create(req: restify.Request, res: restify.Response, next: restify.Next) {
    return this.model
      .create(req.params)
      .then((resource) => {
        let link: string = `<${(req.isSecure()) ? 'https' : 'http'}://${req.headers.host}${req.url}>; rel="self"`;
        res.setHeader('Link', link);
        res.json(201, resource);
        return next();
      })
      .catch((err: any) => next(
        new restify.BadRequestError({
          body: {
            code: 400,
            type: 'BadRequestError',
            message: 'Could not create resource',
            detail: err
          }
        })
      ));
  }

  /**
   * Update resource
   * 
   * @param {restify.Request} req 
   * @param {restify.Response} res 
   * @param {restify.Next} next 
   * @returns Promise  
   * 
   * @memberof ResourceController
   */
  public update(req: restify.Request, res: restify.Response, next: restify.Next) {
    return this.model
      .findByIdAndUpdate(req.params.id, req.body, {new: true})
      .then((resource) => {
        let link: string = `<${(req.isSecure()) ? 'https' : 'http'}://${req.headers.host}${req.url}>; rel="self"`;
        res.setHeader('Link', link);
        res.json(200, resource);
        return next();
      })
      .catch((err: any) => next(
        new restify.BadRequestError({
          body: {
            code: 400,
            type: 'BadRequestError',
            message: 'Could not create resource',
            detail: err
          }
        })
      ));
  }

  /**
   * Delete resource
   * 
   * @param {restify.Request} req 
   * @param {restify.Response} res 
   * @param {restify.Next} next 
   * @returns Promise
   * 
   * @memberof ResourceController
   */
  public remove(req: restify.Request, res: restify.Response, next: restify.Next) {
    return this.model
      .findByIdAndRemove(req.params.id)
      .exec()
      .then(() => {
        res.json(204, 'Resource removed');
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

  /**
   * Generate filter object from query string parameters
   * 
   * @private
   * @param {restify.Request} req 
   * @returns {Object} 
   * 
   * @memberof ResourceController
   */
  private getFilter(req: restify.Request): Object {

    let filter: any = {};

    // add filterable query string parameters to filter object
    // e.g. /api/widgets?name=Widget1&current=true&rank=1
    for (let field of this.filterable) {
      if (typeof req.query[field] !== 'undefined') {
        filter[field] = req.query[field];
      }
    }

    // add query string 'filter' parameter to filter object
    // e.g. /api/widgets?filter=[{rank:{$gt: 1, $lte: 4}}]
    if (typeof req.query['filter'] !== 'undefined') {

      try {

        let filters = JSON.parse(req.query['filter']);

        for (let filterVal of filters) {

          filter = Object.assign(filter, filterVal);
        }

      } catch (e) {
        // TODO: handle syntax error from JSON.parse
      }

    }
    return filter;
  }


  /**
   * Get sort string from query string parameter
   * 
   * @private
   * @param {restify.Request} req 
   * @returns {string} 
   * 
   * @memberof ResourceController
   */
  private getSort(req: restify.Request): string {

    let sort: string = '';

    if (typeof req.query['sort'] !== 'undefined') {

      let sortFields: any = req.query['sort'].split(',');

      for (let sortField of sortFields) {
        if (this.sortable.indexOf(sortField.replace(/-/g, '')) !== -1) {
          sort += `${sortField} `;
        }
      }
    }

    return sort;
  }


  /**
   * Get select fields from query string parameter
   * 
   * @private
   * @param {restify.Request} req 
   * @returns {string} 
   * 
   * @memberof ResourceController
   */
  private getSelectFields(req: restify.Request): string {

    let fields: string;

    if (typeof req.query['fields'] !== 'undefined') {
      fields = req.query['fields'].replace(/,/g, ' '); // replace commas with spaces
    }

    return fields;
  }
}

export { ResourceController };
