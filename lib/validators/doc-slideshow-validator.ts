/**
 * Validates usage of doc-slideshow directive
 */

import { Validator } from './validator';
import { DirectiveType, Component } from '../models';

export class DocSlideshowValidator extends Validator {
    async validate(): Promise<void> {
        Object.values(this.componentSet.components).forEach((component: Component) => {
            const amountOfSlideshows = this.countSlideshowDirectives(component);
            // check if it's the only one
            if (amountOfSlideshows > 1) {
                this.error(
                    `Component "${component.name}" contains more then one slideshow directive, ` +
                        `only one is allowed per component`,
                );
            }
        });
    }

    private countSlideshowDirectives(component: Component): number {
        return Object.values(component.directives).reduce((acc, directive) => {
            if (directive.type === DirectiveType.slideshow) {
                acc++;
            }
            return acc;
        }, 0);
    }
}
