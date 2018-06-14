class JSONPath {

  constructor() {
    this.pathAsArray = [];
  }

  /**
   * Adds a new segment to the path.
   * @param {(string|number)} segment The segment to add.
   * @return {JSONPath} The updated JSONPath object.
   */
  addPathSegment(segment) {
    this.pathAsArray.push(segment);
    return this;
  }

  /**
   * Converts the path to a JSON pointer, as defined in RFC 6901.
   * @return {string} The path as a JSON pointer.
   */
  pathAsPointer() {
    return `/${this.pathAsArray.join('/')}`;
  }

  /**
   * Resolves the path within a given object.
   * @param {*} object The object in which to resolve the path.
   * @return {*} The resulting value, an array of resulting values, or null.
   */
  resolve(object) {
    let nodes = [object];
    for (let segment of this.pathAsArray) {
      let n = nodes.length;
      for (let i = 0; i < n; i++) {
        let node = nodes.pop();
        if (segment === null && node instanceof Array) {
          nodes.unshift(...node);
        } else {
          if (node instanceof Object) {
            nodes.unshift(node[segment]);
          }
        }
      }
    }
    nodes = nodes.filter(node => {
      return node !== undefined;
    });
    if (nodes.length === 0) {
      return null;
    }
    if (nodes.length === 1) {
      return nodes[0];
    }
    return nodes;
  }

  /**
   * Returns a copy of a JSONPath object.
   * @param {JSONPath} jsonPath The JSONPath object to copy.
   * @returns {JSONPath} A copy of the JSONPath object passed as a param.
   */
  static copy(jsonPath) {
    let jsonPathCopy = new JSONPath();
    jsonPathCopy.pathAsArray = jsonPath.pathAsArray.slice();
    return jsonPathCopy;
  }

}

module.exports = JSONPath;
