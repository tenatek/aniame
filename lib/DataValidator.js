const { JSONPath } = require('acamani');

class DataValidator {

  /**
   * Checks a data node for compliance with a schema.
   * @param {*} dataNode The data node to validate.
   * @param {JSONPath} dataPath The path of the data node within the data.
   * @param {Object} descriptor The applicable descriptor.
   * @param {Object} schemaDictionary A dictionary of all relevant schemas.
   * @param {boolean} enforceRequired Whether to enforce the 'required' keyword.
   * @param {function} refCallback A callback for custom validation on references.
   * @param {JSONPath[]} errorPaths An empty array.
   * @return {Promise<void>}
   */
  static async checkNode(
    dataNode,
    dataPath,
    descriptor,
    schemaDictionary,
    enforceRequired,
    refCallback,
    errorPaths
  ) {
    if (descriptor.type === 'array') {
      if (!(dataNode instanceof Array)) {
        // check that the node is an array
        errorPaths.push(dataPath);
      } else {
        // check each array item
        for (let i = 0; i < dataNode.length; i += 1) {
          let itemDataPath = dataPath.slice();
          itemDataPath.push(i);
          await DataValidator.checkNode(
            dataNode[i],
            itemDataPath,
            descriptor.items,
            schemaDictionary,
            true,
            refCallback,
            errorPaths
          );
        }
      }
    } else if (descriptor.type === 'object') {
      if (!(dataNode instanceof Object)) {
        // check that the node is an object
        errorPaths.push(dataPath);
      } else {
        if (enforceRequired) {
          // if the flag is so set, check that each required property is present on the object
          for (let key in descriptor.properties) {
            if (
              descriptor.properties[key].required &&
              dataNode[key] === undefined
            ) {
              let propertyDataPath = dataPath.slice();
              propertyDataPath.push(key);
              errorPaths.push(propertyDataPath);
            }
          }
        }
        for (let key in dataNode) {
          let propertyDataPath = dataPath.slice();
          propertyDataPath.push(key);

          if (descriptor.properties[key] === undefined) {
            // check for unknown properties on the object
            errorPaths.push(propertyDataPath);
          } else {
            // check each property on the object
            await DataValidator.checkNode(
              dataNode[key],
              propertyDataPath,
              descriptor.properties[key],
              schemaDictionary,
              enforceRequired,
              refCallback,
              errorPaths
            );
          }
        }
      }
    } else if (descriptor.type === 'ref') {
      if (refCallback) {
        // if provided, check the node with 'refCallback'
        let callbackResult = await refCallback(
          dataNode,
          descriptor.ref,
          schemaDictionary
        );
        if (callbackResult === false) {
          errorPaths.push(dataPath);
        } else if (callbackResult === null) {
          // check the node against the appropriate schema
          await DataValidator.checkNode(
            dataNode,
            dataPath,
            schemaDictionary[descriptor.ref],
            schemaDictionary,
            enforceRequired,
            refCallback,
            errorPaths
          );
        }
      } else {
        // check the node against the appropriate schema
        await DataValidator.checkNode(
          dataNode,
          dataPath,
          schemaDictionary[descriptor.ref],
          schemaDictionary,
          enforceRequired,
          refCallback,
          errorPaths
        );
      }
    } else if (typeof dataNode !== descriptor.type) {
      // check number, string and boolean nodes
      errorPaths.push(dataPath);
    }
  }

  /**
   * Checks data for compliance with a schema.
   * @param {*} data The data to validate.
   * @param {(Object|string)} schema The schema to validate against.
   * @param {Object} [schemaDictionary] A dictionary of all relevant schemas.
   * @param {boolean} [enforceRequired=true] Whether to enforce the 'required' keyword.
   * @param {function} [refCallback] A callback for custom validation on references.
   * @return {Promise<JSONPath[]>} The paths where validation errors were found.
   */
  static async validateData(
    data,
    schema,
    schemaDictionary,
    enforceRequired,
    refCallback
  ) {
    let dataPath = new JSONPath();
    let errorPaths = [];

    let descriptor;
    if (typeof schema === 'string') {
      descriptor = schemaDictionary[schema];
    } else {
      descriptor = schema;
    }

    let enforceRequiredWithDefault;
    if (enforceRequired === undefined) {
      enforceRequiredWithDefault = true;
    } else {
      enforceRequiredWithDefault = enforceRequired;
    }

    await DataValidator.checkNode(
      data,
      dataPath,
      descriptor,
      schemaDictionary,
      enforceRequiredWithDefault,
      refCallback,
      errorPaths
    );
    return errorPaths;
  }

}

module.exports = DataValidator;
