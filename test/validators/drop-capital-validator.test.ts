import { DropCapitalValidator } from '../../lib/validators/drop-capital-validator';

describe('DropCapitalValidator', () => {
    let definition;
    let parsedDefinition;
    let validator: DropCapitalValidator;
    beforeEach(() => {
        // valid definition (cut)
        definition = {
            componentProperties: [{
                name: 'p1',
                control: {
                    type: 'drop-capital',
                },
                dataType: 'data'
            }]
        };
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
                                    type: 'drop-capital',
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
        validator = new DropCapitalValidator(definition, parsedDefinition);
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
        it('should not pass if dataType is not "data"', () => {
            definition.componentProperties[0].dataType = 'styles';
            const valid = validator.validate(reporter);
            expect(valid).toBeFalsy();
            expect(reporter).toHaveBeenCalledWith(`Property "p1" uses "drop-capital" control type which is allowed to use with dataType="data" only`);
        });
        it('should not pass if there is a component which uses "drop-capital" property more then one time', () => {
            parsedDefinition.components.c1.properties.p3 = {
                property: {
                    name: 'p3',
                    control: {
                        type: 'drop-capital',
                    },
                },
            };
            const valid = validator.validate(reporter);
            expect(valid).toBeFalsy();
            expect(reporter).toHaveBeenCalledWith(`Component "c1" uses properties with "drop-capital" control type more that one time`);
        });
    });
});