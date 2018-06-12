const { validateSchema } = require('./lib/SchemaValidator');
const { indexSchema } = require('./lib/SchemaIndexer');
const { validateData } = require('./lib/DataValidator');

module.exports = { validateSchema, validateData, indexSchema };
