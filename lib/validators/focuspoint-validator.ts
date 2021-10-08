/**
 * Validates usage of focuspoint of image-editor property
 */

import { Validator } from './validator';

export class FocuspointValidator extends Validator {
    async validate(): Promise<void> {
        for (const component of Object.values(this.componentSet.components)) {
            component.properties.forEach((parsedProperty) => {
                if (
                    parsedProperty.control.type === 'image-editor' &&
                    parsedProperty.control.focuspoint &&
                    parsedProperty.directiveKey && // skip, it's covered in other validator
                    component.directives[parsedProperty.directiveKey] && // skip, it's covered in other validator
                    component.directives[parsedProperty.directiveKey].tag === 'img'
                ) {
                    this.error(
                        `Property "${parsedProperty.name}" of component "${component.name}" uses ` +
                            `"focuspoint" feature on <img> html tag, which is not supported, "focuspoint" can be applied to other html tags, where` +
                            `image is a background`,
                    );
                }
            });
        }
    }
}
