import { ResourceController } from './resource.controller';
import { Widget } from '../models/widget.model';

class WidgetController extends ResourceController {

  /* Abstract implementation */
  protected model = Widget;
  public resourceUrl = '/api/widgets';

  // maximum number of records that can be returned
  protected maxRecords = 20;

  // fields that results can be filtered by
  public filterable = ['current', 'name', 'rank'];

  // fields that results can be sorted by
  public sortable = ['name','updatedAt', 'rank'];
}

export { WidgetController };
