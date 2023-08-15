/**
 * Validates usage of doc-infogram directive
 *
 * Rules:
 *  - A component is not allowed to have more than one doc-infogram directive.
 *  - A component with 1 doc-infogram directives -must- have a property control type "infogram"
 *  - A component property with a "infogram" control type MUST be applied to a "infogram" directive
 *  - A component without a doc-infogram directive can't have any "infogram" control types
 */

import { Validator } from './validator';
import { ComponentProperty, DirectiveType, Component } from '../models';

export class DocInfogramValidator extends Validator {
    async validate(): Promise<void> {
        Object.values(this.componentSet.components).forEach((c: Component) => this.validateComponent(c));
    }

    private validateComponent(component: Component) {
        const numInfogramDirectives = this.countInfogramDirectives(component);
        if (numInfogramDirectives === 0) {
            this.validateComponentWithoutInfogramDirective(component);
            return;
        }

        if (numInfogramDirectives > 1) {
            this.error(
                `Component "${component.name}" can only have one "doc-infogram" directive in the HTML definition`,
            );
            return;
        }

        this.validateComponentWithInfogramDirective(component);
    }

    private validateComponentWithoutInfogramDirective(component: Component) {
        if (this.countInfogramPropertiesProperties(component) > 0) {
            this.error(
                `Component "${component.name}" has a "infogram" control type, but only components with a "doc-infogram" directive can have a property with this control type`,
            );
        }
    }

    private validateComponentWithInfogramDirective(component: Component) {
        if (this.countInfogramPropertiesProperties(component) !== 1) {
            this.error(
                `Component "${
                    component.name
                }" with "doc-infogram" directive must have exactly one "infogram" property (found ${this.countInfogramPropertiesProperties(
                    component,
                )})`,
            );
            return;
        }

        // Check whether the infogram control type property is applied to the doc-infogram directive.
        for (const infogramProperty of Object.values(this.infogramPropertiesProperties(component))) {
            this.validateInfogramProperty(component, infogramProperty);
        }
    }

    private validateInfogramProperty(component: Component, infogramProperty: ComponentProperty) {
        if (!infogramProperty.directiveKey) {
            this.error(
                `Component "${component.name}" must configure "directiveKey" for the property with control type "infogram"`,
            );
            return;
        }

        const directive = component.directives[infogramProperty.directiveKey];
        if (!directive || directive.type !== DirectiveType.infogram) {
            this.error(
                `Component "${component.name}" has a control type "infogram" applied to the wrong directive, which can only be used with "doc-infogram" directives`,
            );
        }
    }

    private countInfogramDirectives(component: Component): number {
        return Object.values(component.directives).filter((directive) => directive.type === DirectiveType.infogram)
            .length;
    }

    /** Count number of "infogram" properties */
    private countInfogramPropertiesProperties(component: Component): number {
        return this.infogramPropertiesProperties(component).length;
    }

    /** Get "infogram" properties definitions (collection of nested properties behaving as a single property) */
    private infogramPropertiesProperties(component: Component) {
        return Object.values(component.properties).filter((property) => property.control.type === 'infogram');
    }
}
