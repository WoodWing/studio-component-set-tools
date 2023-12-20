/**
 * Validates if group components exist
 */

import { Validator } from './validator';
import { ComponentGroup, ComponentSet } from '../models';
import * as path from 'path';

export class GroupsValidator extends Validator {
    constructor(error: (errorMessage: string) => false, definition: ComponentSet, private filePaths: Set<string>) {
        super(error, definition);
    }

    async validate(): Promise<void> {
        this.validateGroupsList(this.componentSet.groups);
    }

    /**
     * Validate a list of groups.
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
     * Validate a single parsed group.
     */
    private validateGroup(group: ComponentGroup): void {
        for (const componentName of group.components) {
            if (!(componentName in this.componentSet.components)) {
                this.error(`Component "${componentName}" of group "${group.name}" does not exist`);
            }
        }

        if (group.logo?.icon) {
            if (!this.filePaths.has(path.normalize(group.logo.icon))) {
                this.error(`Group "${group.name}" logo icon missing: "${group.logo.icon}"`);
            }
        }
    }
}
