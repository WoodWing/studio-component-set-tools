/**
 * Validates defaultComponentOnEnter components property
 */

import { Validator } from './validator';

export class DefaultComponentOnEnterOverrideValidator extends Validator {
    async validate(): Promise<void> {
        for (const component of Object.values(this.componentSet.components)) {
            if (
                component.defaultComponentOnEnter &&
                !(component.defaultComponentOnEnter in this.componentSet.components)
            ) {
                this.error(
                    `Property "defaultComponentOnEnter" of "${component.name}" points to non existing component "${component.defaultComponentOnEnter}"`,
                );
            }
        }
    }
}
