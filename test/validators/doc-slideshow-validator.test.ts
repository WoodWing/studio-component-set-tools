import { DocSlideshowValidator } from '../../lib/validators/doc-slideshow-validator';

describe('DocSlideshowValidator', () => {
    let definition: any;
    let error: jasmine.Spy;
    let validator: DocSlideshowValidator;
    beforeEach(() => {
        // valid definition (cut)
        definition = {
            components: {
                slides: {
                    name: 'slides',
                    directives: {
                        d1: {
                            type: 'slideshow',
                            tag: 'div',
                        },
                    },
                    properties: {},
                },
            },
        };
        error = jasmine.createSpy('error');
        validator = new DocSlideshowValidator(error, definition);
    });
    describe('validate', () => {
        it('should pass on valid definition', () => {
            validator.validate();
            expect(error).not.toHaveBeenCalled();
        });
        it('should pass if there are a slideshow directive and others', () => {
            definition.components.slides.directives.d2 = {
                type: 'editable',
                tag: 'div',
            };
            validator.validate();
            expect(error).not.toHaveBeenCalled();
        });
        it('should not pass if there are a slideshow directive and other one', () => {
            definition.components.slides.directives.d2 = {
                type: 'slideshow',
                tag: 'div',
            };
            validator.validate();
            expect(error).toHaveBeenCalledWith(
                `Component "slides" contains more then one slideshow directive, only one is allowed per component`,
            );
        });
    });
});
