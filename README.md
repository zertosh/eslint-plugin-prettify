# eslint-plugin-prettify [![Build Status](https://travis-ci.org/zertosh/eslint-plugin-prettify.svg?branch=master)](https://travis-ci.org/zertosh/eslint-plugin-prettify)

[Prettier](https://github.com/prettier/prettier) as an [ESLint](https://github.com/eslint/eslint) plugin. `eslint-plugin-prettify` will run your code through Prettier and report any differences between it and Prettier as ESLint issues.

## Sample

```js
warning: Insert `,` (prettify/prettier) at pkg/commons-atom/ActiveEditorRegistry.js:22:25:
  20 | import {
  21 |   observeActiveEditorsDebounced,
> 22 |   editorChangesDebounced
     |                         ^
  23 | } from './debounced';;
  24 |
  25 | import {observableFromSubscribeFunction} from '../commons-node/event';


warning: Delete `;` (prettify/prettier) at pkg/commons-atom/ActiveEditorRegistry.js:23:21:
  21 |   observeActiveEditorsDebounced,
  22 |   editorChangesDebounced
> 23 | } from './debounced';;
     |                     ^
  24 |
  25 | import {observableFromSubscribeFunction} from '../commons-node/event';
  26 | import {cacheWhileSubscribed} from '../commons-node/observable';


2 warnings found.
```

> `./node_modules/.bin/eslint --format codeframe pkg/commons-atom/ActiveEditorRegistry.js` (code from [nuclide](https://github.com/facebook/nuclide)).

## Usage

```sh
npm install --save-dev eslint-plugin-prettify prettier
```

_`eslint-plugin-prettify` does not install Prettier for you. You must install it yourself._

In your `.eslintrc`:

```json
{
  "plugins": [
    "prettify"
  ],
  "rules": {
    "prettify/prettier": 2
  }
}
```

## Options

* This rule has a first option:

  - Objects are passed directly to Prettier as [options](https://github.com/prettier/prettier#api). Example:
    
    ```json
    "prettify/prettier": [1, {"singleQuote": true, "parser": "flow"}]
    ```

  - Or the string `"fb"` may be used to set "Facebook defaults":

    ```json
    "prettify/prettier": [2, "fb"]
    ```

    Equivalent to:

    ```json
    "prettify/prettier": [2, {
      "singleQuote": true,
      "trailingComma": "all",
      "bracketSpacing": false,
      "jsxBracketSameLine": true,
      "parser": "flow",
    }, "@format"]
    ```

* The rule also has a second string option:

  - Used to set a pragma that triggers this rule. By default, this rule applies to all files. However, if you set a pragma, only files with that pragma in the heading docblock will be checked. All pragmas must start with `@`. Example:

    ```json
    "prettify/prettier": [2, null, "@prettier"]
    ```

    Only files with this docblock will be checked:

    ```js
    /** @prettier */

    console.log(1 + 2 + 3);
    ```

    Or:

    ```js
    /**
     * @prettier
     */

    console.log(4 + 5 + 6);
    ```

    When the first option is set to `"fb"`, the pragma is automatically set to `"@format"`.

## `prettify/no-styles` plugin

`eslint-plugin-prettify` also includes a special plugin that will cause ESLint to not report any _known_ stylistic issues. This is useful if you have a codebase that you're gradually converting to Prettier, but don't want to have overlapping messages from using a shared ESLint config.

### Usage

```json
{
  "plugins": [
    "prettify/no-styles"
  ],
  "rules": {
    "prettify/no-styles/prettier": 2
  }
}
```

### Options

When used like this, `eslint-plugin-prettify` takes the same options as when used _normally_.

### Caveats

* Only _known_ stylistic issues are filtered. In [no-styles.js](./no-styles.js), there's a hardcoded list of rule ids that are known to be stylistic-only. Submit a PR with updates!
* ESLint's `--fix` flag will not apply fixes anymore. This is a [known issue](https://github.com/eslint/eslint/blob/afbea78d/lib/cli-engine.js#L265) of processors. However, the fix information is still outputted to formatters. So if you're using ESLint through something like [Arcanist](https://secure.phabricator.com/), the fixes will work.

## Wishlist

* When two or more issues occur on the same line, that should be reported as a single "replace".
