/**
 * Validates usage of fitting control type
 * - only one per a component
 */

import { Validator } from './validator';
import { Component } from '../models';

const CONTROL = 'fitting';

export class FittingValidator extends Validator {
    private countPerComponent(component: Component): number {
        let amount = 0;
        component.properties.forEach((parsedProperty) => {
            if (parsedProperty.control.type === CONTROL) {
                amount++;
            }
        });
        return amount;
    }

    async validate(): Promise<void> {
        for (const parsedComponent of Object.values(this.componentSet.components)) {
            if (this.countPerComponent(parsedComponent) > 1) {
                this.error(
                    `Component "${parsedComponent.name}" uses properties with "${CONTROL}" control type ` +
                        `more that one time`,
                );
            }
        }
    }
}
