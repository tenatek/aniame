const JSONPath = require('./JSONPath');
const IndexingResult = require('./IndexingResult');

class SchemaIndexer {

  /**
   * Checks if a descriptor should be indexed, if so, indexes it and optionally collects the values of its relevant properties.
   * @param {*} descriptor The descriptor to check.
   * @param {*} schemaPath The path of the descriptor within the schema.
   * @param {*} descriptorProperties The properties on the indexed descriptors, whose values should be collected.
   * @param {IndexingResult} indexingResult The indexing result.
   */
  static checkDescriptor(
    descriptor,
    schemaPath,
    descriptorProperties,
    indexingResult
  ) {
    if (descriptor.indexAs) {
      // if the descriptor is marked with the 'indexAs' property, index it
      for (let index of descriptor.indexAs) {
        // create the index if it doesn't already exist
        indexingResult.addIndex(index);

        // collect the relevant descriptor properties
        let data = {};
        for (let property of descriptorProperties) {
          data[property] = descriptor[property];
        }

        // store the result
        indexingResult.addResult(index, schemaPath, data);
      }
    }
    if (descriptor.type === 'array') {
      // if this is an array descriptor, check the descriptor of the array items
      let itemsSchemaPath = JSONPath.copy(schemaPath);
      itemsSchemaPath.addPathSegment(null);

      SchemaIndexer.checkDescriptor(
        descriptor.items,
        itemsSchemaPath,
        descriptorProperties,
        indexingResult
      );
    }
    if (descriptor.type === 'object') {
      // if this is an object descriptor, check the descriptors of the object properties
      for (let property in descriptor.properties) {
        let propertySchemaPath = JSONPath.copy(schemaPath);
        propertySchemaPath.addPathSegment(property);

        SchemaIndexer.checkDescriptor(
          descriptor.properties[property],
          propertySchemaPath,
          descriptorProperties,
          indexingResult
        );
      }
    }
  }

  /**
   * Returns the paths of descriptors marked with the 'indexAs' property, and optionally, the values of relevant properties on the indexed descriptors.
   * @param {Object} schema The schema to index.
   * @param {string[]} [descriptorProperties] The properties on the indexed descriptors, whose values should be collected.
   * @return {IndexingResult} The indexing result.
   */
  static index(schema, descriptorProperties) {
    let schemaPath = new JSONPath();
    let indexingResult = new IndexingResult();
    SchemaIndexer.checkDescriptor(
      schema,
      schemaPath,
      descriptorProperties,
      indexingResult
    );
    return indexingResult;
  }

}

module.exports = SchemaIndexer;
