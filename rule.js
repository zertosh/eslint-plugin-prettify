'use strict';

const util = require('util');

let diff;
let prettier;

const fbPragma = 'format';
const fbPrettierOptions = {
  singleQuote: true,
  trailingComma: 'all',
  bracketSpacing: false,
  jsxBracketSameLine: true,
  parser: 'flow',
};

const LINE_ENDING_RE = /\r\n|[\r\n\u2028\u2029]/g;

module.exports = {
  meta: {
    fixable: 'code',
    schema: [
      {
        // Prettier settings:
        anyOf: [
          {
            enum: [null, 'fb']
          },
          {
            type: "object",
            properties: {},
            additionalProperties: true
          }
        ]
      },
      {
        // "Use Prettier" Pragma:
        type: "string",
        pattern: "^@\\w+$"
      }
    ],
  },
  create(context) {
    const prettierOptions = context.options[0] === 'fb'
      ? fbPrettierOptions
      : context.options[0];

    const pragma = prettierOptions === fbPrettierOptions
      ? fbPragma
      : context.options[1]
        ? context.options[1].slice(1) // Remove leading @
        : null;

    if (pragma != null) {
      const firstComment = context.getAllComments()[0];
      if (!(
        firstComment &&
        firstComment.type === 'Block' &&
        firstComment.start === 0
      )) {
        return {};
      }
      const parsed = parseDocblock(firstComment.value);
      if (!parsed.hasOwnProperty(pragma) || parsed[pragma] !== '') {
        return {};
      }
    }

    if (diff == null) diff = require('fast-diff');
    if (prettier == null) prettier = require('prettier');

    return {
      'Program:exit'(node) {
        const source = context.getSource();

        let prettierSource;
        try {
          prettierSource = prettier.format(source, prettierOptions);
        } catch (err) {
          // We've seen mysterious "undefined" errors. Lets see if we can
          // narrow down the culprit with more logging.
          const prettierError = [
            '',
            '---ERROR---',
            util.format(err),
            '---PRETTIER_OPTIONS---',
            util.format(prettierOptions),
            '---SOURCE---',
            source,
          ].join('\n');
          throw new Error(`Prettier exception: ${prettierError}`);
        }

        if (source !== prettierSource) {
          const diffs = diff(source, prettierSource);
          reportDifferences(context, diffs);
        }
      },
    };
  }
};

function reportDifferences(context, results) {
  let batch = [];
  let offset = 0;

  // INSERTs do not advance the offset.

  while (results.length) {
    const result = results.shift();
    switch (result[0]) {
      case diff.INSERT:
      case diff.DELETE:
        batch.push(result);
        break;
      case diff.EQUAL:
        if (results.length) {
          if (batch.length) {
            if (LINE_ENDING_RE.test(result[1])) {
              flush();
              offset += result[1].length;
            } else {
              batch.push(result);
            }
          } else {
            offset += result[1].length;
          }
        }
        break;
    }
    if (batch.length && !results.length) {
      flush();
    }
  }

  function flush() {
    let aheadDeleteText = '';
    let aheadInsertText = '';
    while (batch.length) {
      let next = batch.shift();
      switch (next[0]) {
        case diff.INSERT:
          aheadInsertText += next[1];
          break;
        case diff.DELETE:
          aheadDeleteText += next[1];
          break;
        case diff.EQUAL:
          aheadDeleteText += next[1];
          aheadInsertText += next[1];
          break;
      }
    }
    if (aheadDeleteText && aheadInsertText) {
      reportReplace(context, offset, aheadDeleteText, aheadInsertText);
    } else if (!aheadDeleteText && aheadInsertText) {
      reportInsert(context, offset, aheadInsertText);
    } else if (aheadDeleteText && !aheadInsertText) {
      reportDelete(context, offset, aheadDeleteText);
    }
    offset += aheadDeleteText.length;
  }
}

function reportInsert(context, offset, text) {
  const pos = getLocFromIndex(context, offset);
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
  const start = getLocFromIndex(context, offset);
  const end = getLocFromIndex(context, offset + text.length);
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
  const start = getLocFromIndex(context, offset);
  const end = getLocFromIndex(context, offset + deleteText.length);
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
      case '\t': ret += '\u21b9'; break; // Left Arrow To Bar Over Right Arrow To Bar
      default: ret += str[i]; break;
    }
  }
  return ret;
}

// This was added in ESLint 3.16.0. The built-in version uses an index for fast
// lookups, so try to use that when possible.
function getLocFromIndex(context, index) {
  const sourceCode = context.getSourceCode();
  if (typeof sourceCode.getLocFromIndex === 'function') {
    return sourceCode.getLocFromIndex(index);
  } else {
    const text = sourceCode.getText();
    const lines = sourceCode.getLines();
    if (typeof index !== 'number') {
      throw new TypeError('Expected `index` to be a number.');
    }
    if (index < 0 || index > text.length) {
      throw new RangeError('Index out of range.');
    }
    if (index === text.length) {
      return {
        line: lines.length,
        column: lines[lines.length - 1].length,
      };
    }
    let offset = 0;
    for (let i = 0; i < lines.length; i++) {
      if (index >= offset && index <= offset + lines[i].length) {
        return {
          line: i + 1,
          column: index - offset,
        };
      }
      // Add 1 for the line ending character
      offset = offset + lines[i].length + 1;
    }
  }
}

// This is just the parse as object function from:
// https://github.com/facebook/react-native/blob/d72c6fd/packager/react-packager/src/node-haste/DependencyGraph/docblock.js

const commentStartRe = /^\/\*\*/;
const commentEndRe = /\*\/$/;
const wsRe = /[\t ]+/g;
const stringStartRe = /(\r?\n|^) *\*/g;
const multilineRe = /(?:^|\r?\n) *(@[^\r\n]*?) *\r?\n *([^@\r\n\s][^@\r\n]+?) *\r?\n/g;
const propertyRe = /(?:^|\r?\n) *@(\S+) *([^\r\n]*)/g;

function parseDocblock(docblock_) {
  let docblock = docblock_
    .replace(commentStartRe, '')
    .replace(commentEndRe, '')
    .replace(wsRe, ' ')
    .replace(stringStartRe, '$1');

  // Normalize multi-line directives
  let prev = '';
  while (prev !== docblock) {
    prev = docblock;
    docblock = docblock.replace(multilineRe, '\n$1 $2\n');
  }
  docblock = docblock.trim();

  const result = {};
  let match;
  while ((match = propertyRe.exec(docblock))) {
    result[match[1]] = match[2];
  }

  return result;
}
