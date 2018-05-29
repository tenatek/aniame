const JSONPath = require('./JSONPath');
const ValidationResult = require('./ValidationResult');

class DataValidator {
  static async checkNode(
    dataNode,
    dataPath,
    checkRequired,
    schemaNode,
    otherSchemas,
    refCallback,
    validationResult
  ) {
    if (schemaNode.type === 'array') {
      // handles arrays

      if (dataNode == null || dataNode.constructor !== Array) {
        validationResult.addErrorPath(dataPath);
      } else {
        for (let i = 0; i < dataNode.length; i += 1) {
          let itemDataPath = JSONPath.copy(dataPath);
          itemDataPath.addPathSegment(i);
          await DataValidator.checkNode(
            dataNode[i],
            itemDataPath,
            true,
            schemaNode.items,
            otherSchemas,
            refCallback,
            validationResult
          );
        }
      }
    } else if (schemaNode.type === 'object') {
      // handles objects

      if (dataNode == null || dataNode.constructor !== Object) {
        validationResult.addErrorPath(dataPath);
      } else {
        if (checkRequired) {
          for (let key in schemaNode.properties) {
            if (
              schemaNode.properties[key].required &&
              dataNode[key] === undefined
            ) {
              let propertyDataPath = JSONPath.copy(dataPath);
              propertyDataPath.addPathSegment(key);
              validationResult.addErrorPath(propertyDataPath);
            }
          }
        }
        for (let key in dataNode) {
          let propertyDataPath = JSONPath.copy(dataPath);
          propertyDataPath.addPathSegment(key);

          if (schemaNode.properties[key] === undefined) {
            validationResult.addErrorPath(propertyDataPath);
          } else {
            await DataValidator.checkNode(
              dataNode[key],
              propertyDataPath,
              checkRequired,
              schemaNode.properties[key],
              otherSchemas,
              refCallback,
              validationResult
            );
          }
        }
      }
    } else if (schemaNode.type === 'ref') {
      // handles references
      if (refCallback) {
        if (!(await refCallback(dataNode, schemaNode.model, otherSchemas))) {
          validationResult.addErrorPath(dataPath);
        }
      } else {
        await DataValidator.checkNode(
          dataNode,
          dataPath,
          checkRequired,
          otherSchemas[schemaNode.model],
          otherSchemas,
          refCallback,
          validationResult
        );
      }
    } else if (typeof dataNode !== schemaNode.type) {
      // handles string, number, boolean
      validationResult.addErrorPath(dataPath);
    }
  }

  static async validateData(
    data,
    checkRequired,
    schema,
    otherSchemas,
    refCallback
  ) {
    let dataPath = new JSONPath();
    let validationResult = new ValidationResult();
    let schemaNode;
    if (typeof schema === 'string') {
      schemaNode = otherSchemas[schema];
    } else {
      schemaNode = schema;
    }
    await DataValidator.checkNode(
      data,
      dataPath,
      checkRequired,
      schemaNode,
      otherSchemas,
      refCallback,
      validationResult
    );
    return validationResult;
  }
}

module.exports = DataValidator;
