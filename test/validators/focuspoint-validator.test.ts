import { FocuspointValidator } from '../../lib/validators/focuspoint-validator';

describe('FocuspointValidator', () => {
    let definition: any;
    let error: jasmine.Spy;
    let validator: FocuspointValidator;
    beforeEach(() => {
        // valid definition (cut)
        definition = {
            components: {
                picture: {
                    component: {
                        name: 'picture',
                    },
                    directives: {
                        slide: {
                            type: 'image',
                            tag: 'div'
                        }
                    },
                    properties: [
                        {
                            name: 'test',
                            control: {
                                type: 'image-editor',
                                focuspoint: true
                            },
                            directiveKey: 'slide',
                        }
                    ],
                }
            }
        };
        error = jasmine.createSpy('error');
        validator = new FocuspointValidator(error, definition);
    });
    describe('validate', () => {
        it('should pass on valid definition', () => {
            validator.validate();
            expect(error).not.toHaveBeenCalled();
        });
        it('should pass if directive is applied to <img> tag but "focuspoint" is not set', () => {
            definition.components.picture.directives.slide.tag = 'img';
            delete definition.components.picture.properties[0].control.focuspoint;
            validator.validate();
            expect(error).not.toHaveBeenCalled();
        });
        it('should not pass if directive is applied to <img> tag', () => {
            definition.components.picture.directives.slide.tag = 'img';
            validator.validate();
            expect(error).toHaveBeenCalledWith(`Property "test" of component "picture" uses "focuspoint" feature on <img> html tag, which is not supported, "focuspoint" can be applied to other html tags, whereimage is a background`);
        });
    });
});