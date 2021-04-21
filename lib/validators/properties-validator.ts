/**
 * Validates properties
 * - if names are unique
 * - if icons are present
 * - if reserved words are not used as names
 * - if doc-media properties have a media-properties control type
 */

import * as path from 'path';
import { Validator } from './validator';
import { ComponentSet, ParsedComponent, ComponentProperty } from '../models';
import * as semver from 'semver';

const RESERVED = [/^parallax$/];

export class PropertiesValidator extends Validator {
    constructor(error: (errorMessage: string) => false, definition: ComponentSet, protected filePaths: Set<string>) {
        super(error, definition);
    }

    async validate(): Promise<void> {
        Object.values(this.componentSet.components).forEach((component) => this.validateComponent(component));
    }

    private validateComponent(component: ParsedComponent): void {
        const componentPropertyNames = new Set<string>();

        component.properties.forEach((property) => this.validateProperty(property, componentPropertyNames, component));
    }

    private validateProperty(
        property: ComponentProperty,
        componentPropertyNames: Set<string>,
        component: ParsedComponent,
    ) {
        this.validateReservedPropertyName(property);
        this.validatePropertyName(property, componentPropertyNames, component);
        this.validateRadioPropertyIcons(property);
    }

    private validatePropertyName(
        property: ComponentProperty,
        componentPropertyNames: Set<string>,
        component: ParsedComponent,
    ) {
        if (!property.name) {
            this.validateNamelessProperty(property, component);
            return;
        }

        if (componentPropertyNames.has(property.name)) {
            this.error(`Component property "${property.name}" is not unique`);
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

    private validateNamelessProperty(property: ComponentProperty, component: ParsedComponent) {
        if (property.control.type !== 'header') {
            this.error(
                `Property in component "${component.name}" must have a name when using control type "${property.control.type}"`,
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
}
