const TraversalEngine = require('./TraversalEngine');

class ResourceValidator {

  static async validateNode(data, node, nodePath, descriptor) {
    if (descriptor.type === 'array') {
      if (!(node instanceof Array)) {
        data.errorPaths.push(nodePath);
      }
    } else if (descriptor.type === 'object') {
      if (!(node instanceof Object)) {
        data.errorPaths.push(nodePath);
      } else {
        if (data.enforceRequired) {
          for (let property in descriptor.properties) {
            if (
              descriptor.properties[property].required &&
              node[property] === undefined
            ) {
              let propertyPath = nodePath.slice();
              propertyPath.push(property);
              data.errorPaths.push(propertyPath);
            }
          }
        }
        for (let property in node) {
          if (descriptor.properties[property] === undefined) {
            let propertyPath = nodePath.slice();
            propertyPath.push(property);
            data.errorPaths.push(propertyPath);
          }
        }
      }
    } else if (descriptor.type === 'ref') {
      if (data.refCallback) {
        let callbackResult = await data.refCallback(node, descriptor.ref);
        if (callbackResult === 'valid') {
          return 'stop';
        }
        if (callbackResult === 'invalid') {
          data.errorPaths.push(nodePath);
          return 'stop';
        }
      }
    } else if (typeof node !== descriptor.type) {
      data.errorPaths.push(nodePath);
    }
  }

  /**
   * Checks data for compliance with a schema.
   * @param {*} resource The resource to validate.
   * @param {(Object|string)} schema The schema to validate against.
   * @param {Object} [schemas] A object containing relevant schemas.
   * @param {boolean} [enforceRequired=true] Whether to enforce the 'required' keyword.
   * @param {function} [refCallback] A callback for custom validation on references.
   * @return {Promise<JSONPath[]>} The paths where validation errors were found.
   */
  static async validateResource(
    resource,
    schema,
    schemas,
    enforceRequired,
    refCallback
  ) {
    let data = {
      errorPaths: [],
      refCallback
    };
    if (enforceRequired === undefined) {
      data.enforceRequired = true;
    } else {
      data.enforceRequired = enforceRequired;
    }
    await TraversalEngine.traverseResource(
      [ResourceValidator.validateNode],
      data,
      resource,
      schema,
      schemas
    );
    return data.errorPaths;
  }

}

module.exports = ResourceValidator;
