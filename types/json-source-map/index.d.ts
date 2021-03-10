declare module 'json-source-map' {
    export interface ParsedJsonSourceMap<T> {
        data: T | null;
        pointers: { [key: string]: { [key: string]: { line: number; column: number; pos: number } } } | null;
    }

    export function parse<T>(json: string): ParsedJsonSourceMap<T>;
}
