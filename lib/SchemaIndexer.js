const JSONPath = require('./JSONPath');

class SchemaIndexer {
  static checkNode(indexes, dataKeys, schemaNode, schemaPath, indexingResults) {
    if (indexes.includes(schemaNode.indexAs)) {
      let result = {
        path: schemaPath,
        data: {}
      };
      for (let key of dataKeys) {
        result.data[key] = schemaNode[key];
      }
      indexingResults[schemaNode.indexAs].push(result);
    }
    if (schemaNode.type === 'array') {
      let itemsSchemaPath = JSONPath.copy(schemaPath);
      itemsSchemaPath.addPathSegment(null);
      SchemaIndexer.checkNode(
        indexes,
        dataKeys,
        schemaNode.items,
        itemsSchemaPath,
        indexingResults
      );
    }
    if (schemaNode.type === 'object') {
      for (let property in schemaNode.properties) {
        let propertySchemaPath = JSONPath.copy(schemaPath);
        propertySchemaPath.addPathSegment(property);
        SchemaIndexer.checkNode(
          indexes,
          dataKeys,
          schemaNode.properties[property],
          propertySchemaPath,
          indexingResults
        );
      }
    }
  }

  static index(schema, indexes, dataKeys) {
    let schemaPath = new JSONPath();
    let indexingResults = {};
    for (let index of indexes) {
      indexingResults[index] = [];
    }
    SchemaIndexer.checkNode(
      indexes,
      dataKeys,
      schema,
      schemaPath,
      indexingResults
    );
    return indexingResults;
  }
}

module.exports = SchemaIndexer;
