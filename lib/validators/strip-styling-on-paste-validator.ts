/**
 * Validates stripStylingOnPaste directive option
 */

import { Validator } from './validator';
import { Component } from '../models';

export class StripStylingOnPasteValidator extends Validator {
    async validate(): Promise<void> {
        for (const parsedComponent of Object.values(this.componentSet.components)) {
            this.validateComponent(parsedComponent);
        }
    }

    /**
     * Validates whether stripStylingOnPaste is set for an editable directive.
     */
    validateComponent(parsedComponent: Component): void {
        if (!parsedComponent.directiveOptions) {
            return;
        }

        for (const [key, directiveOptions] of Object.entries(parsedComponent.directiveOptions)) {
            // Only for directives with stripStylingOnPaste option
            if (directiveOptions.stripStylingOnPaste === undefined) continue;

            if (!this.validateDirectiveExists(key, parsedComponent)) continue;

            this.validateDirectiveType(key, parsedComponent);
        }
    }

    validateDirectiveExists(directiveKey: string, parsedComponent: Component): boolean {
        const directive = parsedComponent.directives[directiveKey];
        if (directive) return true;

        this.error(
            `Component "${parsedComponent.name}" has stripStylingOnPaste set for an unknown directive "${directiveKey}".`,
        );
        return false;
    }

    validateDirectiveType(directiveKey: string, parsedComponent: Component): void {
        const directive = parsedComponent.directives[directiveKey];
        if (directive.type === 'editable') return;

        this.error(
            `Component "${parsedComponent.name}" has stripStylingOnPaste set for a directive with key "${directiveKey}" but that directive is not of type "editable". Instead it is of type "${directive.type}".`,
        );
    }
}
