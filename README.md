# studio-component-set-tools

Tools module for Studio Digital Editor component sets.

## Usage

The module provides tooling to develop component sets. It contains for example public API methods for validating a component set.

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

### validatePackageSize

Specific validation of the total maximum size of the component set (in bytes). This method can optionally be used as a quick fail-fast validation before running `validate` or `validateFolder`, which both run a full validation on the component set.

```ts
import { validatePackageSize } from './lib/index';

const packageSize = (await fs.promises.stat('path/to/component-set.zip')).size;
const errorReporter = (errorMessage: string) => console.error(errorMessage);

const validationResult: boolean = await validatePackageSize(packageSize, errorReporter);
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

## Develop

### Format

Formats all code according to [Prettier](https://prettier.io) configuration. Linting checks whether all code has been prettified. Formatting can also be applied automatically your favorite IDE or pre-commit hook. Check out the Prettier website for instructions.

```bash
npm run format:write
```

### Lint & test

Runs TSLint and afterwards all unit tests.

```bash
npm run test
```

## Publish

In case you have never published a npm module before, make sure to read the official npm documentation about [publishing npm packages](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry).

Before publishing update the [version number](https://docs.npmjs.com/updating-your-published-package-version-number) of this package. For example, to increase the patch version:

```bash
npm version patch -m "Bump validator version to %s"
```

Next verify you are logged in as a user with access to the [Woodwing organization](https://www.npmjs.com/org/woodwing):

```bash
npm whoami
```

Finally publish the [scoped package](https://docs.npmjs.com/creating-and-publishing-scoped-public-packages#publishing-scoped-public-packages) by running:

```bash
npm publish --access public
```
