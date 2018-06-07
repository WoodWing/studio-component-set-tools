/**
 * Validates usage of image-editor control type
 */

import { Validator } from './validator';
import { ComponentsDefinition } from '../models';

const ALLOWED_DATA_TYPE = 'doc-image';

export class ImageEditorValidator implements Validator {

    constructor(
        private definition: ComponentsDefinition,
    ) {
    }

    validate(
        errorReporter: (errorMessage: string) => void,
    ): boolean {
        let valid = true;

        for (const property of this.definition.componentProperties) {
            if (property.control.type === 'image-editor' && property.dataType !== ALLOWED_DATA_TYPE) {
                errorReporter(`Property "${property.name}" uses "image-editor" control type which is allowed to use with ` +
                    `dataType="${ALLOWED_DATA_TYPE}" only`);
                valid = false;
            }
        }

        return valid;
    }
}
