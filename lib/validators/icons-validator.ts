/**
 * Validates:
 * - Whether icons have the correct format
 */

import * as path from 'path';
import { Validator } from './validator';
import { ParsedComponentsDefinitionV10X } from '../models';
import { GetFileContentType } from '..';

var PNG = require('pngjs').PNG;

export class IconsValidator extends Validator {
    private supportedFormats = ['.svg', '.png'];

    constructor(
        error: (errorMessage: string) => false,
        definition: ParsedComponentsDefinitionV10X,
        protected getFileContent: GetFileContentType,
    ) {
        super(error, definition);
    }

    async validate(): Promise<void> {
        for (const compInfo of Object.values(this.definition.components)) {
            const component = compInfo.component;

            const ext = path.extname(component.icon).toLowerCase();
            if (this.supportedFormats.indexOf(ext) === -1) {
                this.error(`Icons are only supported in SVG or transparent PNG format`);
            } else if (ext === '.png') {
                let data = await this.getFileContent(path.normalize(component.icon));
                let png = PNG.sync.read(data);

                if (png.alpha === false) {
                    this.error(`PNG icons are only supported when they are transparent`);
                }
            }
        }
    }
}
