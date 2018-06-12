# Aniame

A simple, no-dependency JSON schema validator.

This README contains:

* [JSON schema specification](#json-schema-specification)
  * [Objects](#objects)
  * [Arrays](#arrays)
  * [References](#references)
* [How to use](#how-to-use)
  * [Installation](#installation)
  * [Schema validation](#schema-validation)
  * [Schema indexing](#schema-indexing)
  * [Data validation](#data-validation)
* [JSON paths](#json-paths)

**WARNING:** This package does not comply with the [IETF's JSON Schema drafts](http://json-schema.org/), although there are some similarities. If full compliance is what you're looking for, there's [ajv](https://github.com/epoberezkin/ajv), [djv](https://github.com/korzio/djv), and more.

## JSON schema specification

To describe a JavaScript primitive or data structure with an Aniame schema, we use small, nestable objects called _descriptors_.

For example, the following array:

```javascript
['Homer', 'Marge', 'Bart', 'Lisa', 'Maggie']
```

Is described by the following schema:

```javascript
{
  type: 'array',
  items: {
    type: 'string'
  }
}
```

Where both:

```javascript
{
  type: 'array',
  items: ...
}
```

And:

```javascript
{
  type: 'string'
}
```

Are _descriptors_.

_Descriptors_ are JSON objects that have the following keys:

* a `type` key (either `string`, `number`, `boolean`, `object`, `array` or `ref`).
* a `required` key (`true` or `false`).
* an `indexAs` key (see [schema indexing](#schema-indexing)).
* other keys depending on the `type`.

### Objects

`type: 'object'`

Used to indicate that the expected value is a JSON object. 

With `object`s, the _descriptor_ must contain the `properties` key to describe what the object should contain. `properties`'s value should be an object with the expected keys, and, for each key, a _descriptor_ of the key's expected value.

```javascript
{
  type: 'object',
  properties: {
    address: {
      type: 'object',
      properties: {
        street: {
          type: 'string',
          required: true
        },
        number: {
          type: 'number'
        },
        city: {
          type: 'string'
        }
      }
    }
  }
}
```

The following object is valid under the above schema.

```javascript
{
  address: {
    street: 'Evergreen Terrace',
    number: 742
  }
}
```

### Arrays

`type: 'array'`

Used to indicate that the expected value is an array. 

With `array`s, the _descriptor_ must contain the `items` key, whose value is itself the _descriptor_ of the items of the array.

```javascript
{
  type: 'object',
  properties: {
    nicknames: {
      type: 'array',
      required: false,
      items: {
        type: 'string'
      }
    }
  }
}
```

The following object is valid under the above schema.

```javascript
{
  nicknames: ['Bart', 'El Barto']
}
```

### References

`type: 'ref'`

Used to indicate that the expected value is a reference to another entity, itself compliant with this or another schema. 

With `type: 'ref'`, the _descriptor_ must contain the `ref` key, whose value is a string, the name of the schema that the referenced entity is compliant with.

References can be anything, as they will be validated by an optional, user-provided callback. If no callback is provided, Aniame will validate the value against the schema specified by the `ref` key.

```javascript
{
  type: 'object',
  properties: {
    father: {
      type: 'ref',
      ref: 'person'
    },
    pets: {
      type: 'array',
      items: {
        type: 'ref',
        ref: 'animal'
      }
    }
  }
}
```

The following object is valid under the above schema.

```javascript
{
  father: {
    // the full 'person' object
  },
  // alternatively, database IDs, or anything else
  pets: ['5abe33597d745c1992804194', '5afddf517195746608d181c5']
}
```

## How to use

### Installation

Just do:

```shell
npm install --save aniame
```

And then:

```javascript
const Aniame = require('aniame');
```

### Schema validation

`Aniame.validateSchema(schema[, schemaNames])`

This method checks that a schema is valid under the Aniame spec. It returns a boolean and receives the following parameters:

* the `schema`, a JSON object.
* optionally, `schemaNames`, an array of strings, the names of other schema definitions that can be referenced with `type: 'ref'`.

For example:

```javascript
Aniame.validateSchema({
  type: 'object',
  properties: {
    nicknames: {
      type: 'array',
      required: false,
      items: {
        type: 'string'
      }
    }
  }
});
```

Will return `true`.

### Schema indexing

Sometimes, it can be useful to index specific descriptors within a schema, i.e. store their path within the schema and collect the values of certain of their properties. This can be done by adding the property `indexAs` on such descriptors. This property will be an array of strings, each string being the name of an index that the descriptor should belong to.

To retrieve the indexes, we call:

`Aniame.indexSchema(schema[, descriptorProperties])`

It returns an `IndexingResult` and receives the following parameters:

* the `schema` to index.
* optionally, `descriptorProperties`, an array of strings, the names of the properties whose values should be collected from the indexed descriptors.

`IndexingResult`s have one property, `indexes`, an object whose properties are the various indexes specified within `indexAs` throughout the schema.

Each index is an array of objects, which represent the descriptors that belong to the index. For each descriptor, there will be a `path` and `data` object, where the `descriptorProperties` for the descriptor are stored.

For example:

```javascript
Aniame.indexSchema({
  type: 'object',
  properties: {
    name: {
      type: 'string'
    },
    age: {
      type: 'number'
    },
    telephone: {
      type: 'number',
      description: 'A phone number',
      indexAs: ['contactInfo']
    },
    email: {
      type: 'number',
      description: 'An email',
      indexAs: ['contactInfo']
    }
  }
}, ['description']);
```

Will return:

```javascript
{
  indexes: {
    contactInfo: [
      {
        path: // the JSONPath of 'telephone'
        data: {
          description: 'A phone number'
        }
      },
      {
        path: // the JSONPath of 'email'
        data: {
          description: 'An email'
        }
      }
    ]
  }
}
```

### Data validation 

`Aniame.validateData(data, schema[, schemaDictionary, checkRequired, refCallback])`

This asynchronous method checks that a value is valid under a given schema. It returns a `ValidationResult` and receives the following parameters:

* the `data`, the value to validate.
* the `schema`, the Aniame schema to check the `data` against. It can either be the full schema, or just the name of the schema, in which case the full schema will be pulled from `schemaDictionary`.
* optionally, `schemaDictionary`, a JSON object. Each property on `schemaDictionary` should be the name of a specific schema, and its associated value should be the schema definition.
* optionally, `checkRequired`, a boolean to indicate whether to enforce `required: true`. The default is `true`.
* optionally, `refCallback(data, ref, schemaDictionary)`, an asynchronous function triggered for each `type: 'ref'` key/value pair. If it returns `true` or equivalent, the node is considered valid and the validation moves on. Otherwise, the node will be checked against the appropriate schema, pulled from `schemaDictionary`.

`ValidationResult`s have two properties:

* `success`, a boolean indicating whether the data is valid.
* `errorPaths` if `success` is `false`, an array of the paths within the validated object where the validation failed.

For example:

```javascript
const schemas = {
  person: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        required: true
      },
      email: {
        type: 'string',
        required: true
      },
      job: {
        type: 'ref',
        ref: 'job'
      }
    }
  },
  job: {
    type: 'object',
    properties: {
      company: {
        type: 'string',
        required: true
      },
      position: {
        type: 'string',
        required: true
      }
    }
  }
};

Aniame.validateData({
  name: 'Homer Simpson',
  email: 'homer@springfieldpowerplant.com',
  job: {
    company: 'Springfield Power Plant',
    position: 'Nuclear Safety Inspector'
  }
}, 'person', schemas);
```

Will return a `Promise` that will resolve to `true`.

## JSON paths

Both `IndexingResult`s and `ValidationResult`s contain `JSONPath`s, which represent the path of a node within a JSON object. 

These `JSONPath`s contain an array of the names of the properties that constitute the path: `pathAsArray`.

To transform this array into a JSON pointer as defined in RFC 6901, just call `jsonPath.pathAsPointer()`.

## Copyright & license

Copyright 2018 Ludovic Cyril Michel. Licensed under [MIT](https://github.com/tenatek/aniame/blob/master/LICENSE).