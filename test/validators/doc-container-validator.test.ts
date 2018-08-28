import { DocContainerValidator } from '../../lib/validators/doc-container-validator';

describe('DocContainerValidator', () => {
    let definition: any;
    let validator: DocContainerValidator;
    beforeEach(() => {
        // valid definition (cut)
        definition = {
            'components': {
                'container': {
                    'component': {
                        'name': 'container',
                    },
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
        validator = new DocContainerValidator(definition);
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
        it('should pass if there is only one container directive and another type of directive', () => {
            definition.components.container.directives.d1.type = 'editable';
            definition.components.container.directives.d2 = {
                'type': 'editable',
                'tag': 'div'
            };
            const valid = validator.validate(reporter);
            expect(valid).toBeTruthy();
            expect(reporter).not.toHaveBeenCalled();
        });
        it('should pass if there is a container directive and another type of directive', () => {
            definition.components.container.directives.d2 = {
                'type': 'editable',
                'tag': 'div'
            };
            const valid = validator.validate(reporter);
            expect(valid).toBeTruthy();
            expect(reporter).not.toHaveBeenCalled();
        });
        it('should not pass if there are a container and slideshow directive', () => {
            definition.components.container.directives.d2 = {
                'type': 'slideshow',
                'tag': 'div'
            };
            const valid = validator.validate(reporter);
            expect(valid).toBeFalsy();
            expect(reporter).toHaveBeenCalledWith(`Component "container" contains both a container and slideshow directive,` +
            `but can only contain one of those directive types`);
        });
        it('should not pass if there are multiple container directives', () => {
            definition.components.container.directives.d2 = {
                'type': 'container',
                'tag': 'div'
            };
            const valid = validator.validate(reporter);
            expect(valid).toBeFalsy();
            expect(reporter).toHaveBeenCalledWith(`Component "container" can only have one container directive`);
        });
    });
});