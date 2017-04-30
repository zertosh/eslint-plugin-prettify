'use strict';

const RuleTester = require('eslint').RuleTester;
const rule = require('./rule');

const ruleTester = new RuleTester({
  parser: 'babel-eslint',
});

ruleTester.run('prettier', rule, {
  valid: [
    {code: '/** @format */\na();\n'},
    {code: '/* something */ /** @format */\n a ( )'},
    {code: 'a (`\n * @format\n`)'},
  ],
  invalid: [
    {
      code: `\
/** @format */

a();;;;;;

foo();
`,
      errors: [{}, {
        message: 'DELETE: ;;',
        line: 3,
        column: 5,
         endLine: 3,
        endColumn: 5,
        fix: {text: '/** @format */\na();\n'},
      }],
    },
  ],
});
