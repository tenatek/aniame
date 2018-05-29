const Util = require('./Util');

class SchemaValidator {
  static checkNode(schemaNode, pendingModels) {
    if (schemaNode == null || schemaNode.constructor !== Object) {
      // check that the node is an object
      return false;
    }

    if (
      !['string', 'number', 'boolean', 'object', 'array', 'ref'].includes(schemaNode.type)
    ) {
      // check that the node has a known type
      return false;
    }

    if (
      schemaNode.required !== undefined &&
      typeof schemaNode.required !== 'boolean'
    ) {
      // if the 'required' property is present, check that it is a boolean
      return false;
    }

    if (
      schemaNode.indexAs !== undefined &&
      schemaNode.indexAs.constructor !== Array
    ) {
      // if the 'indexAs' property is present, check that it is an array of strings
      for (let index of schemaNode.indexAs) {
        if (typeof index !== 'string') {
          return false;
        }
      }
    }

    // do validation based on the node type

    if (schemaNode.type === 'array') {
      // handles array types

      if (
        !Util.checkPossibleKeys(schemaNode, [
          'type',
          'indexAs',
          'required',
          'items'
        ])
      ) {
        // check that the node has only permitted keys
        return false;
      }
      if (!SchemaValidator.checkNode(schemaNode.items, pendingModels)) {
        // check members of the array
        return false;
      }
    } else if (schemaNode.type === 'object') {
      // handles object types

      if (
        !Util.checkPossibleKeys(schemaNode, [
          'type',
          'indexAs',
          'required',
          'properties'
        ])
      ) {
        // check that the node has only permitted keys
        return false;
      }
      if (
        schemaNode.properties == null ||
        schemaNode.properties.constructor !== Object
      ) {
        // check that the 'properties' property is an object
        return false;
      }
      for (let key in schemaNode.properties) {
        // check properties of the object
        if (
          !SchemaValidator.checkNode(schemaNode.properties[key], pendingModels)
        ) {
          return false;
        }
      }
    } else if (schemaNode.type === 'ref') {
      // handles references

      if (
        !Util.checkPossibleKeys(schemaNode, [
          'type',
          'indexAs',
          'required',
          'model'
        ])
      ) {
        // check that the node has only permitted keys
        return false;
      }
      if (typeof schemaNode.model !== 'string') {
        // check that the 'model' property is a string
        return false;
      }
      if (!pendingModels.includes(schemaNode.model)) {
        // check that the referenced model is either part of the schema or pending
        return false;
      }
    } else if (
      !Util.checkPossibleKeys(schemaNode, ['type', 'indexAs', 'required'])
    ) {
      // handles string, number, boolean types
      return false;
    }

    return true;
  }

  static validateSchema(schema, pendingModels) {
    return SchemaValidator.checkNode(schema, pendingModels);
  }
}

module.exports = SchemaValidator;
