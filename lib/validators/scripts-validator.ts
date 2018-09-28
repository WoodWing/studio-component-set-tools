/**
 * Validates if scripts files are present
 */

import * as path from 'path';
import { Validator } from './validator';
import { ParsedComponentsDefinitionV10X } from '../models';

export class ScriptsValidator extends Validator {
    constructor(
        error: (errorMessage: string) => false,
        definition: ParsedComponentsDefinitionV10X,
        protected filePaths: Set<string>,
    ) {
        super(error, definition);
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
