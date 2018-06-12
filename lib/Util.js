class Util {

  /**
   * Compares an object's first-level properties with an array of strings.
   * @param {Object} object The object to test.
   * @param {string[]} possibleProperties The properties that the object may have.
   * @return {boolean} Whether all the object's first-level properties are in the array.
   */
  static checkPossibleProperties(object, possibleProperties) {
    for (let key in object) {
      if (!possibleProperties.includes(key)) {
        return false;
      }
    }
    return true;
  }

}

module.exports = Util;
