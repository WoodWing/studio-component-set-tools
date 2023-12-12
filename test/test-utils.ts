import * as path from 'path';
import { validate, readFile, getSize } from '../lib/validate';
import { listFilesRelativeToFolder } from '../lib/util/files';
import { GetFileContentOptionsType } from '../lib/models';

export function createValidator(
    fileCustomiser: (filePath: string, content: string) => string,
    extraFiles: string[] = [],
): {
    validateFolderWithCustomiser: (folderPath: string) => Promise<boolean>;
    errorSpy: jest.SpyInstance;
} {
    const errorSpy = jest.fn();

    async function validateFolderWithCustomiser(folderPath: string): Promise<boolean> {
        const files = new Set([...(await listFilesRelativeToFolder(folderPath)), ...(extraFiles ?? [])]);
        const getFileContent = async (filePath: string, options?: GetFileContentOptionsType) => {
            if (extraFiles.includes(filePath)) return fileCustomiser(filePath, '');
            const content = await readFile(path.resolve(folderPath, filePath), options);
            return fileCustomiser(filePath, Buffer.isBuffer(content) ? content.toString('utf-8') : content);
        };
        const getFileSize = async (filePath: string) =>
            extraFiles.includes(filePath) ? 0 : getSize(path.resolve(folderPath, filePath));
        return validate(files, getFileContent, getFileSize, (errorMessage) => {
            errorSpy(errorMessage);
        });
    }

    return { validateFolderWithCustomiser: validateFolderWithCustomiser, errorSpy: errorSpy };
}
