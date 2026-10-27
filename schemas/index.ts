import Ajv from 'ajv';
import booking from './booking.schema.json';

const ajv = new Ajv({ allErrors: true });
ajv.addSchema(booking);

const created = {
  type: 'object',
  additionalProperties: false,
  required: ['bookingid', 'booking'],
  properties: { bookingid: { type: 'integer' }, booking: { $ref: 'booking' } },
};

const idList = {
  type: 'array',
  items: {
    type: 'object',
    additionalProperties: false,
    required: ['bookingid'],
    properties: { bookingid: { type: 'integer' } },
  },
};

export const validators = {
  booking: ajv.getSchema('booking')!,
  created: ajv.compile(created),
  idList: ajv.compile(idList),
};

/** Returns a readable list of contract violations, or an empty array when the body matches. */
export function violations(name: keyof typeof validators, body: unknown): string[] {
  const validate = validators[name];
  return validate(body) ? [] : (validate.errors ?? []).map((e) => `${e.instancePath || '(root)'} ${e.message}`);
}
