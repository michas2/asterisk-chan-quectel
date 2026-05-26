const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..');
const atResponse = fs.readFileSync(path.join(repoRoot, 'src', 'at_response.c'), 'utf8');

assert.match(
  atResponse,
  /release_failed_answer_channel\(pvt,\s*task,\s*AST_CAUSE_CALL_REJECTED\)/,
  'ATA/CHLD answer failures must use normal cpvt release instead of direct channel hangup'
);

assert.match(
  atResponse,
  /static void release_failed_answer_channel[\s\S]*cpvt_change_state\(cpvt,\s*CALL_STATE_RELEASED,\s*cause\)/,
  'answer failure release helper must drive the cpvt to CALL_STATE_RELEASED'
);

const answerFailureBlock = atResponse.match(
  /case CMD_AT_A:[\s\S]*?case CMD_AT_CHLD_3:/
)?.[0] || '';

assert.doesNotMatch(
  answerFailureBlock,
  /channel_enqueue_hangup\(task->cpvt->channel/,
  'answer failure block must not dereference task->cpvt->channel directly'
);

console.log('homenichat-answer-error-release tests passed');
