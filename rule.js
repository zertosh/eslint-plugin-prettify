'use strict';

const diff = require('fast-diff');

const options = {
  singleQuote: true,
  trailingComma: 'all',
  bracketSpacing: false,
  jsxBracketSameLine: true,
  parser: 'flow',
};

module.exports = function(context) {
  return {
    'Program:exit'(node) {
      // const firstComment = node.comments[0];
      // if (
      //   !firstComment ||
      //   firstComment.start !== 0 ||
      //   !firstComment.value.includes('* @format')
      // ) {
      //   return;
      // }

      const source = context.getSource();
      const prettierSource = require('prettier').format(source, options);
      if (source !== prettierSource) {
        const sourceCode = context.getSourceCode();
        const results = diff(source, prettierSource);
        let offset = 0;

        for (let i = 0; i < results.length; i++) {
          const result = results[i];
          const operation = result[0];
          const replaceText = result[1];

          switch (operation) {
          case diff.EQUAL:
            offset += replaceText.length;
            break;

          case diff.INSERT:
            const pos = sourceCode.getLocFromIndex(offset);
            context.report({
              message: 'Add: "{{ code }}"',
              data: {code: showInvisibles(replaceText)},
              loc: {start: pos, end: pos},
              fix(fixer) {
                return fixer.insertTextAfterRange([null, offset], replaceText)
              }
            })
            // offset is not advanced for inserts.
            break;

          case diff.DELETE:
            const start = sourceCode.getLocFromIndex(offset);
            const end = sourceCode.getLocFromIndex(offset + replaceText.length);
            const range = [offset, offset + replaceText.length];
            context.report({
              message: 'Remove: "{{ code }}"',
              data: {code: showInvisibles(replaceText)},
              loc: {start, end},
              fix(fixer) {
                return fixer.removeRange(range);
              }
            })
            offset += replaceText.length;
            break;
          }
        }
      }
    },
  };
};

function showInvisibles(str) {
  var ret = '';
  for (var i = 0; i < str.length; i++) {
    switch (str[i]) {
      case ' ': ret += '\u00B7'; break; // Middle Dot
      case '\n': ret += '\u23ce'; break; // Return Symbol
      default: ret += str[i]; break;
    }
  }
  return ret;
}
