/**
 * Validates if default values for properties are valid.
 */

import { Validator } from './validator';
import { ParsedComponent, ComponentProperty } from '../models';
import {
    ComponentPropertyControlCheckbox,
    ComponentPropertyControlRadio,
    ComponentPropertyControlSelect,
    COMPONENT_PROPERTY_CONTROL_FITTING_VALUES,
} from '../models/component-property-controls';

const validDataTypes = new Set(['styles', 'inlineStyles', 'data']);

export class DefaultValuesValidator extends Validator {
    private controlTypeToValidateMethod = new Map([
        ['text', this.validateTextControlValue],
        ['select', this.validateSelectOrRadioControlValue],
        ['radio', this.validateSelectOrRadioControlValue],
        ['checkbox', this.validateCheckboxControlValue],
        ['drop-capital', this.validateDropCapitalControlValue],
        ['fitting', this.validateFittingControlValue],
    ]);

    async validate(): Promise<void> {
        Object.values(this.componentSet.components).forEach((component) => this.validateComponent(component));
    }

    /**
     * Iterate through all properties of given component.
     *
     * @param component
     */
    private validateComponent(component: ParsedComponent): void {
        component.properties.forEach((property) => this.validateProperty(property));
    }

    /**
     * Validate property has a valid dataType for the given default value if any.
     *
     * @param property
     */
    private validateProperty(property: ComponentProperty) {
        if (!property.defaultValue) {
            return;
        }

        if (!validDataTypes.has(property.dataType)) {
            this.error(
                `Property ${property.name} has a default value for an unsupported data type ${property.dataType}`,
            );
            return;
        }

        const validateControl = this.controlTypeToValidateMethod.get(property.control.type);
        if (!validateControl) {
            this.error(
                `Property ${property.name} has a default value used with an unsupported control type ${property.control.type}`,
            );
            return;
        }

        return validateControl.bind(this)(property);
    }

    /**
     * String validation
     *
     * @param property
     */
    private validateStringValue(property: ComponentProperty): boolean {
        if (typeof property.defaultValue !== 'string') {
            this.error(`Property ${property.name} defaultValue must be a string`);
            return false;
        }
        return true;
    }

    /**
     * Object validation
     *
     * @param property
     */
    private validateObjectValue(property: ComponentProperty): boolean {
        if (typeof property.defaultValue !== 'object') {
            this.error(`Property ${property.name} defaultValue must be an object`);
            return false;
        }
        return true;
    }

    /**
     * Validate defaultValue against text control type.
     *
     * @param property
     */
    private validateTextControlValue(property: ComponentProperty) {
        // Allow any default string value for text
        this.validateStringValue(property);
    }

    /**
     * Validate defaultValue against select or radio control type.
     *
     * @param property
     */
    private validateSelectOrRadioControlValue(property: ComponentProperty) {
        if (!this.validateStringValue(property)) {
            return;
        }
        if (
            !(<ComponentPropertyControlRadio | ComponentPropertyControlSelect>property.control).options.find(
                (option) => option.value === property.defaultValue,
            )
        ) {
            this.error(
                `Property ${property.name} defaultValue has no matching entry in ${property.control.type} options`,
            );
        }
    }

    /**
     * Validate defaultValue for checkbox control type.
     *
     * @param property
     */
    private validateCheckboxControlValue(property: ComponentProperty) {
        if (!this.validateStringValue(property)) {
            return;
        }
        if (property.defaultValue !== (<ComponentPropertyControlCheckbox>property.control).value) {
            this.error(`Property ${property.name} defaultValue does not match ${property.control.type} value`);
        }
    }

    /**
     * Validates defaultValue for drop-capital control type.
     *
     * @param property
     */
    private validateDropCapitalControlValue(property: ComponentProperty) {
        if (!this.validateObjectValue(property)) {
            return;
        }
        const expectedKeys = ['numberOfCharacters', 'numberOfLines', 'padding'];
        const presentKeys = Object.keys(<{ [key: string]: unknown }>property.defaultValue);
        if (expectedKeys.length !== presentKeys.length || !expectedKeys.every((key) => presentKeys.indexOf(key) >= 0)) {
            this.error(
                `Property ${property.name} defaultValue must be an object with keys "${expectedKeys.join(', ')}"`,
            );
        }
        presentKeys.forEach((key) => {
            if (typeof (<{ [key: string]: unknown }>property.defaultValue)[key] !== 'number') {
                this.error(`Property ${property.name} defaultValue must be an object of number type values`);
            }
        });
    }

    /**
     * Validates defaultValue for fitting control type.
     */
    private validateFittingControlValue(property: ComponentProperty) {
        if (!this.validateStringValue(property)) {
            return;
        }
        const values = Object.values(COMPONENT_PROPERTY_CONTROL_FITTING_VALUES);
        if (!values.find((value) => value === property.defaultValue)) {
            this.error(`Property ${property.name} defaultValue has to be one of '${values.join("', '")}'`);
        }
    }
}
