/**
 * Validates if conversion rules reference to existing components and directives
 */

import { Validator } from './validator';
import { DirectiveType } from '../models';

export class ConversionRulesValidator extends Validator {
    async validate(): Promise<void> {
        for (const srcComponentName of Object.keys(this.componentSet.conversionRules)) {
            if (!(srcComponentName in this.componentSet.components)) {
                this.error(`Conversion rule references to non existing component "${srcComponentName}"`);
                continue; // stop checking
            }
            for (const dstComponentName of Object.keys(this.componentSet.conversionRules[srcComponentName])) {
                if (!(dstComponentName in this.componentSet.components)) {
                    this.error(`Conversion rule references to non existing component "${dstComponentName}"`);
                    continue; // stop checking
                }
                const rule = this.componentSet.conversionRules[srcComponentName][dstComponentName];

                if (rule === 'auto') {
                    // nothing to check
                    continue; // stop checking
                }
                if (rule.type === 'simple') {
                    for (const dstDirectiveKey of Object.keys(rule.map)) {
                        if (!(dstDirectiveKey in this.componentSet.components[dstComponentName].directives)) {
                            this.error(`Conversion rule references to non existing directive "${dstDirectiveKey}"`);
                        }
                        const srcDirectiveKey = rule.map[dstDirectiveKey];
                        if (!(srcDirectiveKey in this.componentSet.components[srcComponentName].directives)) {
                            this.error(`Conversion rule references to non existing directive "${srcDirectiveKey}"`);
                        }
                    }
                    continue; // stop checking
                }
                if (rule.type === 'from-container') {
                    const srcDirectiveKey = rule.container;
                    if (!(srcDirectiveKey in this.componentSet.components[srcComponentName].directives)) {
                        this.error(`Conversion rule references to non existing directive "${srcDirectiveKey}"`);
                        continue; // stop checking
                    }
                    const srcDirectiveType =
                        this.componentSet.components[srcComponentName].directives[srcDirectiveKey].type;
                    if (![DirectiveType.container, DirectiveType.slideshow].some((type) => type === srcDirectiveType)) {
                        this.error(
                            `Conversion rule references to a directive "${srcDirectiveKey}" which must be "slideshow" or "container"`,
                        );
                    }
                    continue; // stop checking
                }
                if (rule.type === 'to-container') {
                    const dstDirectiveKey = rule.container;
                    if (!(dstDirectiveKey in this.componentSet.components[dstComponentName].directives)) {
                        this.error(`Conversion rule references to non existing directive "${dstDirectiveKey}"`);
                        continue; // stop checking
                    }
                    const dstDirectiveType =
                        this.componentSet.components[dstComponentName].directives[dstDirectiveKey].type;
                    if (![DirectiveType.container, DirectiveType.slideshow].some((type) => type === dstDirectiveType)) {
                        this.error(
                            `Conversion rule references to a directive "${dstDirectiveKey}" which must be "slideshow" or "container"`,
                        );
                    }
                    continue; // stop checking
                }
            }
        }
    }
}
