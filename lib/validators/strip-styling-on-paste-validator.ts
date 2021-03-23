/**
 * Validates stripStylingOnPaste directive option
 */

import { Validator } from './validator';
import { ParsedComponent } from '../models';

export class StripStylingOnPasteValidator extends Validator {
    async validate(): Promise<void> {
        for (const parsedComponent of Object.values(this.componentSet.components)) {
            this.validateComponent(parsedComponent);
        }
    }

    /**
     * Validates whether stripStylingOnPaste is set for an editable directive.
     */
    validateComponent(parsedComponent: ParsedComponent): void {
        if (!parsedComponent.directiveOptions) {
            return;
        }

        for (const [key, directiveOptions] of Object.entries(parsedComponent.directiveOptions)) {
            // Only for directives with stripStylingOnPaste option
            if (directiveOptions.stripStylingOnPaste === undefined) {
                continue;
            }

            const directive = parsedComponent.directives[key];
            if (!directive) {
                this.error(
                    `Component "${parsedComponent.name}" has stripStylingOnPaste set for an unknown directive "${key}".`,
                );
                continue;
            }

            if (directive.type !== 'editable') {
                this.error(
                    `Component "${parsedComponent.name}" has stripStylingOnPaste for a directive that is not editable "${key}". The type for that directive is set to "${directive.type}".`,
                );
            }
        }
    }
}
