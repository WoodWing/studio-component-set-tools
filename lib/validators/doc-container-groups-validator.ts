/**
 * Validates groups of doc-container directives.
 * Theses groups are defined as part of the component definition and
 * are configurable per doc-container directive.
 *
 * These groups override the root level groups for the component picker popup inside a container.
 */

import { Validator } from './validator';
import { ParsedComponentsDefinitionV11X } from '../models';
import { GroupsValidator } from './groups-validator';

export class DocContainerGroupsValidator extends Validator {

    constructor(
        error: (errorMessage: string) => false,
        private parsedDefinition: ParsedComponentsDefinitionV11X,
    ) {
        super(error);
    }

    validate(): void {
        // Find slides control properties and check for include and exclude
        for (const parsedComponent of Object.values(this.parsedDefinition.components)) {
            this.validateComponent(parsedComponent);
        }
    }

    /**
     * Validates groups of component.
     * These should have a matching doc-container directive.
     * They should also pass the group validator.
     *
     * @param errorReporter
     * @param parsedComponent
     */
    validateComponent(
        parsedComponent: ParsedComponentsDefinitionV11X['components']['name'],
    ): void {
        if (!parsedComponent.component.directiveOptions) {
            return;
        }

        const groupsValidator = new GroupsValidator(this.error, this.parsedDefinition);

        for (const [key, directiveOptions] of Object.entries(parsedComponent.component.directiveOptions)) {
            // Rules only apply when it has a groups property defined
            if (!directiveOptions.groups) {
                continue;
            }
            if (!parsedComponent.directives[key]) {
                this.error(`Component "${parsedComponent.component.name}" has a group for invalid directive "${key}"`);
                continue;
            }
            if (parsedComponent.directives[key].type !== 'container') {
                this.error(`Component "${parsedComponent.component.name}" has a group for directive "${key}" with incompatible type "${parsedComponent.directives[key].type}". Only type "container" is allowed.`);
                continue;
            }

            groupsValidator.validateGroupsList(directiveOptions.groups);
        }
    }
}
