/**
 * Validates if scripts files are present
 */

import * as path from 'path';
import { Validator } from './validator';
import { ComponentsDefinition } from '../models';

export class ScriptsValidator implements Validator {

    constructor(
        private filePaths: Set<string>,
        private definition: ComponentsDefinition,
    ) {
    }

    validate(
        errorReporter: (errorMessage: string) => void,
    ): boolean {
        let valid = true;

        if (this.definition.scripts) {
            for (const scriptPath of this.definition.scripts) {
                if (!this.filePaths.has(path.normalize(scriptPath))) {
                    valid = false;
                    errorReporter(`Script "${scriptPath}" does not exist`);
                }
            }
        }

        return valid;
    }
}
