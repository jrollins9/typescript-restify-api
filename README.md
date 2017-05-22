# Typescript Restify API

[Node.js](https://nodejs.org) REST API boilerplate using [TypeScript](https://www.typescriptlang.org/), [restify](http://restify.com/), and [mongodb](http://mongodb.org).

## Tools
* Server: [Node.js](https://nodejs.org) with [restify](http://restify.com/)
* Language: [TypeScript 2.3](https://www.typescriptlang.org/)
* Database: [mongodb](http://mongodb.org) with [mongoose](http://mongoosejs.com/)
* Task runner: [gulp](http://gulpjs.com/) 
* Features: Paging, sorting, filtering, field selection, soft deletes, HATEOAS.
* In the future: Testing

## Getting started

```sh
# Clone the repository
git clone https://github.com/jrollins9/typescript-restify-api.git myproject
cd myproject

# Install depenencies
npm install

# Build API
gulp build

# Start server
# Uses nodemon to watch for changes to Typescript source files
gulp start
```

## Database

The server will connect to a database: `mongodb://localhost:27017/dev`.

This setting can be changed in the `config.ts` file.

### config.ts
```ts
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
```

## Seeding Data

Run the seed command
```
gulp seed
```
If the dev server was changed in the `config.ts` file, make the corresponding change in `gulpfile.js`.

### gulpfile.js
```js
seed = {
        db: {
            name: "mongodb://localhost:27017/dev",
            options: {
                server: {
                    socketOptions: {
                        keepAlive: 0
                    }
                }
            }
        },
        count: 50 // number of documents to seed
    };
```

## Usage
### GET Resources with Paging
```
GET /api/widgets?limit=10&page=2
```
### Response
```
Status: 200 OK
Content-Type: application/json
```
```json
{
  "totalItems": 50,
  "totalPages": 5,
  "page": 2,
  "limit": 10,
  "links": {
    "self": "/api/widgets?limit=10&page=2",
    "next": "/api/widgets?limit=10&page=3",
    "prev": "/api/widgets?limit=10&page=1",
    "first": "/api/widgets?limit=10&page=1",
    "last": "/api/widgets?limit=10&page=5"
  },
  "items": [
    {
      "_id": "592336c20fec061708156508",
      "__v": 0,
      "current": true,
      "name": "Widget10",
      "description": "description for widget10",
      "rank": 5,
      "createdAt": "2017-05-22T19:06:53.492Z",
      "updatedAt": "2017-05-22T19:06:53.492Z",
      "deleted": false,
      "deletedAt": null
    },
    ...
  ]
}
```

### GET One Resource
```
GET /api/widgets/{id}
```
### Response
```
Status: 200 OK
Content-Type: application/json
Link: <http://localhost:8888/api/widgets/592336c20fec061708156508>; rel="self"
```
```json
{
  "_id": "592336c20fec061708156508",
  "__v": 0,
  "current": true,
  "name": "Widget10",
  "description": "description for widget10",
  "rank": 5,
  "createdAt": "2017-05-22T19:06:53.492Z",
  "updatedAt": "2017-05-22T19:06:53.492Z",
  "deleted": false,
  "deletedAt": null
}
```

### Create a Resource
```
POST /api/widgets
```
body
```json
{
  "current": true,
  "name": "Widget999",
  "description": "description for widget 999",
  "rank": 1
}
```

### Response
The created resource
```
Status: 201 Created
Content-Type: application/json
Link: <http://localhost:8888/api/widgets/592336c20fec061708156508>; rel="self"
```

```json
{
  "__v": 0,
  "updatedAt": "2017-05-22T21:14:04.628Z",
  "createdAt": "2017-05-22T21:14:04.628Z",
  "current": true,
  "name": "Widget999",
  "description": "description for widget 999",
  "rank": 1,
  "deleted": false,
  "_id": "5923549c251f7c2cdc7b5bbd",
  "deletedAt": null
}
```

### Update a Resource
```
PUT /api/widgets/{id}
```
body
```json
{
  "current": false,
  "description": "widget 999 updated by user",
  "rank": 4
}
```

### Response
The updated resource
```
Status: 200 OK
Content-Type: application/json
Link: <http://localhost:8888/api/widgets/592336c20fec061708156508>; rel="self"
```
```json
{
  "_id": "5923549c251f7c2cdc7b5bbd",
  "updatedAt": "2017-05-22T21:16:44.880Z",
  "createdAt": "2017-05-22T21:14:04.628Z",
  "current": false,
  "name": "Widget999",
  "description": "widget 999 updated by user",
  "rank": 4,
  "__v": 0,
  "deleted": false,
  "deletedAt": null
}
```

### Delete a Resource
```
DELETE /api/widgets/{id}
```

### Response
```
Status: 204 No Content
```

If using soft deletes, the response will be as follows

The 'deleted' resource, notice `deleted` and `deletedAt` fields
```
Status: 200 OK
Content-Type: application/json
Link: <http://localhost:8888/api/widgets/592336c20fec061708156508>; rel="self"
```
```json
{
  "_id": "5923549c251f7c2cdc7b5bbd",
  "updatedAt": "2017-05-22T21:20:41.600Z",
  "createdAt": "2017-05-22T21:14:04.628Z",
  "current": false,
  "name": "Widget999",
  "description": "widget 999 updated by user",
  "rank": 4,
  "__v": 0,
  "deleted": true,
  "deletedAt": "2017-05-22T21:20:41.599Z"
}
```

## Sorting, Filtering, and Field Selection
To use sorting and filtering, the `sortable` and `filterable` properties must be set in the resource's controller.

### widget.controller.ts
```ts
// fields that results can be filtered by
public filterable = ['current', 'name', 'rank', 'deleted'];

// fields that results can be sorted by
public sortable = ['name', 'updatedAt', 'rank', 'deletedAt'];
```

### Sort
```sh
# sort by update date ASC, then by rank DESC
GET /api/widgets?sort=updatedAt,-rank
```

### Filter
```sh
# standard filtering
GET /api/widgets?current=true&rank=1
```

### Advanced Filter
```sh
# advanced filtering, see mongoose documentation for formatting
GET /api/widgets?filter=[{"rank":{"$gt":1, "$lt":4}}]
```

### Field Selection
```sh
# select only the name and description fields
GET /api/widgets?fields=name,description
```

### Combine Sort, Filter, Field Selection
```
GET /api/widgets?sort=-rank&filter=[{"rank":{"$gt":1, "$lt":4}}]&fields=id,name,rank,current&current=false
```