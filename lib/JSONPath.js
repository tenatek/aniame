class JSONPath {
  constructor() {
    this.pathAsArray = [];
  }

  /**
   * Adds a new segment to the path.
   * @param {(string|number)} segment The segment to add.
   */
  addPathSegment(segment) {
    this.pathAsArray.push(segment);
  }

  /**
   * Converts the path to a JSON pointer.
   * @return {string} The path as a JSON pointer.
   */
  pathAsPointer() {
    return `/${this.pathAsArray.join('/')}`;
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
