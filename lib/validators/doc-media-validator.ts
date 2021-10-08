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

    private validateComponent(parsedComponent: Component) {
        const numMediaDirectives = this.countMediaDirectives(parsedComponent);
        if (numMediaDirectives === 0) {
            this.validateComponentWithoutMediaDirective(parsedComponent);
            return;
        }

        if (numMediaDirectives > 1) {
            this.error(
                `Component "${parsedComponent.name}" can only have one "doc-media" directive in the HTML definition`,
            );
            return;
        }

        this.validateComponentWithMediaDirective(parsedComponent);
    }

    private validateComponentWithoutMediaDirective(parsedComponent: Component) {
        if (this.countMediaPropertiesProperties(parsedComponent) > 0) {
            this.error(
                `Component "${parsedComponent.name}" has a "media-properties" control type, but only components with a "doc-media" directive can have a property with this control type`,
            );
        }
    }

    private validateComponentWithMediaDirective(parsedComponent: Component) {
        if (this.countMediaPropertiesProperties(parsedComponent) !== 1) {
            this.error(
                `Component "${
                    parsedComponent.name
                }" with "doc-media" directive must have exactly one "media-properties" property (found ${this.countMediaPropertiesProperties(
                    parsedComponent,
                )})`,
            );
            return;
        }

        // Check whether the media-properties control type property is applied to the doc-media directive.
        for (const mediaProperty of Object.values(this.mediaPropertiesProperties(parsedComponent))) {
            this.validateMediaProperty(parsedComponent, mediaProperty);
        }
    }

    private validateMediaProperty(parsedComponent: Component, mediaProperty: ComponentProperty) {
        if (!mediaProperty.directiveKey) {
            this.error(
                `Component "${parsedComponent.name}" must configure "directiveKey" for the property with control type "media-properties"`,
            );
            return;
        }

        const directive = parsedComponent.directives[mediaProperty.directiveKey];
        if (!directive || directive.type !== DirectiveType.media) {
            this.error(
                `Component "${parsedComponent.name}" has a control type "media-properties" applied to the wrong directive, which can only be used with "doc-media" directives`,
            );
        }
    }

    private countMediaDirectives(parsedComponent: Component): number {
        return Object.values(parsedComponent.directives).filter((directive) => directive.type === DirectiveType.media)
            .length;
    }

    /** Count number of "media-properties" properties */
    private countMediaPropertiesProperties(parsedComponent: Component): number {
        return this.mediaPropertiesProperties(parsedComponent).length;
    }

    /** Get "media-properties" properties definitions (collection of nested properties behaving as a single property) */
    private mediaPropertiesProperties(parsedComponent: Component) {
        return Object.values(parsedComponent.properties).filter(
            (property) => property.control.type === 'media-properties',
        );
    }
}
