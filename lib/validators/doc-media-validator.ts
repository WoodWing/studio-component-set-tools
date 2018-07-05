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
import { DirectiveType, ParsedComponentsDefinition, ParsedComponentsDefinitionComponent, ComponentsDefinition } from '../models';

export class DocMediaValidator implements Validator {

    constructor(
        private definition: ParsedComponentsDefinition,
    ) {
    }

    private countMediaDirectives(parsedComponent: ParsedComponentsDefinitionComponent) : number {
        return Object.values(parsedComponent.directives)
            .filter((directive) => (directive.type === DirectiveType.media))
            .length;
    }

    validate(
        errorReporter: (errorMessage: string) => void,
    ): boolean {
        let valid = true;
        Object.values(this.definition.components).forEach((parsedComponent: ParsedComponentsDefinitionComponent) => {

            let numMediaDirectives = this.countMediaDirectives(parsedComponent);
            if (numMediaDirectives > 1) {
                errorReporter(`A component can have only one "doc-media" directive in the HTML definition`);
                valid = false;
            } else {
                let mediaProperties = Object.values(parsedComponent.properties).filter((property) => property.control.type === 'media-properties');
                // Check whether the component has a media-properties control type
                if (numMediaDirectives < 1 && mediaProperties.length > 0) {
                    errorReporter(`Only components with a doc-media directive can have a "media-properties" control type`);
                    valid = false;
                }
                if (numMediaDirectives === 1) {
                    // Check whether the media-properties control type property is applied to the doc-media directive.
                    Object.values(mediaProperties).forEach((mediaProperty) => {
                        if (mediaProperty.directiveKey !== 'media') {
                            errorReporter(`Control type "media-properties" is only applicable to "doc-media" directives`);
                            valid = false;
                        }
                    });
                }
            }
        });
        return valid;
    }
}