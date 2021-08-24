import { ComponentSet, CustomStyle } from '../models';
import { Validator } from './validator';
import * as path from 'path';

export class CustomStylesValidator extends Validator {
    constructor(error: (errorMessage: string) => false, definition: ComponentSet, private filePaths: Set<string>) {
        super(error, definition);
    }

    async validate(): Promise<void> {
        this.checkCustomStylesFolder();

        if (!this.componentSet.customStyles) {
            return;
        }

        this.componentSet.customStyles.forEach((customStyle) => this.validateDefaultCustomStyleExists(customStyle));
    }

    private checkCustomStylesFolder() {
        if (
            Array.from(this.filePaths).some((file) =>
                file.toLowerCase().startsWith(path.normalize('styles/customstyles/')),
            )
        ) {
            this.error(`The "styles" directory can't contain a directory called "customStyles".`);
        }
    }

    private validateDefaultCustomStyleExists(customStyle: CustomStyle) {
        if (!customStyle.default) {
            return;
        }

        if (!this.filePaths.has(path.normalize(customStyle.default))) {
            this.error(`The default file for custom style "${customStyle.label}" does not exist`);
        }
    }
}
