/**
 * Validates if the component set package size
 */

import { ComponentSet, GetFileContentType } from '../models';
import { Validator } from './validator';

const MAX_COMPONENT_SET_FILE_COUNT = 2000;
const MAX_COMPONENT_SET_SIZE_MB = 200;
const MAX_CUSTOM_DATA_FILE_COUNT = 1000;
const MAX_CUSTOM_DATA_SIZE_MB = 20;
const MB_IN_BYTES = 1 * 1000 * 1000;

interface FileInfo {
    path: string;
    size: number;
}

export class PackageValidator extends Validator {
    constructor(
        error: (errorMessage: string) => false,
        definition: ComponentSet,
        private filePaths: Set<string>,
        private getFileContent: GetFileContentType,
    ) {
        super(error, definition);
    }

    async validate(): Promise<void> {
        const files: FileInfo[] = [];
        for (let filePath of Array.from(this.filePaths)) {
            const file = (await this.getFileContent(filePath)) as Buffer | string;
            files.push({
                path: filePath,
                size: file.length,
            });
        }
        this.validateComponentSetFileCount(files);
        this.validateComponentSetSize(files);
        this.validateCustomData(files);
    }

    validateComponentSetFileCount(files: FileInfo[]): void {
        if (files.length > MAX_COMPONENT_SET_FILE_COUNT) {
            this.error(
                `At ${files.length} files, the component set exceeds the total maximum amount of ${MAX_COMPONENT_SET_FILE_COUNT} files.`,
            );
        }
    }

    validateComponentSetSize(files: FileInfo[]): void {
        const folderSize = this.calculateFolderSize(files);
        if (folderSize > MAX_COMPONENT_SET_SIZE_MB) {
            this.error(
                `At ${folderSize}MB, the component set exceeds the total maximum size of ${MAX_COMPONENT_SET_SIZE_MB}MB.`,
            );
        }
    }

    validateCustomData(files: FileInfo[]): void {
        const customDataFiles = files.filter((file) => file.path.startsWith('custom/'));
        this.validateCustomDataFileCount(customDataFiles);
        this.validateCustomDataSize(customDataFiles);
    }

    validateCustomDataFileCount(files: FileInfo[]): void {
        if (files.length > MAX_CUSTOM_DATA_FILE_COUNT) {
            this.error(
                `At ${files.length} files, the 'custom' folder exceeds the maximum amount of ${MAX_CUSTOM_DATA_FILE_COUNT} files.`,
            );
        }
    }

    validateCustomDataSize(files: FileInfo[]): void {
        const folderSize = this.calculateFolderSize(files);
        if (folderSize > MAX_CUSTOM_DATA_SIZE_MB) {
            this.error(
                `At ${folderSize}MB, the 'custom' folder exceeds the maximum size of ${MAX_CUSTOM_DATA_SIZE_MB}MB.`,
            );
        }
    }

    calculateFolderSize(files: FileInfo[]): number {
        const totalSize = files.reduce((acc, file) => {
            return acc + file.size;
        }, 0);
        return Math.round(totalSize / MB_IN_BYTES);
    }
}
