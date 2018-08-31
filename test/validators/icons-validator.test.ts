import { IconsValidator } from '../../lib/validators/icons-validator';
import { readFile } from 'fs';

describe('IconsValidator', () => {
    let definition: any;
    let error: jasmine.Spy;
    let validator: IconsValidator;
    let getFileContent;
    beforeEach(() => {
        // valid definition (cut)
        definition = {
            components: [
                {
                    name: 'text',
                    icon: './test/resources/minimal-sample/icons/transparent.png'
                },
                {
                    name: 'text',
                    icon: './test/resources/minimal-sample/icons/component.svg'
                }
            ]
        };
        getFileContent = jasmine.createSpy('getFileContent').and.callFake(async (path) => {
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
        error = jasmine.createSpy('error');
        validator = new IconsValidator(error, definition, getFileContent);
    });
    describe('validate', () => {
        it('should pass on valid definition', async () => {
            await validator.validate();
            expect(error).not.toHaveBeenCalled();
        });
        it('should pass with capitalized file extensions', async () => {
            definition.components.push({
                name: 'capitals',
                icon: 'component.SVG'
            });
            await validator.validate();
            expect(error).not.toHaveBeenCalled();
        });
        it('should fail for a non-supported file extension', async () => {
            definition.components.push({
                name: 'unsupported',
                icon: 'unsupported.txt'
            });
            await validator.validate();
            expect(error).toHaveBeenCalledWith(`Icons are only supported in SVG or transparent PNG format`);
        });
        it('should fail for non-transparent PNG icons', async () => {
            definition.components.push({
                name: 'opaque',
                icon: './test/resources/minimal-sample/icons/opaque.png'
            });
            await validator.validate();
            expect(error).toHaveBeenCalledWith(`PNG icons are only supported when they are transparent`);
        });
    });
});