/**
 * Validates usage of focuspoint of image-editor property
 */

import { Validator } from './validator';

export class FocuspointValidator extends Validator {
    async validate(): Promise<void> {
        for (const parsedComponent of Object.values(this.componentSet.components)) {
            parsedComponent.properties.forEach((parsedProperty) => {
                if (
                    parsedProperty.control.type === 'image-editor' &&
                    parsedProperty.control.focuspoint &&
                    parsedProperty.directiveKey && // skip, it's covered in other validator
                    parsedComponent.directives[parsedProperty.directiveKey] && // skip, it's covered in other validator
                    parsedComponent.directives[parsedProperty.directiveKey].tag === 'img'
                ) {
                    this.error(
                        `Property "${parsedProperty.name}" of component "${parsedComponent.name}" uses ` +
                            `"focuspoint" feature on <img> html tag, which is not supported, "focuspoint" can be applied to other html tags, where` +
                            `image is a background`,
                    );
                }
            });
        }
    }
}
