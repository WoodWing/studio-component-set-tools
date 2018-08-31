/**
 * Validates restrictChildren properties option
 */

import { Validator } from './validator';
import { DirectiveType, ParsedComponentsDefinitionV10X, ParsedComponentsDefinitionComponent } from '../models';

const PROPERTY = 'restrictChildren';
const ADDITIONAL_PROPERTY = 'withContent';

export class RestrictChildrenValidator extends Validator {

    constructor(
        error: (errorMessage: string) => false,
        private definition: ParsedComponentsDefinitionV10X,
    ) {
        super(error);
    }

    private hasSlideshowDirective(parsedComponent: ParsedComponentsDefinitionComponent) : boolean {
        return Object.values(parsedComponent.directives)
        .some(directive => directive.type === DirectiveType.slideshow);
    }

    validate(): void {
        Object.values(this.definition.components).forEach((parsedComponent: ParsedComponentsDefinitionComponent) => {
            const isPresent = PROPERTY in parsedComponent.component && parsedComponent.component[PROPERTY];
            const hasSlideshow = this.hasSlideshowDirective(parsedComponent);
            if (!isPresent) {
                if (hasSlideshow) {
                    this.error(`Component property "${PROPERTY}" must be defined in component "${parsedComponent.component.name}" because the ` +
                        `component contains a slideshow directive`);
                }
                return;
            }
            const propertyValue = parsedComponent.component[PROPERTY]
                // satisfy the compiler -> if PROPERTY exists then it is a non empty object otherwise it can't pass the schema
                || {};
            const propertyKeys = Object.keys(propertyValue);
            // slideshow component can have only one entry
            if (hasSlideshow && propertyKeys.length > 1) {
                this.error(`Component property "${PROPERTY}" of component "${parsedComponent.component.name}" must contain only one entry` +
                ` because the component contains a slideshow directive`);
            }
            // check if all keys point to correct component
            propertyKeys.forEach((componentName: string) => {
                if (componentName === parsedComponent.component.name) {
                    this.error(`Component property "${PROPERTY}.${componentName}" of component "${parsedComponent.component.name}" points to itself`);
                    return;
                }
                if (componentName in this.definition.components) {
                    const pointedParsedComponent = this.definition.components[componentName];
                    // check additional property
                    if (ADDITIONAL_PROPERTY in propertyValue[componentName]) {
                        const additionalPropertyValue = propertyValue[componentName][ADDITIONAL_PROPERTY] || '';
                        if (!(additionalPropertyValue in pointedParsedComponent.directives)) {
                            this.error(`Additional property "${ADDITIONAL_PROPERTY}" of property "${PROPERTY}.${componentName}" of component ` +
                                `"${parsedComponent.component.name}" points to non existing directive key "${additionalPropertyValue}" of component ` +
                                `"${pointedParsedComponent.component.name}"`);
                        }
                    }
                } else {
                    this.error(`Component property "${PROPERTY}.${componentName}" of component "${parsedComponent.component.name}" points to ` +
                        `non existing component`);
                }
            });
        });
    }
}
