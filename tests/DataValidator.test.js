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
              model: 'race',
              required: true
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

test('rejects unknown attributes', async () => {
  expect.assertions(1);
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
});

test('ignores optional attributes', async () => {
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

test('enforces required attributes', async () => {
  expect.assertions(1);
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
});

test('checks attribute types', async () => {
  expect.assertions(1);
  let result = await DataValidator.validateData(
    schemas,
    'person',
    {
      name: 'true',
      telephone: '534',
      email: 'test'
    },
    true
  );
  expect(result.success).toBe(false);
});

test('checks array element types', async () => {
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
          age: {
            name: 'Bob'
          },
          name: {
            first: 'tom'
          }
        }
      ]
    },
    true
  );
  expect(result.success).toBe(false);
});
