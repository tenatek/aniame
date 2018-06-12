const JSONPath = require('../lib/JSONPath');
const SchemaIndexer = require('../lib/SchemaIndexer');

const schema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      required: true
    },
    telephone: {
      type: 'ref',
      indexAs: ['ref'],
      ref: 'some-model'
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
                type: 'ref',
                indexAs: ['ref'],
                ref: 'some-model',
                required: true
              },
              family: {
                type: 'string'
              }
            },
            required: true
          },
          age: {
            type: 'ref',
            indexAs: ['ref'],
            ref: 'some-model',
            required: true
          }
        }
      }
    }
  }
};

test('get correct relation paths', () => {
  expect.assertions(1);
  let indexingResults = SchemaIndexer.indexSchema(schema, ['ref']);
  let expectedResults = {
    indexes: {
      ref: [
        {
          path: new JSONPath().addPathSegment('telephone'),
          data: {
            ref: 'some-model'
          }
        },
        {
          path: new JSONPath()
            .addPathSegment('pets')
            .addPathSegment(null)
            .addPathSegment('name')
            .addPathSegment('first'),
          data: {
            ref: 'some-model'
          }
        },
        {
          path: new JSONPath()
            .addPathSegment('pets')
            .addPathSegment(null)
            .addPathSegment('age'),
          data: {
            ref: 'some-model'
          }
        }
      ]
    }
  };
  expect(indexingResults).toEqual(expectedResults);
});