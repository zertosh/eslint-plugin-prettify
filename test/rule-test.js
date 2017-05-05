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
    {code: '/** @format */\n\'\';\n', options: ['fb']},
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
    testFixture('13'),
    testFixture('14'),
    testFixture('15'),
    testFixture('16'),
    testFixture('17'),
    testFixture('18'),
  ],
});

function testFixture(name) {
  const filename = path.join(__dirname, 'fixtures', name + '.txt');
  const src = fs.readFileSync(filename, 'utf8');
  const sections = src.split(/^[A-Z]+:\n/m).map(x => x.replace(/(?=\n)\n$/, ''));
  const item = {
    code: sections[1],
    output: sections[2],
    options: eval(sections[3]),
    errors: eval(sections[4]),
  };
  return item;
}
