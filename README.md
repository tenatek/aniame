# Aniame

A simple, no-dependency JSON schema validator for Node.js.

**WARNING:** This package does NOT implement any of the [IETF's JSON Schema drafts](http://json-schema.org/). If that's what you're looking for, have a look at [ajv](https://github.com/epoberezkin/ajv), for example.

## JSON schema specification

Under the Aniame specification, a JSON schema is made up of recursive blocks, each describing an expected key/value pair on the JSON object to validate.

### Example

The following JSON object is a valid schema under the Aniame spec.

```json
{
  "firstName": {
    "type": "string"
  },
  "lastName": {
    "type": "string",
    "required": true
  },
  "age": {
    "type": "number"
  },
  "graduatedCollege": {
    "type": "boolean",
    "required": true
  },
  "nicknames": {
    "type": "array",
    "required": false,
    "elements": {
      "type": "string"
    }
  },
  "address": {
    "type": "object",
    "children": {
      "street": {
        "type": "string",
        "required": true
      },
      "number": {
        "type": "number"
      },
      "city": {
        "type": "string"
      }
    }
  }
}
```

The following object is valid under the above schema:

```json
{
  "lastName": "Simpson",
  "age": 32,
  "graduatedCollege": false,
  "nicknames": ["Bart", "El Barto"],
  "address": {
    "street": "Evergreen Terrace",
    "number": 742
  }
}
```
