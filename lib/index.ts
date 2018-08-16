import * as colors from 'colors/safe';
import * as fs from 'fs';
import * as path from 'path';
import * as semver from 'semver';

import * as Ajv from 'ajv';
import * as recursiveReadDir from 'recursive-readdir';

import { componentsDefinitionSchema_v1_0_x } from './components-schema-v1_0_x';
import { componentsDefinitionSchema_v1_1_x } from './components-schema-v1_1_x';
import { parseDefinition } from './parser/parser-utils';
import { ParsedComponentsDefinitionV10X, ComponentsDefinition } from './models';
import {
    Validator, RestrictChildrenValidator, DocContainerValidator, DefaultComponentOnEnterValidator,
    UnitTypeValidator, ImageEditorValidator, FocuspointValidator, DirectivePropertiesValidator, GroupsValidator,
    ConversionRulesValidator, DocSlideshowValidator, DropCapitalValidator, PropertiesValidator, FittingValidator,
    InteractiveValidator, ComponentsValidator, DisableFullscreenCheckboxValidator, SlidesValidator,
    ScriptsValidator, DocMediaValidator, IconsValidator, DefaultValuesValidator, AutofillValidator
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
    let parsedDefinition: ParsedComponentsDefinitionV10X|null = null;
    try {
        parsedDefinition = await parseDefinition(componentsDefinition, getFileContent);
    } catch (e) {
        errorReporter(e);
    }
    // can't run validators if the parser has failed
    if (!parsedDefinition) {
        return false;
    }

    const validators = getValidators(componentsDefinition.version, filePaths, componentsDefinition, parsedDefinition, getFileContent);
    if (!validators) {
        errorReporter(`Could not find validators for component model version "${componentsDefinition.version}"`);
        return false;
    }

    let valid = true;
    for (const validator of validators) {
        valid = (await validator.validate(errorReporter)) && valid;
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
    }
    return null;
}

/**
 * Returns set of validators according to component definition version
 *
 * @param version
 * @param filePaths
 * @param componentsDefinition
 * @param parsedDefinition
 * @param getFileContent
 */
function getValidators(
    version: string,
    filePaths: Set<string>,
    componentsDefinition: ComponentsDefinition,
    parsedDefinition: ParsedComponentsDefinitionV10X,
    getFileContent: GetFileContentType
) : Validator[] | null {
    const common: Validator[] = [
        new ComponentsValidator(filePaths, componentsDefinition),
        new ConversionRulesValidator(parsedDefinition),
        new DefaultComponentOnEnterValidator(parsedDefinition),
        new DefaultValuesValidator(parsedDefinition),
        new DirectivePropertiesValidator(parsedDefinition),
        new DisableFullscreenCheckboxValidator(componentsDefinition),
        new DocContainerValidator(parsedDefinition),
        new DocMediaValidator(parsedDefinition),
        new DocSlideshowValidator(parsedDefinition),
        new DropCapitalValidator(componentsDefinition, parsedDefinition),
        new FittingValidator(parsedDefinition),
        new FocuspointValidator(parsedDefinition),
        new GroupsValidator(parsedDefinition),
        new IconsValidator(componentsDefinition, getFileContent),
        new ImageEditorValidator(componentsDefinition),
        new InteractiveValidator(componentsDefinition),
        new PropertiesValidator(filePaths, componentsDefinition),
        new RestrictChildrenValidator(parsedDefinition),
        new ScriptsValidator(filePaths, componentsDefinition),
        new SlidesValidator(parsedDefinition),
        new UnitTypeValidator(componentsDefinition),
    ];
    if (semver.satisfies(version, '1.0.0')) {
        return common;
    } else if (semver.satisfies(version, '1.1.x')) {
        return common.concat(
            new AutofillValidator(parsedDefinition)
        );
    }
    return null;
}