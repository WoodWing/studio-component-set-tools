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

export class DocContainerGroupsValidator implements Validator {

    constructor(
        private parsedDefinition: ParsedComponentsDefinitionV11X,
    ) {
    }

    validate(
        errorReporter: (errorMessage: string) => void,
    ): boolean {
        let valid = true;

        // Find slides control properties and check for include and exclude
        for (const parsedComponent of Object.values(this.parsedDefinition.components)) {
            valid = this.validateComponent(errorReporter, parsedComponent) && valid;
        }

        return valid;
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
        errorReporter: (errorMessage: string) => void,
        parsedComponent: ParsedComponentsDefinitionV11X['components']['name'],
    ): boolean {
        let valid = true;

        if (!parsedComponent.component.groups) {
            return valid;
        }

        const groupsValidator = new GroupsValidator(this.parsedDefinition);

        for (const [key, group] of Object.entries(parsedComponent.component.groups)) {
            if (!parsedComponent.directives[key]) {
                valid = false;
                errorReporter(`Component "${parsedComponent.component.name}" has a group for invalid directive "${key}"`);
                continue;
            }
            if (parsedComponent.directives[key].type !== 'container') {
                valid = false;
                errorReporter(`Component "${parsedComponent.component.name}" has a group for directive "${key}" with incompatible type "${parsedComponent.directives[key].type}"`);
                continue;
            }

            valid = groupsValidator.validateGroupsList(errorReporter, group) && valid;
        }

        return valid;
    }
}
