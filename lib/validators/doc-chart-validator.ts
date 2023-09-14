/**
 * Validates usage of doc-chart directive
 *
 * Rules:
 *  - A component is not allowed to have more than one doc-chart directive.
 *  - A component with 1 doc-chart directive -must- have a property control type "chart"
 *  - A component property with a "chart" control type MUST be applied to a "chart" directive
 *  - A component without a doc-chart directive can't have any "chart" control types
 */

import { Validator } from './validator';
import { ComponentProperty, DirectiveType, Component } from '../models';

export class DocChartValidator extends Validator {
    async validate(): Promise<void> {
        Object.values(this.componentSet.components).forEach((c: Component) => this.validateComponent(c));
    }

    private validateComponent(component: Component) {
        const numChartDirectives = this.countChartDirectives(component);
        if (numChartDirectives === 0) {
            this.validateComponentWithoutChartDirective(component);
            return;
        }

        if (numChartDirectives > 1) {
            this.error(`Component "${component.name}" can only have one "doc-chart" directive in the HTML definition`);
            return;
        }

        this.validateComponentWithChartDirective(component);
    }

    private validateComponentWithoutChartDirective(component: Component) {
        if (this.countChartPropertiesProperties(component) > 0) {
            this.error(
                `Component "${component.name}" has a "chart" control type, but only components with a "doc-chart" directive can have a property with this control type`,
            );
        }
    }

    private validateComponentWithChartDirective(component: Component) {
        if (this.countChartPropertiesProperties(component) !== 1) {
            this.error(
                `Component "${
                    component.name
                }" with "doc-chart" directive must have exactly one "chart" property (found ${this.countChartPropertiesProperties(
                    component,
                )})`,
            );
            return;
        }

        // Check whether the chart-properties control type property is applied to the doc-chart directive.
        for (const chartProperty of Object.values(this.chartPropertiesProperties(component))) {
            this.validateChartProperty(component, chartProperty);
        }
    }

    private validateChartProperty(component: Component, chartProperty: ComponentProperty) {
        if (!chartProperty.directiveKey) {
            this.error(
                `Component "${component.name}" must configure "directiveKey" for the property with control type "chart"`,
            );
            return;
        }

        const directive = component.directives[chartProperty.directiveKey];
        if (!directive || directive.type !== DirectiveType.chart) {
            this.error(
                `Component "${component.name}" has a control type "chart" applied to the wrong directive, which can only be used with "doc-chart" directives`,
            );
        }
    }

    private countChartDirectives(component: Component): number {
        return Object.values(component.directives).filter((directive) => directive.type === DirectiveType.chart).length;
    }

    /** Count number of "chart" properties */
    private countChartPropertiesProperties(component: Component): number {
        return this.chartPropertiesProperties(component).length;
    }

    /** Get "chart" properties definitions (collection of nested properties behaving as a single property) */
    private chartPropertiesProperties(component: Component) {
        return Object.values(component.properties).filter((property) => property.control.type === 'chart');
    }
}
