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
const styleRules = require('./style-rules');

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
