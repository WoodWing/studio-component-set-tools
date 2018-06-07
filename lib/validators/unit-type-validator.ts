/**
 * Validates value of unit text property
 */

import { Validator } from './validator';
import { ComponentsDefinition } from '../models';

const TYPES = [
    'em',
    'px',
];
const TYPES_REGEXP = new RegExp(`^(${TYPES.join('|')})$`);

export class UnitTypeValidator implements Validator {

    constructor(
        private definition: ComponentsDefinition,
    ) {
    }

    validate(
        errorReporter: (errorMessage: string) => void,
    ): boolean {
        let valid = true;

        for (const property of this.definition.componentProperties) {
            if (property.control.type === 'text' && property.control.unit && !TYPES_REGEXP.test(property.control.unit)) {
                errorReporter(`Property "${property.name}" has unaccaptable unit type "${property.control.unit}", ` +
                    `only "${TYPES.join(',')}" are allowed`);
                valid = false;
            }
        }

        return valid;
    }
}
