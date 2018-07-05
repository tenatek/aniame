class IndexingResult {

  /**
   * Adds a new index if it doesn't already exist.
   * @param {string} index The index to add.
   */
  addIndex(index) {
    if (!this[index]) {
      this[index] = [];
    }
  }

  /**
   * Adds the path and, optionally, the relevant data, of a descriptor to the appropriate index.
   * @param {string} index The index that the descriptor should be added to.
   * @param {JSONPath} path The path of the descriptor.
   * @param {Object} data The descriptor's relevant data.
   */
  addResult(index, path, data) {
    this[index].push({
      path,
      data
    });
  }

}

module.exports = IndexingResult;
