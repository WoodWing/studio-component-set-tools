/**
 * Validates usage of interactive control type
 */

import { Validator } from './validator';
import { ComponentsDefinition } from '../models';

const CONTROL = 'interactive';
const ALLOWED_DATA_TYPE = 'doc-interactive';

export class InteractiveValidator extends Validator {

    constructor(
        error: (errorMessage: string) => false,
        private definition: ComponentsDefinition,
    ) {
        super(error);
    }

    validate(): void {
        for (const property of this.definition.componentProperties) {
            if (property.control.type === CONTROL && property.dataType !== ALLOWED_DATA_TYPE) {
                this.error(`Property "${property.name}" uses "${CONTROL}" control type which is allowed to use with ` +
                    `dataType="${ALLOWED_DATA_TYPE}" only`);
            }
        }
    }
}
