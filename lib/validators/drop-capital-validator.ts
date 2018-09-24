/**
 * Validates usage of drop-capital control type
 * - allowed to use with dataType=data
 * - only one per a component
 */

import { Validator } from './validator';
import { ComponentsDefinition, ParsedComponentsDefinitionV10X, ParsedComponentsDefinitionComponent } from '../models';

const CONTROL = 'drop-capital';
const ALLOWED_DATA_TYPE = 'data';

export class DropCapitalValidator extends Validator {

    constructor(
        error: (errorMessage: string) => false,
        private definition: ComponentsDefinition,
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
        for (const property of this.definition.componentProperties) {
            if (property.control.type === CONTROL && property.dataType !== ALLOWED_DATA_TYPE) {
                this.error(`Property "${property.name}" uses "${CONTROL}" control type which is allowed to use with ` +
                    `dataType="${ALLOWED_DATA_TYPE}" only`);
            }
        }

        for (const parsedComponent of Object.values(this.parsedDefinition.components)) {
            if (this.countPerComponent(parsedComponent) > 1) {
                this.error(`Component "${parsedComponent.component.name}" uses properties with "${CONTROL}" control type ` +
                    `more that one time`);
            }
        }
    }
}
