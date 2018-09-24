/**
 * Validates defaultComponentOnEnter components property
 */

import { Validator } from './validator';
import { ParsedComponentsDefinitionV11X } from '../models';

export class DefaultComponentOnEnterOverrideValidator extends Validator {

    constructor(
        error: (errorMessage: string) => false,
        private definition: ParsedComponentsDefinitionV11X,
    ) {
        super(error);
    }

    validate(): void {
        for (const parsedComponent of Object.values(this.definition.components)) {
            if ('defaultComponentOnEnter' in parsedComponent.component &&
                parsedComponent.component.defaultComponentOnEnter &&
                !(parsedComponent.component.defaultComponentOnEnter in this.definition.components)
            ) {
                this.error(`Property "defaultComponentOnEnter" of "${parsedComponent.component.name}" points to non existing component "${parsedComponent.component.defaultComponentOnEnter}"`);
            }
        }
    }
}
