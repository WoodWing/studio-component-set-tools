/**
 * Validates components
 * - if names are unique
 * - if icons are present
 * - if templates are present
 * - if styles are present
 * - also if generic styles are present: design.scss, design.css, _common.scss
 */

import * as path from 'path';
import { Validator } from './validator';
import { ComponentSet } from '../models';

const RESERVED = [/^__internal__/];
const GENERIC_FILES = [
    path.normalize('styles/_common.scss'),
    path.normalize('styles/design.scss'),
    path.normalize('styles/design.css'),
];

export class ComponentsValidator extends Validator {
    constructor(error: (errorMessage: string) => false, definition: ComponentSet, private filePaths: Set<string>) {
        super(error, definition);
    }

    async validate(): Promise<void> {
        const componentNames = new Set<string>();
        for (const comp of Object.values(this.componentSet.components)) {
            // reserved words
            if (RESERVED.some((regexp) => regexp.test(comp.name))) {
                this.error(`Component name "${comp.name}" is a reserved word`);
            }

            // Validate we have not seen the name yet
            if (componentNames.has(comp.name)) {
                this.error(`Component "${comp.name}" is not unique`);
            }
            componentNames.add(comp.name);

            // Validate the component has an icon
            if (!this.filePaths.has(path.normalize(comp.icon))) {
                this.error(`Component "${comp.name}" icon missing "${comp.icon}"`);
            }

            // Validate the component has a html template
            const htmlTemplatePath = path.normalize(`templates/html/${comp.name}.html`);
            if (!this.filePaths.has(htmlTemplatePath)) {
                this.error(`Component "${comp.name}" html template missing "${htmlTemplatePath}"`);
            }

            // Validate the component has a style
            const componentStylePath = path.normalize(`styles/_${comp.name}.scss`);
            if (!this.filePaths.has(componentStylePath)) {
                this.error(`Component "${comp.name}" style scss file missing "${componentStylePath}"`);
            }
        }

        // generic files
        for (const file of GENERIC_FILES) {
            if (!this.filePaths.has(file)) {
                this.error(`File "${file}" is missing`);
            }
        }
    }
}
