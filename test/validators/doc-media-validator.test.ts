import { DocMediaValidator } from '../../lib/validators/doc-media-validator';

describe('DocMediaValidator', () => {
    let definition: any;
    let error: jasmine.Spy;
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
                            tag: 'div'
                        }
                    },
                    properties: [
                        {
                            name: 'mediaproperty',
                            directiveKey: 'd1',
                            control: {
                                type: 'media-properties',
                                mediaType: 'social'
                            }
                        }
                    ]
                },
                nomediaproperties: {
                    name: 'nomediaproperties',
                    directives: {
                        d1: {
                            type: 'media',
                            tag: 'div'
                        }
                    },
                    properties: {}
                }
            }
        };
        error = jasmine.createSpy('error');
        validator = new DocMediaValidator(error, definition);
    });
    describe('validate', () => {
        it('should pass on a valid definition', () => {
            validator.validate();
            expect(error).not.toHaveBeenCalled();
        });
        it('should pass with one media directives and other directive types', () => {
            definition.components.socialmedia.directives.d2 = {
                type: 'editable',
                tag: 'p'
            };
            definition.components.socialmedia.directives.d3 = {
                type: 'link',
                tag: 'a'
            };
            validator.validate();
            expect(error).not.toHaveBeenCalled();
        });
        it('should not pass with multiple media type directives', () => {
            definition.components.socialmedia.directives.d2 = {
                type: 'media',
                tag: 'div'
            };
            validator.validate();
            expect(error).toHaveBeenCalledWith(`A component can have only one "doc-media" directive in the HTML definition`);
        });
        it('should fail if a component property with a media-properties control type is not applied to a media directive', () => {
            definition.components.wrongdirectivekey = {
                component: {
                    name: 'wrongdirectivekey',
                },
                directives: {
                    d1: {
                        type: 'editable',
                        tag: 'p'
                    },
                    d2: {
                        type: 'media',
                        tag: 'div'
                    }
                },
                properties: [
                    {
                        name: 'mediaproperty',
                        directiveKey: 'd1',
                        control: {
                            type: 'media-properties',
                            mediaType: 'social'
                        }
                    }
                ]
            };
            validator.validate();
            expect(error).toHaveBeenCalledWith(`Control type "media-properties" is only applicable to "doc-media" directives`);
        });
        it('should fail in case a component does not have a doc-media directive, but has a media-properties control type', () => {
            definition.components.nomediaproperties = {
                component: {
                    name: 'nomediaproperties'
                },
                directives: {
                    d1: {
                        type: 'editable',
                        tag: 'div'
                    }
                },
                properties: [
                    {
                        name: 'mediaproperty',
                        directiveKey: 'd1',
                        control: {
                            type: 'media-properties',
                            mediaType: 'social'
                        }
                    }
                ]
            };
            validator.validate();
            expect(error).toHaveBeenCalledWith(`Only components with a doc-media directive can have a "media-properties" control type`);
        });
        it('should fail in case a "media-properties" property does not have a directive key', () => {
            definition.components.nodirectivekey = {
                component: {
                    name: 'nodirectivekey'
                },
                directives: {
                    d1: {
                        type: 'media',
                        tag: 'div'
                    }
                },
                properties: [
                    {
                        name: 'mediaproperty',
                        control: {
                            type: 'media-properties',
                            mediaType: 'social'
                        }
                    }
                ]
            };
            validator.validate();
            expect(error).toHaveBeenCalledWith(`The directive key is required for properties of type "media-properties"`);
        });
    });
});
