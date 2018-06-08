/**
 * Validates if properties which works with directives only have a reference to a directive
 */

import { Validator } from './validator';
import { ParsedComponentsDefinition } from '../models';

const CONTROLS = ['image-editor', 'interactive', 'media-properties'];

export class DirectivePropertiesValidator implements Validator {

    constructor(
        private definition: ParsedComponentsDefinition,
    ) {
    }

    validate(
        errorReporter: (errorMessage: string) => void,
    ): boolean {
        let valid = true;

        for (const parsedComponent of Object.values(this.definition.components)) {
            for (const parsedProperty of Object.values(parsedComponent.properties)) {
                if (CONTROLS.indexOf(parsedProperty.property.control.type) >= 0 && !parsedProperty.directiveKey) {
                    errorReporter(`Property "${parsedProperty.property.name}" of component "${parsedComponent.component.name}" must reference ` +
                        `to a directive`);
                    valid = false;
                }
            }
        }
        
        return valid;
    }
}
