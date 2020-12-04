/**
 * Getting file options type
 */
export type GetFileContentOptionsType = { encoding: string | null } | null;

/**
 * return string if encoding is string and Buffer otherwise
 */
export type GetFileContentType = (filePath: string, options?: GetFileContentOptionsType) => Promise<any>;
