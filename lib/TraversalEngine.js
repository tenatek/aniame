const { JSONPath } = require('acamani');

class TraversalEngine {

  /**
   * Runs on nodes of the resource that match a descriptor from the schema.
   * @param {*} callbacks An array of functions to call on the node.
   * @param {*} node The node being visited.
   * @param {*} nodePath The path of the node within the resource.
   * @param {*} descriptor The matching schema descriptor.
   * @param {*} schemas An object containing relevant schemas.
   * @param {*} data An accumulator, made available to each callback throughout the traversal.
   */
  static async visitNode(callbacks, node, nodePath, descriptor, schemas, data) {
    let shouldVisitChildNodes = true;
    for (let callback of callbacks) {
      if ((await callback(node, nodePath, descriptor, data)) === 'stop') {
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
              node[i],
              itemPath,
              descriptor.items,
              schemas,
              data
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
                node[property],
                propertyPath,
                descriptor.properties[property],
                schemas,
                data
              );
            }
          }
        }
      } else if (descriptor.type === 'ref') {
        await TraversalEngine.visitNode(
          callbacks,
          node,
          nodePath.slice(),
          schemas[descriptor.ref],
          schemas,
          data
        );
      }
    }
  }

  /**
   * Traverses the resource, running callbacks on each node that matches a descriptor from the schema.
   * @param {*} callbacks An array of functions to run on each node.
   * @param {*} resource The resource to traverse.
   * @param {*} schema The schema of the resource.
   * @param {*} schemas An object containing relevant schemas.
   * @param {*} data An accumulator, made available to each callback, on each node.
   */
  static async traverseResource(callbacks, resource, schema, schemas, data) {
    let rootPath = new JSONPath();
    let descriptor;
    if (typeof schema === 'string') {
      descriptor = schemas[schema];
    } else {
      descriptor = schema;
    }
    await TraversalEngine.visitNode(
      callbacks,
      resource,
      rootPath,
      descriptor,
      schemas,
      data
    );
  }

}

module.exports = TraversalEngine;
