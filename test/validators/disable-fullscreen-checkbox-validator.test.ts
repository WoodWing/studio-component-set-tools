import { DisableFullscreenCheckboxValidator } from '../../lib/validators/disable-fullscreen-checkbox-validator';

describe('DisableFullscreenCheckboxValidator', () => {
    let definition: any;
    let error: jest.Mock;
    let validator: DisableFullscreenCheckboxValidator;
    beforeEach(() => {
        // valid definition (cut)
        definition = {
            components: {
                c1: {
                    properties: [
                        {
                            name: 'p1',
                            control: {
                                type: 'disable-fullscreen-checkbox',
                            },
                            dataType: 'styles',
                        },
                        {
                            name: 'p2',
                            control: {
                                type: 'text',
                            },
                            dataType: 'data',
                        },
                    ],
                },
            },
        };
        error = jest.fn();
        validator = new DisableFullscreenCheckboxValidator(error, definition);
    });
    describe('validate', () => {
        it('should pass on valid definition', () => {
            validator.validate();
            expect(error).not.toHaveBeenCalled();
        });
        it('should not pass if dataType is not "styles"', () => {
            definition.components.c1.properties[0].dataType = 'data';
            validator.validate();
            expect(error).toHaveBeenCalledWith(
                `Property "p1" uses "disable-fullscreen-checkbox" control type which is allowed to use with dataType="styles" only`,
            );
        });
    });
});
