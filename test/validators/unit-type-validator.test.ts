import { UnitTypeValidator } from '../../lib/validators/unit-type-validator';

describe('UnitTypeValidator', () => {
    let definition;
    let validator: UnitTypeValidator;
    beforeEach(() => {
        // valid definition (cut)
        definition = {
            componentProperties: [{
                name: 'p1',
                control: {
                    type: 'text',
                    unit: 'px',
                },
            }, {
                name: 'p2',
                control: {
                    type: 'text',
                },
            }, {
                name: 'p3',
                control: {
                    type: 'text',
                    unit: 'eM',     // test if it is case-insensitive
                },
            }]
        };
        validator = new UnitTypeValidator(definition);
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
        it('should not pass if unit type is unknown', () => {
            definition.componentProperties[1].control.unit = 'xy';
            const valid = validator.validate(reporter);
            expect(valid).toBeFalsy();
            expect(reporter).toHaveBeenCalledWith(`Property "p2" has unaccaptable unit type "xy", only "em,px" are allowed`);
        });
    });
});