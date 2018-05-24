class ValidationResult {
  constructor() {
    this.success = true;
    this.errorPaths = [];
  }

  addErrorPath(path) {
    this.success = false;
    this.errorPaths.push(path);
  }

  getErrorPathsAsArrays() {
    return this.errorPaths.map((errorPath) => {
      return errorPath.pathAsArray;
    });
  }

  getErrorPathsAsPointers() {
    return this.errorPaths.map((errorPath) => {
      return errorPath.pathAsPointer();
    });
  }
}

module.exports = ValidationResult;
