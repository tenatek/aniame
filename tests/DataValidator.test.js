const DataValidator = require('../DataValidator');

const schemas = {
  person: {
    type: 'object',
    children: {
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
        elements: {
          type: 'object',
          children: {
            name: {
              type: 'object',
              children: {
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
              model: 'race'
            }
          }
        }
      }
    }
  },
  race: {
    type: 'object',
    children: {
      name: {
        type: 'string',
        required: true
      },
      classification: {
        type: 'number',
        required: true
      }
    }
  }
};

test('unknown attributes are rejected', async () => {
  expect.assertions(2);
  let result = await DataValidator.validateData(
    schemas,
    'person',
    {
      name: 'Tim',
      telephone: 123456,
      email: 'blue',
      test: true
    },
    true
  );
  expect(result.success).toBe(false);
  expect(result.errorPaths).toEqual([['test']]);
});

test('optional attributes can be omitted', async () => {
  expect.assertions(1);
  let result = await DataValidator.validateData(
    schemas,
    'person',
    {
      name: 'Tim',
      email: 'blue'
    },
    true
  );
  expect(result.success).toBe(true);
});

test('required attributes cannot be omitted', async () => {
  expect.assertions(2);
  let result = await DataValidator.validateData(
    schemas,
    'person',
    {
      name: 'true',
      telephone: 534
    },
    true
  );
  expect(result.success).toBe(false);
  expect(result.errorPaths).toEqual([['email']]);
});

test('types are checked', async () => {
  expect.assertions(2);
  let result = await DataValidator.validateData(
    schemas,
    'person',
    {
      name: true,
      telephone: '534',
      email: 'test'
    },
    true
  );
  expect(result.success).toBe(false);
  expect(result.errorPaths).toEqual([['name'], ['telephone']]);
});

test('array elements are validated', async () => {
  expect.assertions(2);
  let result = await DataValidator.validateData(
    schemas,
    'person',
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
    true
  );
  expect(result.success).toBe(false);
  expect(result.errorPaths).toEqual([['pets', 1]]);
});

test('nested objects are validated', async () => {
  expect.assertions(2);
  let result = await DataValidator.validateData(
    schemas,
    'person',
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
    true
  );
  expect(result.success).toBe(false);
  expect(result.errorPaths).toEqual([['pets', 1, 'name'], ['pets', 1, 'age']]);
});

test('references can be checked against their schema', async () => {
  expect.assertions(1);
  let result = await DataValidator.validateData(
    schemas,
    'person',
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
    true
  );
  expect(result.success).toBe(true);
});

test('references can be checked with a callback', async () => {
  expect.assertions(2);
  let result = await DataValidator.validateData(
    schemas,
    'person',
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
    true,
    (s, m, d) => {
      if (d === 6) {
        return true;
      }
      return false;
    }
  );
  expect(result.success).toBe(false);
  expect(result.errorPaths).toEqual([['pets', 1, 'race']]);
});
