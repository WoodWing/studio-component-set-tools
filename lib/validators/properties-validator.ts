/**
 * Validates properties
 * - if names are unique
 * - if icons are present
 * - if reserved words are not used as names
 * - if doc-media properties have a media-properties control type
 */

import * as path from 'path';
import { Validator } from './validator';
import { ComponentProperty, ComponentSet, Component } from '../models';
import type { ComponentPropertyControl } from '../models/component-property-controls';
import * as semver from 'semver';

const RESERVED = [/^parallax$/];

const TYPES_ALLOWING_CHILD_PROPERTIES: ComponentPropertyControl['type'][] = [
    'select',
    'checkbox',
    'radio',
    'text',
    'textarea',
    'url',
    'time',
    'colorPicker',
    'slider',
];

export class PropertiesValidator extends Validator {
    constructor(error: (errorMessage: string) => false, definition: ComponentSet, protected filePaths: Set<string>) {
        super(error, definition);
    }

    async validate(): Promise<void> {
        Object.values(this.componentSet.components).forEach((component) => this.validateComponent(component));
    }

    private validateComponent(component: Component): void {
        const componentPropertyNames = new Set<string>();

        component.properties.forEach((property) => this.validateProperty(property, componentPropertyNames, component));
        component.properties.forEach((property) =>
            this.validateChildProperties(property, componentPropertyNames, component),
        );
    }

    private validateProperty(property: ComponentProperty, componentPropertyNames: Set<string>, component: Component) {
        this.validateReservedPropertyName(property);
        this.validatePropertyName(property, componentPropertyNames, component);
        this.validateRadioPropertyIcons(property);
        this.validateCheckBoxValue(property);
    }

    private validatePropertyName(
        property: ComponentProperty,
        componentPropertyNames: Set<string>,
        component: Component,
    ) {
        if (!property.name) {
            this.validateNamelessProperty(property, component);
            return;
        }

        if (componentPropertyNames.has(property.name)) {
            this.error(`Component property "${property.name}" used in component "${component.name}" is not unique`);
        }

        componentPropertyNames.add(property.name);
    }

    private validateReservedPropertyName(property: ComponentProperty) {
        if (semver.satisfies(this.componentSet.version, '>=1.4.x')) {
            return;
        }

        if (RESERVED.some((regexp) => regexp.test(property.name))) {
            this.error(`Component property name "${property.name}" is a reserved word`);
        }
    }

    private validateNamelessProperty(property: ComponentProperty, component: Component) {
        if (property.control.type !== 'header') {
            this.error(
                `Property in component "${component.name}" must have a name when using control type "${property.control.type}"`,
            );
        }
        if (property.dataType) {
            this.error(
                `Nameless property with control type "${property.control.type}" and label "${property.label}" in component "${component.name}" cannot have a dataType`,
            );
        }
    }

    private validateRadioPropertyIcons(property: ComponentProperty) {
        if (property.control.type !== 'radio') {
            return;
        }
        for (const controlOption of property.control.options) {
            if (!this.filePaths.has(path.normalize(controlOption.icon))) {
                this.error(`Component properties "${property.name}" icon missing "${controlOption.icon}"`);
            }
        }
    }

    private validateCheckBoxValue(property: ComponentProperty) {
        if (property.control.type !== 'checkbox') {
            return;
        }
        if (typeof property.control.value === 'boolean' && property.dataType !== 'data') {
            this.error(
                `Checkbox property "${property.name}" cannot have a boolean value for dataType "${property.dataType}", boolean values are only allowed for dataType "data"`,
            );
        }
    }

    private validateChildProperties(
        property: ComponentProperty,
        componentPropertyNames: Set<string>,
        component: Component,
    ) {
        if (!property.childProperties) return;

        if (!TYPES_ALLOWING_CHILD_PROPERTIES.includes(property.control.type)) {
            this.error(
                `Property in component "${component.name}" with control type "${property.control.type}" cannot contain child properties`,
            );
        }

        property.childProperties.forEach((conditionalChildProperties) => {
            const conditionalUsedPropertyNames = new Set(componentPropertyNames);
            (conditionalChildProperties.properties as ComponentProperty[]).forEach((childProperty) => {
                this.validateProperty(childProperty, conditionalUsedPropertyNames, component);
            });
        });
    }
}
