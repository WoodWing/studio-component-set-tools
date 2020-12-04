/**
 * Validates if conversion shortcuts components are exist
 */

import { Validator } from './validator';

export class ConversionShortcutsValidator extends Validator {
    async validate(): Promise<void> {
        if (!this.componentSet.shortcuts || !this.componentSet.shortcuts.conversionComponents) {
            return;
        }
        this.componentSet.shortcuts.conversionComponents.forEach((componentName) => {
            if (!(componentName in this.componentSet.components)) {
                this.error(`Component "${componentName}" does not exist`);
            }
        });
    }
}
