/**
 * Validates if default values for properties are valid.
 */

import { Validator } from './validator';
import { ParsedComponentsDefinition,
    ParsedComponentsDefinitionComponent,
    ParsedComponentsDefinitionProperty } from '../models';

const validDataTypes = new Set(['styles', 'inlineStyles', 'data']);

export class DefaultValuesValidator implements Validator {
    private controlTypeToValidateMethod = new Map([
        ['text', this.validateTextControlValue],
        ['select', this.validateSelectOrRadioControlValue],
        ['radio', this.validateSelectOrRadioControlValue],
        ['checkbox', this.validateCheckboxControlValue],
    ]);

    constructor(
        private definition: ParsedComponentsDefinition,
    ) {
    }

    validate(
        errorReporter: (errorMessage: string) => void,
    ): boolean {
        return Object.values(this.definition.components).reduce((valid, component) => this.validateComponent(errorReporter, component) && valid, true);
    }

    /**
     * Iterate through all properties of given component.
     *
     * @param errorReporter
     * @param component
     */
    private validateComponent(errorReporter: (errorMessage: string) => void, component: ParsedComponentsDefinitionComponent) {
        return component.properties.reduce((valid, property) => this.validateProperty(errorReporter, property) && valid, true);
    }

    /**
     * Validate property has a valid dataType for the given default value if any.
     *
     * @param errorReporter
     * @param property
     */
    private validateProperty(errorReporter: (errorMessage: string) => void, property: ParsedComponentsDefinitionProperty) {
        if (!property.defaultValue) {
            return true;
        }

        if (!validDataTypes.has(property.dataType)) {
            errorReporter(`Property ${property.name} has a default value for an unsupported data type ${property.dataType}`);
            return false;
        }

        const validateControl = this.controlTypeToValidateMethod.get(property.control.type);
        if (!validateControl) {
            errorReporter(`Property ${property.name} has a default value used with an unsupported control type ${property.control.type}`);
            return false;
        }

        return validateControl(errorReporter, property);
    }

    /**
     * Validate defaultValue against text control type.
     * @param _errorReporter
     * @param property
     */
    private validateTextControlValue(_errorReporter: (errorMessage: string) => void, property: ParsedComponentsDefinitionProperty) {
        // Allow any default value for text
        return true;
    }

    /**
     * Validate defaultValue against select or radio control type.
     *
     * @param errorReporter
     * @param property
     */
    private validateSelectOrRadioControlValue(errorReporter: (errorMessage: string) => void, property: ParsedComponentsDefinitionProperty) {
        if (!(<any>property.control).options.find((option: any) => option.value === property.defaultValue)) {
            errorReporter(`Property ${property.name} defaultValue has no matching entry in ${property.control.type} options`);
            return false;
        }
        return true;
    }

    /**
     * Validate defaultValue for checkbox control type.
     *
     * @param errorReporter
     * @param property
     */
    private validateCheckboxControlValue(errorReporter: (errorMessage: string) => void, property: ParsedComponentsDefinitionProperty) {
        if (property.defaultValue !== (<any>property.control).value) {
            errorReporter(`Property ${property.name} defaultValue does not match ${property.control.type} value`);
            return false;
        }
        return true;
    }
}
