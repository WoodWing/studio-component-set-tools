/**
 * Validates defaultComponentOnEnter global property
 */

import { Validator } from './validator';

export class DefaultComponentOnEnterValidator extends Validator {
    async validate(): Promise<void> {
        if (!(this.componentSet.defaultComponentOnEnter in this.componentSet.components)) {
            this.error(
                `Property "defaultComponentOnEnter" points to non existing component "${this.componentSet.defaultComponentOnEnter}"`,
            );
        }
    }
}
