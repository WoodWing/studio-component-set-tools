import { ComponentSet } from '../models';
import { Validator } from './validator';

export class CustomStylesValidator extends Validator {
    constructor(error: (errorMessage: string) => false, definition: ComponentSet, private filePaths: Set<string>) {
        super(error, definition);
    }

    async validate(): Promise<void> {
        this.checkCustomStylesFolder();

        if (!this.componentSet.customStyles) {
            return;
        }
    }

    private checkCustomStylesFolder() {
        if (!Array.from(this.filePaths).every((file) => !file.toLowerCase().startsWith('styles/customstyles/'))) {
            this.error(`The "styles" directory can't contain a directory called "customStyles".`);
        }
    }
}
