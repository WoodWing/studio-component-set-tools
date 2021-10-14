/**
 * Validates if default values for properties are valid.
 */

import { Validator } from './validator';
import { Component, ComponentProperty } from '../models';
import {
    ComponentPropertyControlCheckbox,
    ComponentPropertyControlRadio,
    ComponentPropertyControlSelect,
    ComponentPropertyControlSlider,
    COMPONENT_PROPERTY_CONTROL_FITTING_VALUES,
} from '../models/component-property-controls';

const validDataTypes = new Set(['styles', 'inlineStyles', 'data']);

type AcceptedValueType = 'string' | 'object' | 'number' | 'boolean';

export class DefaultValuesValidator extends Validator {
    private readonly controlTypeToValidateMethod = new Map([
        ['text', this.validateTextControlValue],
        ['select', this.validateSelectOrRadioControlValue],
        ['radio', this.validateSelectOrRadioControlValue],
        ['checkbox', this.validateCheckboxControlValue],
        ['drop-capital', this.validateDropCapitalControlValue],
        ['fitting', this.validateFittingControlValue],
        ['slider', this.validateSliderControlType],
    ]);

    private readonly controlTypesRequiringDefaultValue = new Set(['slider']);

    async validate(): Promise<void> {
        Object.values(this.componentSet.components).forEach((component) => this.validateComponent(component));
    }

    /**
     * Iterate through all properties of given component.
     */
    private validateComponent(component: Component): void {
        component.properties.forEach((property) => this.validateProperty(property));
    }

    /**
     * Validate property has a valid dataType for the given default value if any.
     */
    private validateProperty(property: ComponentProperty) {
        if (property.defaultValue === undefined) {
            this.validateDefaultValueRequiredFor(property);
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

    private validateDefaultValueRequiredFor(property: ComponentProperty) {
        if (this.controlTypesRequiringDefaultValue.has(property.control.type)) {
            this.error(
                `Property ${property.name} defaultValue is required for control type "${property.control.type}"`,
            );
            return;
        }
    }

    private validateValue(
        property: ComponentProperty,
        acceptedTypes: AcceptedValueType | AcceptedValueType[],
    ): boolean {
        if (!Array.isArray(acceptedTypes)) {
            acceptedTypes = [acceptedTypes];
        }

        if (!acceptedTypes.some((acceptedType) => typeof property.defaultValue === acceptedType)) {
            this.error(`Property ${property.name} defaultValue must be one of (${acceptedTypes.join(' | ')})`);
            return false;
        }
        return true;
    }

    /**
     * Validate defaultValue against text control type.
     */
    private validateTextControlValue(property: ComponentProperty) {
        // Allow any default string value for text
        this.validateValue(property, 'string');
    }

    /**
     * Validate defaultValue against select or radio control type.
     */
    private validateSelectOrRadioControlValue(property: ComponentProperty) {
        if (!this.validateValue(property, 'string')) {
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
     */
    private validateCheckboxControlValue(property: ComponentProperty) {
        if (!this.validateValue(property, property.dataType === 'data' ? ['string', 'boolean'] : 'string')) {
            return;
        }
        if (property.defaultValue !== (<ComponentPropertyControlCheckbox>property.control).value) {
            this.error(`Property ${property.name} defaultValue does not match ${property.control.type} value`);
        }
    }

    /**
     * Validates defaultValue for drop-capital control type.
     */
    private validateDropCapitalControlValue(property: ComponentProperty) {
        if (!this.validateValue(property, 'object')) {
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
        if (!this.validateValue(property, 'string')) {
            return;
        }
        const values = Object.values(COMPONENT_PROPERTY_CONTROL_FITTING_VALUES);
        if (!values.find((value) => value === property.defaultValue)) {
            this.error(
                `Property ${property.name} defaultValue has to be one of '${values.join(
                    "', '",
                )}'. To use 'fit content to frame' the property needs to be removed from the definition.`,
            );
        }
    }

    /**
     * Validates defaultValue for slider control type.
     */
    private validateSliderControlType(property: ComponentProperty) {
        if (!this.validateValue(property, 'number')) {
            return;
        }
        const sliderControl = property.control as ComponentPropertyControlSlider;
        const defaultValue = property.defaultValue as number;

        if (defaultValue < sliderControl.minValue || defaultValue > sliderControl.maxValue) {
            this.error(`Property ${property.name} defaultValue must be between the minimum and maximum values`);
        }
    }
}
