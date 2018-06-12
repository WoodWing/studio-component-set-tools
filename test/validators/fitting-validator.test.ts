import { FittingValidator } from '../../lib/validators/fitting-validator';

describe('FittingValidator', () => {
    let parsedDefinition;
    let validator: FittingValidator;
    beforeEach(() => {
        // valid definition (cut)
        parsedDefinition = {
            components: {
                c1: {
                    component: {
                        name: 'c1',
                    },
                    properties: {
                        p1: {
                            property: {
                                name: 'p1',
                                control: {
                                    type: 'fitting',
                                },
                            },
                        },
                        p2: {
                            property: {
                                name: 'p2',
                                control: {
                                    type: 'text',
                                },
                            },
                        },
                    },
                },
            },
        };
        validator = new FittingValidator(parsedDefinition);
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
        it('should not pass if there is a component which uses "fitting" property more then one time', () => {
            parsedDefinition.components.c1.properties.p3 = {
                property: {
                    name: 'p3',
                    control: {
                        type: 'fitting',
                    },
                },
            };
            const valid = validator.validate(reporter);
            expect(valid).toBeFalsy();
            expect(reporter).toHaveBeenCalledWith(`Component "c1" uses properties with "fitting" control type more that one time`);
        });
    });
});