import { DocContainerValidator } from '../../lib/validators/doc-container-validator';

describe('DocContainerValidator', () => {
    let definition: any;
    let error: jasmine.Spy;
    let validator: DocContainerValidator;
    beforeEach(() => {
        // valid definition (cut)
        definition = {
            'components': {
                'container': {
                    'name': 'container',
                    'directives': {
                        'd1': {
                            'type': 'container',
                            'tag': 'div'
                        }
                    },
                    'properties': {}
                }
            }
        };
        error = jasmine.createSpy('error');
        validator = new DocContainerValidator(error, definition);
    });
    describe('validate', () => {
        it('should pass on valid definition', () => {
            validator.validate();
            expect(error).not.toHaveBeenCalled();
        });
        it('should pass if there is only one container directive and another type of directive', () => {
            definition.components.container.directives.d1.type = 'editable';
            definition.components.container.directives.d2 = {
                'type': 'editable',
                'tag': 'div'
            };
            validator.validate();
            expect(error).not.toHaveBeenCalled();
        });
        it('should pass if there is a container directive and another type of directive', () => {
            definition.components.container.directives.d2 = {
                'type': 'editable',
                'tag': 'div'
            };
            validator.validate();
            expect(error).not.toHaveBeenCalled();
        });
        it('should not pass if there are a container and slideshow directive', () => {
            definition.components.container.directives.d2 = {
                'type': 'slideshow',
                'tag': 'div'
            };
            validator.validate();
            expect(error).toHaveBeenCalledWith(`Component "container" contains both a container and slideshow directive,` +
            `but can only contain one of those directive types`);
        });
        it('should not pass if there are multiple container directives', () => {
            definition.components.container.directives.d2 = {
                'type': 'container',
                'tag': 'div'
            };
            validator.validate();
            expect(error).toHaveBeenCalledWith(`Component "container" can only have one container directive`);
        });
    });
});
