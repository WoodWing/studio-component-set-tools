/**
 * Validates usage of doc-slideshow directive
 */

import { Validator } from './validator';
import { DirectiveType, ParsedComponentsDefinitionV10X, ParsedComponentsDefinitionComponent, ParsedComponentsDefinitionDirective } from '../models';

export class DocSlideshowValidator extends Validator {

    constructor(
        error: (errorMessage: string) => false,
        private definition: ParsedComponentsDefinitionV10X,
    ) {
        super(error);
    }

    validate(): void {
        Object.values(this.definition.components).forEach((parsedComponent: ParsedComponentsDefinitionComponent) => {
            const amountOfSlideshows = this.countSlideshowDirectives(parsedComponent);
            // check if it's the only one
            if (amountOfSlideshows > 1) {
                this.error(`Component "${parsedComponent.component.name}" contains more then one slideshow directive, ` +
                    `only one is allowed per component`);
            }
        });
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
}
