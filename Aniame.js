const { validateResource, validateNode } = require('./lib/ResourceValidator');
const { validateSchema } = require('./lib/SchemaValidator');
const { traverseResource } = require('./lib/TraversalEngine');

module.exports = {
  validateNode,
  validateResource,
  validateSchema,
  traverseResource
};
