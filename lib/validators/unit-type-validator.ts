/**
 * Validates value of unit text property
 */

import { Validator } from './validator';
import { ParsedComponentsDefinitionComponent, ParsedComponentsDefinitionProperty } from '../models';

const TYPES = [
    'em',
    'px',
];
const TYPES_REGEXP = new RegExp(`^(${TYPES.join('|')})$`, 'i');

export class UnitTypeValidator extends Validator {
    validate(): void {
        Object.values(this.definition.components).forEach((component) => this.validateComponent(component));
    }

    /**
     * Iterate through all properties of given component.
     *
     * @param component
     */
    private validateComponent(component: ParsedComponentsDefinitionComponent): void {
        component.properties.forEach((property) => this.validateProperty(property));
    }

    /**
     * Validate property with control type text for having a valid unit if defined.
     *
     * @param property
     */
    private validateProperty(property: ParsedComponentsDefinitionProperty) {
        if (property.control.type === 'text' && property.control.unit && !TYPES_REGEXP.test(property.control.unit)) {
            this.error(`Property "${property.name}" has unacceptable unit type "${property.control.unit}", ` +
                `only "${TYPES.join(',')}" are allowed`);
        }
    }
}
