/**
 * Validates if group components exist
 */

import { Validator } from './validator';
import { ComponentGroup } from '../models';

export class GroupsValidator extends Validator {
    async validate(): Promise<void> {
        this.validateGroupsList(this.componentSet.groups);
    }

    /**
     * Validate a list of groups.
     *
     * @param errorReporter
     * @param parsedGroup
     */
    validateGroupsList(groups: ComponentGroup[]): void {
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
     * Validate a list of groups.
     *
     * @param errorReporter
     * @param parsedGroup
     */
    validateGroupsProperties(group: ComponentGroup): void {
        if (group.logo) {
            if (!group.logo.path) {
                this.error(`Component group "${group.name}" is missing mandatory property "path" in "logo"`);
            }
            if (group.logo.path && typeof group.logo.path !== 'string') {
                this.error(`Component group "${group.name}" property "path" in "logo" should be of type string`);
            }
            if (group.logo.link && typeof group.logo.link !== 'string') {
                this.error(`Component group "${group.name}" property "link" in "logo" should be of type string`);
            }
        }
    }

    /**
     * Validate a single parsed group.
     *
     * @param errorReporter
     * @param parsedGroup
     */
    private validateGroup(group: ComponentGroup): void {
        this.validateGroupsProperties(group);
        for (const componentName of group.components) {
            if (!(componentName in this.componentSet.components)) {
                this.error(`Component "${componentName}" of group "${group.name}" does not exist`);
            }
        }
    }
}
