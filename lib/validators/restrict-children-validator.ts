/**
 * Validates restrictChildren properties option
 */

import { Validator } from './validator';
import { DirectiveType, Component } from '../models';

const PROPERTY = 'restrictChildren';
const ADDITIONAL_PROPERTY = 'withContent';

export class RestrictChildrenValidator extends Validator {
    private hasSlideshowDirective(component: Component): boolean {
        return Object.values(component.directives).some((directive) => directive.type === DirectiveType.slideshow);
    }

    async validate(): Promise<void> {
        Object.values(this.componentSet.components).forEach((component: Component) => {
            const isPresent = PROPERTY in component && component[PROPERTY];
            const hasSlideshow = this.hasSlideshowDirective(component);
            if (!isPresent) {
                if (hasSlideshow) {
                    this.error(
                        `Component property "${PROPERTY}" must be defined in component "${component.name}" because the ` +
                            `component contains a slideshow directive`,
                    );
                }
                return;
            }
            const propertyValue =
                component[PROPERTY] ||
                // satisfy the compiler -> if PROPERTY exists then it is a non empty object otherwise it can't pass the schema
                {};
            const propertyKeys = Object.keys(propertyValue);
            // slideshow component can have only one entry
            if (hasSlideshow && propertyKeys.length > 1) {
                this.error(
                    `Component property "${PROPERTY}" of component "${component.name}" must contain only one entry` +
                        ` because the component contains a slideshow directive`,
                );
            }
            // check if all keys point to correct component
            propertyKeys.forEach((componentName: string) => {
                if (componentName === component.name) {
                    this.error(
                        `Component property "${PROPERTY}.${componentName}" of component "${component.name}" points to itself`,
                    );
                    return;
                }
                if (componentName in this.componentSet.components) {
                    const pointedParsedComponent = this.componentSet.components[componentName];
                    // check additional property
                    if (ADDITIONAL_PROPERTY in propertyValue[componentName]) {
                        const additionalPropertyValue = propertyValue[componentName][ADDITIONAL_PROPERTY] || '';
                        if (!(additionalPropertyValue in pointedParsedComponent.directives)) {
                            this.error(
                                `Additional property "${ADDITIONAL_PROPERTY}" of property "${PROPERTY}.${componentName}" of component ` +
                                    `"${component.name}" points to non existing directive key "${additionalPropertyValue}" of component ` +
                                    `"${pointedParsedComponent.name}"`,
                            );
                        }
                    }
                } else {
                    this.error(
                        `Component property "${PROPERTY}.${componentName}" of component "${component.name}" points to ` +
                            `non existing component`,
                    );
                }
            });
        });
    }
}
