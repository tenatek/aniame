# Aniame

A simple, no-dependency JSON schema validator.

**WARNING:** This package does NOT implement any of the [IETF's JSON Schema drafts](http://json-schema.org/). If that's what you're looking for, there's [ajv](https://github.com/epoberezkin/ajv), [djv](https://github.com/korzio/djv), and more.

## JSON schema specification

JSON objects are made of nested key/value pairs. To describe JSON objects with an Aniame schema, we keep the keys in place, and we merely substitute each value with its description.

For example, the following object:

```javascript
{
  name: 'Simpson'
}
```

Is described by the following schema:

```javascript
{
  name: {
    type: 'string',
    required: true
  }
}
```

_Aniame descriptions_ are JSON objects that have the following keys:

* a `type` key (either `string`, `number`, `boolean`, `object`, `array` or `ref`).
* a `required` key (`true` or `false`).
* other keys depending on the `type`.

### Objects

`type: 'object'`

Used to indicate that the key's value will be a nested JSON object. 

With `object`s, the _Aniame description_ must contain the `children` key to describe what the object should contain. `children`'s value should be an object with the expected keys, and, for each key, an _Aniame description_.

```javascript
{
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

Used to indicate that the key's value will be an array. 

With `array`s, the _Aniame description_ must contain the `elements` key, whose value is itself the _Aniame description_ of the elements of the array.

```javascript
{
  nicknames: {
    type: 'array',
    required: false,
    elements: {
      type: 'string'
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

Used to indicate that the key's value will be a reference to a different JSON object, itself compliant with this or another schema. 

With `ref`s, the _Aniame description_ must contain the `model` key, whose value is a string, the name of the schema that the referenced object is compliant with.

References can be anything, as they will be validated by an optional, user-provided callback. If no callback is provided, Aniame will treat the reference as a JSON object and validate it against the `model` schema.

```javascript
{
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
```

The following object is valid under the above schema.

```javascript
{
  father: {
    // the full 'person' object
  },
  // alternatively, an id that the callback will use to verify
  // the referenced object's existence in some DB, for instance
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

This method checks that a JSON object is valid under a given schema. It returns a boolean and receives the following parameters:

* the `schemas`, a JSON object. Each key should be the name of a specific schema, and its associated value should be the schema definition.
* the `model`, a string, the name of the schema the JSON object should comply with.
* the `data`, the JSON object to validate.
* optionally, `checkRequired`, a boolean to indicate whether to enforce `required: true`. The default is `false`.
* optionally, `checkRefCallback(schemas, model, data)`, a function triggered for each `type: 'ref'` key/value pair. If it returns `true` or equivalent, the node is considered valid and the validation moves on. Otherwise, the node will be checked against the appropriate schema.

## Copyright & license

Copyright 2018 Ludovic Cyril Michel. Licensed under [MIT](https://github.com/tenatek/aniame/blob/master/LICENSE).