import { FocuspointValidator } from '../../lib/validators/focuspoint-validator';

describe('FocuspointValidator', () => {
    let definition;
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
                    properties: {
                        p1: {
                            property: {
                                name: 'test',
                                control: {
                                    type: 'image-editor',
                                    focuspoint: true
                                }
                            },
                            directiveKey: 'slide',
                        }
                    }
                }
            }
        };
        validator = new FocuspointValidator(definition);
    });
    describe('validate', () => {
        let reporter;
        beforeEach(() => {
            reporter = jasmine.createSpy('reporter');
        })
        it('should pass on valid definition', () => {
            const valid = validator.validate(reporter);
            expect(valid).toBeTruthy();
            expect(reporter).not.toHaveBeenCalled();
        });
        it('should pass if directive is applied to <img> tag but "focuspoint" is not set', () => {
            definition.components.picture.directives.slide.tag = 'img';
            delete definition.components.picture.properties.p1.property.control.focuspoint;
            const valid = validator.validate(reporter);
            expect(valid).toBeTruthy();
            expect(reporter).not.toHaveBeenCalled();
        });
        it('should not pass if directive is applied to <img> tag', () => {
            definition.components.picture.directives.slide.tag = 'img';
            const valid = validator.validate(reporter);
            expect(valid).toBeFalsy();
            expect(reporter).toHaveBeenCalledWith(`Property "test" of component "picture" uses "focuspoint" feature on <img> html tag, which is not supported, "focuspoint" can be applied to other html tags, whereimage is a background`);
        });
    });
});