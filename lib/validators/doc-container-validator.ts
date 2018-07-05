/**
 * Validates usage of doc-container directive
 */

import { Validator } from './validator';
import { DirectiveType, ParsedComponentsDefinition, ParsedComponentsDefinitionComponent } from '../models';

export class DocContainerValidator implements Validator {

    constructor(
        private definition: ParsedComponentsDefinition,
    ) {
    }

    private countContainerDirectives(parsedComponent: ParsedComponentsDefinitionComponent) : number {
        return Object.values(parsedComponent.directives)
        .filter(directive => directive.type === DirectiveType.container)
        .length;
    }

    private countSlideshowDirectives(parsedComponent: ParsedComponentsDefinitionComponent) : number {
        return Object.values(parsedComponent.directives)
        .filter(directive => directive.type === DirectiveType.slideshow)
        .length;
    }

    validate(
        errorReporter: (errorMessage: string) => void,
    ): boolean {
        let valid = true;

        Object.values(this.definition.components).forEach((parsedComponent: ParsedComponentsDefinitionComponent) => {
            const containerCount = this.countContainerDirectives(parsedComponent);
            const slideshowCount = this.countSlideshowDirectives(parsedComponent);

            // check if there is not more than one doc-container
            // and it cannot be combined with slideshow directives
            if (containerCount > 1) {
                errorReporter(`Component "${parsedComponent.component.name}" can only have one container directive`);
                valid = false;
            } else if (containerCount === 1 && slideshowCount > 0) {
                errorReporter(`Component "${parsedComponent.component.name}" contains both a container and slideshow directive,` +
                `but can only contain one of those directive types`);
                valid = false;
            }
        });

        return valid;
    }
}
