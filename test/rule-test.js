'use strict';

const fs = require('fs');
const path = require('path');

const RuleTester = require('eslint').RuleTester;
const rule = require('../rule');

const ruleTester = new RuleTester();

ruleTester.run('prettier', rule, {
  valid: [
    {code: 'a();\n'},
  ],
  invalid: [
    // testFixture('01'),
    // testFixture('02'),
    // testFixture('03'),
    // testFixture('04'),
    // testFixture('05'),
    testFixture('06'),
  ],
});

function testFixture(name) {
  const filename = path.join(__dirname, 'fixtures', name + '.txt');
  const src = fs.readFileSync(filename, 'utf8');
  const sections = src.split(/^\n?[A-Z]+:\n/m);
  const item = {
    code: sections[1],
    output: sections[2],
    errors: eval(sections[3]),
  };
  return item;
}
