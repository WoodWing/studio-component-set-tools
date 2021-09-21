import * as fs from 'fs';
import * as path from 'path';
import * as semver from 'semver';
import ajv, { Schema, ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import * as chalk from 'chalk';
import * as jsonMap from 'json-source-map';

import { componentsDefinitionSchema_v1_0_x } from './components-schema-v1_0_x';
import { componentsDefinitionSchema_v1_1_x } from './components-schema-v1_1_x';
import { componentsDefinitionSchema_v1_2_x } from './components-schema-v1_2_x';
import { componentsDefinitionSchema_v1_3_x } from './components-schema-v1_3_x';
import { componentsDefinitionSchema_v1_4_x } from './components-schema-v1_4_x';
import { componentsDefinitionSchema_v1_5_x } from './components-schema-v1_5_x';
import { componentsDefinitionSchema_v1_6_x } from './components-schema-v1_6_x';
import { componentsDefinitionSchema_v1_7_x } from './components-schema-v1_7_x';
import { componentsDefinitionSchema_v1_8_x } from './components-schema-v1_8_x';
import { componentsDefinitionSchema_v1_9_x } from './components-schema-v1_9_x';

import { parseDefinition } from './parser';
import {
    ComponentsDefinition,
    ComponentSet,
    GetFileContentOptionsType,
    GetFileContentType,
    GetFileSize,
} from './models';
import {
    AutofillValidator,
    ComponentsValidator,
    ConversionRulesValidator,
    ConversionShortcutsValidator,
    CustomStylesValidator,
    DefaultComponentOnEnterOverrideValidator,
    DefaultComponentOnEnterValidator,
    DefaultValuesValidator,
    DirectiveOptionsValidator,
    DirectivePropertiesValidator,
    DisableFullscreenCheckboxValidator,
    DocContainerGroupsValidator,
    DocContainerValidator,
    DocMediaValidator,
    DocSlideshowValidator,
    DropCapitalValidator,
    FittingValidator,
    FocuspointValidator,
    GroupsValidator,
    IconsValidator,
    ImageEditorValidator,
    InteractiveValidator,
    LocalizationValidator,
    PackageValidator,
    PropertiesValidator,
    RestrictChildrenValidator,
    ScriptsValidator,
    SlidesValidator,
    StripStylingOnPasteValidator,
    UnitTypeValidator,
    validateTotalSize,
    Validator,
} from './validators';
import { listFilesRelativeToFolder } from './util/files';
import { loadHtmlRenditions } from './renditions';
import { deepFreeze } from './util/freeze';

const ajvInstance = new ajv({ allErrors: true, verbose: true, allowUnionTypes: true });
addFormats(ajvInstance);

const componentsDefinitionPath = 'components-definition.json';

export const readFile: GetFileContentType = (pathToFile: fs.PathLike, options?: GetFileContentOptionsType) =>
    new Promise<string | Buffer>((resolve, reject) => {
        return fs.readFile(pathToFile, options, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });

export const getSize: GetFileSize = (pathToFile: fs.PathLike) => {
    return new Promise<number>((resolve, reject) => {
        return fs.stat(pathToFile, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data.size);
            }
        });
    });
};

/**
 * Validates a components package based on folder path.
 *
 * @param folderPath Path to folder containing the components.
 */
export async function validateFolder(folderPath: string): Promise<boolean> {
    const files = await listFilesRelativeToFolder(folderPath);
    const getFileContent = async (filePath: string, options?: GetFileContentOptionsType) =>
        readFile(path.resolve(folderPath, filePath), options);
    const getFileSize = async (filePath: string) => getSize(path.resolve(folderPath, filePath));
    return validate(files, getFileContent, getFileSize, (errorMessage) => {
        console.log(chalk.redBright(errorMessage));
    });
}

/**
 * Validates a components package given an array of paths
 * and a function to get the file content.
 *
 * @param filePaths normalized paths to files, relative to root folder of components package
 * @param getFileContent an async function that resolves with the file content
 * @param getFileSize an async function that resolves with the file size
 * @param errorReporter called when there is a validation error
 */
export async function validate(
    filePaths: Set<string>,
    getFileContent: GetFileContentType,
    getFileSize: GetFileSize,
    errorReporter: (errorMessage: string) => void,
): Promise<boolean> {
    if (!filePaths.has(componentsDefinitionPath)) {
        errorReporter(`Components definition file "${componentsDefinitionPath}" is missing`);
        return false;
    }

    const componentsDefinitionContent = (await getFileContent(componentsDefinitionPath, {
        encoding: 'utf8',
    })) as string;
    const { data: componentsDefinition, pointers: componentsDefinitionSourcePointers } = await getComponentsDefinition(
        componentsDefinitionContent,
        errorReporter,
    );
    if (!componentsDefinition) {
        return false;
    }
    deepFreeze(componentsDefinition);

    const validateSchema = getValidationSchema(componentsDefinition.version);
    if (!validateSchema) {
        errorReporter(`Could not find validation schema for component model version "${componentsDefinition.version}"`);
        return false;
    }

    if (!validateSchema(componentsDefinition)) {
        if (validateSchema.errors) {
            const jsonLines = componentsDefinitionContent.split('\n');

            validateSchema.errors.forEach((error) => {
                if (!componentsDefinitionSourcePointers) {
                    return;
                }

                const errorPointer = componentsDefinitionSourcePointers[error.dataPath];

                let errorMessage = `${error.dataPath} ${error.message}\n${JSON.stringify(error.params, undefined, 4)}`;
                errorMessage += `\n${componentsDefinitionPath} - line ${errorPointer.value.line}, column ${errorPointer.value.column}:`;
                errorMessage += `\n> ${jsonLines
                    .slice(errorPointer.value.line, Math.max(errorPointer.valueEnd.line, errorPointer.value.line + 1))
                    .join('\n> ')}\n`;
                errorReporter(errorMessage);
            });
        }
        return false;
    }

    // parse everything for deeper testing
    let componentSet: ComponentSet | null = null;
    try {
        componentSet = await parseDefinition(await loadHtmlRenditions(componentsDefinition, getFileContent));
    } catch (e) {
        errorReporter(e.message ?? e);
    }
    // can't run validators if the parser has failed
    if (!componentSet) {
        return false;
    }

    // Wrap the error reporter to detect if it's called
    let valid = true;
    const validateError = (errorMessage: string): false => {
        valid = false;
        errorReporter(errorMessage);
        return valid;
    };

    const validators = getValidators(
        componentsDefinition.version,
        validateError,
        componentSet,
        filePaths,
        getFileContent,
        getFileSize,
    );
    if (!validators) {
        errorReporter(`Could not find validators for component model version "${componentsDefinition.version}"`);
        return false;
    }

    for (const validator of validators) {
        await validator.validate();
    }

    return valid;
}

/**
 * Validates the total file size of the component set package.
 *
 * @param size component set package size in bytes
 * @param errorReporter called when there is a validation error
 */
export function validatePackageSize(size: number, errorReporter: (errorMessage: string) => void): boolean {
    const error = validateTotalSize(size);
    if (error) {
        errorReporter(error);
        return false;
    }
    return true;
}

async function getComponentsDefinition(
    componentsDefinitionContent: string,
    errorReporter: (errorMessage: string) => void,
): Promise<jsonMap.ParsedJsonSourceMap<ComponentsDefinition>> {
    try {
        return jsonMap.parse(componentsDefinitionContent);
    } catch (e) {
        errorReporter(
            chalk.redBright(`Components definition file "${componentsDefinitionPath}" is not valid json: \n${e}`),
        );
    }
    return { data: null, pointers: null };
}

const semVerOptions = { includePrerelease: true };

/**
 * Returns the validation function for given version.
 *
 * @param version
 * @returns schema validation function if found, otherwise null.
 */
function getValidationSchema(version: string): ValidateFunction | null {
    const schemaSource = getValidationSchemaSource(version);
    return schemaSource !== null ? ajvInstance.compile(schemaSource) : null;
}

/**
 * Returns the validation schema source for given version.
 *
 * @param version
 * @returns schema validation schema source if found, otherwise null.
 */
function getValidationSchemaSource(version: string): Schema | null {
    // Only one version supported
    // When introducing a patch version, make sure to update the supported range, e.g. '1.0.0 - 1.0.1'
    if (semver.satisfies(version, '1.0.0', semVerOptions)) {
        return componentsDefinitionSchema_v1_0_x;
    } else if (semver.satisfies(version, '1.1.x', semVerOptions)) {
        return componentsDefinitionSchema_v1_1_x;
    } else if (semver.satisfies(version, '1.2.x', semVerOptions)) {
        return componentsDefinitionSchema_v1_2_x;
    } else if (semver.satisfies(version, '1.3.x', semVerOptions)) {
        return componentsDefinitionSchema_v1_3_x;
    } else if (semver.satisfies(version, '1.4.x', semVerOptions)) {
        return componentsDefinitionSchema_v1_4_x;
    } else if (semver.satisfies(version, '1.5.x', semVerOptions)) {
        return componentsDefinitionSchema_v1_5_x;
    } else if (semver.satisfies(version, '1.6.x', semVerOptions)) {
        return componentsDefinitionSchema_v1_6_x;
    } else if (semver.satisfies(version, '1.7.x', semVerOptions)) {
        return componentsDefinitionSchema_v1_7_x;
    } else if (semver.satisfies(version, '1.8.x', semVerOptions)) {
        return componentsDefinitionSchema_v1_8_x;
    } else if (semver.satisfies(version, '1.9.0-next', semVerOptions)) {
        return componentsDefinitionSchema_v1_9_x;
    }

    return null;
}

/**
 * Returns set of validators according to component definition version
 */
export function getValidators(
    version: string,
    error: (errorMessage: string) => false,
    componentSet: ComponentSet,
    filePaths: Set<string>,
    getFileContent: GetFileContentType,
    getFileSize: GetFileSize,
): Validator[] | null {
    let validators: Validator[] = [];
    if (semver.satisfies(version, '>=1.0.0', semVerOptions)) {
        validators = validators.concat(
            new ComponentsValidator(error, componentSet, filePaths),
            new DirectiveOptionsValidator(error, componentSet),
            new ConversionRulesValidator(error, componentSet),
            new DefaultComponentOnEnterValidator(error, componentSet),
            new DefaultValuesValidator(error, componentSet),
            new DirectivePropertiesValidator(error, componentSet),
            new DocContainerValidator(error, componentSet),
            new DocMediaValidator(error, componentSet),
            new DocSlideshowValidator(error, componentSet),
            new DropCapitalValidator(error, componentSet),
            new FittingValidator(error, componentSet),
            new FocuspointValidator(error, componentSet),
            new GroupsValidator(error, componentSet),
            new IconsValidator(error, componentSet, getFileContent),
            new ImageEditorValidator(error, componentSet),
            new InteractiveValidator(error, componentSet),
            new PropertiesValidator(error, componentSet, filePaths),
            new RestrictChildrenValidator(error, componentSet),
            new ScriptsValidator(error, componentSet, filePaths),
            new SlidesValidator(error, componentSet),
            new UnitTypeValidator(error, componentSet),
            new LocalizationValidator(error, componentSet, filePaths, getFileContent),
            new PackageValidator(error, componentSet, filePaths, getFileSize),
            new CustomStylesValidator(error, componentSet, filePaths),
        );
    }
    if (semver.satisfies(version, '>=1.1.0', semVerOptions)) {
        validators = validators.concat(
            new AutofillValidator(error, componentSet),
            new DefaultComponentOnEnterOverrideValidator(error, componentSet),
            new DocContainerGroupsValidator(error, componentSet),
        );
    }
    if (semver.satisfies(version, '>=1.3.0', semVerOptions)) {
        validators = validators.concat(new ConversionShortcutsValidator(error, componentSet));
    }
    if (semver.satisfies(version, '>=1.0.0 <1.4.0', semVerOptions)) {
        validators = validators.concat(new DisableFullscreenCheckboxValidator(error, componentSet));
    }
    if (semver.satisfies(version, '>=1.6.0', semVerOptions)) {
        validators = validators.concat(new StripStylingOnPasteValidator(error, componentSet));
    }
    return validators.length > 0 ? validators : null;
}
