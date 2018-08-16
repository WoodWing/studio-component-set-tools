/**
 * Validates if group components exist
 */

import { Validator } from './validator';
import { ParsedComponentsDefinitionV10X } from '../models';

export class GroupsValidator implements Validator {

    constructor(
        private definition: ParsedComponentsDefinitionV10X,
    ) {
    }

    validate(
        errorReporter: (errorMessage: string) => void,
    ): boolean {
        return this.validateGroupsList(errorReporter, this.definition.groups);
    }

    /**
     * Validate a list of groups.
     *
     * @param errorReporter
     * @param parsedGroup
     */
    validateGroupsList(
        errorReporter: (errorMessage: string) => void,
        groups: ParsedComponentsDefinitionV10X['groups'],
    ): boolean {
        let valid = true;

        const groupNames = new Set<string>();

        for (const group of groups) {
            valid = this.validateGroup(errorReporter, group) && valid;

            if (groupNames.has(group.name)) {
                valid = false;
                errorReporter(`Component group "${group.name}" is not unique`);
            }
            groupNames.add(group.name);
        }

        return valid;
    }

    /**
     * Validate a single parsed group.
     *
     * @param errorReporter
     * @param parsedGroup
     */
    private validateGroup(
        errorReporter: (errorMessage: string) => void,
        group: ParsedComponentsDefinitionV10X['groups'][0],
    ): boolean {
        let valid = true;

        for (const componentName of group.components) {
            if (!(componentName in this.definition.components)) {
                errorReporter(`Component "${componentName}" of group "${group.name}" does not exist`);
                valid = false;
            }
        }

        return valid;
    }
}
