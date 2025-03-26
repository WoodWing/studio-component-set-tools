import { IconsValidator } from '../../lib/validators/icons-validator';
import { readFile } from 'fs';

describe('IconsValidator', () => {
    let definition: any;
    let error: jest.Mock;
    let validator: IconsValidator;
    let getFileContent: any;
    beforeEach(() => {
        // valid definition (cut)
        definition = {
            components: {
                c1: {
                    name: 'c1',
                    icon: './test/resources/minimal-sample/icons/transparent.png',
                },
                c2: {
                    name: 'c2',
                    icon: './test/resources/minimal-sample/icons/component.svg',
                },
            },
        };
        getFileContent = jest.fn(async (path) => {
            return new Promise((resolve, reject) => {
                return readFile(path, (err, data) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(data);
                    }
                });
            });
        });
        error = jest.fn();
        validator = new IconsValidator(error, definition, getFileContent);
    });
    describe('validate', () => {
        it('should pass on valid definition', async () => {
            await validator.validate();
            expect(error).not.toHaveBeenCalled();
        });
        it('should pass with capitalized file extensions', async () => {
            definition.components.c3 = {
                name: 'capitals',
                icon: 'component.SVG',
            };
            await validator.validate();
            expect(error).not.toHaveBeenCalled();
        });
        it('should fail for a non-supported file extension', async () => {
            definition.components.c3 = {
                name: 'unsupported',
                icon: 'unsupported.txt',
            };
            await validator.validate();
            expect(error).toHaveBeenCalledWith(`Icons are only supported in SVG or transparent PNG format`);
        });
        it('should fail for non-transparent PNG icons', async () => {
            definition.components.c3 = {
                name: 'opaque',
                icon: './test/resources/minimal-sample/icons/opaque.png',
            };
            await validator.validate();
            expect(error).toHaveBeenCalledWith(`PNG icons are only supported when they are transparent`);
        });
        it('should fail for non png files with a png extension', async () => {
            definition.components.c3 = {
                name: 'wrong',
                icon: './test/resources/invalid-files/wrong.png',
            };
            await validator.validate();
            expect(error).toHaveBeenCalledWith(
                `Component "wrong" icon "./test/resources/invalid-files/wrong.png" is not a valid PNG file`,
            );
        });
    });
});
