import { IconsValidator } from '../../lib/validators/icons-validator';

describe('IconsValidator', () => {
    let definition;
    let validator: IconsValidator;
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
        validator = new IconsValidator(definition);
    });
    describe('validate', () => {
        let reporter;
        beforeEach(() => {
            reporter = jasmine.createSpy('reporter');
        });
        it('should pass on valid definition', () => {
            const valid = validator.validate(reporter);
            expect(reporter).not.toHaveBeenCalled();
            expect(valid).toBeTruthy();
        });
        it('should pass with capitalized file extensions', () => {
            definition.components.push({
                name: 'capitals',
                icon: 'component.SVG'
            });
            const valid = validator.validate(reporter);
            expect(reporter).not.toHaveBeenCalled();
            expect(valid).toBeTruthy();
        });
        it('should fail for a non-supported file extension', () => {
            definition.components.push({
                name: 'unsupported',
                icon: 'unsupported.txt'
            });
            const valid = validator.validate(reporter);
            expect(reporter).toHaveBeenCalledWith(`Icons are only supported in SVG or transparent PNG format`);
            expect(valid).toBeFalsy();
        });
        it('should fail for non-transparent PNG icons', () => {
            definition.components.push({
                name: 'opaque',
                icon: './test/resources/minimal-sample/icons/opaque.png'
            });
            const valid = validator.validate(reporter);
            expect(reporter).toHaveBeenCalledWith(`PNG icons are only supported when they are transparent`);
            expect(valid).toBeFalsy();
        });
    });
});