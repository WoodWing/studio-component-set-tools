import * as colors from 'colors/safe';
import * as fs from 'fs';
import * as path from 'path';
import * as semver from 'semver';

import * as Ajv from 'ajv';
import * as recursiveReadDir from 'recursive-readdir';

import { componentsDefinitionSchema_v1_0_x } from './components-schema-v1_0_x';
import { componentsDefinitionSchema_v1_1_x } from './components-schema-v1_1_x';
import { componentsDefinitionSchema_v1_2_x } from './components-schema-v1_2_x';
import { componentsDefinitionSchema_v1_3_x } from './components-schema-v1_3_x';

import { parseDefinition } from './parser/parser-utils';
import { ComponentsDefinition, ComponentSet } from './models';
import {
    Validator, RestrictChildrenValidator, DocContainerValidator, DefaultComponentOnEnterValidator,
    UnitTypeValidator, ImageEditorValidator, FocuspointValidator, DirectivePropertiesValidator, GroupsValidator,
    ConversionRulesValidator, DocSlideshowValidator, DropCapitalValidator, PropertiesValidator, FittingValidator,
    InteractiveValidator, ComponentsValidator, DisableFullscreenCheckboxValidator, SlidesValidator,
    ScriptsValidator, DocMediaValidator, IconsValidator, DefaultValuesValidator, AutofillValidator,
    DefaultComponentOnEnterOverrideValidator, DocContainerGroupsValidator, ConversionShortcutsValidator
} from './validators';

const ajv = new Ajv({allErrors: true, jsonPointers: true, verbose: true});

const componentsDefinitionPath = path.normalize('./components-definition.json');

export const readFile: GetFileContentType = (pathToFile: fs.PathLike, options?: GetFileContentOptionsType) =>
    new Promise<any>((resolve, reject) => {
        return fs.readFile(pathToFile, options, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });

/**
 * Validates a components package based on folder path.
 *
 * @param folderPath Path to folder containing the components.
 */
export async function validateFolder(folderPath: string): Promise<boolean> {
    folderPath = path.normalize(folderPath);

    // List files, make relative to input folder and normalize.
    const files = new Set(
        (await recursiveReadDir(folderPath))
        .map((p) => path.normalize(p).replace(
            new RegExp(`^${folderPath.replace(/\\/g, '\\\\')}(/|\\\\)?`), '')),
    );

    return validate(
        files,
        async (filePath: string, options?: GetFileContentOptionsType) =>
            readFile(path.resolve(folderPath, filePath), options),
        (errorMessage) => {
            console.log(colors.red(errorMessage));
        }
    );
}

/**
 * Getting file options type
 */
export type GetFileContentOptionsType = { encoding: string|null } | null;

/**
 * return string if encoding is string and Buffer otherwise
 */
export type GetFileContentType = (filePath: string, options?: GetFileContentOptionsType) => Promise<any>;

/**
 * Validates a components package given an array of paths
 * and a function to get the file content.
 *
 * @param filePaths paths to files, relative to root folder of components package
 * @param getFileContent an async function that resolves with the file content
 * @param errorReporter error reporter
 */
export async function validate(
    filePaths: Set<string>,
    getFileContent: GetFileContentType,
    errorReporter: (errorMessage: string) => void,
) {
    // Validate it has a component definition file
    if (!filePaths.has(componentsDefinitionPath)) {
        errorReporter(`Components definition file missing ${componentsDefinitionPath}`);
        return false;
    }

    // Validate the schema of the component definition file
    const componentsDefinition: ComponentsDefinition = JSON.parse(await getFileContent(componentsDefinitionPath, { encoding: 'utf8' }));

    const validateSchema = getValidationSchema(componentsDefinition.version);
    if (!validateSchema) {
        errorReporter(`Could not find validation schema for component model version "${componentsDefinition.version}"`);
        return false;
    }

    if (!validateSchema(componentsDefinition)) {
        if (validateSchema.errors) {
            validateSchema.errors.forEach((error) => {
                errorReporter(`${error.dataPath} ${error.message}\n${JSON.stringify(error.params, undefined, 4)}`);
            });
        }
        return false;
    }

    // parse everything for deeper testing
    let componentSet: ComponentSet|null = null;
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
    const validateError = (errorMessage: string) : false => {
        valid = false;
        errorReporter(errorMessage);
        return valid;
    };

    const validators = getValidators(
        componentsDefinition.version,
        validateError,
        componentSet,
        filePaths,
        getFileContent
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
 * Returns the validation function for given version.
 *
 * @param version
 * @returns schema validation function if found, otherwise null.
 */
function getValidationSchema(version: string): Ajv.ValidateFunction | null {
    // Only one version supported
    // When introducing a patch version, make sure to update the supported range, e.g. '1.0.0 - 1.0.1'
    if (semver.satisfies(version, '1.0.0')) {
        return ajv.compile(componentsDefinitionSchema_v1_0_x);
    } else if (semver.satisfies(version, '1.1.x')) {
        return ajv.compile(componentsDefinitionSchema_v1_1_x);
    } else if (semver.satisfies(version, '1.2.x')) {
        return ajv.compile(componentsDefinitionSchema_v1_2_x);
    } else if (semver.satisfies(version, '1.3.x')) {
        return ajv.compile(componentsDefinitionSchema_v1_3_x);
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
 */
export function getValidators(
    version: string,
    error: (errorMessage: string) => false,
    componentSet: ComponentSet,
    filePaths: Set<string>,
    getFileContent: GetFileContentType,
) : Validator[] | null {
    let validators: Validator[] = [];
    if (semver.satisfies(version, '>=1.0.0')) {
        validators = validators.concat(
            new ComponentsValidator(error, componentSet, filePaths),
            new ConversionRulesValidator(error, componentSet),
            new DefaultComponentOnEnterValidator(error, componentSet),
            new DefaultValuesValidator(error, componentSet),
            new DirectivePropertiesValidator(error, componentSet),
            new DisableFullscreenCheckboxValidator(error, componentSet),
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
        validators = validators.concat(
            new ConversionShortcutsValidator(error, parsedDefinition),
        );
    }
    return validators.length > 0 ? validators : null;
}