/**
 * Getting file options type
 */
export type GetFileContentOptionsType = { encoding: string | null } | null;

/**
 * Return string if encoding is string and Buffer otherwise.
 */
export type GetFileContentType = (
    normalizedRelativeFilePath: string,
    options?: GetFileContentOptionsType,
) => Promise<string | Buffer>;

/**
 * Return file size in bytes.
 */
export type GetFileSize = (normalizedRelativeFilePath: string) => Promise<number>;
