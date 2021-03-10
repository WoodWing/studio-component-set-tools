/**
 * Validates:
 * - Whether icons have the correct format
 */

import * as path from 'path';
import { Validator } from './validator';
import { ComponentSet, GetFileContentType } from '../models';

import * as pngjs from 'pngjs';
const PNG = pngjs.PNG;

export class IconsValidator extends Validator {
    private supportedFormats = ['.svg', '.png'];

    constructor(
        error: (errorMessage: string) => false,
        definition: ComponentSet,
        protected getFileContent: GetFileContentType,
    ) {
        super(error, definition);
    }

    async validate(): Promise<void> {
        for (const component of Object.values(this.componentSet.components)) {
            const ext = path.extname(component.icon).toLowerCase();
            if (this.supportedFormats.indexOf(ext) === -1) {
                this.error(`Icons are only supported in SVG or transparent PNG format`);
            } else if (ext === '.png') {
                const data = await this.getFileContent(path.normalize(component.icon));
                const png = PNG.sync.read(data as Buffer);

                if (png.alpha === false) {
                    this.error(`PNG icons are only supported when they are transparent`);
                }
            }
        }
    }
}
