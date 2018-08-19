const ResourceValidator = require('../lib/ResourceValidator');

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
  let result = await ResourceValidator.validateResource('test', schemas.string);
  expect(result).toEqual([]);
});

test('unknown attributes are rejected', async () => {
  expect.assertions(1);
  let result = await ResourceValidator.validateResource(
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
  let result = await ResourceValidator.validateResource(
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
  let result = await ResourceValidator.validateResource(
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
  let result = await ResourceValidator.validateResource(
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
  let result = await ResourceValidator.validateResource(
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
  let result = await ResourceValidator.validateResource(
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
  let result = await ResourceValidator.validateResource(
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
  let result = await ResourceValidator.validateResource(
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
    node => {
      if (node === 5) {
        return 'valid';
      }
      return 'invalid';
    }
  );
  expect(result).toEqual([]);
});

test('callback can trigger full check', async () => {
  expect.assertions(1);
  let result = await ResourceValidator.validateResource(
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
            classification: 'test'
          }
        }
      ]
    },
    'person',
    schemas,
    true,
    () => {
      return 'check';
    }
  );
  expect(result).toEqual([['pets', 1, 'race', 'classification']]);
});
