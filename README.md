# csde-components-validator
Validation module for Content Station Digital Editor components packages.

## Versioning
The validator module should be capable of validating all supported versions.
The version string in the component definition file is used to determine the right validation schema.

The component definition model uses semantic versioning:

- a new MAJOR version is introduced when breaking changes are made
- a new MINOR version is introduced when additions are made to the component model in a non breaking fashion
- a new PATCH version is introduced for bug fixes in the validator

## Publish
Verify you are logged in as an user with access to the [Woodwing organization](https://www.npmjs.com/org/woodwing):

```npm whoami```

Update the version number in package.json and run:

```npm publish --access public```
