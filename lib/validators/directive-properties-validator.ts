/**
 * Validates:
 * - if properties which works with directives only have a reference to a directive
 * - if all properties whose dataType=doc-* have a reference to a directive
 */

import { Validator } from './validator';
import { DirectiveType } from '../models';

const CONTROLS = ['image-editor', 'interactive', 'media-properties'];

export class DirectivePropertiesValidator extends Validator {
    async validate(): Promise<void> {
        const regexp = new RegExp(
            `^doc-(${Object.values(DirectiveType)
                .filter((item) => item !== DirectiveType.unknown)
                .join('|')})`,
            'i',
        );

        for (const component of Object.values(this.componentSet.components)) {
            component.properties.forEach((parsedProperty) => {
                if (CONTROLS.indexOf(parsedProperty.control.type) >= 0 && !parsedProperty.directiveKey) {
                    this.error(
                        `Property "${parsedProperty.name}" of component "${component.name}" must reference ` +
                            `to a directive`,
                    );
                }
                // check all dataType=doc-* properties
                if (regexp.test(parsedProperty.dataType) && !parsedProperty.directiveKey) {
                    this.error(
                        `Property "${parsedProperty.name}" of component "${component.name}" must reference ` +
                            `to a directive because its dataType is a directive type`,
                    );
                }
            });
        }
    }
}
