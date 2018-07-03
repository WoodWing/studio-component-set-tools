import { DocMediaValidator } from '../../lib/validators/doc-media-validator';

describe('DocMediaValidator', () => {
    let definition;
    let validator: DocMediaValidator;

    beforeEach(() => {
        definition = {
            // valid definition (cut)
            components: {
                socialmedia: {
                    component: {
                        name: 'likes',
                    },
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
        validator = new DocMediaValidator(definition);
    });
    describe('validate', () => {
        let reporter;
        beforeEach(() => {
            reporter = jasmine.createSpy('reporter');
        });
        it('should pass on a valid definition', () => {
            const valid = validator.validate(reporter);
            expect(valid).toBeTruthy();
            expect(reporter).not.toHaveBeenCalled();
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
            const valid = validator.validate(reporter);
            expect(valid).toBeTruthy();
            expect(reporter).not.toHaveBeenCalled();
        });
        it('should not pass with multiple media type directives', () => {
            definition.components.socialmedia.directives.d2 = {
                type: 'media',
                tag: 'div'
            };
            const valid = validator.validate(reporter);
            expect(valid).toBeFalsy();
            expect(reporter).toHaveBeenCalledWith(`A component can have only one "doc-media" directive in the HTML definition`);
        });
    });
});