# Aniame

A simple, no-dependency JSON schema validator.

**WARNING:** This package does NOT implement any of the [IETF's JSON Schema drafts](http://json-schema.org/). If that's what you're looking for, there's [ajv](https://github.com/epoberezkin/ajv), [djv](https://github.com/korzio/djv), and more.

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
  elements: {
    type: 'string'
  }
}
```

Where both:

```javascript
{
  type: 'array',
  elements: ...
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
* other keys depending on the `type`.

### Objects

`type: 'object'`

Used to indicate that the expected value is a JSON object. 

With `object`s, the _descriptor_ must contain the `children` key to describe what the object should contain. `children`'s value should be an object with the expected keys, and, for each key, a _descriptor_ of the key's expected value.

```javascript
{
  type: 'object',
  children: {
    address: {
      type: 'object',
      children: {
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

With `array`s, the _descriptor_ must contain the `elements` key, whose value is itself the _descriptor_ of the elements of the array.

```javascript
{
  type: 'object',
  children: {
    nicknames: {
      type: 'array',
      required: false,
      elements: {
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

With `ref`s, the _descriptor_ must contain the `model` key, whose value is a string, the name of the schema that the referenced entity is compliant with.

References can be anything, as they will be validated by an optional, user-provided callback. If no callback is provided, Aniame will validate the value against the schema specified by the `model` key.

```javascript
{
  type: 'object',
  children: {
    father: {
      type: 'ref',
      model: 'person'
    },
    pets: {
      type: 'array',
      elements: {
        type: 'ref',
        model: 'animal'
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

`Aniame.validateSchema(schema[, models])`

This method checks that a schema is valid under the Aniame spec. It returns a boolean and receives the following parameters:

* the `schema`, a JSON object.
* optionally, `models`, an array of strings, the names of other schema definitions that can be referenced with `type: 'ref'`.

### Data validation 

`Aniame.validateData(schemas, model, data[, checkRequired, checkRefCallback])`

This method checks that a JSON object is valid under a given schema. It returns a `ValidationResult` and receives the following parameters:

* the `schemas`, a JSON object. Each key should be the name of a specific schema, and its associated value should be the schema definition.
* the `model`, a string, the name of the schema the JSON object should comply with.
* the `data`, the JSON object to validate.
* optionally, `checkRequired`, a boolean to indicate whether to enforce `required: true`. The default is `false`.
* optionally, `checkRefCallback(schemas, model, data)`, a function triggered for each `type: 'ref'` key/value pair. If it returns `true` or equivalent, the node is considered valid and the validation moves on. Otherwise, the node will be checked against the appropriate schema.

`ValidationResult`s have two keys:

* `success`, a boolean indicating whether the data is valid.
* `errorPaths` if `success` is `false`, an array of the paths within the validated object where the validation failed.

## Copyright & license

Copyright 2018 Ludovic Cyril Michel. Licensed under [MIT](https://github.com/tenatek/aniame/blob/master/LICENSE).