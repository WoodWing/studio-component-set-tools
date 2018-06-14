/**
 * Validates usage of fitting control type
 * - only one per a component
 */

import { Validator } from './validator';
import { ParsedComponentsDefinition, ParsedComponentsDefinitionComponent } from '../models';

const CONTROL = 'fitting';

export class FittingValidator implements Validator {

    constructor(
        private parsedDefinition: ParsedComponentsDefinition,
    ) {
    }

    private countPerComponent(component: ParsedComponentsDefinitionComponent) : number {
        let amount = 0;
        for (const parsedProperty of Object.values(component.properties)) {
            if (parsedProperty.property.control.type === CONTROL) {
                amount++;
            }
        }
        return amount;
    }

    validate(
        errorReporter: (errorMessage: string) => void,
    ): boolean {
        let valid = true;

        for (const parsedComponent of Object.values(this.parsedDefinition.components)) {
            if (this.countPerComponent(parsedComponent) > 1) {
                errorReporter(`Component "${parsedComponent.component.name}" uses properties with "${CONTROL}" control type ` +
                    `more that one time`);
                valid = false;
            }
        }

        return valid;
    }
}
