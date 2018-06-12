class ValidationResult {

  constructor() {
    this.success = true;
    this.errorPaths = [];
  }

  /**
   * Adds an error path to the list of error paths.
   * @param {JSONPath} path The error path to add.
   */
  addErrorPath(path) {
    this.success = false;
    this.errorPaths.push(path);
  }

  /**
   * Returns the error paths as an array of arrays.
   * @return {string[][]} An array of paths, each path being represented by an array of strings, each string being the name of a property of an object along the path.
   */
  getErrorPathsAsArrays() {
    return this.errorPaths.map(errorPath => {
      return errorPath.pathAsArray;
    });
  }

  /**
   * Returns the error paths as an array of JSON pointers, as defined in RFC 6901.
   * @return {string[]} An array of JSON pointers.
   */
  getErrorPathsAsPointers() {
    return this.errorPaths.map(errorPath => {
      return errorPath.pathAsPointer();
    });
  }

}

module.exports = ValidationResult;
