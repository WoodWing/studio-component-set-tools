import { StripStylingOnPasteValidator } from '../../lib/validators';

describe('StripStylingOnPasteValidator', () => {
    let error: jest.Mock, definition: any;
    let validator: StripStylingOnPasteValidator;
    beforeEach(() => {
        // valid definition (cut)
        definition = {
            components: {
                c1: {
                    name: 'c1',
                    directiveOptions: {
                        title: {
                            stripStylingOnPaste: false,
                        },
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
        validator = new StripStylingOnPasteValidator(error, definition);
    });
    describe('validate', () => {
        it('should pass on valid definition', () => {
            validator.validate();
            expect(error).not.toHaveBeenCalled();
        });

        it('should not pass if directive does not exist', () => {
            delete definition.components.c1.directives.title;
            validator.validate();
            expect(error).toHaveBeenCalledWith(
                `Component "c1" has stripStylingOnPaste set for an unknown directive "title".`,
            );
        });

        it('should not pass if directive has wrong type', () => {
            definition.components.c1.directives.title.type = 'image';
            validator.validate();
            expect(error).toHaveBeenCalledWith(
                `Component "c1" has stripStylingOnPaste set for a directive with key "title" but that directive is not of type "editable". Instead it is of type "image".`,
            );
        });
    });
});
