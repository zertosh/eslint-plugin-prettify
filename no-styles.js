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
  // "Possible Errors"
  'no-extra-semi': null,

  // "Stylistic Issues"
  'array-bracket-spacing': null,
  'block-spacing': null,
  'brace-style': null,
  'camelcase': null,
  'capitalized-comments': null,
  'comma-dangle': null,
  'comma-spacing': null,
  'comma-style': null,
  'computed-property-spacing': null,
  'consistent-this': null,
  'eol-last': null,
  'func-call-spacing': null,
  'func-name-matching': null,
  'func-names': null,
  'func-style': null,
  'id-blacklist': null,
  'id-length': null,
  'id-match': null,
  'indent': null,
  'jsx-quotes': null,
  'key-spacing': null,
  'keyword-spacing': null,
  'line-comment-position': null,
  'linebreak-style': null,
  'lines-around-comment': null,
  'lines-around-directive': null,
  'max-depth': null,
  'max-len': null,
  'max-lines': null,
  'max-nested-callbacks': null,
  'max-params': null,
  'max-statements': null,
  'max-statements-per-line': null,
  'multiline-ternary': null,
  'new-cap': null,
  'new-parens': null,
  'newline-after-var': null,
  'newline-before-return': null,
  'newline-per-chained-call': null,
  'no-array-constructor': null,
  'no-bitwise': null,
  'no-continue': null,
  'no-inline-comments': null,
  'no-lonely-if': null,
  'no-mixed-operators': null,
  'no-mixed-spaces-and-tabs': null,
  'no-multi-assign': null,
  'no-multiple-empty-lines': null,
  'no-negated-condition': null,
  'no-nested-ternary': null,
  'no-new-object': null,
  'no-plusplus': null,
  'no-restricted-syntax': null,
  'no-tabs': null,
  'no-ternary': null,
  'no-trailing-spaces': null,
  'no-underscore-dangle': null,
  'no-unneeded-ternary': null,
  'no-whitespace-before-property': null,
  'nonblock-statement-body-position': null,
  'object-curly-newline': null,
  'object-curly-spacing': null,
  'object-property-newline': null,
  'one-var': null,
  'one-var-declaration-per-line': null,
  'operator-assignment': null,
  'operator-linebreak': null,
  'padded-blocks': null,
  'quote-props': null,
  'quotes': null,
  'require-jsdoc': null,
  'semi': null,
  'semi-spacing': null,
  'sort-keys': null,
  'sort-vars': null,
  'space-before-blocks': null,
  'space-before-function-paren': null,
  'space-in-parens': null,
  'space-infix-ops': null,
  'space-unary-ops': null,
  'spaced-comment': null,
  'template-tag-spacing': null,
  'unicode-bom': null,
  'wrap-regex': null
};
