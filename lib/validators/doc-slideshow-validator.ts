/**
 * Validates usage of doc-slideshow directive
 */

import { Validator } from './validator';
import { DirectiveType, ParsedComponent } from '../models';

export class DocSlideshowValidator extends Validator {
    validate(): void {
        Object.values(this.componentSet.components).forEach((parsedComponent: ParsedComponent) => {
            const amountOfSlideshows = this.countSlideshowDirectives(parsedComponent);
            // check if it's the only one
            if (amountOfSlideshows > 1) {
                this.error(
                    `Component "${parsedComponent.name}" contains more then one slideshow directive, ` +
                        `only one is allowed per component`,
                );
            }
        });
    }

    private countSlideshowDirectives(parsedComponent: ParsedComponent): number {
        return Object.values(parsedComponent.directives).reduce((acc, directive) => {
            if (directive.type === DirectiveType.slideshow) {
                acc++;
            }
            return acc;
        }, 0);
    }
}
