/**
 * Validates value of slides property
 */

import { Validator } from './validator';
import { Component, ComponentProperty } from '../models';

export class SlidesValidator extends Validator {
    async validate(): Promise<void> {
        // Find slides control properties and check for include and exclude
        for (const component of Object.values(this.componentSet.components)) {
            component.properties.forEach((property) => {
                this.validateComponent(component, property);
            });
        }
    }

    /**
     * Validates when slides property is found for component.
     * Checks if restrictChildren is set and validates the include and exclude properties
     * are valid for the slide component of doc-slideshow.
     */
    validateComponent(component: Component, property: ComponentProperty): void {
        if (property.control.type !== 'slides') {
            return;
        }

        if (!component.restrictChildren) {
            this.error(`Component "${component.name}" must have restrictChildren set to use the slides property`);
            return;
        }

        const slideComponentName = Object.keys(component.restrictChildren)[0];
        const slideComponent = this.componentSet.components[slideComponentName];

        if (property.control.include) {
            this.validateHasProperties(slideComponent, property, property.control.include);
        }
        if (property.control.exclude) {
            this.validateHasProperties(slideComponent, property, property.control.exclude);
        }
    }

    /**
     * Validate a list of property names are valid.
     */
    private validateHasProperties(component: Component, property: ComponentProperty, properties: string[]): void {
        properties.forEach((propertyName) => {
            if (!this.hasProperty(component, propertyName)) {
                this.error(
                    `Property "${property.name}" is referring to an invalid property "${propertyName}"` +
                        `not part of "${component.name}"`,
                );
            }
        });
    }

    /**
     * Validate the component has the property.
     */
    private hasProperty(component: Component, propertyName: string) {
        for (let i = 0; i < component.properties.length; i++) {
            if (component.properties[i].name === propertyName) {
                return true;
            }
        }
        return false;
    }
}
