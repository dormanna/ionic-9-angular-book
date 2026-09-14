// The one file that knows the model provider: its address,
// the key and the model. The app only knows /api/drafts.
const ENDPOINT = 'https://api.anthropic.com/v1/messages';
// Models are retired. Expect to change this line.
const MODEL = 'claude-opus-5';

export const configured = () =>
  Boolean(process.env.ANTHROPIC_API_KEY);

const nullable = (type) => ({ anyOf: [type, { type: 'null' }] });

// The form the answer must take. Every field is there;
// what the sentence does not say comes back as null.
const schema = {
  type: 'object',
  properties: {
    people: nullable({ type: 'integer' }),
    date: nullable({ type: 'string', format: 'date' }),
    bus: nullable({ type: 'boolean' }),
    pickUp: nullable({ type: 'string' }),
    language: nullable({
      type: 'string',
      enum: ['de', 'en', 'fr', 'es'],
    }),
    firstName: nullable({ type: 'string' }),
    lastName: nullable({ type: 'string' }),
    time: nullable({ type: 'string' }),
  },
  required: ['people', 'date', 'bus', 'pickUp', 'language',
    'firstName', 'lastName', 'time'],
  additionalProperties: false,
};

// today comes from the phone, the weekday from today.
const instruction = (today) => {
  const weekday = new Date(`${today}T12:00:00Z`)
    .toLocaleDateString('en-US',
      { weekday: 'long', timeZone: 'UTC' });
  return 'Fill in a tour request form from one sentence. '
    + `Today is ${weekday}, ${today}. `
    + 'Use only what the sentence states and null for '
    + 'everything it does not state. language is the '
    + 'language the tour is to be guided in: set it only '
    + 'when the sentence names it, never from the language '
    + 'the sentence is written in. firstName and lastName '
    + 'are the name of the person making the request, only '
    + 'when the sentence gives it. time is the tour\'s start '
    + 'time as HH:MM on a 24-hour clock, only when the '
    + 'sentence gives a clock time. bus is true when the '
    + 'sentence asks to be picked up. date as YYYY-MM-DD.';
};

const ask = (sentence, today) =>
  fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      system: instruction(today),
      messages: [{ role: 'user', content: sentence }],
      output_config: {
        effort: 'low',
        format: { type: 'json_schema', schema },
      },
    }),
  });

// Worth one more try, and after how long? A 429 without
// retry-after is the account's spending cap: never.
const retryDelay = (res) => {
  if (res.status === 429) {
    const seconds = Number(res.headers.get('retry-after'));
    return seconds > 0 && seconds <= 2 ? seconds * 1000 : null;
  }
  return [500, 502, 503, 504, 529].includes(res.status)
    ? 1000
    : null;
};

// The fields the sentence names, or null if the answer
// is of no use.
export const draft = async (sentence, today) => {
  let res = await ask(sentence, today);
  const delay = retryDelay(res);
  if (delay !== null) {
    await new Promise((done) => setTimeout(done, delay));
    res = await ask(sentence, today);
  }
  if (!res.ok) {
    return null;
  }
  const message = await res.json();
  if (message.stop_reason !== 'end_turn') {
    return null;
  }
  const block = message.content.find((b) => b.type === 'text');
  try {
    return JSON.parse(block.text);
  } catch {
    return null;
  }
};
