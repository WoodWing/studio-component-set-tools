/**
 * Validates usage of doc-slideshow directive
 */

import { Validator } from './validator';
import { DirectiveType, ParsedComponentsDefinition, ParsedComponentsDefinitionComponent, ParsedComponentsDefinitionDirective } from '../models';

export class DocSlideshowValidator implements Validator {

    constructor(
        private definition: ParsedComponentsDefinition,
    ) {
    }

    private countSlideshowDirectives(parsedComponent: ParsedComponentsDefinitionComponent) : number {
        return Object.values(parsedComponent.directives)
        .reduce((acc: number, directive: ParsedComponentsDefinitionDirective) => {
            if (directive.type === DirectiveType.slideshow) {
                acc++;
            }
            return acc;
        }, 0);
    }

    validate(
        errorReporter: (errorMessage: string) => void,
    ): boolean {
        let valid = true;

        Object.values(this.definition.components).forEach((parsedComponent: ParsedComponentsDefinitionComponent) => {
            const amountOfSlideshows = this.countSlideshowDirectives(parsedComponent);
            // check if it's the only one
            if (amountOfSlideshows > 1) {
                errorReporter(`Component "${parsedComponent.component.name}" contains more then one slideshow directive, ` +
                    `only one is allowed per component`);
                valid = false;
            }
        });

        return valid;
    }
}
