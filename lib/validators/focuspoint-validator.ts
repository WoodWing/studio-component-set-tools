/**
 * Validates usage of focuspoint of image-editor property
 */

import { Validator } from './validator';
import { ParsedComponentsDefinitionV10X } from '../models';

export class FocuspointValidator extends Validator {

    constructor(
        error: (errorMessage: string) => false,
        private definition: ParsedComponentsDefinitionV10X,
    ) {
        super(error);
    }

    validate(): void {
        for (const parsedComponent of Object.values(this.definition.components)) {
            parsedComponent.properties.forEach((parsedProperty) => {
                if (parsedProperty.control.type === 'image-editor' && parsedProperty.control.focuspoint &&
                    parsedProperty.directiveKey &&  // skip, it's covered in other validator
                    parsedComponent.directives[parsedProperty.directiveKey] && // skip, it's covered in other validator
                    parsedComponent.directives[parsedProperty.directiveKey].tag === 'img') {
                        this.error(`Property "${parsedProperty.name}" of component "${parsedComponent.component.name}" uses ` +
                            `"focuspoint" feature on <img> html tag, which is not supported, "focuspoint" can be applied to other html tags, where` +
                            `image is a background`);
                    }
            });
        }
    }
}
