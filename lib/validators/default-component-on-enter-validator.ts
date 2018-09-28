/**
 * Validates defaultComponentOnEnter global property
 */

import { Validator } from './validator';

export class DefaultComponentOnEnterValidator extends Validator {
    validate(): void {
        if (!(this.definition.defaultComponentOnEnter in this.definition.components)) {
            this.error(`Property "defaultComponentOnEnter" points to non existing component "${this.definition.defaultComponentOnEnter}"`);
        }
    }
}
