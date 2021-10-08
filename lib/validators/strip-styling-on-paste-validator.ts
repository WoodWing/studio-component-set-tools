/**
 * Validates stripStylingOnPaste directive option
 */

import { Validator } from './validator';
import { Component } from '../models';

export class StripStylingOnPasteValidator extends Validator {
    async validate(): Promise<void> {
        for (const component of Object.values(this.componentSet.components)) {
            this.validateComponent(component);
        }
    }

    /**
     * Validates whether stripStylingOnPaste is set for an editable directive.
     */
    validateComponent(component: Component): void {
        if (!component.directiveOptions) {
            return;
        }

        for (const [key, directiveOptions] of Object.entries(component.directiveOptions)) {
            // Only for directives with stripStylingOnPaste option
            if (directiveOptions.stripStylingOnPaste === undefined) continue;

            if (!this.validateDirectiveExists(key, component)) continue;

            this.validateDirectiveType(key, component);
        }
    }

    validateDirectiveExists(directiveKey: string, component: Component): boolean {
        const directive = component.directives[directiveKey];
        if (directive) return true;

        this.error(
            `Component "${component.name}" has stripStylingOnPaste set for an unknown directive "${directiveKey}".`,
        );
        return false;
    }

    validateDirectiveType(directiveKey: string, component: Component): void {
        const directive = component.directives[directiveKey];
        if (directive.type === 'editable') return;

        this.error(
            `Component "${component.name}" has stripStylingOnPaste set for a directive with key "${directiveKey}" but that directive is not of type "editable". Instead it is of type "${directive.type}".`,
        );
    }
}
