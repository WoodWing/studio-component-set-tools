import { DefaultComponentOnEnterValidator } from '../../lib/validators/default-component-on-enter-validator';

describe('DefaultComponentOnEnterValidator', () => {
    let definition;
    let validator: DefaultComponentOnEnterValidator;
    beforeEach(() => {
        // valid definition (cut)
        definition = {
            'components': {
                'text': {
                    'component': {
                        'name': 'text',
                    },
                    'directives': {
                        'd1': {
                            'type': 'editable',
                            'tag': 'div'
                        }
                    },
                    'properties': {}
                }
            },
            defaultComponentOnEnter: 'text',
        };
        validator = new DefaultComponentOnEnterValidator(definition);
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
        it('should not pass if it points to non existing component', () => {
            definition.defaultComponentOnEnter = 'body';
            const valid = validator.validate(reporter);
            expect(valid).toBeFalsy();
            expect(reporter).toHaveBeenCalledWith(`Property "defaultComponentOnEnter" points to non existing component "body"`);
        });
    });
});