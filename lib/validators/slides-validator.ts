/**
 * Validates value of slides property
 */

import { Validator } from './validator';
import { ParsedComponent, ComponentProperty, Component } from '../models';

export class SlidesValidator extends Validator {
    async validate(): Promise<void> {
        // Find slides control properties and check for include and exclude
        for (const parsedComponent of Object.values(this.componentSet.components)) {
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
        parsedComponent: ParsedComponent,
        property: ComponentProperty,
    ): void {
        if (property.control.type !== 'slides') {
            return;
        }

        if (!parsedComponent.restrictChildren) {
            this.error(`Component "${parsedComponent.name}" must have restrictChildren set to use the slides property`);
            return;
        }

        const slideComponentName = Object.keys(parsedComponent.restrictChildren)[0];
        const slideComponent = this.componentSet.components[slideComponentName];

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
    private validateHasProperties(parsedComponent: ParsedComponent,
                                  property: ComponentProperty,
                                  properties: string[]): void {
        properties.forEach((propertyName) => {
            if (!this.hasProperty(parsedComponent, propertyName)) {
                this.error(`Property "${property.name}" is referring to an invalid property "${propertyName}"`
                    + `not part of "${parsedComponent.name}"`);
            }
        });
    }

    /**
     * Validate the component has the property.
     *
     * @param parsedComponent
     * @param propertyName
     */
    private hasProperty(parsedComponent: ParsedComponent, propertyName: string) {
        for (let i = 0; i < parsedComponent.properties.length; i++) {
            if (parsedComponent.properties[i].name === propertyName) {
                return true;
            }
        }
        return false;
    }
}
