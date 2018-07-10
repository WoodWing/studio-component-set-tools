/**
 * Validates:
 * - Whether icons have the correct format
 */

import * as path from 'path';
import { Validator } from './validator';
import { ComponentsDefinition } from '../models';
import { GetFileContentType } from '..';
var PNG = require('pngjs').PNG;

export class IconsValidator implements Validator {

    private supportedFormats = ['.svg', '.png'];

    constructor(
        private definition: ComponentsDefinition,
        private getFileContent: GetFileContentType,
    ) {
    }

    validate(
        errorReporter: (errorMessage: string) => void,
    ): boolean {
        let valid = true;

        Object.values(this.definition.components).forEach(async (component) => {
            const ext = path.extname(component.icon).toLowerCase();
            if (this.supportedFormats.indexOf(ext) === -1) {
                errorReporter(`Icons are only supported in SVG or transparent PNG format`);
                valid = false;
            } else if (ext === '.png') {
                let data = this.getFileContent(path.normalize(component.icon));
                let png = PNG.sync.read(data);

                if (png.alpha === false) {
                    valid = false;
                    errorReporter(`PNG icons are only supported when they are transparent`);
                }
            }
        });

        return valid;
    }
}
