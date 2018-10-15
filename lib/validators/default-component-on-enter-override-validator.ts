/**
 * Validates defaultComponentOnEnter components property
 */

import { Validator } from './validator';

export class DefaultComponentOnEnterOverrideValidator extends Validator {
    validate(): void {
        for (const parsedComponent of Object.values(this.definition.components)) {
            if (parsedComponent.defaultComponentOnEnter &&
                !(parsedComponent.defaultComponentOnEnter in this.definition.components)
            ) {
                this.error(`Property "defaultComponentOnEnter" of "${parsedComponent.name}" points to non existing component "${parsedComponent.defaultComponentOnEnter}"`);
            }
        }
    }
}
