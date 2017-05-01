'use strict';

const diff = require('fast-diff');
let prettier;

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

      if (prettier == null) prettier = require('prettier');
      const source = context.getSource();
      const prettierSource = prettier.format(source, options);
      if (source === prettierSource) {
        return;
      }

      const results = diff(source, prettierSource);
      let offset = 0;

      for (let i = 0; i < results.length; i++) {
        const result = results[i];

        switch (result[0]) {
        case diff.EQUAL:
          offset += result[1].length;
          break;

        case diff.INSERT:
          reportInsert(context, offset, result[1]);
          // INSERTs do not advance the offset.
          break;

        case diff.DELETE:
          const next = results[i + 1];
          // For more useful messages, a DELETE followed by an INSERT is
          // reported as a "replace".
          if (next != null && next[0] === diff.INSERT) {
            reportReplace(context, offset, result[1], next[1]);
            offset += result[1].length - next[1].length;
            i++;
          } else {
            reportDelete(context, offset, result[1]);
            offset += result[1].length;
          }
          break;
        }
      }
    },
  };
};

function reportInsert(context, offset, text) {
  const sourceCode = context.getSourceCode();
  const pos = sourceCode.getLocFromIndex(offset);
  const range = [null, offset];
  context.report({
    message: 'Insert `{{ code }}`',
    data: {code: showInvisibles(text)},
    loc: {start: pos, end: pos},
    fix(fixer) {
      return fixer.insertTextAfterRange(range, text);
    },
  });
}

function reportDelete(context, offset, text) {
  const sourceCode = context.getSourceCode();
  const start = sourceCode.getLocFromIndex(offset);
  const end = sourceCode.getLocFromIndex(offset + text.length);
  const range = [offset, offset + text.length];
  context.report({
    message: 'Delete `{{ code }}`',
    data: {code: showInvisibles(text)},
    loc: {start, end},
    fix(fixer) {
      return fixer.removeRange(range);
    },
  });
}

function reportReplace(context, offset, deleteText, insertText) {
  const sourceCode = context.getSourceCode();
  const start = sourceCode.getLocFromIndex(offset);
  const end = sourceCode.getLocFromIndex(offset + deleteText.length);
  const range = [offset, offset + deleteText.length];
  context.report({
    message: 'Replace `{{ deleteCode }}` with `{{ insertCode }}`',
    data: {
      deleteCode: showInvisibles(deleteText),
      insertCode: showInvisibles(insertText),
    },
    loc: {start, end},
    fix(fixer) {
      return fixer.replaceTextRange(range, insertText);
    },
  });
}

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
