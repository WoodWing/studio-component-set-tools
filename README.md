# csde-components-validator

Validation module for Content Station Digital Editor component sets.

## Usage

The module provides two public api methods for validating a component set.

### validateFolder

Validates a component set given an input folder.

```ts
import { validateFolder } from './lib/index';

const validationResult: boolean = await validateFolder('path/to/component-set');
```

The validation result is returned as a boolean value and any error is logged to the console.

### validate

Lower level method that validates the component set given a set of paths, a function to get the file content given the path and a function that logs errors. This api is useful when the component set is validated in memory.

```ts
import { validate } from './lib/index';

const filePaths = new Set(['path1', 'path2']);
const getFileContent = async (filePath: string) => 'fileContent';
const errorReporter = (errorMessage: string) => console.error(errorMessage);

const validationResult: boolean = await validate(filePaths, getFileContent, errorReporter);
```

### parser

If published version (from "dist" folder) of the package is used then:

-   if parser is going to be used in the browser remember that package's target is ES6 which may be unsupported or partly supported by the browsers
-   also polyfills may be needed for IE browsers

An example of possible usage:

```ts
import { parseDefinition } from '@woodwing/csde-components-validator/dist/parser';

const componentsDefinition = getComponentsDefinitionJson();
parseDefinition(componentsDefinition).then((componentSet) => {
    // componentSet is a parsed definition
});
```

## Publish

In case you have never published a npm module before, make sure to read the official npm documentation about [publishing npm packages](https://docs.npmjs.com/getting-started/publishing-npm-packages).

Before publishing update the [version number](https://docs.npmjs.com/getting-started/publishing-npm-packages#how-to-update-the-version-number) of this package. For example, to increase the patch version:

    $ npm version patch -m "Bump validator version to %s"

Next verify you are logged in as a user with access to the [Woodwing organization](https://www.npmjs.com/org/woodwing):

    $ npm whoami

Finally publish the [scoped package](https://www.npmjs.com/docs/orgs/publishing-an-org-scoped-package.html#publishing-a-public-scoped-package) by running:

    $ npm publish --access public
