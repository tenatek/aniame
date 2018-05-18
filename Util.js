function checkPossibleKeys(object, possibleKeys) {
  for (let key in object) {
    if (!possibleKeys.includes(key)) return false;
  }
  return true;
}

module.exports = { checkPossibleKeys };