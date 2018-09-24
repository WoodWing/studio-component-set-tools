/**
 * Validates usage of doc-container directive
 */

import { Validator } from './validator';
import { DirectiveType, ParsedComponentsDefinitionV10X, ParsedComponentsDefinitionComponent } from '../models';

export class DocContainerValidator extends Validator {

    constructor(
        error: (errorMessage: string) => false,
        private definition: ParsedComponentsDefinitionV10X,
    ) {
        super(error);
    }

    validate(): void {
        Object.values(this.definition.components).forEach((parsedComponent: ParsedComponentsDefinitionComponent) => {
            const containerCount = this.countContainerDirectives(parsedComponent);
            const slideshowCount = this.countSlideshowDirectives(parsedComponent);

            // check if there is not more than one doc-container
            // and it cannot be combined with slideshow directives
            if (containerCount > 1) {
                this.error(`Component "${parsedComponent.component.name}" can only have one container directive`);
            } else if (containerCount === 1 && slideshowCount > 0) {
                this.error(`Component "${parsedComponent.component.name}" contains both a container and slideshow directive,` +
                `but can only contain one of those directive types`);
            }
        });
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
}
