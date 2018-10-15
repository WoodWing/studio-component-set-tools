/**
 * Validates usage of doc-media directive
 *
 * Rules:
 *  - A component is not allowed to have more than one doc-media directive.
 *  - A component with 1 doc-media directives -can- have a property control type "media-properties"
 *  - A component property with a "media-properties" control type MUST be applied to a "media" directive
 *  - A component without a doc-media directive can't have any "media-properties" control types
 */

import { Validator } from './validator';
import { DirectiveType, ParsedComponent } from '../models';

export class DocMediaValidator extends Validator {
    private countMediaDirectives(parsedComponent: ParsedComponent) : number {
        return Object.values(parsedComponent.directives)
            .filter((directive) => (directive.type === DirectiveType.media))
            .length;
    }

    validate(): void {
        Object.values(this.definition.components).forEach((parsedComponent: ParsedComponent) => {

            let numMediaDirectives = this.countMediaDirectives(parsedComponent);
            if (numMediaDirectives > 1) {
                this.error(`A component can have only one "doc-media" directive in the HTML definition`);
            } else {
                let mediaProperties = Object.values(parsedComponent.properties).filter((property) => property.control.type === 'media-properties');
                // Check whether the component has a media-properties control type
                if (numMediaDirectives < 1 && mediaProperties.length > 0) {
                    this.error(`Only components with a doc-media directive can have a "media-properties" control type`);
                }
                if (numMediaDirectives === 1) {
                    // Check whether the media-properties control type property is applied to the doc-media directive.
                    Object.values(mediaProperties).forEach((mediaProperty) => {
                        if (mediaProperty.directiveKey) {
                            const directive = parsedComponent.directives[mediaProperty.directiveKey];
                            if (!directive || directive.type !== DirectiveType.media) {
                                this.error(`Control type "media-properties" is only applicable to "doc-media" directives`);
                            }
                        } else {
                            this.error(`The directive key is required for properties of type "media-properties"`);
                        }
                    });
                }
            }
        });
    }
}