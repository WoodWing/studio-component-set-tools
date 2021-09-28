import { DirectivePropertiesValidator } from '../../lib/validators/directive-properties-validator';

describe('DirectivePropertiesValidator', () => {
    let definition: any;
    let error: jest.Mock;
    let validator: DirectivePropertiesValidator;
    beforeEach(() => {
        // valid definition (cut)
        definition = {
            components: {
                picture: {
                    name: 'picture',
                    directives: {
                        slide: {
                            type: 'image',
                            tag: 'div',
                        },
                    },
                    properties: [
                        {
                            name: 'test',
                            control: {
                                type: 'image-editor',
                                focuspoint: true,
                            },
                            directiveKey: 'slide',
                        },
                        {
                            name: 'test',
                            control: {
                                type: 'test',
                            },
                            dataType: 'doc-editable',
                            directiveKey: 'slide',
                        },
                    ],
                },
            },
        };
        error = jest.fn();
        validator = new DirectivePropertiesValidator(error, definition);
    });
    describe('validate', () => {
        it('should pass on valid definition', () => {
            validator.validate();
            expect(error).not.toHaveBeenCalled();
        });
        it('should pass on valid definition (other control type)', () => {
            definition.components.picture.properties[0].control.type = 'interactive';
            validator.validate();
            expect(error).not.toHaveBeenCalled();
        });
        it('should not pass if directive key is not set', () => {
            delete definition.components.picture.properties[0].directiveKey;
            validator.validate();
            expect(error).toHaveBeenCalledWith(`Property "test" of component "picture" must reference to a directive`);
        });
        it('should not pass if directive key is not set for directive dataType', () => {
            delete definition.components.picture.properties[1].directiveKey;
            validator.validate();
            expect(error).toHaveBeenCalledWith(
                `Property "test" of component "picture" must reference to a directive because its dataType is a directive type`,
            );
        });
    });
});
