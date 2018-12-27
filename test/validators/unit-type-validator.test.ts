import { UnitTypeValidator } from '../../lib/validators/unit-type-validator';

describe('UnitTypeValidator', () => {
    let definition: any;
    let error: jasmine.Spy;
    let validator: UnitTypeValidator;
    beforeEach(() => {
        // valid definition (cut)
        definition = {
            components: {
                c1: {
                    properties: [
                        {
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
                        },
                    ],
                },
            },
        };
        error = jasmine.createSpy('error');
        validator = new UnitTypeValidator(error, definition);
    });
    describe('validate', () => {
        it('should pass on valid definition', () => {
            validator.validate();
            expect(error).not.toHaveBeenCalled();
        });
        it('should not pass if unit type is unknown', () => {
            definition.components.c1.properties[1].control.unit = 'xy';
            validator.validate();
            expect(error).toHaveBeenCalledWith(`Property "p2" has unacceptable unit type "xy", only "em,px" are allowed`);
        });
    });
});
