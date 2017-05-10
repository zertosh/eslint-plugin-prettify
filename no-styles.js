/**
 * This a special mode of eslint-plugin-prettify that will filter known style
 * rule messages. This is useful in codebases that have a mixture of files.
 * The problem is that ESLint's `--fix` flag doesn't apply fixes anymore. This
 * is a known issue[1] of processors. However, the fix information is still
 * outputted to formatters. So if you're using ESLint through something
 * Arcanist, the fixes will work.
 *
 * [1]: https://github.com/eslint/eslint/blob/afbea78d/lib/cli-engine.js#L265
 */
'use strict';

const plugin = require('./index');

module.exports = Object.assign({}, plugin, {
  processors: {
    '.js': {
      preprocess(text, filename) {
        return [text];
      },
      postprocess(messages, filename) {
        // If any message is a prettier message, remove these rules:
        var errors = [];
        var useFiltered = false;
        for (var i = 0; i < messages[0].length; i++) {
          var message = messages[0];
          if (!styleRules.hasOwnProperty(message[i].ruleId)) {
            errors.push(message[i]);
          }
          if (message[i].ruleId === 'prettify/no-styles/prettier') {
            useFiltered = true;
          }
        }
        return useFiltered ? errors : messages[0];
      },
    }
  },
});

// http://eslint.org/docs/rules/
const styleRules = {
  // Possible Errors
  'no-extra-parens': null,
  'no-extra-semi': null,

  // Best Practices
  'dot-location': null,
  'no-floating-decimal': null,
  'no-multi-spaces': null,
  'wrap-iife': null,

  // Stylistic Issues
  'array-bracket-spacing': null,
  'block-spacing': null,
  'brace-style': null,
  'comma-dangle': null,
  'comma-spacing': null,
  'comma-style': null,
  'computed-property-spacing': null,
  'eol-last': null,
  'func-call-spacing': null,
  'indent': null,
  'jsx-quotes': null,
  'key-spacing': null,
  'keyword-spacing': null,
  'linebreak-style': null,
  'max-len': null,
  'max-statements-per-line': null,
  'multiline-ternary': null,
  'new-parens': null,
  'newline-per-chained-call': null,
  'no-mixed-spaces-and-tabs': null,
  'no-multiple-empty-lines': null,
  'no-tabs': null,
  'no-trailing-spaces': null,
  'no-whitespace-before-property': null,
  'nonblock-statement-body-position': null,
  'object-curly-newline': null,
  'object-curly-spacing': null,
  'object-property-newline': null,
  'one-var-declaration-per-line': null,
  'operator-linebreak': null,
  'padded-blocks': null,
  'quote-props': null,
  'quotes': null,
  'semi': null,
  'semi-spacing': null,
  'space-before-blocks': null,
  'space-before-function-paren': null,
  'space-in-parens': null,
  'space-infix-ops': null,
  'space-unary-ops': null,
  'template-tag-spacing': null,
  'unicode-bom': null,
  'wrap-regex': null,

  // ECMAScript 6
  'arrow-parens': null,
  'arrow-spacing': null,
  'generator-star-spacing': null,
  'no-confusing-arrow': null,
  'rest-spread-spacing': null,
  'template-curly-spacing': null,
  'yield-star-spacing': null,
};
