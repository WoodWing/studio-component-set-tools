/**
 * Validates usage of disable-fullscreen-checkbox control type
 */

import { Validator } from './validator';
import { ComponentsDefinition } from '../models';

const CONTROL = 'disable-fullscreen-checkbox';
const ALLOWED_DATA_TYPE = 'styles';

export class DisableFullscreenCheckboxValidator implements Validator {

    constructor(
        private definition: ComponentsDefinition,
    ) {
    }

    validate(
        errorReporter: (errorMessage: string) => void,
    ): boolean {
        let valid = true;

        for (const property of this.definition.componentProperties) {
            if (property.control.type === CONTROL && property.dataType !== ALLOWED_DATA_TYPE) {
                errorReporter(`Property "${property.name}" uses "${CONTROL}" control type which is allowed to use with ` +
                    `dataType="${ALLOWED_DATA_TYPE}" only`);
                valid = false;
            }
        }

        return valid;
    }
}
