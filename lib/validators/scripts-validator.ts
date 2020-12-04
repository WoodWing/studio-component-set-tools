/**
 * Validates if scripts files are present
 */

import * as path from 'path';
import { Validator } from './validator';
import { ComponentSet } from '../models';

export class ScriptsValidator extends Validator {
    constructor(error: (errorMessage: string) => false, definition: ComponentSet, protected filePaths: Set<string>) {
        super(error, definition);
    }

    async validate(): Promise<void> {
        if (this.componentSet.scripts) {
            for (const scriptPath of this.componentSet.scripts) {
                if (!this.filePaths.has(path.normalize(scriptPath))) {
                    this.error(`Script "${scriptPath}" does not exist`);
                }
            }
        }
    }
}
