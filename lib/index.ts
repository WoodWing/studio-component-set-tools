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
        errorReporter('components definition file missing!');
        return false;
    }

    // Validate the schema of the component definition file
    const componentsDefinition = await getFileContent(componentsDefinitionPath);

    if (!validateSchema(JSON.parse(componentsDefinition))) {
        errorReporter(`Invalid: ${JSON.stringify(validateSchema.errors, undefined, 4)}`);
        return false;
    }

    // TODO: Validate components have matching templates

    return true;
}
