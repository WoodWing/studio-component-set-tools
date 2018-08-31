/**
 * Validates defaultComponentOnEnter global property
 */

import { Validator } from './validator';
import { ParsedComponentsDefinitionV10X } from '../models';

export class DefaultComponentOnEnterValidator extends Validator {

    constructor(
        error: (errorMessage: string) => false,
        private definition: ParsedComponentsDefinitionV10X,
    ) {
        super(error);
    }

    validate(): void {
        if (!(this.definition.defaultComponentOnEnter in this.definition.components)) {
            this.error(`Property "defaultComponentOnEnter" points to non existing component "${this.definition.defaultComponentOnEnter}"`);
        }
    }
}
