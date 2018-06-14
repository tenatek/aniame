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
  let result = path.access(object);
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
