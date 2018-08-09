const DataValidator = require('../lib/DataValidator');

const schemas = {
  person: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        required: true
      },
      telephone: {
        type: 'number'
      },
      email: {
        type: 'string',
        required: true
      },
      pets: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: {
              type: 'object',
              properties: {
                first: {
                  type: 'string',
                  required: true
                },
                family: {
                  type: 'string'
                }
              },
              required: true
            },
            race: {
              type: 'ref',
              ref: 'race'
            }
          }
        }
      }
    }
  },
  race: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        required: true
      },
      classification: {
        type: 'number',
        required: true
      }
    }
  },
  string: {
    type: 'string'
  }
};

test('non-objects can be validated', async () => {
  expect.assertions(1);
  let result = await DataValidator.validateData('test', schemas.string);
  expect(result).toEqual([]);
});

test('unknown attributes are rejected', async () => {
  expect.assertions(1);
  let result = await DataValidator.validateData(
    {
      name: 'Tim',
      telephone: 123456,
      email: 'blue',
      test: true
    },
    schemas.person
  );
  expect(result).toEqual([['test']]);
});

test('optional attributes can be omitted', async () => {
  expect.assertions(1);
  let result = await DataValidator.validateData(
    {
      name: 'Tim',
      email: 'blue'
    },
    schemas.person
  );
  expect(result).toEqual([]);
});

test('required attributes cannot be omitted', async () => {
  expect.assertions(1);
  let result = await DataValidator.validateData(
    {
      name: 'true',
      telephone: 534
    },
    schemas.person
  );
  expect(result).toEqual([['email']]);
});

test('types are checked', async () => {
  expect.assertions(1);
  let result = await DataValidator.validateData(
    {
      name: true,
      telephone: '534',
      email: 'test'
    },
    schemas.person
  );
  expect(result).toEqual([['name'], ['telephone']]);
});

test('array items are validated', async () => {
  expect.assertions(1);
  let result = await DataValidator.validateData(
    {
      name: 'true',
      telephone: 534,
      email: 'test',
      pets: [
        {
          name: {
            first: 'tom'
          }
        },
        3
      ]
    },
    schemas.person
  );
  expect(result).toEqual([['pets', 1]]);
});

test('nested objects are validated', async () => {
  expect.assertions(1);
  let result = await DataValidator.validateData(
    {
      name: 'true',
      telephone: 534,
      email: 'test',
      pets: [
        {
          name: {
            first: 'tom'
          }
        },
        {
          age: 3
        }
      ]
    },
    schemas.person
  );
  expect(result).toEqual([['pets', 1, 'name'], ['pets', 1, 'age']]);
});

test('references can be checked against their schema', async () => {
  expect.assertions(1);
  let result = await DataValidator.validateData(
    {
      name: 'true',
      telephone: 534,
      email: 'test',
      pets: [
        {
          name: {
            first: 'tom'
          }
        },
        {
          name: {
            first: 'blue'
          },
          race: {
            name: 'cocker',
            classification: 3
          }
        }
      ]
    },
    'person',
    schemas
  );
  expect(result).toEqual([]);
});

test('references can be checked with a callback', async () => {
  expect.assertions(1);
  let result = await DataValidator.validateData(
    {
      name: 'true',
      telephone: 534,
      email: 'test',
      pets: [
        {
          name: {
            first: 'tom'
          }
        },
        {
          name: {
            first: 'blue'
          },
          race: 5
        }
      ]
    },
    'person',
    schemas,
    true,
    (s, m, d) => {
      if (d === 6) {
        return true;
      }
      return false;
    }
  );
  expect(result).toEqual([['pets', 1, 'race']]);
});

test('callback can return null', async () => {
  expect.assertions(1);
  let result = await DataValidator.validateData(
    {
      name: 'true',
      telephone: 534,
      email: 'test',
      pets: [
        {
          name: {
            first: 'tom'
          }
        },
        {
          name: {
            first: 'blue'
          },
          race: {
            name: 'cocker',
            classification: 3
          }
        }
      ]
    },
    'person',
    schemas,
    true,
    () => {
      return null;
    }
  );
  expect(result).toEqual([]);
});
