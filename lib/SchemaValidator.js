const Util = require('./Util');

class SchemaValidator {
  /**
   * Checks a descriptor for compliance with the Aniame schema spec.
   * @param {Object} schemaDescriptor The descriptor to check.
   * @param {string[]} [schemaNames] The names of other schemas that might be referenced with the 'ref' type.
   * @return {boolean} The validation result.
   */
  static checkDescriptor(schemaDescriptor, schemaNames) {
    if (schemaDescriptor == null || !(schemaDescriptor instanceof Object)) {
      // check that the descriptor is an object
      return false;
    }

    if (
      !['string', 'number', 'boolean', 'object', 'array', 'ref'].includes(schemaDescriptor.type)
    ) {
      // check that the descriptor has a known type
      return false;
    }

    if (
      schemaDescriptor.required !== undefined &&
      typeof schemaDescriptor.required !== 'boolean'
    ) {
      // if the 'required' property is present, check that it is a boolean
      return false;
    }

    if (
      schemaDescriptor.indexAs !== undefined &&
      !(schemaDescriptor.indexAs instanceof Array)
    ) {
      // if the 'indexAs' property is present, check that it is an array of strings
      for (let index of schemaDescriptor.indexAs) {
        if (typeof index !== 'string') {
          return false;
        }
      }
    }

    if (schemaDescriptor.type === 'array') {
      if (
        !Util.checkPossibleKeys(schemaDescriptor, [
          'type',
          'indexAs',
          'required',
          'items'
        ])
      ) {
        // check that the descriptor has only permitted keys
        return false;
      }
      if (
        !SchemaValidator.checkDescriptor(schemaDescriptor.items, schemaNames)
      ) {
        // check the descriptor of the items of the array
        return false;
      }
    } else if (schemaDescriptor.type === 'object') {
      if (
        !Util.checkPossibleKeys(schemaDescriptor, [
          'type',
          'indexAs',
          'required',
          'properties'
        ])
      ) {
        // check that the descriptor has only permitted keys
        return false;
      }
      if (
        schemaDescriptor.properties == null ||
        schemaDescriptor.properties.constructor !== Object
      ) {
        // check that the 'properties' property is an object
        return false;
      }
      for (let key in schemaDescriptor.properties) {
        // check the descriptor of the properties of the object
        if (
          !SchemaValidator.checkDescriptor(
            schemaDescriptor.properties[key],
            schemaNames
          )
        ) {
          return false;
        }
      }
    } else if (schemaDescriptor.type === 'ref') {
      if (
        !Util.checkPossibleKeys(schemaDescriptor, [
          'type',
          'indexAs',
          'required',
          'ref'
        ])
      ) {
        // check that the descriptor has only permitted keys
        return false;
      }
      if (typeof schemaDescriptor.ref !== 'string') {
        // check that the 'ref' property is a string
        return false;
      }
      if (!schemaNames.includes(schemaDescriptor.ref)) {
        // check that the referenced schema is valid
        return false;
      }
    } else if (
      !Util.checkPossibleKeys(schemaDescriptor, ['type', 'indexAs', 'required'])
    ) {
      // for string, number, boolean types, check that the descriptor has only permitted keys
      return false;
    }

    return true;
  }

  /**
   * Checks a schema for compliance with the Aniame schema spec.
   * @param {Object} schema The schema to check.
   * @param {string[]} [schemaNames] The names of other schemas that might be referenced with the 'ref' type.
   * @return {boolean} The validation result.
   */
  static validateSchema(schema, schemaNames) {
    return SchemaValidator.checkDescriptor(schema, schemaNames);
  }
}

module.exports = SchemaValidator;
