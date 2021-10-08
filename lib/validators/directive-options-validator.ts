/**
 * Validates directiveOptions entries have a matching directive in the template
 */

import { Validator } from './validator';
import { Component } from '../models';

export class DirectiveOptionsValidator extends Validator {
    async validate(): Promise<void> {
        for (const component of Object.values(this.componentSet.components)) {
            this.validateComponent(component);
        }
    }

    /**
     * Validates whether directiveOptions entries have a matching directive
     */
    validateComponent(component: Component): void {
        if (!component.directiveOptions) {
            return;
        }

        for (const key of Object.keys(component.directiveOptions)) {
            this.validateDirectiveOption(key, component);
        }
    }

    validateDirectiveOption(directiveKey: string, component: Component): void {
        if (!component.directives[directiveKey]) {
            this.error(
                `Component "${component.name}" has directive options for an unknown directive "${directiveKey}".`,
            );
        }
    }
}
