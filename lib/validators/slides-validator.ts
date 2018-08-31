/**
 * Validates value of slides property
 */

import { Validator } from './validator';
import { ParsedComponentsDefinitionV10X, ParsedComponentsDefinitionComponent, ParsedComponentsDefinitionProperty } from '../models';

export class SlidesValidator extends Validator {

    constructor(
        error: (errorMessage: string) => false,
        private parsedDefinition: ParsedComponentsDefinitionV10X,
    ) {
        super(error);
    }

    validate(): void {
        // Find slides control properties and check for include and exclude
        for (const parsedComponent of Object.values(this.parsedDefinition.components)) {
            parsedComponent.properties.forEach((property) => {
                this.validateComponent(parsedComponent, property);
            });
        }
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
        parsedComponent: ParsedComponentsDefinitionComponent,
        property: ParsedComponentsDefinitionProperty,
    ): void {
        if (property.control.type !== 'slides') {
            return;
        }

        if (!parsedComponent.component.restrictChildren) {
            this.error(`Component "${parsedComponent.component.name}" must have restrictChildren set to use the slides property`);
            return;
        }

        const slideComponentName = Object.keys(parsedComponent.component.restrictChildren)[0];
        const slideComponent = this.parsedDefinition.components[slideComponentName];

        if (property.control.include) {
            this.validateHasProperties(slideComponent,
                property, property.control.include);
        }
        if (property.control.exclude) {
            this.validateHasProperties(slideComponent,
                property, property.control.exclude);
        }
    }

    /**
     * Validate a list of property names are valid.
     *
     * @param errorReporter
     * @param parsedComponent
     * @param property
     * @param properties
     */
    private validateHasProperties(parsedComponent: ParsedComponentsDefinitionComponent,
                                  property: ParsedComponentsDefinitionProperty,
                                  properties: string[]): void {
        properties.forEach((propertyName) => {
            if (!this.hasProperty(parsedComponent, propertyName)) {
                this.error(`Property "${property.name}" is referring to an invalid property "${propertyName}"`
                    + `not part of "${parsedComponent.component.name}"`);
            }
        });
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
