import { IconsValidator } from '../../lib/validators/icons-validator';
import { readFile } from 'fs';

describe('IconsValidator', () => {
    let definition;
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
        validator = new IconsValidator(definition, getFileContent);
    });
    fdescribe('validate', () => {
        let reporter;
        beforeEach(() => {
            reporter = jasmine.createSpy('reporter');
        });
        it('should pass on valid definition', async () => {
            const valid = await validator.validate(reporter);
            expect(reporter).not.toHaveBeenCalled();
            expect(valid).toBeTruthy();
        });
        it('should pass with capitalized file extensions', async () => {
            definition.components.push({
                name: 'capitals',
                icon: 'component.SVG'
            });
            const valid = await validator.validate(reporter);
            expect(reporter).not.toHaveBeenCalled();
            expect(valid).toBeTruthy();
        });
        it('should fail for a non-supported file extension', async () => {
            definition.components.push({
                name: 'unsupported',
                icon: 'unsupported.txt'
            });
            const valid = await validator.validate(reporter);
            expect(reporter).toHaveBeenCalledWith(`Icons are only supported in SVG or transparent PNG format`);
            expect(valid).toBeFalsy();
        });
        fit('should fail for non-transparent PNG icons', async () => {
            definition.components.push({
                name: 'opaque',
                icon: './test/resources/minimal-sample/icons/opaque.png'
            });
            const valid = await validator.validate(reporter);
            expect(reporter).toHaveBeenCalledWith(`PNG icons are only supported when they are transparent`);
            expect(valid).toBeFalsy();
        });
    });
});