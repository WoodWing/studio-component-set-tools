/**
 * Validates groups of doc-container directives.
 * Theses groups are defined as part of the component definition and
 * are configurable per doc-container directive.
 *
 * These groups override the root level groups for the component picker popup inside a container.
 */

import { Validator } from './validator';
import { Component } from '../models';
import { GroupsValidator } from './groups-validator';

export class DocContainerGroupsValidator extends Validator {
    async validate(): Promise<void> {
        // Find slides control properties and check for include and exclude
        for (const component of Object.values(this.componentSet.components)) {
            this.validateComponent(component);
        }
    }

    /**
     * Validates groups of component.
     * These should have a matching doc-container directive.
     * They should also pass the group validator.
     *
     * @param errorReporter
     * @param component
     */
    validateComponent(component: Component): void {
        if (!component.directiveOptions) {
            return;
        }

        const groupsValidator = new GroupsValidator(this.error, this.componentSet);

        for (const [key, directiveOptions] of Object.entries(component.directiveOptions)) {
            // Rules only apply when it has a groups property defined
            if (!directiveOptions.groups) {
                continue;
            }
            if (!component.directives[key]) {
                this.error(`Component "${component.name}" has a group for invalid directive "${key}"`);
                continue;
            }
            if (component.directives[key].type !== 'container') {
                this.error(
                    `Component "${component.name}" has a group for directive "${key}" with incompatible type "${component.directives[key].type}". Only type "container" is allowed.`,
                );
                continue;
            }

            groupsValidator.validateGroupsList(directiveOptions.groups);
        }
    }
}
