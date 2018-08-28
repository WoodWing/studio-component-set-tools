import { DefaultComponentOnEnterOverrideValidator } from '../../lib/validators/default-component-on-enter-override-validator';

describe('DefaultComponentOnEnterOverrideValidator', () => {
    let definition: any;
    let validator: DefaultComponentOnEnterOverrideValidator;
    beforeEach(() => {
        // valid definition (cut)
        definition = {
            components: {
                text: {
                    component: {
                        name: 'text',
                        defaultComponentOnEnter: 'body',
                    },
                },
                body: {
                    component: {
                        name: 'body',
                    },
                },
            },
        };
        validator = new DefaultComponentOnEnterOverrideValidator(definition);
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
        it('should not pass if it points to non existing component', () => {
            definition.components.text.component.defaultComponentOnEnter = 'body2';
            const valid = validator.validate(reporter);
            expect(valid).toBeFalsy();
            expect(reporter).toHaveBeenCalledWith(`Property "defaultComponentOnEnter" of "text" points to non existing component "body2"`);
        });
    });
});