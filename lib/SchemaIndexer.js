const JSONPath = require('./JSONPath');

class SchemaIndexer {
  static checkNode(dataKeys, schemaNode, schemaPath, indexingResults) {
    if (schemaNode.indexAs) {
      for (let index of schemaNode.indexAs) {
        if (!indexingResults[index]) {
          indexingResults[index] = [];
        }
        let result = {
          path: schemaPath,
          data: {}
        };
        for (let key of dataKeys) {
          result.data[key] = schemaNode[key];
        }
        indexingResults[index].push(result);
      }
    }
    if (schemaNode.type === 'array') {
      let itemsSchemaPath = JSONPath.copy(schemaPath);
      itemsSchemaPath.addPathSegment(null);
      SchemaIndexer.checkNode(
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
          dataKeys,
          schemaNode.properties[property],
          propertySchemaPath,
          indexingResults
        );
      }
    }
  }

  static index(schema, dataKeys) {
    let schemaPath = new JSONPath();
    let indexingResults = {};
    SchemaIndexer.checkNode(dataKeys, schema, schemaPath, indexingResults);
    return indexingResults;
  }
}

module.exports = SchemaIndexer;
