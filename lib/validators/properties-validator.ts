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

    /**
     * Iterate through all properties of given component.
     *
     * @param component
     */
    private validateComponent(component: ParsedComponent): void {
        const componentPropertyNames = new Set<string>();

        component.properties.forEach((property) => this.validateProperty(property, componentPropertyNames));
    }

    /**
     * Validate property with control type interactive uses the correct dataType.
     *
     * @param property
     */
    private validateProperty(property: ComponentProperty, componentPropertyNames: Set<string>) {
        this.validateReservedPropertyName(property);

        // Validate we have not seen the name yet
        if (componentPropertyNames.has(property.name)) {
            this.error(`Component property "${property.name}" is not unique`);
        }
        componentPropertyNames.add(property.name);

        // Validate the property has icons (for radio control type)
        if (property.control.type === 'radio') {
            for (const controlOption of property.control.options) {
                if (!this.filePaths.has(path.normalize(controlOption.icon))) {
                    this.error(`Component properties "${property.name}" icon missing "${controlOption.icon}"`);
                }
            }
        }
    }

    private validateReservedPropertyName(property: ComponentProperty) {
        if (semver.satisfies(this.componentSet.version, '>=1.4.x')) {
            return;
        }

        if (RESERVED.some((regexp) => regexp.test(property.name))) {
            this.error(`Component property name "${property.name}" is a reserved word`);
        }
    }
}
