/**
 * Validates if conversion shortcuts components are exist
 */

import { Validator } from './validator';

export class ConversionShortcutsValidator extends Validator {
    validate(): void {
        if (!this.definition.conversionShortcutComponents) {
            return;
        }
        this.definition.conversionShortcutComponents.forEach(componentName => {
            if (!(componentName in this.definition.components)) {
                this.error(`Component "${componentName}" does not exist`);
            }
        });
    }
}
