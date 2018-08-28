import { DisableFullscreenCheckboxValidator } from '../../lib/validators/disable-fullscreen-checkbox-validator';

describe('DisableFullscreenCheckboxValidator', () => {
    let definition: any;
    let validator: DisableFullscreenCheckboxValidator;
    beforeEach(() => {
        // valid definition (cut)
        definition = {
            componentProperties: [{
                name: 'p1',
                control: {
                    type: 'disable-fullscreen-checkbox',
                },
                dataType: 'styles'
            }, {
                name: 'p2',
                control: {
                    type: 'text',
                },
                dataType: 'data'
            }]
        };
        validator = new DisableFullscreenCheckboxValidator(definition);
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
        it('should not pass if dataType is not "styles"', () => {
            definition.componentProperties[0].dataType = 'data';
            const valid = validator.validate(reporter);
            expect(valid).toBeFalsy();
            expect(reporter).toHaveBeenCalledWith(`Property "p1" uses "disable-fullscreen-checkbox" control type which is allowed to use with dataType="styles" only`);
        });
    });
});