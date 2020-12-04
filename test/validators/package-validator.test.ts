import { GetFileContentType } from '../../lib/models';
import { PackageValidator } from '../../lib/validators/package-validator';

const MB = 1 * 1000 * 1000;

describe('PackageValidator', () => {
    let definition: any;
    let error: jasmine.Spy;
    let validator: PackageValidator;

    function createFakeFiles(
        amount: number,
        size: number,
        basePath = '',
    ): { filePaths: Set<string>; getFileContent: GetFileContentType } {
        const filePaths: Set<string> = new Set();
        const fileContent: { [path: string]: Buffer | string } = {};
        for (let i = 0; i < amount; i++) {
            const fakeFile = `${basePath}fake-file-${i}.text`;
            filePaths.add(fakeFile);
            fileContent[fakeFile] = Buffer.alloc(size);
        }
        return {
            filePaths: filePaths,
            getFileContent: jasmine.createSpy('getFileContent').and.callFake(async (path) => {
                return fileContent[path];
            }),
        };
    }

    beforeEach(() => {
        // valid definition
        definition = {
            components: {},
        };
        error = jasmine.createSpy('error');
    });

    describe('validate', () => {
        it('should pass when the amount of files is under the configured maximum', async () => {
            const files = createFakeFiles(2000, 1);
            validator = new PackageValidator(error, definition, files.filePaths, files.getFileContent);
            await validator.validate();
            expect(error).not.toHaveBeenCalled();
        });
        it('should pass when the total size is under the configured maximum', async () => {
            const files = createFakeFiles(200, 1 * MB);
            validator = new PackageValidator(error, definition, files.filePaths, files.getFileContent);
            await validator.validate();
            expect(error).not.toHaveBeenCalled();
        });
        it('should fail when the amount of files exceeds the configured maximum', async () => {
            const files = createFakeFiles(2001, 1);
            validator = new PackageValidator(error, definition, files.filePaths, files.getFileContent);
            await validator.validate();
            expect(error).toHaveBeenCalledWith(
                `At 2001 files, the component set exceeds the total maximum amount of 2000 files.`,
            );
        });
        it('should fail when the total size exceeds the configured maximum', async () => {
            const files = createFakeFiles(201, 1 * MB);
            validator = new PackageValidator(error, definition, files.filePaths, files.getFileContent);
            await validator.validate();
            expect(error).toHaveBeenCalledWith(`At 201MB, the component set exceeds the total maximum size of 200MB.`);
        });

        it('should pass when the amount of files in the custom data folder is under the configured maximum', async () => {
            const files = createFakeFiles(1000, 1, 'custom/');
            validator = new PackageValidator(error, definition, files.filePaths, files.getFileContent);
            await validator.validate();
            expect(error).not.toHaveBeenCalled();
        });
        it('should pass when the size of the custom data folder is under the configured maximum', async () => {
            const files = createFakeFiles(20, 1 * MB, 'custom/');
            validator = new PackageValidator(error, definition, files.filePaths, files.getFileContent);
            await validator.validate();
            expect(error).not.toHaveBeenCalled();
        });
        it('should fail when the amount of files in the custom data folder exceeds the configured maximum', async () => {
            const files = createFakeFiles(1001, 1, 'custom/');
            validator = new PackageValidator(error, definition, files.filePaths, files.getFileContent);
            await validator.validate();
            expect(error).toHaveBeenCalledWith(
                `At 1001 files, the 'custom' folder exceeds the maximum amount of 1000 files.`,
            );
        });
        it('should fail when the size of the custom data folder exceeds the configured maximum', async () => {
            const files = createFakeFiles(21, 1 * MB, 'custom/');
            validator = new PackageValidator(error, definition, files.filePaths, files.getFileContent);
            await validator.validate();
            expect(error).toHaveBeenCalledWith(`At 21MB, the 'custom' folder exceeds the maximum size of 20MB.`);
        });
    });
});
