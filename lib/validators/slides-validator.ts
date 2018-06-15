/**
 * Validates value of slides property
 */

import { Validator } from './validator';
import { ParsedComponentsDefinition, ParsedComponentsDefinitionComponent, ParsedComponentsDefinitionProperty } from '../models';

export class SlidesValidator implements Validator {

    constructor(
        private parsedDefinition: ParsedComponentsDefinition,
    ) {
    }

    validate(
        errorReporter: (errorMessage: string) => void,
    ): boolean {
        let valid = true;

        // Find slides control properties and check for include and exclude
        for (const parsedComponent of Object.values(this.parsedDefinition.components)) {
            parsedComponent.properties.forEach((property) => {
                valid = this.validateComponent(errorReporter, parsedComponent, property) && valid;
            });
        }

        return valid;
    }

    /**
     * Validates when slides property is found for component.
     * Checks if restrictChildren is set and validates the include and exclude properties
     * are valid for the slide component of doc-slideshow.
     *
     * @param errorReporter
     * @param parsedComponent
     * @param property
     */
    validateComponent(
        errorReporter: (errorMessage: string) => void,
        parsedComponent: ParsedComponentsDefinitionComponent,
        property: ParsedComponentsDefinitionProperty,
    ): boolean {
        if (property.control.type !== 'slides') {
            return true;
        }

        if (!parsedComponent.component.restrictChildren) {
            errorReporter(`Component "${parsedComponent.component.name}" must have restrictChildren set to use the slides property`);
            return false;
        }

        const slideComponentName = Object.keys(parsedComponent.component.restrictChildren)[0];
        const slideComponent = this.parsedDefinition.components[slideComponentName];

        let valid = true;

        if (property.control.include) {
            valid = this.validateHasProperties(errorReporter, slideComponent,
                property, property.control.include) && valid;
        }
        if (property.control.exclude) {
            valid = this.validateHasProperties(errorReporter, slideComponent,
                property, property.control.exclude) && valid;
        }

        return valid;
    }

    /**
     * Validate a list of property names are valid.
     *
     * @param errorReporter
     * @param parsedComponent
     * @param property
     * @param properties
     */
    private validateHasProperties(errorReporter: (errorMessage: string) => void,
                                  parsedComponent: ParsedComponentsDefinitionComponent,
                                  property: ParsedComponentsDefinitionProperty,
                                  properties: string[]): boolean {
        let valid = true;
        properties.forEach((propertyName) => {
            if (!this.hasProperty(parsedComponent, propertyName)) {
                errorReporter(`Property "${property.name}" is referring to an invalid property "${propertyName}"`
                    + `not part of "${parsedComponent.component.name}"`);
                valid = false;
            }
        });
        return valid;
    }

    /**
     * Validate the component has the property.
     *
     * @param parsedComponent
     * @param propertyName
     */
    private hasProperty(parsedComponent: ParsedComponentsDefinitionComponent, propertyName: string) {
        for (let i = 0; i < parsedComponent.properties.length; i++) {
            if (parsedComponent.properties[i].name === propertyName) {
                return true;
            }
        }
        return false;
    }
}
