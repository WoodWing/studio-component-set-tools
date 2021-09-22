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

Lower level method that validates the component set given a set of normalized relative paths, a function to get the file content given the normalized relative path and a function that logs errors. This api is useful when the component set is validated in memory.

```ts
import { validate } from './lib/validate';

const filePaths = new Set(['path1', 'path2']);
const getFileContent = async (normalizedRelativefilePath: string) => 'fileContent';
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

An example of possible usage:

```ts
import { parseDefinition } from '@woodwing/studio-component-set-tools/dist/parser';

const componentsDefinition = getComponentsDefinitionJson();
// componentSet is a parsed definition
const componentSet = await parseDefinition(componentsDefinition);
```

### generateComponentSetInfo

The `generateComponentSetInfo` function can be used to generate a plain overview of components and component fields. This information is useful to interpret digital articles created for the given component set. The input for the function is information from the component set: component set definition and rendition files (html, psv, etc).

The first parameter allows for specifying the components definition. As second parameter, a function is expected that returns the contents of a given component set rendition file as string.

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
        container: {
            fields: [
                {
                    contentKey: 'main',
                    restrictChildren: ['body'],
                    type: 'container',
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

## Releasing a new schema version

By default the next schema version is being developed under the `-next` tag. For example, if the latest release version is `1.6.0` you will see there is already a `1.7.0` version in this repository. It can be used by setting the version to `1.7.0-next`. This allows developers to already publish new versions of the studio component set tools without having to release a new schema version.

Using these versions as an example, when the new schema is ready follow these steps:

1. Duplicate `lib/components-schema-v1_7_x.ts` as `lib/components-schema-v1_8_x.ts`.
2. In `lib/validate.ts/getValidationSchemaSource` introduce a new matcher on `1.8.0-next` for the next in development schema.
3. Remove the prerelease tag `-next` from `1.7.0-next`
4. Update tests in `test/validate.test.ts` (include some simple smoke tests to ensure there are no typos in the version matching logic).

## Publish a new version

In case you have never published a npm module before, make sure to read the official npm documentation about [publishing npm packages](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry).

### Through the Github actions pipeline

1. Create a branch
1. Update the [version number](https://docs.npmjs.com/updating-your-published-package-version-number) of this package. For example, to increase the patch version:

    ```bash
    npm version patch -m "Bump validator version to %s"
    ```

    Minor version:

    ```bash
    npm version minor -m "Bump validator version to %s"
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

This will create a commit and tag for the version as well.

Next verify you are logged in as a user with access to the [Woodwing organization](https://www.npmjs.com/org/woodwing):

```bash
npm whoami
```

Finally publish the [scoped package](https://docs.npmjs.com/creating-and-publishing-scoped-public-packages#publishing-scoped-public-packages) by running:

```bash
npm run check
npm run build
npm publish --access public
```
