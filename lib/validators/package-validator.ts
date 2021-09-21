/**
 * Validates component package size:
 * - Maximum number of files in the component set.
 * - Maximum total file size of the component set.
 * - Maximum number of files in the custom data folder.
 * - Maximum total file size of the custom data folder.
 */

import { ComponentSet, GetFileSize } from '../models';
import { Validator } from './validator';

const MAX_COMPONENT_SET_FILE_COUNT = 5000;
const MAX_COMPONENT_SET_SIZE_MB = 100;
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
        private getFileSize: GetFileSize,
    ) {
        super(error, definition);
    }

    async validate(): Promise<void> {
        const files: FileInfo[] = [];
        for (const filePath of Array.from(this.filePaths)) {
            const fileSize = await this.getFileSize(filePath);
            files.push({
                path: filePath,
                size: fileSize,
            });
        }
        this.validateComponentSetFileCount(files);
        this.validateComponentSetSize(files);
        this.validateCustomData(files);
    }

    private validateComponentSetSize(files: FileInfo[]): void {
        const folderSize = this.calculateFolderSize(files);
        const error = validateTotalSize(folderSize);
        if (error) {
            this.error(error);
        }
    }

    private validateComponentSetFileCount(files: FileInfo[]): void {
        if (files.length > MAX_COMPONENT_SET_FILE_COUNT) {
            this.error(
                `At ${files.length} files, the component set exceeds the total maximum amount of ${MAX_COMPONENT_SET_FILE_COUNT} files.`,
            );
        }
    }

    private validateCustomData(files: FileInfo[]): void {
        const customDataFiles = files.filter((file) => file.path.toLowerCase().startsWith('custom/'));
        this.validateCustomDataFileCount(customDataFiles);
        this.validateCustomDataSize(customDataFiles);
    }

    private validateCustomDataFileCount(files: FileInfo[]): void {
        if (files.length > MAX_CUSTOM_DATA_FILE_COUNT) {
            this.error(
                `At ${files.length} files, the 'custom' folder exceeds the maximum amount of ${MAX_CUSTOM_DATA_FILE_COUNT} files.`,
            );
        }
    }

    private validateCustomDataSize(files: FileInfo[]): void {
        const folderSize = Math.round(this.calculateFolderSize(files) / MB_IN_BYTES);
        if (folderSize > MAX_CUSTOM_DATA_SIZE_MB) {
            this.error(
                `At ${folderSize}MB, the 'custom' folder exceeds the maximum size of ${MAX_CUSTOM_DATA_SIZE_MB}MB.`,
            );
        }
    }

    private calculateFolderSize(files: FileInfo[]): number {
        return files.reduce((acc, file) => {
            return acc + file.size;
        }, 0);
    }
}

export function validateTotalSize(size: number): string | void {
    const sizeMB = Math.round(size / MB_IN_BYTES);
    if (sizeMB > MAX_COMPONENT_SET_SIZE_MB) {
        return `At ${sizeMB}MB, the component set exceeds the total maximum size of ${MAX_COMPONENT_SET_SIZE_MB}MB.`;
    }
}
