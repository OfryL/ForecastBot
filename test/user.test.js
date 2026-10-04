const test = require('node:test');
const assert = require('node:assert/strict');
const { isBlockBotError } = require('../src/utils/user');

test('isBlockBotError recognises unreachable chats', () => {
  assert.equal(isBlockBotError({ code: 403, response: { description: 'Forbidden: bot was blocked by the user' } }), true);
  assert.equal(isBlockBotError({ code: 403, response: { description: 'Forbidden: user is deactivated' } }), true);
  assert.equal(isBlockBotError({ code: 403, response: { description: 'Forbidden: bot was kicked from the group chat' } }), true);
  assert.equal(isBlockBotError({ code: 400, response: { description: 'Bad Request: chat not found' } }), true);
});

test('isBlockBotError ignores other errors', () => {
  assert.equal(isBlockBotError({ code: 429, response: { description: 'Too Many Requests' } }), false);
  assert.equal(isBlockBotError({ code: 403 }), false);
  assert.equal(isBlockBotError(new Error('network')), false);
  assert.equal(isBlockBotError(null), false);
});
