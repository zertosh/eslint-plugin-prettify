'use strict';

module.exports = {
  rules: {
    prettier: require('./rule'),
  },
  rulesConfig: {
    prettier: 0,
  },
  processors: {
    '.js': {
      preprocess(text, filename) {
        return [text];
      },
      postprocess(messages, filename) {
        // If any message is a prettier message, remove these rules:
        var message0 = messages[0];
        var filtered = [];
        var useFiltered = false;
        for (var i = 0; i < message0.length; i++) {
          // TODO: Replace with compare to list of known style rules.
          if (!message0[i].ruleId) {
            filtered.push(message0[i]);
          }
          if (message0[i].ruleId === 'eslint-plugin-prettify/prettier') {
            useFiltered = true;
          }
        }
        return useFiltered ? filtered : message0;
      },
    }
  },
};
