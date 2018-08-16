/**
 * Validates defaultComponentOnEnter components property
 */

import { Validator } from './validator';
import { ParsedComponentsDefinitionV12X } from '../models';

export class DefaultComponentOnEnterOverrideValidator implements Validator {

    constructor(
        private definition: ParsedComponentsDefinitionV12X,
    ) {
    }

    validate(
        errorReporter: (errorMessage: string) => void,
    ): boolean {
        let valid = true;

        for (const parsedComponent of Object.values(this.definition.components)) {
            if ('defaultComponentOnEnter' in parsedComponent.component &&
                parsedComponent.component.defaultComponentOnEnter &&
                !(parsedComponent.component.defaultComponentOnEnter in this.definition.components)
            ) {
                errorReporter(`Property "defaultComponentOnEnter" of "${parsedComponent.component.name}" points to non existing component "${parsedComponent.component.defaultComponentOnEnter}"`);
                valid = false;
            }
        }

        return valid;
    }
}
