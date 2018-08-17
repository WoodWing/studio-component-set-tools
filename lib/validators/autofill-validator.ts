/**
 * Validates if autofill rules are correct
 */

import { Validator } from './validator';
import { DirectiveType, ParsedComponentsDefinitionV11X } from '../models';

const supportedDestinationDirectives = [DirectiveType.editable, DirectiveType.link];

export class AutofillValidator implements Validator {

    constructor(
        private definition: ParsedComponentsDefinitionV11X,
    ) {
    }

    validate(
        errorReporter: (errorMessage: string) => void,
    ): boolean {
        return Object.values(this.definition.components).reduce((valid, component) => {
            return this.validateComponent(errorReporter, component) && valid;
        }, true);
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
        errorReporter: (errorMessage: string) => void,
        parsedComponent: ParsedComponentsDefinitionV11X['components']['name'],
    ): boolean {
        // Only check when it has directiveOptions configured
        if (!parsedComponent.component.directiveOptions) {
            return true;
        }

        let valid = true;

        for (const [dstKey, directiveOptions] of Object.entries(parsedComponent.component.directiveOptions)) {
            // Only for directives with autofill
            if (!directiveOptions.autofill) {
                continue;
            }

            const rule = directiveOptions.autofill;

            // check if destination directive exists
            if (!parsedComponent.directives[dstKey]) {
                errorReporter(`Component "${parsedComponent.component.name}" has incorrect autofill rule "${dstKey}". ` +
                `This component doesn't have directive "${dstKey}".`);
                valid = false;
            } else if (supportedDestinationDirectives.indexOf(parsedComponent.directives[dstKey].type) < 0) {
                errorReporter(`Component "${parsedComponent.component.name}" has incorrect autofill rule "${dstKey}". ` +
                `Supported types of destination directive are "${supportedDestinationDirectives.join('", "')}" only.`);
                valid = false;
            }

            // check if source directive exists
            if (!parsedComponent.directives[rule.source]) {
                errorReporter(`Component "${parsedComponent.component.name}" has incorrect autofill rule "${dstKey}". ` +
                `This component doesn't have directive "${rule.source}".`);
                valid = false;
            // check if metadataField is set when source directive is image kind
            } else if (parsedComponent.directives[rule.source].type === DirectiveType.image && !('metadataField' in rule)) {
                errorReporter(`Component "${parsedComponent.component.name}" has incorrect autofill rule "${dstKey}". ` +
                `If source directive is image kind then "metadataField" must be set.`);
                valid = false;
            }
            // check if dst !== src
            if (dstKey === rule.source) {
                errorReporter(`Component "${parsedComponent.component.name}" has incorrect autofill rule "${dstKey}". ` +
                `There is no sense to fill directive content from itself.`);
                valid = false;
            }
        }

        return valid;
    }
}
