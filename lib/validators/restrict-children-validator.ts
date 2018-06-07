/**
 * Validates restrictChildren properties option
 */

import { Validator } from './validator';
import { DirectiveType, ParsedComponentsDefinition } from '../models';

const PROPERTY = 'restrictChildren';
const ADDITIONAL_PROPERTY = 'withContent';

export class RestrictChildrenValidator implements Validator {

    constructor(
        private definition: ParsedComponentsDefinition,
    ) {
    }

    private hasSlideshowDirective(parsedComponent: ParsedComponentsDefinition['components']['name']) : boolean {
        return Object.values(parsedComponent.directives)
        .some(directive => directive.type === DirectiveType.slideshow);
    }

    validate(
        errorReporter: (errorMessage: string) => void,
    ): boolean {
        let valid = true;

        Object.values(this.definition.components).forEach((parsedComponent: ParsedComponentsDefinition['components']['name']) => {
            const isPresent = PROPERTY in parsedComponent.component && parsedComponent.component[PROPERTY];
            if (!isPresent) {
                if (this.hasSlideshowDirective(parsedComponent)) {
                    errorReporter(`Component property "${PROPERTY}" must be defined in component "${parsedComponent.component.name}" because the ` +
                        `component contains a slideshow directive`);
                    valid = false;
                }
                return;
            }
            // check if all keys point to corrent component
            // TODO if || {} is removed then ES2017 shows an error that parsedComponent.component[PROPERTY] may be undefined, why?
            const propertyValue = parsedComponent.component[PROPERTY] || {};
            Object.keys(propertyValue).forEach((componentName: string) => {
                if (componentName === parsedComponent.component.name) {
                    errorReporter(`Component property "${PROPERTY}.${componentName}" of component "${parsedComponent.component.name}" points to itself`);
                    valid = false;
                    return;
                }
                if (componentName in this.definition.components) {
                    const pointedParsedComponent = this.definition.components[componentName];
                    // check additional property
                    if (ADDITIONAL_PROPERTY in propertyValue[componentName]) {
                        const additionalPropertyValue = propertyValue[componentName][ADDITIONAL_PROPERTY] || '';
                        if (!(additionalPropertyValue in pointedParsedComponent.directives)) {
                            errorReporter(`Additional property "${ADDITIONAL_PROPERTY}" of property "${PROPERTY}.${componentName}" of component ` +
                                `"${parsedComponent.component.name}" points to non existing directive key "${additionalPropertyValue}" of component ` +
                                `"${pointedParsedComponent.component.name}"`);
                            valid = false;
                        }
                    }
                } else {
                    errorReporter(`Component property "${PROPERTY}.${componentName}" of component "${parsedComponent.component.name}" points to ` +
                        `non existing component`);
                    valid = false;
                }
            });
        });

        return valid;
    }
}
