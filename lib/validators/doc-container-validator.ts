/**
 * Validates usage of doc-container directive
 */

import { Validator } from './validator';
import { DirectiveType, ParsedComponentsDefinition, ParsedComponentsDefinitionComponent } from '../models';

export class DocContainerValidator implements Validator {

    constructor(
        private definition: ParsedComponentsDefinition,
    ) {
    }

    private hasContainerDirective(parsedComponent: ParsedComponentsDefinitionComponent) : boolean {
        return Object.values(parsedComponent.directives)
        .some(directive => directive.type === DirectiveType.container);
    }

    validate(
        errorReporter: (errorMessage: string) => void,
    ): boolean {
        let valid = true;

        Object.values(this.definition.components).forEach((parsedComponent: ParsedComponentsDefinitionComponent) => {
            const hasContainer = this.hasContainerDirective(parsedComponent);
            // check if it's the only one
            if (hasContainer && Object.keys(parsedComponent.directives).length > 1) {
                errorReporter(`Component "${parsedComponent.component.name}" contains container directive, it can be the only directive in the component, ` +
                    `all other directives are restricted`);
                valid = false;
            }
        });

        return valid;
    }
}
