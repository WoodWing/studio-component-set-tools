import { ImageEditorValidator } from '../../lib/validators/image-editor-validator';

describe('ImageEditorValidator', () => {
    let definition: any;
    let error: jasmine.Spy;
    let validator: ImageEditorValidator;
    beforeEach(() => {
        // valid definition (cut)
        definition = {
            components: {
                c1: {
                    properties: [
                        {
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
                        }
                    ]
                },
            },
        };
        error = jasmine.createSpy('error');
        validator = new ImageEditorValidator(error, definition);
    });
    describe('validate', () => {
        it('should pass on valid definition', () => {
            validator.validate();
            expect(error).not.toHaveBeenCalled();
        });
        it('should not pass if dataType is not "doc-image"', () => {
            definition.components.c1.properties[0].dataType = 'data';
            validator.validate();
            expect(error).toHaveBeenCalledWith(`Property "p1" uses "image-editor" control type which is allowed to use with dataType="doc-image" only`);
        });
    });
});