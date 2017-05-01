'use strict';

// This is just the parse as object function from:
// https://github.com/facebook/react-native/blob/d72c6fd/packager/react-packager/src/node-haste/DependencyGraph/docblock.js

const commentStartRe = /^\/\*\*/;
const commentEndRe = /\*\/$/;
const wsRe = /[\t ]+/g;
const stringStartRe = /(\r?\n|^) *\*/g;
const multilineRe = /(?:^|\r?\n) *(@[^\r\n]*?) *\r?\n *([^@\r\n\s][^@\r\n]+?) *\r?\n/g;
const propertyRe = /(?:^|\r?\n) *@(\S+) *([^\r\n]*)/g;

module.exports.parse = function(docblock_) {
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
