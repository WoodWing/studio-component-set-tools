import { DocSlideshowValidator } from '../../lib/validators/doc-slideshow-validator';

describe('DocSlideshowValidator', () => {
    let definition: any;
    let validator: DocSlideshowValidator;
    beforeEach(() => {
        // valid definition (cut)
        definition = {
            'components': {
                'slides': {
                    'component': {
                        'name': 'slides',
                    },
                    'directives': {
                        'd1': {
                            'type': 'slideshow',
                            'tag': 'div'
                        }
                    },
                    'properties': {}
                }
            }
        };
        validator = new DocSlideshowValidator(definition);
    });
    describe('validate', () => {
        let reporter: jasmine.Spy;
        beforeEach(() => {
            reporter = jasmine.createSpy('reporter');
        });
        it('should pass on valid definition', () => {
            const valid = validator.validate(reporter);
            expect(valid).toBeTruthy();
            expect(reporter).not.toHaveBeenCalled();
        });
        it('should pass if there are a slideshow directive and others', () => {
            definition.components.slides.directives.d2 = {
                'type': 'editable',
                'tag': 'div'
            };
            const valid = validator.validate(reporter);
            expect(valid).toBeTruthy();
            expect(reporter).not.toHaveBeenCalled();
        });
        it('should not pass if there are a slideshow directive and other one', () => {
            definition.components.slides.directives.d2 = {
                'type': 'slideshow',
                'tag': 'div'
            };
            const valid = validator.validate(reporter);
            expect(valid).toBeFalsy();
            expect(reporter).toHaveBeenCalledWith(`Component "slides" contains more then one slideshow directive, only one is allowed per component`);
        });
    });
});