/**
 * Validates usage of drop-capital control type
 * - allowed to use with dataType=data
 * - only one per a component
 */

import { Validator } from './validator';
import { ComponentsDefinition, ParsedComponentsDefinition, ParsedComponentsDefinitionComponent } from '../models';

const CONTROL = 'drop-capital';
const ALLOWED_DATA_TYPE = 'data';

export class DropCapitalValidator implements Validator {

    constructor(
        private definition: ComponentsDefinition,
        private parsedDefinition: ParsedComponentsDefinition,
    ) {
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

    validate(
        errorReporter: (errorMessage: string) => void,
    ): boolean {
        let valid = true;

        for (const property of this.definition.componentProperties) {
            if (property.control.type === CONTROL && property.dataType !== ALLOWED_DATA_TYPE) {
                errorReporter(`Property "${property.name}" uses "${CONTROL}" control type which is allowed to use with ` +
                    `dataType="${ALLOWED_DATA_TYPE}" only`);
                valid = false;
            }
        }

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
