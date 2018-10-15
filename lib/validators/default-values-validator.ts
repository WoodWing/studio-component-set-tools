/**
 * Validates if default values for properties are valid.
 */

import { Validator } from './validator';
import { ParsedComponent, ComponentProperty } from '../models';

const validDataTypes = new Set(['styles', 'inlineStyles', 'data']);

export class DefaultValuesValidator extends Validator {
    private controlTypeToValidateMethod = new Map([
        ['text', this.validateTextControlValue],
        ['select', this.validateSelectOrRadioControlValue],
        ['radio', this.validateSelectOrRadioControlValue],
        ['checkbox', this.validateCheckboxControlValue],
    ]);

    validate(): void {
        Object.values(this.definition.components).forEach((component) => this.validateComponent(component));
    }

    /**
     * Iterate through all properties of given component.
     *
     * @param errorReporter
     * @param component
     */
    private validateComponent(component: ParsedComponent): void {
        component.properties.forEach((property) => this.validateProperty(property));
    }

    /**
     * Validate property has a valid dataType for the given default value if any.
     *
     * @param errorReporter
     * @param property
     */
    private validateProperty(property: ComponentProperty) {
        if (!property.defaultValue) {
            return;
        }

        if (!validDataTypes.has(property.dataType)) {
            this.error(`Property ${property.name} has a default value for an unsupported data type ${property.dataType}`);
            return;
        }

        const validateControl = this.controlTypeToValidateMethod.get(property.control.type);
        if (!validateControl) {
            this.error(`Property ${property.name} has a default value used with an unsupported control type ${property.control.type}`);
            return;
        }

        return validateControl.bind(this)(property);
    }

    /**
     * Validate defaultValue against text control type.
     * @param _errorReporter
     * @param property
     */
    private validateTextControlValue(_property: ComponentProperty) {
        // Allow any default value for text
    }

    /**
     * Validate defaultValue against select or radio control type.
     *
     * @param errorReporter
     * @param property
     */
    private validateSelectOrRadioControlValue(property: ComponentProperty) {
        if (!(<any>property.control).options.find((option: any) => option.value === property.defaultValue)) {
            this.error(`Property ${property.name} defaultValue has no matching entry in ${property.control.type} options`);
        }
    }

    /**
     * Validate defaultValue for checkbox control type.
     *
     * @param errorReporter
     * @param property
     */
    private validateCheckboxControlValue(property: ComponentProperty) {
        if (property.defaultValue !== (<any>property.control).value) {
            this.error(`Property ${property.name} defaultValue does not match ${property.control.type} value`);
        }
    }
}
