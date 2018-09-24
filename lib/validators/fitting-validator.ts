/**
 * Validates usage of fitting control type
 * - only one per a component
 */

import { Validator } from './validator';
import { ParsedComponentsDefinitionV10X, ParsedComponentsDefinitionComponent } from '../models';

const CONTROL = 'fitting';

export class FittingValidator extends Validator {

    constructor(
        error: (errorMessage: string) => false,
        private parsedDefinition: ParsedComponentsDefinitionV10X,
    ) {
        super(error);
    }

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
        for (const parsedComponent of Object.values(this.parsedDefinition.components)) {
            if (this.countPerComponent(parsedComponent) > 1) {
                this.error(`Component "${parsedComponent.component.name}" uses properties with "${CONTROL}" control type ` +
                    `more that one time`);
            }
        }
    }
}
