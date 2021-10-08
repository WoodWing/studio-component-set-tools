/**
 * Validates usage of doc-container directive
 */

import { Validator } from './validator';
import { DirectiveType, Component } from '../models';

export class DocContainerValidator extends Validator {
    async validate(): Promise<void> {
        Object.values(this.componentSet.components).forEach((parsedComponent: Component) => {
            const containerCount = this.countContainerDirectives(parsedComponent);
            const slideshowCount = this.countSlideshowDirectives(parsedComponent);

            // check if there is not more than one doc-container
            // and it cannot be combined with slideshow directives
            if (containerCount > 1) {
                this.error(`Component "${parsedComponent.name}" can only have one container directive`);
            } else if (containerCount === 1 && slideshowCount > 0) {
                this.error(
                    `Component "${parsedComponent.name}" contains both a container and slideshow directive,` +
                        `but can only contain one of those directive types`,
                );
            }
        });
    }

    private countContainerDirectives(parsedComponent: Component): number {
        return Object.values(parsedComponent.directives).filter(
            (directive) => directive.type === DirectiveType.container,
        ).length;
    }

    private countSlideshowDirectives(parsedComponent: Component): number {
        return Object.values(parsedComponent.directives).filter(
            (directive) => directive.type === DirectiveType.slideshow,
        ).length;
    }
}
