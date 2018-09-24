/**
 * Validates if default values for properties are valid.
 */

import { Validator } from './validator';
import { ParsedComponentsDefinitionV10X,
    ParsedComponentsDefinitionComponent,
    ParsedComponentsDefinitionProperty } from '../models';

const validDataTypes = new Set(['styles', 'inlineStyles', 'data']);

export class DefaultValuesValidator extends Validator {
    private controlTypeToValidateMethod = new Map([
        ['text', this.validateTextControlValue],
        ['select', this.validateSelectOrRadioControlValue],
        ['radio', this.validateSelectOrRadioControlValue],
        ['checkbox', this.validateCheckboxControlValue],
    ]);

    constructor(
        error: (errorMessage: string) => false,
        private definition: ParsedComponentsDefinitionV10X,
    ) {
        super(error);
    }

    validate(): void {
        Object.values(this.definition.components).forEach((component) => this.validateComponent(component));
    }

    /**
     * Iterate through all properties of given component.
     *
     * @param errorReporter
     * @param component
     */
    private validateComponent(component: ParsedComponentsDefinitionComponent): void {
        component.properties.forEach((property) => this.validateProperty(property));
    }

    /**
     * Validate property has a valid dataType for the given default value if any.
     *
     * @param errorReporter
     * @param property
     */
    private validateProperty(property: ParsedComponentsDefinitionProperty) {
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
    private validateTextControlValue(_property: ParsedComponentsDefinitionProperty) {
        // Allow any default value for text
    }

    /**
     * Validate defaultValue against select or radio control type.
     *
     * @param errorReporter
     * @param property
     */
    private validateSelectOrRadioControlValue(property: ParsedComponentsDefinitionProperty) {
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
    private validateCheckboxControlValue(property: ParsedComponentsDefinitionProperty) {
        if (property.defaultValue !== (<any>property.control).value) {
            this.error(`Property ${property.name} defaultValue does not match ${property.control.type} value`);
        }
    }
}
