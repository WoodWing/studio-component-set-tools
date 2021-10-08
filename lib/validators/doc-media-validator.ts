/**
 * Validates usage of doc-media directive
 *
 * Rules:
 *  - A component is not allowed to have more than one doc-media directive.
 *  - A component with 1 doc-media directives -must- have a property control type "media-properties"
 *  - A component property with a "media-properties" control type MUST be applied to a "media" directive
 *  - A component without a doc-media directive can't have any "media-properties" control types
 */

import { Validator } from './validator';
import { ComponentProperty, DirectiveType, Component } from '../models';

export class DocMediaValidator extends Validator {
    async validate(): Promise<void> {
        Object.values(this.componentSet.components).forEach((c: Component) => this.validateComponent(c));
    }

    private validateComponent(component: Component) {
        const numMediaDirectives = this.countMediaDirectives(component);
        if (numMediaDirectives === 0) {
            this.validateComponentWithoutMediaDirective(component);
            return;
        }

        if (numMediaDirectives > 1) {
            this.error(`Component "${component.name}" can only have one "doc-media" directive in the HTML definition`);
            return;
        }

        this.validateComponentWithMediaDirective(component);
    }

    private validateComponentWithoutMediaDirective(component: Component) {
        if (this.countMediaPropertiesProperties(component) > 0) {
            this.error(
                `Component "${component.name}" has a "media-properties" control type, but only components with a "doc-media" directive can have a property with this control type`,
            );
        }
    }

    private validateComponentWithMediaDirective(component: Component) {
        if (this.countMediaPropertiesProperties(component) !== 1) {
            this.error(
                `Component "${
                    component.name
                }" with "doc-media" directive must have exactly one "media-properties" property (found ${this.countMediaPropertiesProperties(
                    component,
                )})`,
            );
            return;
        }

        // Check whether the media-properties control type property is applied to the doc-media directive.
        for (const mediaProperty of Object.values(this.mediaPropertiesProperties(component))) {
            this.validateMediaProperty(component, mediaProperty);
        }
    }

    private validateMediaProperty(component: Component, mediaProperty: ComponentProperty) {
        if (!mediaProperty.directiveKey) {
            this.error(
                `Component "${component.name}" must configure "directiveKey" for the property with control type "media-properties"`,
            );
            return;
        }

        const directive = component.directives[mediaProperty.directiveKey];
        if (!directive || directive.type !== DirectiveType.media) {
            this.error(
                `Component "${component.name}" has a control type "media-properties" applied to the wrong directive, which can only be used with "doc-media" directives`,
            );
        }
    }

    private countMediaDirectives(component: Component): number {
        return Object.values(component.directives).filter((directive) => directive.type === DirectiveType.media).length;
    }

    /** Count number of "media-properties" properties */
    private countMediaPropertiesProperties(component: Component): number {
        return this.mediaPropertiesProperties(component).length;
    }

    /** Get "media-properties" properties definitions (collection of nested properties behaving as a single property) */
    private mediaPropertiesProperties(component: Component) {
        return Object.values(component.properties).filter((property) => property.control.type === 'media-properties');
    }
}
