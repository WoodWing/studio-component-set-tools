/**
 * Validates if conversion rules reference to existing components and directives
 */

import { Validator } from './validator';
import { ParsedComponentsDefinitionV10X, DirectiveType } from '../models';

export class ConversionRulesValidator implements Validator {

    constructor(
        private definition: ParsedComponentsDefinitionV10X,
    ) {
    }

    validate(
        errorReporter: (errorMessage: string) => void,
    ): boolean {
        let valid = true;

        for (const srcComponentName of Object.keys(this.definition.conversionRules)) {
            if (!(srcComponentName in this.definition.components)) {
                errorReporter(`Conversion rule references to non existing component "${srcComponentName}"`);
                valid = false;
                continue;   // stop checking
            }
            for (const dstComponentName of Object.keys(this.definition.conversionRules[srcComponentName])) {
                if (!(dstComponentName in this.definition.components)) {
                    errorReporter(`Conversion rule references to non existing component "${dstComponentName}"`);
                    valid = false;
                    continue;   // stop checking
                }
                const rule = this.definition.conversionRules[srcComponentName][dstComponentName];

                if (rule === 'auto') {
                    // nothing to check
                    continue;   // stop checking
                }
                if (rule.type === 'simple') {
                    for (const dstDirectiveKey of Object.keys(rule.map)) {
                        if (!(dstDirectiveKey in this.definition.components[dstComponentName].directives)) {
                            errorReporter(`Conversion rule references to non existing directive "${dstDirectiveKey}"`);
                            valid = false;
                        }
                        const srcDirectiveKey = rule.map[dstDirectiveKey];
                        if (!(srcDirectiveKey in this.definition.components[srcComponentName].directives)) {
                            errorReporter(`Conversion rule references to non existing directive "${srcDirectiveKey}"`);
                            valid = false;
                        }
                    }
                    continue;   // stop checking
                }
                if (rule.type === 'from-container') {
                    const srcDirectiveKey = rule.container;
                    if (!(srcDirectiveKey in this.definition.components[srcComponentName].directives)) {
                        errorReporter(`Conversion rule references to non existing directive "${srcDirectiveKey}"`);
                        valid = false;
                        continue;   // stop checking
                    }
                    const srcDirectiveType = this.definition.components[srcComponentName].directives[srcDirectiveKey].type;
                    if (![DirectiveType.container, DirectiveType.slideshow].some(type => type === srcDirectiveType)) {
                        errorReporter(`Conversion rule references to a directive "${srcDirectiveKey}" which must be "slideshow" or "container"`);
                        valid = false;
                    }
                    continue;   // stop checking
                }
                if (rule.type === 'to-container') {
                    const dstDirectiveKey = rule.container;
                    if (!(dstDirectiveKey in this.definition.components[dstComponentName].directives)) {
                        errorReporter(`Conversion rule references to non existing directive "${dstDirectiveKey}"`);
                        valid = false;
                        continue;   // stop checking
                    }
                    const dstDirectiveType = this.definition.components[dstComponentName].directives[dstDirectiveKey].type;
                    if (![DirectiveType.container, DirectiveType.slideshow].some(type => type === dstDirectiveType)) {
                        errorReporter(`Conversion rule references to a directive "${dstDirectiveKey}" which must be "slideshow" or "container"`);
                        valid = false;
                    }
                    continue;   // stop checking
                }
            }
        }
        
        return valid;
    }
}
