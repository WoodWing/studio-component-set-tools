/**
 * Validates if group components exist
 */

import { Validator } from './validator';
import { ParsedComponentsDefinition } from '../models';

export class GroupsValidator implements Validator {

    constructor(
        private definition: ParsedComponentsDefinition,
    ) {
    }

    validate(
        errorReporter: (errorMessage: string) => void,
    ): boolean {
        let valid = true;

        for (const parsedGroup of Object.values(this.definition.groups)) {
            for (const componentName of parsedGroup.components) {
                if (!(componentName in this.definition.components)) {
                    errorReporter(`Component "${componentName}" of group "${parsedGroup.name}" does not exist`);
                    valid = false;
                }
            }
        }
        
        return valid;
    }
}
