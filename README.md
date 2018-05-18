# Aniame

A simple, no-dependency JSON schema validator for Node.js.

**WARNING:** This package does NOT implement any of the [IETF's JSON Schema drafts](http://json-schema.org/). If that's what you're looking for, have a look at [ajv](https://github.com/epoberezkin/ajv), for example.

## JSON schema specification

JSON objects are made of nested key/value pairs. To describe JSON objects with an Aniame schema, we merely substitute each value with its description. The keys remain the same.

For example, the following object:

```javascript
{
  name: 'Simpson';
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

Aniame descriptions are JSON objects that have the following keys:

* a `type` key (either `string`, `number`, `boolean`, `array`, `object` or `ref`)
* a `required` key (`true` or `false`)
* if the type is an `array`, an `elements` key that indicates what the elements of the array should look like. `elements` should be, in turn, an Aniame description
* if the type is an `object`, a `children` key that indicates what the object should contain. `children` should be, in turn, an object with the expected keys, and, for each key, an Aniame description

### Example

The following JSON object is a valid schema under the Aniame spec.

```javascript
{
  firstName: {
    type: 'string'
  },
  lastName: {
    type: 'string',
    required: true
  },
  age: {
    type: 'number'
  },
  graduatedCollege: {
    type: 'boolean',
    required: true
  },
  nicknames: {
    type: 'array',
    required: false,
    elements: {
      type: 'string'
    }
  },
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
  lastName: 'Simpson',
  age: 32,
  graduatedCollege: false,
  nicknames: ['Bart', 'El Barto'],
  address: {
    street: 'Evergreen Terrace',
    number: 742
  }
}
```
