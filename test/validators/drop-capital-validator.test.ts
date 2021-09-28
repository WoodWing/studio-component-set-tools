import { DropCapitalValidator } from '../../lib/validators/drop-capital-validator';

describe('DropCapitalValidator', () => {
    let definition: any;
    let error: jest.Mock;
    let validator: DropCapitalValidator;
    beforeEach(() => {
        // valid definition (cut)
        definition = {
            components: {
                c1: {
                    name: 'c1',
                    properties: [
                        {
                            name: 'p1',
                            control: {
                                type: 'drop-capital',
                            },
                            dataType: 'data',
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
        error = jest.fn();
        validator = new DropCapitalValidator(error, definition);
    });
    describe('validate', () => {
        it('should pass on valid definition', () => {
            validator.validate();
            expect(error).not.toHaveBeenCalled();
        });
        it('should not pass if dataType is not "data"', () => {
            definition.components.c1.properties[0].dataType = 'styles';
            validator.validate();
            expect(error).toHaveBeenCalledWith(
                `Property "p1" uses "drop-capital" control type which is allowed to use with dataType="data" only`,
            );
        });
        it('should not pass if there is a component which uses "drop-capital" property more then one time', () => {
            definition.components.c1.properties.push({
                name: 'p3',
                control: {
                    type: 'drop-capital',
                },
            });
            validator.validate();
            expect(error).toHaveBeenCalledWith(
                `Component "c1" uses properties with "drop-capital" control type more that one time`,
            );
        });
    });
});
