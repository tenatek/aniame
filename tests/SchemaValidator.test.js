const SchemaValidator = require('../lib/SchemaValidator');

test('rejects schema nodes that are not objects', () => {
  expect(SchemaValidator.validateSchema({
    type: 'object',
    properties: {
      name: 'Tim',
      telephone: 123456,
      email: 'blue',
      test: true
    }
  })).toBe(false);
});

test('"required" is optional', () => {
  expect(SchemaValidator.validateSchema({
    type: 'object',
    properties: {
      name: {
        type: 'string'
      },
      telephone: {
        type: 'number'
      },
      email: {
        type: 'string'
      }
    }
  })).toBe(true);
});

test('references work', () => {
  expect(SchemaValidator.validateSchema(
    {
      type: 'object',
      properties: {
        name: {
          type: 'ref',
          model: 'person'
        },
        telephone: {
          type: 'number',
          required: true
        },
        email: {
          type: 'string'
        }
      }
    },
    ['person']
  )).toBe(true);
});

test('complex example', () => {
  expect(SchemaValidator.validateSchema(
    {
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
          indexAs: ['email'],
          required: true
        },
        friend: {
          type: 'ref',
          model: 'person',
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
              age: {
                type: 'number',
                required: true
              }
            }
          }
        }
      }
    },
    ['person']
  )).toBe(true);
});

test('rejects unknown attributes', () => {
  expect(SchemaValidator.validateSchema({
    type: 'object',
    properties: {
      name: {
        type: 'string',
        required: true,
        blue: true
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
            age: {
              type: 'number',
              required: true
            }
          }
        }
      }
    }
  })).toBe(false);
});
