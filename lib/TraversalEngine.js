const { JSONPath } = require('acamani');

class TraversalEngine {

  /**
   * Runs on nodes of the resource that match a descriptor from the schema.
   * @param {*} callbacks An array of functions to call on the node.
   * @param {*} data An accumulator, made available to each callback throughout the traversal.
   * @param {*} node The node being visited.
   * @param {*} nodePath The path of the node within the resource.
   * @param {*} descriptor The matching schema descriptor.
   * @param {*} schemas An object containing relevant schemas.
   */
  static async visitNode(callbacks, data, node, nodePath, descriptor, schemas) {
    let shouldVisitChildNodes = true;
    for (let callback of callbacks) {
      if ((await callback(data, node, nodePath, descriptor)) === 'stop') {
        shouldVisitChildNodes = false;
      }
    }
    if (shouldVisitChildNodes) {
      if (descriptor.type === 'array') {
        if (node instanceof Array) {
          for (let i = 0; i < node.length; i += 1) {
            let itemPath = nodePath.slice();
            itemPath.push(i);
            await TraversalEngine.visitNode(
              callbacks,
              data,
              node[i],
              itemPath,
              descriptor.items,
              schemas
            );
          }
        }
      } else if (descriptor.type === 'object') {
        if (node instanceof Object) {
          for (let property in node) {
            if (descriptor.properties[property] !== undefined) {
              let propertyPath = nodePath.slice();
              propertyPath.push(property);
              await TraversalEngine.visitNode(
                callbacks,
                data,
                node[property],
                propertyPath,
                descriptor.properties[property],
                schemas
              );
            }
          }
        }
      } else if (descriptor.type === 'ref') {
        await TraversalEngine.visitNode(
          callbacks,
          data,
          node,
          nodePath.slice(),
          schemas[descriptor.ref],
          schemas
        );
      }
    }
  }

  /**
   * Traverses the resource, running callbacks on each node that matches a descriptor from the schema.
   * @param {*} callbacks An array of functions to run on each node.
   * @param {*} data An accumulator, made available to each callback, on each node.
   * @param {*} resource The resource to traverse.
   * @param {*} schema The schema of the resource.
   * @param {*} schemas An object containing relevant schemas.
   */
  static async traverseResource(callbacks, data, resource, schema, schemas) {
    let rootPath = new JSONPath();
    let descriptor;
    if (typeof schema === 'string') {
      descriptor = schemas[schema];
    } else {
      descriptor = schema;
    }
    await TraversalEngine.visitNode(
      callbacks,
      data,
      resource,
      rootPath,
      descriptor,
      schemas
    );
  }

}

module.exports = TraversalEngine;
