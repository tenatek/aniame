const JSONPath = require('./JSONPath');
const ValidationResult = require('./ValidationResult');

class DataValidator {
  static async checkNode(
    schemas,
    schemaNode,
    dataNode,
    dataPath,
    checkRequired,
    checkRefCallback,
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
            schemas,
            schemaNode.items,
            dataNode[i],
            itemDataPath,
            true,
            checkRefCallback,
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
              schemas,
              schemaNode.properties[key],
              dataNode[key],
              propertyDataPath,
              checkRequired,
              checkRefCallback,
              validationResult
            );
          }
        }
      }
    } else if (schemaNode.type === 'ref') {
      // handles references
      if (checkRefCallback) {
        if (!(await checkRefCallback(schemas, schemaNode.model, dataNode))) {
          validationResult.addErrorPath(dataPath);
        }
      } else {
        await DataValidator.checkNode(
          schemas,
          schemas[schemaNode.model],
          dataNode,
          dataPath,
          checkRequired,
          checkRefCallback,
          validationResult
        );
      }
    } else if (typeof dataNode !== schemaNode.type) {
      // handles string, number, boolean
      validationResult.addErrorPath(dataPath);
    }
  }

  static async validateData(
    schemas,
    model,
    data,
    checkRequired,
    checkRefCallback
  ) {
    let dataPath = new JSONPath();
    let validationResult = new ValidationResult();
    await DataValidator.checkNode(
      schemas,
      schemas[model],
      data,
      dataPath,
      checkRequired,
      checkRefCallback,
      validationResult
    );
    return validationResult;
  }
}

module.exports = DataValidator;
