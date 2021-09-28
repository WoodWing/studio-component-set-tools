import { DefaultComponentOnEnterValidator } from '../../lib/validators/default-component-on-enter-validator';

describe('DefaultComponentOnEnterValidator', () => {
    let definition: any;
    let error: jest.Mock;
    let validator: DefaultComponentOnEnterValidator;
    beforeEach(() => {
        // valid definition (cut)
        definition = {
            components: {
                text: {
                    name: 'text',
                    directives: {
                        d1: {
                            type: 'editable',
                            tag: 'div',
                        },
                    },
                    properties: {},
                },
            },
            defaultComponentOnEnter: 'text',
        };
        error = jest.fn();
        validator = new DefaultComponentOnEnterValidator(error, definition);
    });
    describe('validate', () => {
        it('should pass on valid definition', () => {
            validator.validate();
            expect(error).not.toHaveBeenCalled();
        });
        it('should not pass if it points to non existing component', () => {
            definition.defaultComponentOnEnter = 'body';
            validator.validate();
            expect(error).toHaveBeenCalledWith(
                `Property "defaultComponentOnEnter" points to non existing component "body"`,
            );
        });
    });
});
