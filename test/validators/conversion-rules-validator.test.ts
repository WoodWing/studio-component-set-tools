import { ConversionRulesValidator } from '../../lib/validators/conversion-rules-validator';

describe('ConversionRulesValidator', () => {
    let definition: any;
    let error: jest.Mock;
    let validator: ConversionRulesValidator;
    beforeEach(() => {
        // valid definition (cut)
        definition = {
            components: {
                c1: {
                    name: 'c1',
                    directives: {
                        slide: {
                            type: 'image',
                            tag: 'div',
                        },
                    },
                },
                c2: {
                    name: 'c2',
                    directives: {
                        figure: {
                            type: 'image',
                            tag: 'div',
                        },
                    },
                },
            },
            conversionRules: {
                c1: {
                    c2: 'auto',
                },
            },
        };
        error = jest.fn();
        validator = new ConversionRulesValidator(error, definition);
    });
    describe('validate', () => {
        it('should pass on valid definition', () => {
            validator.validate();
            expect(error).not.toHaveBeenCalled();
        });
        it('should pass on valid definition (simple)', () => {
            definition.conversionRules.c1 = {
                c2: {
                    type: 'simple',
                    map: {
                        figure: 'slide',
                    },
                },
            };
            validator.validate();
            expect(error).not.toHaveBeenCalled();
        });
        it('should pass on valid definition (from-container)', () => {
            definition.conversionRules.c1 = {
                c2: {
                    type: 'from-container',
                    container: 'slide',
                },
            };
            definition.components.c1.directives.slide.type = 'slideshow';
            validator.validate();
            expect(error).not.toHaveBeenCalled();
        });
        it('should pass on valid definition (to-container)', () => {
            definition.conversionRules.c1 = {
                c2: {
                    type: 'to-container',
                    container: 'figure',
                },
            };
            definition.components.c2.directives.figure.type = 'slideshow';
            validator.validate();
            expect(error).not.toHaveBeenCalled();
        });
        it('should not pass if source component does not exist', () => {
            definition.conversionRules.u1 = {};
            validator.validate();
            expect(error).toHaveBeenCalledWith(`Conversion rule references to non existing component "u1"`);
        });
        it('should not pass if destination component does not exist', () => {
            definition.conversionRules.c1 = {
                u2: 'auto',
            };
            validator.validate();
            expect(error).toHaveBeenCalledWith(`Conversion rule references to non existing component "u2"`);
        });
        it('should not pass if source directive does not exist', () => {
            definition.conversionRules.c1 = {
                c2: {
                    type: 'simple',
                    map: {
                        figure: 'ud1',
                    },
                },
            };
            validator.validate();
            expect(error).toHaveBeenCalledWith(`Conversion rule references to non existing directive "ud1"`);
        });
        it('should not pass if destination directive does not exist', () => {
            definition.conversionRules.c1 = {
                c2: {
                    type: 'simple',
                    map: {
                        ud2: 'slide',
                    },
                },
            };
            validator.validate();
            expect(error).toHaveBeenCalledWith(`Conversion rule references to non existing directive "ud2"`);
        });
        it('should not pass if from-container directive does not exist', () => {
            definition.conversionRules.c1 = {
                c2: {
                    type: 'from-container',
                    container: 'ud3',
                },
            };
            validator.validate();
            expect(error).toHaveBeenCalledWith(`Conversion rule references to non existing directive "ud3"`);
        });
        it('should not pass if from-container directive is not supported', () => {
            definition.conversionRules.c1 = {
                c2: {
                    type: 'from-container',
                    container: 'slide',
                },
            };
            validator.validate();
            expect(error).toHaveBeenCalledWith(
                `Conversion rule references to a directive "slide" which must be "slideshow" or "container"`,
            );
        });
        it('should not pass if to-container directive does not exist', () => {
            definition.conversionRules.c1 = {
                c2: {
                    type: 'to-container',
                    container: 'ud4',
                },
            };
            validator.validate();
            expect(error).toHaveBeenCalledWith(`Conversion rule references to non existing directive "ud4"`);
        });
        it('should not pass if to-container directive is not supported', () => {
            definition.conversionRules.c1 = {
                c2: {
                    type: 'to-container',
                    container: 'figure',
                },
            };
            validator.validate();
            expect(error).toHaveBeenCalledWith(
                `Conversion rule references to a directive "figure" which must be "slideshow" or "container"`,
            );
        });
    });
});
