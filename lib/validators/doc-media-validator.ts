/**
 * Validates usage of doc-media directive
 */

import { Validator } from './validator';
import { DirectiveType, ParsedComponentsDefinition, ParsedComponentsDefinitionComponent } from '../models';

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

            if (this.countMediaDirectives(parsedComponent) > 1) {
                errorReporter(`A component can have only one "doc-media" directive in the HTML definition`);
                valid = false;
            }
        });
        return valid;
    }
}