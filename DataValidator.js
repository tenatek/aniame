async function checkNode(
  schemas,
  schemaNode,
  dataNode,
  checkRequired,
  checkRefCallback
) {
  // filters out unknown attributes

  if (schemaNode === undefined) {
    return false;
  }

  // first-level validation

  if (typeof schemaNode.type !== 'string') {
    if (dataNode == null || dataNode.constructor !== Object) {
      return false;
    }
    if (checkRequired) {
      for (let key in schemaNode) {
        if (schemaNode[key].required && dataNode[key] === undefined) {
          return false;
        }
      }
    }
    for (let key in dataNode) {
      if (
        !(await checkNode(
          schemas,
          schemaNode[key],
          dataNode[key],
          checkRequired,
          checkRefCallback
        ))
      ) {
        return false;
      }
    }
  } else if (schemaNode.type === 'array') {
    // handles arrays

    if (dataNode == null || dataNode.constructor !== Array) {
      return false;
    }
    for (let element of dataNode) {
      if (
        !(await checkNode(
          schemas,
          schemaNode.elements,
          element,
          true,
          checkRefCallback
        ))
      ) {
        return false;
      }
    }
  } else if (schemaNode.type === 'object') {
    // handles objects

    if (dataNode == null || dataNode.constructor !== Object) {
      return false;
    }
    if (checkRequired) {
      for (let key in schemaNode.children) {
        if (schemaNode.children[key].required && dataNode[key] === undefined) {
          return false;
        }
      }
    }
    for (let key in dataNode) {
      if (
        !(await checkNode(
          schemas,
          schemaNode.children[key],
          dataNode[key],
          checkRequired,
          checkRefCallback
        ))
      ) {
        return false;
      }
    }
  } else if (schemaNode.type === 'ref') {
    // handles references

    if (
      !(await checkRef(schemas, schemaNode.model, dataNode, checkRefCallback))
    ) {
      return false;
    }
  } else if (schemaNode.type === 'file') {
    // handles files

    if (typeof dataNode !== 'string') {
      return false;
    }
  } else if (typeof dataNode !== schemaNode.type) {
    // handles string, number, boolean

    return false;
  }

  return true;
}

async function checkRef(schemas, model, dataNode, checkRefCallback) {
  if (checkRefCallback && (await checkRefCallback(schemas, model, dataNode))) {
    return true;
  }

  if (
    dataNode != null &&
    dataNode.constructor === Object &&
    (await validateData(schemas, model, dataNode, true))
  ) {
    return true;
  }

  return false;
}

async function validateData(
  schemas,
  model,
  data,
  checkRequired,
  checkRefCallback
) {
  return checkNode(
    schemas,
    schemas[model],
    data,
    checkRequired,
    checkRefCallback
  );
}

module.exports = { validateData };
