/**
 * Validates if autofill rules are correct
 */

import { Validator } from './validator';
import { DirectiveType, ParsedComponent } from '../models';

const supportedDestinationDirectives = [DirectiveType.editable, DirectiveType.link];
const supportedSourceDirectives = [DirectiveType.image];

export class AutofillValidator extends Validator {
    validate(): void {
        Object.values(this.componentSet.components).forEach((component) => {
            this.validateComponent(component);
        });
    }

    /**
     * Validates autofill setting of components.
     * - Should have a valid destination directive
     * - Should have a valid source directive
     * - metadata field should set for image type
     * - destination should not be source
     *
     * @param errorReporter
     * @param parsedComponent
     */
    validateComponent(
        parsedComponent: ParsedComponent,
    ): void {
        // Only check when it has directiveOptions configured
        if (!parsedComponent.directiveOptions) {
            return;
        }

        for (const [dstKey, directiveOptions] of Object.entries(parsedComponent.directiveOptions)) {
            // Only for directives with autofill
            if (!directiveOptions.autofill) {
                continue;
            }

            const rule = directiveOptions.autofill;

            // check if destination directive exists
            if (!parsedComponent.directives[dstKey]) {
                this.error(`Component "${parsedComponent.name}" has incorrect autofill rule "${dstKey}". ` +
                `This component doesn't have directive "${dstKey}".`);
            } else if (supportedDestinationDirectives.indexOf(parsedComponent.directives[dstKey].type) < 0) {
                this.error(`Component "${parsedComponent.name}" has incorrect autofill rule "${dstKey}". ` +
                `Supported types of destination directive are "${supportedDestinationDirectives.join('", "')}" only.`);
            }

            // check if source directive exists
            if (!parsedComponent.directives[rule.source]) {
                this.error(`Component "${parsedComponent.name}" has incorrect autofill rule "${dstKey}". ` +
                `This component doesn't have directive "${rule.source}".`);
            // Check if source directive is supported
            } else if (supportedSourceDirectives.indexOf(parsedComponent.directives[rule.source].type) < 0) {
                this.error(`Component "${parsedComponent.name}" has incorrect autofill rule "${dstKey}". ` +
                `Supported types of source directive are "${supportedSourceDirectives.join('", "')}" only.`);
            // check if metadataField is set when source directive is image kind
            } else if (parsedComponent.directives[rule.source].type === DirectiveType.image && !('metadataField' in rule)) {
                this.error(`Component "${parsedComponent.name}" has incorrect autofill rule "${dstKey}". ` +
                `If source directive is image kind then "metadataField" must be set.`);
            }
            // check if dst !== src
            if (dstKey === rule.source) {
                this.error(`Component "${parsedComponent.name}" has incorrect autofill rule "${dstKey}". ` +
                `There is no sense to fill directive content from itself.`);
            }
        }
    }
}
