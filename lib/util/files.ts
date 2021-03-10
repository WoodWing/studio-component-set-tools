import * as path from 'path';
import * as fs from 'fs';

export async function listFilesRelativeToFolder(folderPath: string): Promise<Set<string>> {
    folderPath = path.normalize(folderPath);

    // List files, make relative to input folder and normalize.
    return new Set(
        (await listFilesRecursively(folderPath)).map((p) =>
            path.normalize(p).replace(new RegExp(`^${folderPath.replace(/\\/g, '\\\\')}(/|\\\\)?`), ''),
        ),
    );
}

async function listFilesRecursively(folderPath: string): Promise<string[]> {
    const fileList: string[] = [];
    const files = await fs.promises.readdir(folderPath);
    for (const file of files) {
        const folder = path.join(folderPath, file);
        if ((await fs.promises.stat(folder)).isDirectory()) {
            fileList.push(...(await listFilesRecursively(folder)));
        } else {
            fileList.push(folder);
        }
    }
    return fileList;
}
