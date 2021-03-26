# studio-component-set-tools

Tools module for Studio Digital Editor component sets.

## Upgrade notice

This module is a continuation of the `csde-components-validator` module. When upgrading to this module there is a slight change: imports from `./lib/index` or `@woodwing/csde-components-validator/dist/lib/index` have to be changed to `./lib/validate` or `@woodwing/studio-component-set-tools/dist/lib/validate`.

## Usage

The module provides tooling to develop component sets. For example, it contains public API methods to validate a component set.

### `validateFolder`

Validates a component set given an input folder.

```ts
import { validateFolder } from './lib/validate';

const validationResult: boolean = await validateFolder('path/to/component-set');
```

The validation result is returned as a boolean value and any error is logged to the console.

### `validate`

Lower level method that validates the component set given a set of paths, a function to get the file content given the path and a function that logs errors. This api is useful when the component set is validated in memory.

```ts
import { validate } from './lib/validate';

const filePaths = new Set(['path1', 'path2']);
const getFileContent = async (filePath: string) => 'fileContent';
const errorReporter = (errorMessage: string) => console.error(errorMessage);

const validationResult: boolean = await validate(filePaths, getFileContent, errorReporter);
```

### `validatePackageSize`

Specific validation of the total maximum size of the component set (in bytes). This method can optionally be used as a quick fail-fast validation before running `validate` or `validateFolder`, which both run a full validation on the component set.

```ts
import { validatePackageSize } from './lib/validate';

const packageSize = (await fs.promises.stat('path/to/component-set.zip')).size;
const errorReporter = (errorMessage: string) => console.error(errorMessage);

const validationResult: boolean = await validatePackageSize(packageSize, errorReporter);
```

### `parseDefinition`

If published version (from "dist" folder) of the package is used then:

-   if parser is going to be used in the browser remember that package's target is ES6 which may be unsupported or partly supported by the browsers
-   also polyfills may be needed for IE browsers

An example of possible usage:

```ts
import { parseDefinition } from '@woodwing/studio-component-set-tools/dist/parser';

const componentsDefinition = getComponentsDefinitionJson();
// componentSet is a parsed definition
const componentSet = await parseDefinition(componentsDefinition);
```

### generateComponentSetInfo

To retrieve the component set information as provided when publishing an article from Studio, the `generateComponentSetInfo` function can be used.

The `generateComponentSetInfo` function needs the rendition templates to be available in the componentsDefinition. To add this information an
rendition resolver is expected as parameter. This function should return a Promise of a string with the contents of the rendition file. The
relative filepath is given as parameter.

An example of possible usage:

```ts
import { generateComponentSetInfo } from '@woodwing/studio-component-set-tools/dist/utils';

// The contents of components-definition.json as Javascript object
const componentsDefinition = getComponentsDefinitionJson();

const info = await generateComponentSetInfo(componentsDefinition, async (relativePath: string) => {
    return (await fs.promises.readFile(relativePath)).toString();
});
```

The returned data contains the field information per component. An example of the returned data:

```ts
{
    components: {
        body: {
            fields: [
                {
                    contentKey: 'text',
                    type: 'editable',
                },
            ],
        },
        intro: {
            fields: [
                {
                    contentKey: 'text',
                    type: 'editable',
                },
            ],
        },
    },
}
```

## Development

### Watched build/test

To watch the build:

```bash
npm run watch
```

To watch the tests:

```bash
npm run watchtest
```

### Format

Formats all code according to [Prettier](https://prettier.io) configuration. Linting checks whether all code has been prettified. Formatting can also be applied automatically your favorite IDE or pre-commit hook. Check out the Prettier website for instructions.

```bash
npm run format:write
```

### Check

Runs ESLint, Prettier and all unit tests.

```bash
npm run check
```

Also available as individual commands

```bash
npm run lint
npm run format:check
npm run test
```

## Publish a new version

In case you have never published a npm module before, make sure to read the official npm documentation about [publishing npm packages](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry).

### Through the Github actions pipeline

1. Create a branch
1. Update the [version number](https://docs.npmjs.com/updating-your-published-package-version-number) of this package. For example, to increase the patch version:

    ```bash
    npm version patch -m "Bump validator version to %s"
    ```

    This will create a commit and tag for the version as well.

1. Push and create a PR from the branch.
1. After review, merge and delete the branch
1. Create a release in the [Release tab](https://github.com/WoodWing/studio-component-set-tools/releases) of the project. Use the same version as used in the first step for both _Tag version_ and _Release title_.
1. Describe the changes in the release
1. Publish the release

When the release workflow action succeeds, the new version will be available on [npm](https://www.npmjs.com/package/@woodwing/studio-component-set-tools)

### Manually

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
