/**
 * Validates defaultComponentOnEnter components property
 */

import { Validator } from './validator';

export class DefaultComponentOnEnterOverrideValidator extends Validator {
    async validate(): Promise<void> {
        for (const parsedComponent of Object.values(this.componentSet.components)) {
            if (parsedComponent.defaultComponentOnEnter &&
                !(parsedComponent.defaultComponentOnEnter in this.componentSet.components)
            ) {
                this.error(`Property "defaultComponentOnEnter" of "${parsedComponent.name}" points to non existing component "${parsedComponent.defaultComponentOnEnter}"`);
            }
        }
    }
}
