import { InteractiveValidator } from '../../lib/validators/interactive-validator';

describe('InteractiveValidator', () => {
    let definition: any;
    let error: jasmine.Spy;
    let validator: InteractiveValidator;
    beforeEach(() => {
        // valid definition (cut)
        definition = {
            components: {
                c1: {
                    component: {

                    },
                    properties: [
                        {
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
                        },
                    ],
                },
            },
        };
        error = jasmine.createSpy('error');
        validator = new InteractiveValidator(error, definition);
    });
    describe('validate', () => {
        it('should pass on valid definition', () => {
            validator.validate();
            expect(error).not.toHaveBeenCalled();
        });
        it('should not pass if dataType is not "interactive"', () => {
            definition.components.c1.properties[0].dataType = 'data';
            validator.validate();
            expect(error).toHaveBeenCalledWith(`Property "p1" uses "interactive" control type which is allowed to use with dataType="doc-interactive" only`);
        });
    });
});