/**
 * Validates:
 * - Localization files being present and valid json
 */

import * as path from 'path';
import { Validator } from './validator';
import { ComponentSet, GetFileContentType } from '../models';

// Languages supported by Enterprise Server
const supportedLanguages = [
    'csCZ',
    'deDE',
    'enUS',
    'esES',
    'frFR',
    'itIT',
    'jaJP',
    'koKR',
    'nlNL',
    'plPL',
    'ptBR',
    'ruRU',
    'zhCN',
    'zhTW',
    'fiFI',
];

export class LocalizationValidator extends Validator {
    constructor(
        error: (errorMessage: string) => false,
        definition: ComponentSet,
        private filePaths: Set<string>,
        protected getFileContent: GetFileContentType,
    ) {
        super(error, definition);
    }

    async validate(): Promise<void> {
        for (const localizationFile of this.getLocalizationFiles()) {
            await this.validateLocalizationFile(localizationFile);
        }
    }

    async validateLocalizationFile(localizationFile: string): Promise<void> {
        const localizationFileParsed = path.parse(localizationFile);

        // Ignore non json files
        if (localizationFileParsed.ext !== '.json') {
            return;
        }

        if (!supportedLanguages.includes(localizationFileParsed.name)) {
            this.error(
                `Localization file "${localizationFile}" is not a supported language. Supported languages: \n${supportedLanguages}`,
            );
            return;
        }

        try {
            JSON.parse((await this.getFileContent(localizationFile)) as string);
        } catch (e) {
            this.error(`Localization file "${localizationFile}" is not valid json: \n${e}`);
            return;
        }
    }

    getLocalizationFiles(): string[] {
        return [...this.filePaths].filter((filePath) => filePath.startsWith('localization'));
    }
}
