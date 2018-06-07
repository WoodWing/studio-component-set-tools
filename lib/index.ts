import * as colors from 'colors/safe';
import * as fs from 'fs';
import * as path from 'path';
import * as semver from 'semver';

import * as Ajv from 'ajv';
import * as recursiveReadDir from 'recursive-readdir';

import { componentsDefinitionSchema_v1_0_x } from './components-schema-v1_0_x';
import { ComponentsDefinitionV10X } from './components-types-v1_0_x';
import { parseDefinition } from './parser/parser-utils';
import { RestrictChildrenValidator } from './validators/restrict-children-validator';
import { ParsedComponentsDefinition } from './models';
import { DocContainerValidator } from './validators/doc-container-validator';
import { Validator } from './validators/validator';
import { DocSlideshowValidator } from './validators/doc-slideshow-validator';
import { DefaultComponentOnEnterValidator } from './validators/default-component-on-enter-validator';
import { UnitTypeValidator } from './validators/unit-type-validator';
import { ImageEditorValidator } from './validators/image-editor-validator';
import { FocuspointValidator } from './validators/focuspoint-validator';

const ajv = new Ajv({allErrors: true, jsonPointers: true, verbose: true});

const componentsDefinitionPath = path.normalize('./components-definition.json');

export const readFile = (pathToFile: fs.PathLike, options: { encoding: string }) =>
    new Promise<string>((resolve, reject) => {
        return fs.readFile(pathToFile, options, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data.toString());
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

    return await validate(files, async (filePath: string) => {
        return await readFile(path.resolve(folderPath, filePath), {encoding: 'utf8'});
    }, (errorMessage) => {
        console.log(colors.red(errorMessage));
    });
}

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
    getFileContent: (filePath: string) => Promise<string>,
    errorReporter: (errorMessage: string) => void,
) {
    // Validate it has a component definition file
    if (!filePaths.has(componentsDefinitionPath)) {
        errorReporter(`Components definition file missing ${componentsDefinitionPath}`);
        return false;
    }

    // Validate the schema of the component definition file
    const componentsDefinition: ComponentsDefinitionV10X = JSON.parse(await getFileContent(componentsDefinitionPath));

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

    // Perform additional validation of components now that we know the structure is as expected
    let valid = true;
    const componentNames = new Set<string>();
    for (const comp of componentsDefinition.components) {
        // Validate we have not seen the name yet
        if (componentNames.has(comp.name)) {
            valid = false;
            errorReporter(`Component "${comp.name}" is not unique`);
        }
        componentNames.add(comp.name);

        // Validate the component has an icon
        if (!filePaths.has(path.normalize(comp.icon))) {
            valid = false;
            errorReporter(`Component "${comp.name}" icon missing "${comp.icon}"`);
        }

        // Validate the component has a html template
        const htmlTemplatePath = path.normalize(`./templates/html/${comp.name}.html`);
        if (!filePaths.has(htmlTemplatePath)) {
            valid = false;
            errorReporter(`Component "${comp.name}" html template missing "${htmlTemplatePath}"`);
        }

        // Validate the component has a style
        const componentStylePath = path.normalize(`./styles/_${comp.name}.scss`);
        if (!filePaths.has(componentStylePath)) {
            valid = false;
            errorReporter(`Component "${comp.name}" style scss file missing "${componentStylePath}"`);
        }
    }

    // Check component properties
    const componentPropertyNames = new Set<string>();
    for (const compProp of componentsDefinition.componentProperties) {
        // Validate we have not seen the name yet
        if (componentPropertyNames.has(compProp.name)) {
            valid = false;
            errorReporter(`Component property "${compProp.name}" is not unique`);
        }
        componentPropertyNames.add(compProp.name);

        // Validate the property has icons (for radio control type)
        if (compProp.control.type === 'radio') {
            for (const controlOption of compProp.control.options) {
                if (!filePaths.has(path.normalize(controlOption.icon))) {
                    valid = false;
                    errorReporter(`Component properties "${compProp.name}" icon missing "${controlOption.icon}"`);
                }
            }
        }
    }

    // Check component groups
    const componentGroupNames = new Set<string>();
    for (const group of componentsDefinition.groups) {
        // Validate we have not seen the name yet
        if (componentGroupNames.has(group.name)) {
            valid = false;
            errorReporter(`Component group "${group.name}" is not unique`);
        }
        componentGroupNames.add(group.name);
    }

    // parse everything for deeper testing
    let parsedDefinition: ParsedComponentsDefinition|null = null;
    try {
        parsedDefinition = await parseDefinition(componentsDefinition, getFileContent);
    } catch (e) {
        errorReporter(e);
    }
    // can't run validators without parsedDefinition
    if (!parsedDefinition) {
        return false;
    }

    const validators: Validator[] = [
        new RestrictChildrenValidator(parsedDefinition),
        new DocContainerValidator(parsedDefinition),
        new DocSlideshowValidator(parsedDefinition),
        new DefaultComponentOnEnterValidator(parsedDefinition),
        new UnitTypeValidator(componentsDefinition),
        new ImageEditorValidator(componentsDefinition),
        new FocuspointValidator(parsedDefinition),
    ];
    for (const validator of validators) {
        valid = validator.validate(errorReporter) && valid;
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
    }
    return null;
}
