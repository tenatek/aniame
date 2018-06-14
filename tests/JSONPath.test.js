const JSONPath = require('../lib/JSONPath');

test('accesses the right node in a simple object', () => {
  expect.assertions(1);
  let path = new JSONPath()
    .addPathSegment('a')
    .addPathSegment('b')
    .addPathSegment(0)
    .addPathSegment('c');
  let object = {
    a: {
      b: [
        {
          c: {
            d: 1
          }
        }
      ]
    }
  };
  let result = path.resolve(object);
  expect(result).toEqual({ d: 1 });
});

test('accesses various nodes in an array', () => {
  expect.assertions(1);
  let path = new JSONPath()
    .addPathSegment('a')
    .addPathSegment('b')
    .addPathSegment(null)
    .addPathSegment('c');
  let object = {
    a: {
      b: [
        {
          c: {
            d: 1
          }
        },
        {
          c: {
            e: 2
          }
        }
      ]
    }
  };
  let result = path.resolve(object);
  expect(result).toEqual([{ d: 1 }, { e: 2 }]);
});

test('handles dead ends appropriately', () => {
  expect.assertions(1);
  let path = new JSONPath()
    .addPathSegment('a')
    .addPathSegment('b')
    .addPathSegment(null)
    .addPathSegment('c');
  let object = {
    a: {
      b: [
        {
          c: {
            d: 1
          }
        },
        {
          e: 3
        }
      ]
    }
  };
  let result = path.resolve(object);
  expect(result).toEqual({ d: 1 });
});

test('handles nested arrays appropriately', () => {
  expect.assertions(1);
  let path = new JSONPath()
    .addPathSegment('a')
    .addPathSegment('b')
    .addPathSegment(null)
    .addPathSegment('c')
    .addPathSegment(null);
  let object = {
    a: {
      b: [
        {
          c: [
            {
              d: 1
            }
          ]
        },
        {
          c: [
            {
              e: 2
            },
            {
              f: 3
            }
          ]
        }
      ]
    }
  };
  let result = path.resolve(object);
  expect(result).toEqual([{ d: 1 }, { e: 2 }, { f: 3 }]);
});

test('handles illegal paths appropriately', () => {
  expect.assertions(1);
  let path = new JSONPath()
    .addPathSegment('a')
    .addPathSegment('b')
    .addPathSegment(null)
    .addPathSegment('c')
    .addPathSegment(null);
  let object = {
    a: {
      b: [
        {
          c: {
            d: 1
          }
        },
        {
          c: [
            {
              e: 2
            },
            {
              f: 3
            }
          ]
        }
      ]
    }
  };
  let result = path.resolve(object);
  expect(result).toEqual([{ e: 2 }, { f: 3 }]);
});

test('replaces values on the object', () => {
  expect.assertions(2);
  let path = new JSONPath()
    .addPathSegment('a')
    .addPathSegment('b')
    .addPathSegment(null)
    .addPathSegment('c')
    .addPathSegment(null)
    .addPathSegment('e');
  let object = {
    a: {
      b: [
        {
          c: {
            d: 1
          }
        },
        {
          c: [{ e: 3 }, { e: 4 }]
        }
      ]
    }
  };
  let result = path.resolve(object, result => {
    return result + 1;
  });
  expect(result).toEqual([4, 5]);
  expect(object).toEqual({
    a: {
      b: [
        {
          c: {
            d: 1
          }
        },
        {
          c: [{ e: 4 }, { e: 5 }]
        }
      ]
    }
  });
});

test('replaces values in arrays', () => {
  expect.assertions(2);
  let path = new JSONPath().addPathSegment(null);
  let object = [1, 2, 3];
  let result = path.resolve(object, result => {
    return result + 1;
  });
  expect(result).toEqual([2, 3, 4]);
  expect(object).toEqual([2, 3, 4]);
});
