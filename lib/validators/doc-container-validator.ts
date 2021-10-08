/**
 * Validates usage of doc-container directive
 */

import { Validator } from './validator';
import { DirectiveType, Component } from '../models';

export class DocContainerValidator extends Validator {
    async validate(): Promise<void> {
        Object.values(this.componentSet.components).forEach((component: Component) => {
            const containerCount = this.countContainerDirectives(component);
            const slideshowCount = this.countSlideshowDirectives(component);

            // check if there is not more than one doc-container
            // and it cannot be combined with slideshow directives
            if (containerCount > 1) {
                this.error(`Component "${component.name}" can only have one container directive`);
            } else if (containerCount === 1 && slideshowCount > 0) {
                this.error(
                    `Component "${component.name}" contains both a container and slideshow directive,` +
                        `but can only contain one of those directive types`,
                );
            }
        });
    }

    private countContainerDirectives(component: Component): number {
        return Object.values(component.directives).filter((directive) => directive.type === DirectiveType.container)
            .length;
    }

    private countSlideshowDirectives(component: Component): number {
        return Object.values(component.directives).filter((directive) => directive.type === DirectiveType.slideshow)
            .length;
    }
}
