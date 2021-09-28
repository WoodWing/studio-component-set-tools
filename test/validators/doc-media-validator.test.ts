import { DocMediaValidator } from '../../lib/validators/doc-media-validator';

describe('DocMediaValidator', () => {
    let definition: any;
    let error: jest.Mock;
    let validator: DocMediaValidator;

    beforeEach(() => {
        definition = {
            // valid definition (cut)
            components: {
                socialmedia: {
                    name: 'socialmedia',
                    directives: {
                        d1: {
                            type: 'media',
                            tag: 'div',
                        },
                    },
                    properties: [
                        {
                            name: 'mediaproperty',
                            directiveKey: 'd1',
                            control: {
                                type: 'media-properties',
                                mediaType: 'social',
                            },
                        },
                    ],
                },
                // Do not fail on different components without media directive
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
        validator = new DocMediaValidator(error, definition);
    });
    describe('validate', () => {
        it('should pass on a valid definition', () => {
            validator.validate();
            expect(error).not.toHaveBeenCalled();
        });
        it('should not pass when there is a media directive but no media properties', () => {
            definition.components.socialmedia.properties = [];

            validator.validate();
            expect(error).toHaveBeenCalledWith(
                `Component "socialmedia" with "doc-media" directive must have exactly one "media-properties" property (found 0)`,
            );
        });
        it('should pass with one media directives and other directive types', () => {
            definition.components.socialmedia.directives.d2 = {
                type: 'editable',
                tag: 'p',
            };
            definition.components.socialmedia.directives.d3 = {
                type: 'link',
                tag: 'a',
            };
            validator.validate();
            expect(error).not.toHaveBeenCalled();
        });
        it('should not pass with multiple media type directives', () => {
            definition.components.socialmedia.directives.d2 = {
                type: 'media',
                tag: 'div',
            };
            validator.validate();
            expect(error).toHaveBeenCalledWith(
                `Component "socialmedia" can only have one "doc-media" directive in the HTML definition`,
            );
        });
        it('should fail if a component property with a media-properties control type is not applied to a media directive', () => {
            definition.components.wrongdirectivekey = {
                name: 'wrongdirectivekey',
                directives: {
                    d1: {
                        type: 'editable',
                        tag: 'p',
                    },
                    d2: {
                        type: 'media',
                        tag: 'div',
                    },
                },
                properties: [
                    {
                        name: 'mediaproperty',
                        directiveKey: 'd1',
                        control: {
                            type: 'media-properties',
                            mediaType: 'social',
                        },
                    },
                ],
            };
            validator.validate();
            expect(error).toHaveBeenCalledWith(
                `Component "wrongdirectivekey" has a control type "media-properties" applied to the wrong directive, which can only be used with "doc-media" directives`,
            );
        });
        it('should fail in case a "media-properties" property does not have a directive key', () => {
            definition.components.nodirectivekey = {
                name: 'nodirectivekey',
                directives: {
                    d1: {
                        type: 'media',
                        tag: 'div',
                    },
                },
                properties: [
                    {
                        name: 'mediaproperty',
                        control: {
                            type: 'media-properties',
                            mediaType: 'social',
                        },
                    },
                ],
            };
            validator.validate();
            expect(error).toHaveBeenCalledWith(
                `Component "nodirectivekey" must configure "directiveKey" for the property with control type "media-properties"`,
            );
        });

        it('should fail in case a component without a media directive has "media-properties" property', () => {
            definition.components.body.properties = [
                {
                    name: 'mediaproperty',
                    directiveKey: 'd1',
                    control: {
                        type: 'media-properties',
                        mediaType: 'social',
                    },
                },
            ];

            validator.validate();
            expect(error).toHaveBeenCalledWith(
                `Component "body" has a "media-properties" control type, but only components with a "doc-media" directive can have a property with this control type`,
            );
        });
    });
});
