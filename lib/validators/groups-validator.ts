/**
 * Validates if group components exist
 */

import { Validator } from './validator';
import { ParsedComponentsDefinitionV10X } from '../models';

export class GroupsValidator extends Validator {

    constructor(
        error: (errorMessage: string) => false,
        private definition: ParsedComponentsDefinitionV10X,
    ) {
        super(error);
    }

    validate(): void {
        this.validateGroupsList(this.definition.groups);
    }

    /**
     * Validate a list of groups.
     *
     * @param errorReporter
     * @param parsedGroup
     */
    validateGroupsList(
        groups: ParsedComponentsDefinitionV10X['groups'],
    ): void {
        const groupNames = new Set<string>();

        for (const group of groups) {
            this.validateGroup(group);

            if (groupNames.has(group.name)) {
                this.error(`Component group "${group.name}" is not unique`);
            }
            groupNames.add(group.name);
        }
    }

    /**
     * Validate a single parsed group.
     *
     * @param errorReporter
     * @param parsedGroup
     */
    private validateGroup(
        group: ParsedComponentsDefinitionV10X['groups'][0],
    ): void {
        for (const componentName of group.components) {
            if (!(componentName in this.definition.components)) {
                this.error(`Component "${componentName}" of group "${group.name}" does not exist`);
            }
        }
    }
}
