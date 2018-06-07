import { DocContainerValidator } from '../../lib/validators/doc-container-validator';

describe('DocContainerValidator', () => {
    let definition;
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
        let reporter;
        beforeEach(() => {
            reporter = jasmine.createSpy('reporter');
        })
        it('should pass on valid definition', () => {
            const valid = validator.validate(reporter);
            expect(valid).toBeTruthy();
            expect(reporter).not.toHaveBeenCalled();
        });
        it('should pass if there are directives but container directive', () => {
            definition.components.container.directives.d1.type = 'editable';
            definition.components.container.directives.d2 = {
                'type': 'editable',
                'tag': 'div'
            };
            const valid = validator.validate(reporter);
            expect(valid).toBeTruthy();
            expect(reporter).not.toHaveBeenCalled();
        });
        it('should not pass if there are a container directive and other one', () => {
            definition.components.container.directives.d2 = {
                'type': 'editable',
                'tag': 'div'
            };
            const valid = validator.validate(reporter);
            expect(valid).toBeFalsy();
            expect(reporter).toHaveBeenCalledWith(`Component "container" contains container directive, it can be the only directive in the component, all other directives are restricted`);
        });
    });
});