const { validateResource } = require('./lib/ResourceValidator');
const { validateSchema } = require('./lib/SchemaValidator');
const { traverseResource } = require('./lib/TraversalEngine');

module.exports = { validateSchema, validateResource, traverseResource };
