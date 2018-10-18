import { DefaultComponentOnEnterOverrideValidator } from '../../lib/validators/default-component-on-enter-override-validator';

describe('DefaultComponentOnEnterOverrideValidator', () => {
    let definition: any;
    let error: jasmine.Spy;
    let validator: DefaultComponentOnEnterOverrideValidator;
    beforeEach(() => {
        // valid definition (cut)
        definition = {
            components: {
                text: {
                    name: 'text',
                    defaultComponentOnEnter: 'body',
                },
                body: {
                    name: 'body',
                },
            },
        };
        error = jasmine.createSpy('error');
        validator = new DefaultComponentOnEnterOverrideValidator(error, definition);
    });
    describe('validate', () => {
        it('should pass on valid definition', () => {
            validator.validate();
            expect(error).not.toHaveBeenCalled();
        });
        it('should not pass if it points to non existing component', () => {
            definition.components.text.defaultComponentOnEnter = 'body2';
            validator.validate();
            expect(error).toHaveBeenCalledWith(`Property "defaultComponentOnEnter" of "text" points to non existing component "body2"`);
        });
    });
});