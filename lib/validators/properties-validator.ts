/**
 * Validates properties
 * - if names are unique
 * - if icons are present
 * - if reserved words are not used as names
 * - if doc-media properties have a media-properties control type
 */

import * as path from 'path';
import { Validator } from './validator';
import { ComponentsDefinition } from '../models';

const RESERVED = [
    /^parallax$/,
];

export class PropertiesValidator extends Validator {

    constructor(
        error: (errorMessage: string) => false,
        private filePaths: Set<string>,
        private definition: ComponentsDefinition,
    ) {
        super(error);
    }

    validate(): void {
        // Check component properties
        const componentPropertyNames = new Set<string>();
        for (const compProp of this.definition.componentProperties) {
            // reserved words
            if (RESERVED.some(regexp => regexp.test(compProp.name))) {
                this.error(`Component property name "${compProp.name}" is a reserved word`);
            }
            // Validate we have not seen the name yet
            if (componentPropertyNames.has(compProp.name)) {
                this.error(`Component property "${compProp.name}" is not unique`);
            }
            componentPropertyNames.add(compProp.name);

            // Validate the property has icons (for radio control type)
            if (compProp.control.type === 'radio') {
                for (const controlOption of compProp.control.options) {
                    if (!this.filePaths.has(path.normalize(controlOption.icon))) {
                        this.error(`Component properties "${compProp.name}" icon missing "${controlOption.icon}"`);
                    }
                }
            }
        }
    }
}
