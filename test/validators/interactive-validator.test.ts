import { InteractiveValidator } from '../../lib/validators/interactive-validator';

describe('InteractiveValidator', () => {
    let definition: any;
    let validator: InteractiveValidator;
    beforeEach(() => {
        // valid definition (cut)
        definition = {
            componentProperties: [{
                name: 'p1',
                control: {
                    type: 'interactive',
                },
                dataType: 'doc-interactive'
            }, {
                name: 'p2',
                control: {
                    type: 'text',
                },
                dataType: 'data'
            }]
        };
        validator = new InteractiveValidator(definition);
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
        it('should not pass if dataType is not "interactive"', () => {
            definition.componentProperties[0].dataType = 'data';
            const valid = validator.validate(reporter);
            expect(valid).toBeFalsy();
            expect(reporter).toHaveBeenCalledWith(`Property "p1" uses "interactive" control type which is allowed to use with dataType="doc-interactive" only`);
        });
    });
});