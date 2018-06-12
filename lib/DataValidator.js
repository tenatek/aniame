const JSONPath = require('./JSONPath');
const ValidationResult = require('./ValidationResult');

class DataValidator {

  /**
   * Checks a data node for compliance with a schema.
   * @param {*} dataNode The data node to validate.
   * @param {JSONPath} dataPath The path of the data node within the data.
   * @param {Object} descriptor The applicable descriptor.
   * @param {Object} schemaDictionary A dictionary of all relevant schemas.
   * @param {boolean} checkRequired Whether to enforce the 'required' keyword.
   * @param {function} refCallback A callback for custom validation on references.
   * @param {ValidationResult} validationResult The validation result.
   * @return {Promise<void>}
   */
  static async checkNode(
    dataNode,
    dataPath,
    descriptor,
    schemaDictionary,
    checkRequired,
    refCallback,
    validationResult
  ) {
    if (descriptor.type === 'array') {
      if (dataNode == null || !(dataNode instanceof Array)) {
        // check that the node is an array
        validationResult.addErrorPath(dataPath);
      } else {
        // check each array item
        for (let i = 0; i < dataNode.length; i += 1) {
          let itemDataPath = JSONPath.copy(dataPath);
          itemDataPath.addPathSegment(i);
          await DataValidator.checkNode(
            dataNode[i],
            itemDataPath,
            descriptor.items,
            schemaDictionary,
            true,
            refCallback,
            validationResult
          );
        }
      }
    } else if (descriptor.type === 'object') {
      if (dataNode == null || !(dataNode instanceof Object)) {
        // check that the node is an object
        validationResult.addErrorPath(dataPath);
      } else {
        if (checkRequired) {
          // if the flag is so set, check that each required property is present on the object
          for (let key in descriptor.properties) {
            if (
              descriptor.properties[key].required &&
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

          if (descriptor.properties[key] === undefined) {
            // check for unknown properties on the object
            validationResult.addErrorPath(propertyDataPath);
          } else {
            // check each property on the object
            await DataValidator.checkNode(
              dataNode[key],
              propertyDataPath,
              descriptor.properties[key],
              schemaDictionary,
              checkRequired,
              refCallback,
              validationResult
            );
          }
        }
      }
    } else if (descriptor.type === 'ref') {
      if (refCallback) {
        // if provided, check the node with 'refCallback'
        if (!(await refCallback(dataNode, descriptor.ref, schemaDictionary))) {
          validationResult.addErrorPath(dataPath);
        }
      } else {
        // check the node against the appropriate schema
        await DataValidator.checkNode(
          dataNode,
          dataPath,
          schemaDictionary[descriptor.ref],
          schemaDictionary,
          checkRequired,
          refCallback,
          validationResult
        );
      }
    } else if (typeof dataNode !== descriptor.type) {
      // check number, string and boolean nodes
      validationResult.addErrorPath(dataPath);
    }
  }

  /**
   * Checks data for compliance with a schema.
   * @param {*} data The data to validate.
   * @param {(Object|string)} schema The schema to validate against.
   * @param {Object} [schemaDictionary] A dictionary of all relevant schemas.
   * @param {boolean} [checkRequired=true] Whether to enforce the 'required' keyword.
   * @param {function} [refCallback] A callback for custom validation on references.
   * @return {Promise<ValidationResult>} The validation result.
   */
  static async validateData(
    data,
    schema,
    schemaDictionary,
    checkRequired,
    refCallback
  ) {
    let dataPath = new JSONPath();
    let validationResult = new ValidationResult();
    let descriptor;
    if (typeof schema === 'string') {
      descriptor = schemaDictionary[schema];
    } else {
      descriptor = schema;
    }
    await DataValidator.checkNode(
      data,
      dataPath,
      descriptor,
      schemaDictionary,
      checkRequired === undefined ? true : checkRequired,
      refCallback,
      validationResult
    );
    return validationResult;
  }

}

module.exports = DataValidator;
