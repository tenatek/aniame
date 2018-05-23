class ValidationResult {
  constructor() {
    this.success = true;
    this.errorPaths = [];
  }

  addErrorPath(path) {
    this.success = false;
    this.errorPaths.push(path);
  }
}

module.exports = ValidationResult;
