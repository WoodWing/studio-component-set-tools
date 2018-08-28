import { ImageEditorValidator } from '../../lib/validators/image-editor-validator';

describe('ImageEditorValidator', () => {
    let definition: any;
    let validator: ImageEditorValidator;
    beforeEach(() => {
        // valid definition (cut)
        definition = {
            componentProperties: [{
                name: 'p1',
                control: {
                    type: 'image-editor',
                },
                dataType: 'doc-image'
            }, {
                name: 'p2',
                control: {
                    type: 'text',
                },
                dataType: 'data'
            }]
        };
        validator = new ImageEditorValidator(definition);
    });
    describe('validate', () => {
        let reporter: jasmine.Spy;
        beforeEach(() => {
            reporter = jasmine.createSpy('reporter');
        });
        it('should pass on valid definition', () => {
            const valid = validator.validate(reporter);
            expect(valid).toBeTruthy();
            expect(reporter).not.toHaveBeenCalled();
        });
        it('should not pass if dataType is not "doc-image"', () => {
            definition.componentProperties[0].dataType = 'data';
            const valid = validator.validate(reporter);
            expect(valid).toBeFalsy();
            expect(reporter).toHaveBeenCalledWith(`Property "p1" uses "image-editor" control type which is allowed to use with dataType="doc-image" only`);
        });
    });
});