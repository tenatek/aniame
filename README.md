# Aniame

A simple JSON schema validator.

[![npm version](https://img.shields.io/npm/v/aniame.svg)](https://www.npmjs.com/package/aniame)
[![npm downloads](https://img.shields.io/npm/dm/aniame.svg)](https://www.npmjs.com/package/aniame)
[![build status](https://travis-ci.org/tenatek/aniame.svg?branch=master)](https://travis-ci.org/tenatek/aniame)
[![coverage status](https://coveralls.io/repos/github/tenatek/aniame/badge.svg?branch=master)](https://coveralls.io/github/tenatek/aniame?branch=master)

This README contains:

* [JSON schema specification](#json-schema-specification)
  * [Objects](#objects)
  * [Arrays](#arrays)
  * [References](#references)
* [How to use](#how-to-use)
  * [Installation](#installation)
  * [Schema validation](#schema-validation)
  * [Data validation](#data-validation)
* [Copyright & license](#copyright--license)

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
* an optional `description` key, which, if present, must be a string.
* an optional `required` key (`true` or `false`).
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

### Data validation 

`Aniame.validateData(data, schema[, schemaDictionary, enforceRequired, refCallback])`

This asynchronous method checks that a value is valid under a given schema. It returns a `Promise` that resolves to an array and receives the following parameters:

* the `data`, the value to validate.
* the `schema`, the Aniame schema to check the `data` against. It can either be the full schema, or just the name of the schema, in which case the full schema will be pulled from `schemaDictionary`.
* optionally, `schemaDictionary`, a JSON object. Each property on `schemaDictionary` should be the name of a specific schema, and its associated value should be the schema definition.
* optionally, `enforceRequired`, a boolean to indicate whether to enforce `required: true`. The default is `true`.
* optionally, `refCallback(data, ref, schemaDictionary)`, an asynchronous function triggered for each `type: 'ref'` key/value pair. If it returns `true` or equivalent, the node is considered valid and the validation moves on. If it returns `false` or equivalent, the node is considered invalid. If it returns `null`, or if no callback is provided, the node will be checked against the appropriate schema, pulled from `schemaDictionary`.

The resulting array contains the paths within the validated object where the validation failed. If the array is empty, the validation is successful.

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
  email: 45
}, 'person', schemas);
```

Will return a `Promise` that will resolve to:

```javascript
[
  ['email']
]
```

## Copyright & license

Copyright 2018 Ludovic Cyril Michel. Licensed under [MIT](https://github.com/tenatek/aniame/blob/master/LICENSE).