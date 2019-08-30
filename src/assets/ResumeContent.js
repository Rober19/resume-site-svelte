import { writable } from 'svelte/store';
import amanda from 'amanda';
import schema from './Schema.json';
import spanish from './spanish_content.json';
import english from './english_content.json';

// Validate the data against the schema.
SchemaValidator(spanish, schema);
SchemaValidator(english, schema);

function SchemaValidator(source, schema) {
  // Initialize a JSON Schema validator.  
  let validator = amanda('json');
  validator.validate(source, schema, error => {
    if (error) {
      alert(error);
      console.trace(error);
    }
  });
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
