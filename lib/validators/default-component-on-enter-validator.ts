/**
 * Validates defaultComponentOnEnter components property
 */

import { Validator } from './validator';
import { ParsedComponentsDefinition } from '../models';

export class DefaultComponentOnEnterValidator implements Validator {

    constructor(
        private definition: ParsedComponentsDefinition,
    ) {
    }

    validate(
        errorReporter: (errorMessage: string) => void,
    ): boolean {
        let valid = true;

        if (!(this.definition.defaultComponentOnEnter in this.definition.components)) {
            errorReporter(`Property "defaultComponentOnEnter" points to non existing component "${this.definition.defaultComponentOnEnter}"`);
            valid = false;
        }

        return valid;
    }
}
