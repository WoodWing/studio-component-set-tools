import { ConversionShortcutsValidator } from '../../lib/validators/conversion-shortcuts-validator';

describe('ConversionShortcutsValidator', () => {
    let error: jasmine.Spy, definition: any;
    let validator: ConversionShortcutsValidator;
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
            },
            shortcuts: {
                conversionComponents: [
                    'picture',
                ],
            }
        };
        error = jasmine.createSpy('error');
        validator = new ConversionShortcutsValidator(error, definition);
    });
    describe('validate', () => {
        it('should pass on valid definition', () => {
            validator.validate();
            expect(error).not.toHaveBeenCalled();
        });
        it('should not pass if the list contains non existing component', () => {
            definition.shortcuts.conversionComponents.push('none');
            validator.validate();
            expect(error).toHaveBeenCalledWith(`Component "none" does not exist`);
        });
    });
});
