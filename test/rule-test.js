'use strict';

const fs = require('fs');
const path = require('path');

const RuleTester = require('eslint').RuleTester;
const rule = require('../rule');

const ruleTester = new RuleTester();

ruleTester.run('prettier', rule, {
  valid: [
    {code: 'a();\n'},
    {code: 'a()\n', options: [null, '@format']},
  ],
  invalid: [
    testFixture('01'),
    testFixture('02'),
    testFixture('03'),
    testFixture('04'),
    testFixture('05'),
    testFixture('06'),
    testFixture('07'),
    testFixture('08'),
    testFixture('09'),
    testFixture('10'),
    testFixture('11-a'),
    testFixture('11-b'),
    testFixture('11-c'),
    testFixture('12'),
  ],
});

function testFixture(name) {
  const filename = path.join(__dirname, 'fixtures', name + '.txt');
  const src = fs.readFileSync(filename, 'utf8');
  const sections = src.split(/^\n?[A-Z]+:\n/m);
  const item = {
    code: sections[1],
    output: sections[2],
    options: eval(sections[3]),
    errors: eval(sections[4]),
  };
  return item;
}
