/**
 * Validates if scripts files are present
 */

import * as path from 'path';
import { Validator } from './validator';
import { ComponentsDefinition } from '../models';

export class ScriptsValidator extends Validator {

    constructor(
        error: (errorMessage: string) => false,
        private filePaths: Set<string>,
        private definition: ComponentsDefinition,
    ) {
        super(error);
    }

    validate(): void {
        if (this.definition.scripts) {
            for (const scriptPath of this.definition.scripts) {
                if (!this.filePaths.has(path.normalize(scriptPath))) {
                    this.error(`Script "${scriptPath}" does not exist`);
                }
            }
        }
    }
}
