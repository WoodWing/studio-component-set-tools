/**
 * Validates:
 * - Whether icons have the correct format
 */

import * as path from 'path';
import { Validator } from './validator';
import { Component, ComponentSet, GetFileContentType } from '../models';

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
        for (const comp of Object.values(this.componentSet.components)) {
            const ext = path.extname(comp.icon).toLowerCase();
            if (this.supportedFormats.indexOf(ext) === -1) {
                this.error(`Icons are only supported in SVG or transparent PNG format`);
            } else if (ext === '.png') {
                await this.validatePngIcon(comp.name, comp.icon);
            }
        }
    }

    private async validatePngIcon(name: Component['name'], icon: Component['icon']) {
        try {
            const data = await this.getFileContent(path.normalize(icon));
            const png = PNG.sync.read(data as Buffer);

            if (png.alpha === false) {
                this.error(`PNG icons are only supported when they are transparent`);
            }
        } catch (e) {
            if (e.message === 'Invalid file signature') {
                this.error(`Component "${name}" icon "${icon}" is not a valid PNG file`);
            } else {
                this.error(
                    `Cannot validate component "${name}" icon "${icon}" due to an unexpected error: ${e.message}`,
                );
            }
        }
    }
}
