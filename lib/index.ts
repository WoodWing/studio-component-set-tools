import * as fs from 'fs';
import * as path from 'path';
import * as semver from 'semver';
import ajv, { ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import colors from 'colors/safe';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore no typings for json-source-map
import * as jsonMap from 'json-source-map';

import { componentsDefinitionSchema_v1_0_x } from './components-schema-v1_0_x';
import { componentsDefinitionSchema_v1_1_x } from './components-schema-v1_1_x';
import { componentsDefinitionSchema_v1_2_x } from './components-schema-v1_2_x';
import { componentsDefinitionSchema_v1_3_x } from './components-schema-v1_3_x';
import { componentsDefinitionSchema_v1_4_x } from './components-schema-v1_4_x';
import { componentsDefinitionSchema_v1_5_x } from './components-schema-v1_5_x';

import { parseDefinition } from './parser';
import {
    ComponentsDefinition,
    ComponentSet,
    GetFileContentType,
    GetFileContentOptionsType,
    GetFileSize,
} from './models';
import {
    Validator,
    RestrictChildrenValidator,
    DocContainerValidator,
    DefaultComponentOnEnterValidator,
    UnitTypeValidator,
    ImageEditorValidator,
    FocuspointValidator,
    DirectivePropertiesValidator,
    GroupsValidator,
    ConversionRulesValidator,
    DocSlideshowValidator,
    DropCapitalValidator,
    PropertiesValidator,
    FittingValidator,
    InteractiveValidator,
    ComponentsValidator,
    DisableFullscreenCheckboxValidator,
    SlidesValidator,
    ScriptsValidator,
    DocMediaValidator,
    IconsValidator,
    DefaultValuesValidator,
    AutofillValidator,
    DefaultComponentOnEnterOverrideValidator,
    DocContainerGroupsValidator,
    ConversionShortcutsValidator,
    LocalizationValidator,
    PackageValidator,
} from './validators';
import { listFilesRelativeToFolder } from './util/files';
import { validateTotalSize } from './validators/package-validator';

const ajvInstance = new ajv({ allErrors: true, verbose: true });
addFormats(ajvInstance);

const componentsDefinitionPath = path.normalize('./components-definition.json');

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
        console.log(colors.red(errorMessage));
    });
}

/**
 * Validates a components package given an array of paths
 * and a function to get the file content.
 *
 * @param filePaths paths to files, relative to root folder of components package
 * @param getFileContent an async function that resolves with the file content
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
        componentSet = await parseDefinition(componentsDefinition, getFileContent);
    } catch (e) {
        errorReporter(e);
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
): Promise<{
    data: ComponentsDefinition | null;
    pointers: { [key: string]: { [key: string]: { line: number; column: number; pos: number } } } | null;
}> {
    try {
        return jsonMap.parse(componentsDefinitionContent);
    } catch (e) {
        errorReporter(colors.red(`Components definition file "${componentsDefinitionPath}" is not valid json: \n${e}`));
    }
    return { data: null, pointers: null };
}

/**
 * Returns the validation function for given version.
 *
 * @param version
 * @returns schema validation function if found, otherwise null.
 */
function getValidationSchema(version: string): ValidateFunction | null {
    // Only one version supported
    // When introducing a patch version, make sure to update the supported range, e.g. '1.0.0 - 1.0.1'
    if (semver.satisfies(version, '1.0.0')) {
        return ajvInstance.compile(componentsDefinitionSchema_v1_0_x);
    } else if (semver.satisfies(version, '1.1.x')) {
        return ajvInstance.compile(componentsDefinitionSchema_v1_1_x);
    } else if (semver.satisfies(version, '1.2.x')) {
        return ajvInstance.compile(componentsDefinitionSchema_v1_2_x);
    } else if (semver.satisfies(version, '1.3.x')) {
        return ajvInstance.compile(componentsDefinitionSchema_v1_3_x);
    } else if (semver.satisfies(version, '1.4.x')) {
        return ajvInstance.compile(componentsDefinitionSchema_v1_4_x);
    } else if (semver.satisfies(version, '1.5.x')) {
        return ajvInstance.compile(componentsDefinitionSchema_v1_5_x);
    }
    return null;
}

/**
 * Returns set of validators according to component definition version
 *
 * @param version
 * @param filePaths
 * @param componentsDefinition
 * @param componentSet
 * @param getFileContent
 * @param getFileSize
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
    if (semver.satisfies(version, '>=1.0.0')) {
        validators = validators.concat(
            new ComponentsValidator(error, componentSet, filePaths),
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
        );
    }
    if (semver.satisfies(version, '>=1.1.0')) {
        validators = validators.concat(
            new AutofillValidator(error, componentSet),
            new DefaultComponentOnEnterOverrideValidator(error, componentSet),
            new DocContainerGroupsValidator(error, componentSet),
        );
    }
    if (semver.satisfies(version, '>=1.3.0')) {
        validators = validators.concat(new ConversionShortcutsValidator(error, componentSet));
    }
    if (semver.satisfies(version, '>=1.0.0') && semver.satisfies(version, '<1.4.0')) {
        validators = validators.concat(new DisableFullscreenCheckboxValidator(error, componentSet));
    }
    return validators.length > 0 ? validators : null;
}
