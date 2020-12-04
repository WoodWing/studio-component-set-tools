import { FittingValidator } from '../../lib/validators/fitting-validator';

describe('FittingValidator', () => {
    let componentSet: any;
    let error: jasmine.Spy;
    let validator: FittingValidator;
    beforeEach(() => {
        // valid definition (cut)
        componentSet = {
            components: {
                c1: {
                    name: 'c1',
                    properties: [
                        {
                            name: 'p1',
                            control: {
                                type: 'fitting',
                            },
                        },
                        {
                            name: 'p2',
                            control: {
                                type: 'text',
                            },
                        },
                    ],
                },
            },
        };
        error = jasmine.createSpy('error');
        validator = new FittingValidator(error, componentSet);
    });
    describe('validate', () => {
        it('should pass on valid definition', () => {
            validator.validate();
            expect(error).not.toHaveBeenCalled();
        });
        it('should not pass if there is a component which uses "fitting" property more then one time', () => {
            componentSet.components.c1.properties.push({
                name: 'p3',
                control: {
                    type: 'fitting',
                },
            });
            validator.validate();
            expect(error).toHaveBeenCalledWith(
                `Component "c1" uses properties with "fitting" control type more that one time`,
            );
        });
    });
});
