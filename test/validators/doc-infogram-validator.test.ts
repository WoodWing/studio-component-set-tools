import { DocInfogramValidator } from '../../lib/validators/doc-infogram-validator';

describe('DocInfogramValidator', () => {
    let definition: any;
    let error: jest.Mock;
    let validator: DocInfogramValidator;

    beforeEach(() => {
        definition = {
            // valid definition (cut)
            components: {
                infogram: {
                    name: 'infogram',
                    directives: {
                        d1: {
                            type: 'infogram',
                            tag: 'div',
                        },
                    },
                    properties: [
                        {
                            name: 'infogramproperty',
                            directiveKey: 'd1',
                            control: {
                                type: 'infogram',
                            },
                        },
                    ],
                },
                // Do not fail on different components without infogram directive
                body: {
                    name: 'body',
                    directives: {
                        d1: {
                            type: 'editable',
                            tag: 'p',
                        },
                    },
                    properties: [],
                },
            },
        };
        error = jest.fn();
        validator = new DocInfogramValidator(error, definition);
    });
    describe('validate', () => {
        it('should pass on a valid definition', () => {
            validator.validate();
            expect(error).not.toHaveBeenCalled();
        });
        it('should not pass when there is a infogram directive but no infogram properties', () => {
            definition.components.infogram.properties = [];

            validator.validate();
            expect(error).toHaveBeenCalledWith(
                `Component "infogram" with "doc-infogram" directive must have exactly one "infogram" property (found 0)`,
            );
        });
        it('should pass with one infogram directives and other directive types', () => {
            definition.components.infogram.directives.d2 = {
                type: 'editable',
                tag: 'p',
            };
            definition.components.infogram.directives.d3 = {
                type: 'link',
                tag: 'a',
            };
            validator.validate();
            expect(error).not.toHaveBeenCalled();
        });
        it('should not pass with multiple infogram type directives', () => {
            definition.components.infogram.directives.d2 = {
                type: 'infogram',
                tag: 'div',
            };
            validator.validate();
            expect(error).toHaveBeenCalledWith(
                `Component "infogram" can only have one "doc-infogram" directive in the HTML definition`,
            );
        });
        it('should fail if a component property with a infogram control type is not applied to a infogram directive', () => {
            definition.components.wrongdirectivekey = {
                name: 'wrongdirectivekey',
                directives: {
                    d1: {
                        type: 'editable',
                        tag: 'p',
                    },
                    d2: {
                        type: 'infogram',
                        tag: 'div',
                    },
                },
                properties: [
                    {
                        name: 'infogramproperty',
                        directiveKey: 'd1',
                        control: {
                            type: 'infogram',
                        },
                    },
                ],
            };
            validator.validate();
            expect(error).toHaveBeenCalledWith(
                `Component "wrongdirectivekey" has a control type "infogram" applied to the wrong directive, which can only be used with "doc-infogram" directives`,
            );
        });
        it('should fail in case a "infogram" property does not have a directive key', () => {
            definition.components.nodirectivekey = {
                name: 'nodirectivekey',
                directives: {
                    d1: {
                        type: 'infogram',
                        tag: 'div',
                    },
                },
                properties: [
                    {
                        name: 'infogramproperty',
                        control: {
                            type: 'infogram',
                        },
                    },
                ],
            };
            validator.validate();
            expect(error).toHaveBeenCalledWith(
                `Component "nodirectivekey" must configure "directiveKey" for the property with control type "infogram"`,
            );
        });

        it('should fail in case a component without a infogram directive has "infogram" property', () => {
            definition.components.body.properties = [
                {
                    name: 'infogramproperty',
                    directiveKey: 'd1',
                    control: {
                        type: 'infogram',
                    },
                },
            ];

            validator.validate();
            expect(error).toHaveBeenCalledWith(
                `Component "body" has a "infogram" control type, but only components with a "doc-infogram" directive can have a property with this control type`,
            );
        });
    });
});
