/**
 * Validates directiveOptions entries have a matching directive in the template
 */

import { Validator } from './validator';
import { ParsedComponent } from '../models';

export class DirectiveOptionsValidator extends Validator {
    async validate(): Promise<void> {
        for (const parsedComponent of Object.values(this.componentSet.components)) {
            this.validateComponent(parsedComponent);
        }
    }

    /**
     * Validates whether directiveOptions entries have a matching directive
     */
    validateComponent(parsedComponent: ParsedComponent): void {
        if (!parsedComponent.directiveOptions) {
            return;
        }

        for (const key of Object.keys(parsedComponent.directiveOptions)) {
            if (!parsedComponent.directives[key]) {
                this.error(
                    `Component "${parsedComponent.name}" has directive options for an unknown directive "${key}".`,
                );
            }
        }
    }
}
