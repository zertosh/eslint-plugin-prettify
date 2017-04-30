'use strict';

const diff = require('fast-diff');

const options = {
  singleQuote: true,
  trailingComma: 'all',
  bracketSpacing: false,
  jsxBracketSameLine: true,
  parser: 'flow',
};

function locFromRange(lines, range) {
  debugger;
  let [start, end] = range;
  let loc = {
    start: {line: 0, column: 0},
    end: {line: 0, column: 0},
  };
  let offset = 0;
  for (let i = 0; i < lines.length; i++) {
    let nextOffset = offset + lines[i].length;
    if (start >= offset && start <= nextOffset) {
      loc.start.line = i + 1;
      loc.start.column = start - offset;
    }
    if (end >= offset && end < nextOffset) {
      loc.end.line = i + 1;
      loc.end.column = end - offset;
      return loc;
    }
    offset = nextOffset + 1;
  }
  return loc;
}

module.exports = function(context) {
  return {
    'Program:exit'(node) {
      const firstComment = node.comments[0];
      if (
        !firstComment ||
        firstComment.start !== 0 ||
        !firstComment.value.includes('* @format')
      ) {
        return;
      }

      const source = context.getSource();
      const prettierSource = require('prettier').format(source, options);
      if (source !== prettierSource) {

        var results = diff(source, prettierSource);
        var offset = 0;

        var sourceCode = context.getSourceCode();

        for (var i = 0; i < results.length; i++) {
          var result = results[i];

          switch (result[0]) {
            case diff.EQUAL:
              offset += result[1].length;
              break;

            case diff.INSERT: {
              let replaceText = result[1];
              let replaceRange = [offset, offset + replaceText.length];
              let loc = locFromRange(sourceCode.getLines(), replaceRange);
              // console.log(replaceRange, loc);
              // offset = replaceRange[1];
              context.report({
                message: 'INSERT: {{ insert }}',
                data: {insert: replaceText},
                loc: {start: loc.start, end: loc.start},
                fix(fixer) {
                  return fixer.insertTextAfterRange([replaceRange[0], replaceRange[0]], replaceText)
                }
              })
              break;
            }

            case diff.DELETE: {
              let replaceText = result[1];
              let replaceRange = [offset, offset + replaceText.length];
              let loc = locFromRange(sourceCode.getLines(), replaceRange);
              console.log(replaceRange, loc);
              // offset = replaceRange[1];
              loc.end.column--;
              context.report({
                message: 'DELETE: {{ insert }}',
                data: {insert: replaceText},
                loc: loc,
                fix(fixer) {
                  return fixer.removeRange(replaceRange)
                }
              })
              break;
            }
          }
        }
      }
    },
  };
};
