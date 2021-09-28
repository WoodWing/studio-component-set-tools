import { DirectiveOptionsValidator } from '../../lib/validators';

describe('DirectiveOptionsValidator', () => {
    let error: jest.Mock, definition: any;
    let validator: DirectiveOptionsValidator;
    beforeEach(() => {
        // valid definition (cut)
        definition = {
            components: {
                c1: {
                    name: 'c1',
                    directiveOptions: {
                        title: {},
                    },
                    directives: {
                        title: {
                            type: 'editable',
                            tag: 'p',
                        },
                    },
                },
            },
        };
        error = jest.fn();
        validator = new DirectiveOptionsValidator(error, definition);
    });
    describe('validate', () => {
        it('should pass on valid definition', () => {
            validator.validate();
            expect(error).not.toHaveBeenCalled();
        });
        it('should not pass if destination directive does not exist', () => {
            delete definition.components.c1.directives.title;
            validator.validate();
            expect(error).toHaveBeenCalledWith(
                `Component "c1" has directive options for an unknown directive "title".`,
            );
        });
    });
});
