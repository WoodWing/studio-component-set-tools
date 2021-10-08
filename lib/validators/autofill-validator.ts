/**
 * Validates if autofill rules are correct
 */

import { Validator } from './validator';
import { DirectiveType, Component } from '../models';

const supportedDestinationDirectives = [DirectiveType.editable, DirectiveType.link];
const supportedSourceDirectives = [DirectiveType.image];

export class AutofillValidator extends Validator {
    async validate(): Promise<void> {
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
     * @param component
     */
    validateComponent(component: Component): void {
        // Only check when it has directiveOptions configured
        if (!component.directiveOptions) {
            return;
        }

        for (const [dstKey, directiveOptions] of Object.entries(component.directiveOptions)) {
            // Only for directives with autofill
            if (!directiveOptions.autofill) {
                continue;
            }

            const rule = directiveOptions.autofill;

            // check if destination directive exists
            if (!component.directives[dstKey]) {
                this.error(
                    `Component "${component.name}" has incorrect autofill rule "${dstKey}". ` +
                        `This component doesn't have directive "${dstKey}".`,
                );
            } else if (supportedDestinationDirectives.indexOf(component.directives[dstKey].type) < 0) {
                this.error(
                    `Component "${component.name}" has incorrect autofill rule "${dstKey}". ` +
                        `Supported types of destination directive are "${supportedDestinationDirectives.join(
                            '", "',
                        )}" only.`,
                );
            }

            // check if source directive exists
            if (!component.directives[rule.source]) {
                this.error(
                    `Component "${component.name}" has incorrect autofill rule "${dstKey}". ` +
                        `This component doesn't have directive "${rule.source}".`,
                );
                // Check if source directive is supported
            } else if (supportedSourceDirectives.indexOf(component.directives[rule.source].type) < 0) {
                this.error(
                    `Component "${component.name}" has incorrect autofill rule "${dstKey}". ` +
                        `Supported types of source directive are "${supportedSourceDirectives.join('", "')}" only.`,
                );
                // check if metadataField is set when source directive is image kind
            } else if (component.directives[rule.source].type === DirectiveType.image && !('metadataField' in rule)) {
                this.error(
                    `Component "${component.name}" has incorrect autofill rule "${dstKey}". ` +
                        `If source directive is image kind then "metadataField" must be set.`,
                );
            }
            // check if dst !== src
            if (dstKey === rule.source) {
                this.error(
                    `Component "${component.name}" has incorrect autofill rule "${dstKey}". ` +
                        `There is no sense to fill directive content from itself.`,
                );
            }
        }
    }
}
