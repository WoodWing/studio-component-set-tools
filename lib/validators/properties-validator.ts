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

export class PropertiesValidator implements Validator {

    constructor(
        private filePaths: Set<string>,
        private definition: ComponentsDefinition,
    ) {
    }

    validate(
        errorReporter: (errorMessage: string) => void,
    ): boolean {
        let valid = true;

        // Check component properties
        const componentPropertyNames = new Set<string>();
        for (const compProp of this.definition.componentProperties) {
            // reserved words
            if (RESERVED.some(regexp => regexp.test(compProp.name))) {
                errorReporter(`Component property name "${compProp.name}" is a reserved word`);
                valid = false;
            }
            // Validate we have not seen the name yet
            if (componentPropertyNames.has(compProp.name)) {
                errorReporter(`Component property "${compProp.name}" is not unique`);
                valid = false;
            }
            componentPropertyNames.add(compProp.name);

            // Validate the property has icons (for radio control type)
            if (compProp.control.type === 'radio') {
                for (const controlOption of compProp.control.options) {
                    if (!this.filePaths.has(path.normalize(controlOption.icon))) {
                        errorReporter(`Component properties "${compProp.name}" icon missing "${controlOption.icon}"`);
                        valid = false;
                    }
                }
            }

            // Validate if the doc-media properties have a media-properties control type
            if (compProp.dataType === 'doc-media') {
                if (compProp.control.type !== 'media-properties') {
                    errorReporter(`Component property "doc-media" requires the control type "media-properties"`);
                    valid = false;
                }
            }
        }

        return valid;
    }
}
