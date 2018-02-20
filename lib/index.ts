import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';
// import * as colors from 'colors/safe'; // https://github.com/DefinitelyTyped/DefinitelyTyped/pull/23639
const colors = require('colors/safe');

const error = colors.red;
const readFileAsync = promisify(fs.readFile);

import * as Ajv from 'ajv';
import { componentsDefinitionSchema } from './components-schema';
import * as recursiveReadDir from 'recursive-readdir';

const ajv = new Ajv({allErrors: true, jsonPointers: true, verbose: true});
const validateSchema = ajv.compile(componentsDefinitionSchema);

const componentsDefinitionPath = path.normalize('./components-definition.json');

/**
 * Validates a components package based on folder path.
 *
 * @param folderPath Path to folder containing the components.
 */
export async function validateFolder(folderPath: string) : Promise<boolean> {
    folderPath = path.normalize(folderPath);

    // List files, make relative to input folder and normalize.
    const files = new Set(
        (await recursiveReadDir(folderPath))
        .map((p) => path.normalize(p.replace(new RegExp(`^${folderPath}(/|\)?`),"")))
    );

    return await validate(files, async (filePath: string) => {
        return readFileAsync(path.resolve(folderPath, filePath), {encoding: 'utf8'});
    }, (errorMessage) => {
        console.log(error(errorMessage));
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
    errorReporter: (errorMessage: string) => void
) {
    // Validate it has a component definition file
    if (!filePaths.has(componentsDefinitionPath)) {
        errorReporter(`Components definition file missing ${componentsDefinitionPath}`);
        return false;
    }

    // Validate the schema of the component definition file
    const componentsDefinition = JSON.parse(await getFileContent(componentsDefinitionPath));
    if (!validateSchema(componentsDefinition)) {
        if (validateSchema.errors) {
            validateSchema.errors.forEach(error => {
                errorReporter(`${error.dataPath} ${error.message}\n${JSON.stringify(error.params, undefined, 4)}`);
            });
        }
        return false;
    }

    // Perform additional validation of components now that we know the structure is as expected
    let valid = true;
    for (let i = 0; i < componentsDefinition.components.length; i++) {
        const comp = componentsDefinition.components[i];

        // Validate the component has an icon
        if (!filePaths.has(comp.icon)) {
            errorReporter(`Component ${comp.name} icon missing "${comp.icon}"`);
        }

        // Validate the component has a html template
        const htmlTemplatePath = path.normalize(`./templates/html/${comp.name}.html`);
        if (!filePaths.has(htmlTemplatePath)) {
            errorReporter(`Component ${comp.name} html template missing "${htmlTemplatePath}"`);
        }

        // Validate the component has a style
        const componentStylePath = path.normalize(`./styles/_${comp.name}.scss`);
        if (!filePaths.has(componentStylePath)) {
            errorReporter(`Component ${comp.name} style scss file missing "${componentStylePath}"`);
        }
    }

    return valid;
}
