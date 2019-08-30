import { writable } from 'svelte/store';
import Ajv from 'ajv';
import schema from './Schema.json';
import spanish from './spanish_content.json';
import english from './english_content.json';

// Validate the data against the schema.
SchemaValidator(spanish, schema);
SchemaValidator(english, schema);

function SchemaValidator(data, schema) {
  var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
  var validate = ajv.compile(schema);
  var valid = validate(data);
  if (!valid) {
    for (const err of validate.errors) {
      console.error(err.message);
      console.table(err);
    }
  }
}

// Spanish is default content
export const content_app = spanish;

function LanguageStore() {
  const { subscribe, set, update } = writable(spanish);

  return {
    subscribe,
    useEng: () => update(data => english),
    useEsp: () => update(data => spanish),
    reset: () => {},
  };
}

export const db_content = LanguageStore();
