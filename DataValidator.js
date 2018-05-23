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
          let elementDataPath = dataPath.slice();
          elementDataPath.push(i);
          await DataValidator.checkNode(
            schemas,
            schemaNode.elements,
            dataNode[i],
            elementDataPath,
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
          for (let key in schemaNode.children) {
            if (
              schemaNode.children[key].required &&
              dataNode[key] === undefined
            ) {
              let errorPath = dataPath.slice();
              errorPath.push(key);
              validationResult.addErrorPath(errorPath);
            }
          }
        }
        for (let key in dataNode) {
          if (schemaNode.children[key] === undefined) {
            let errorPath = dataPath.slice();
            errorPath.push(key);
            validationResult.addErrorPath(errorPath);
          } else {
            let childDataPath = dataPath.slice();
            childDataPath.push(key);
            await DataValidator.checkNode(
              schemas,
              schemaNode.children[key],
              dataNode[key],
              childDataPath,
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
    let validationResult = new ValidationResult();
    await DataValidator.checkNode(
      schemas,
      schemas[model],
      data,
      [],
      checkRequired,
      checkRefCallback,
      validationResult
    );
    return validationResult;
  }
}

module.exports = DataValidator;
