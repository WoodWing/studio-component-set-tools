/**
 * Validates value of unit text property
 */

import { Validator } from './validator';
import { ComponentsDefinition } from '../models';

const TYPES = [
    'em',
    'px',
];
const TYPES_REGEXP = new RegExp(`^(${TYPES.join('|')})$`, 'i');

export class UnitTypeValidator extends Validator {

    constructor(
        error: (errorMessage: string) => false,
        private definition: ComponentsDefinition,
    ) {
        super(error);
    }

    validate(): void {
        for (const property of this.definition.componentProperties) {
            if (property.control.type === 'text' && property.control.unit && !TYPES_REGEXP.test(property.control.unit)) {
                this.error(`Property "${property.name}" has unaccaptable unit type "${property.control.unit}", ` +
                    `only "${TYPES.join(',')}" are allowed`);
            }
        }
    }
}
