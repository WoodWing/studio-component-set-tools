/**
 * Validates usage of fitting control type
 * - only one per a component
 */

import { Validator } from './validator';
import { ParsedComponentsDefinitionComponent } from '../models';

const CONTROL = 'fitting';

export class FittingValidator extends Validator {
    private countPerComponent(component: ParsedComponentsDefinitionComponent) : number {
        let amount = 0;
        component.properties.forEach((parsedProperty) => {
            if (parsedProperty.control.type === CONTROL) {
                amount++;
            }
        });
        return amount;
    }

    validate(): void {
        for (const parsedComponent of Object.values(this.definition.components)) {
            if (this.countPerComponent(parsedComponent) > 1) {
                this.error(`Component "${parsedComponent.component.name}" uses properties with "${CONTROL}" control type ` +
                    `more that one time`);
            }
        }
    }
}
