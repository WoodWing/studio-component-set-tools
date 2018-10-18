/**
 * Validates if conversion shortcuts components are exist
 */

import { Validator } from './validator';

export class ConversionShortcutsValidator extends Validator {
    validate(): void {
        if (!this.componentSet.conversionShortcutComponents) {
            return;
        }
        this.componentSet.conversionShortcutComponents.forEach(componentName => {
            if (!(componentName in this.componentSet.components)) {
                this.error(`Component "${componentName}" does not exist`);
            }
        });
    }
}
