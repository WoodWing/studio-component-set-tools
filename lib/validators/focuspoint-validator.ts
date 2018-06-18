/**
 * Validates usage of focuspoint of image-editor property
 */

import { Validator } from './validator';
import { ParsedComponentsDefinition } from '../models';

export class FocuspointValidator implements Validator {

    constructor(
        private definition: ParsedComponentsDefinition,
    ) {
    }

    validate(
        errorReporter: (errorMessage: string) => void,
    ): boolean {
        let valid = true;

        for (const parsedComponent of Object.values(this.definition.components)) {
            parsedComponent.properties.forEach((parsedProperty) => {
                if (parsedProperty.control.type === 'image-editor' && parsedProperty.control.focuspoint &&
                    parsedProperty.directiveKey &&  // skip, it's covered in other validator
                    parsedComponent.directives[parsedProperty.directiveKey] && // skip, it's covered in other validator
                    parsedComponent.directives[parsedProperty.directiveKey].tag === 'img') {
                        errorReporter(`Property "${parsedProperty.name}" of component "${parsedComponent.component.name}" uses ` +
                            `"focuspoint" feature on <img> html tag, which is not supported, "focuspoint" can be applied to other html tags, where` +
                            `image is a background`);
                        valid = false;
                    }
            });
        }

        return valid;
    }
}
