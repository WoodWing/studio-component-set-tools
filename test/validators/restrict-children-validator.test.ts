import { RestrictChildrenValidator } from '../../lib/validators/restrict-children-validator';

describe('RestrictChildrenValidator', () => {
    let definition;
    let validator;
    beforeEach(() => {
        // valid definition (cut)
        definition = {
            'components': {
                'body': {
                    'component': {
                        'name': 'body',
                    },
                    'directives': {
                        'text': {
                            'type': 'editable',
                            'tag': 'p'
                        }
                    },
                    'properties': {
                        'selectProperty': {
                            'property': {
                                'name': 'selectProperty',
                            },
                            'directiveKey': null
                        }
                    }
                },
                'intro': {
                    'component': {
                        'name': 'intro',
                    },
                    'directives': {
                        'text': {
                            'type': 'editable',
                            'tag': 'p'
                        }
                    },
                },
                'slider': {
                    'component': {
                        'name': 'slider',
                        'restrictChildren': {
                            'body': {}
                        },
                    },
                    'directives': {
                        'slides': {
                            'type': 'slideshow',
                            'tag': 'p'
                        }
                    },
                    'properties': {}
                }
            }
        };
        validator = new RestrictChildrenValidator(definition);
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
        it('should pass on valid definition with additional withContent property', () => {
            definition.components.slider.component.restrictChildren.body.withContent = 'text';
            const valid = validator.validate(reporter);
            expect(valid).toBeTruthy();
            expect(reporter).not.toHaveBeenCalled();
        });
        it('should not pass if there is not restrictChildren property in slideshow component', () => {
            delete definition.components.slider.component.restrictChildren;
            const valid = validator.validate(reporter);
            expect(valid).toBeFalsy();
            expect(reporter).toHaveBeenCalledWith(`Component property "restrictChildren" must be defined in component "slider" because the component contains a slideshow directive`);
        });
        it('should not pass if restrictChildren property additional withContent property point to wrong directive', () => {
            definition.components.slider.component.restrictChildren.body.withContent = 'unknown';
            const valid = validator.validate(reporter);
            expect(valid).toBeFalsy();
            expect(reporter).toHaveBeenCalledWith(`Additional property "withContent" of property "restrictChildren.body" of component "slider" points to non existing directive key "unknown" of component "body"`);
        });
        it('should not pass if restrictChildren property points to the parent component', () => {
            definition.components.slider.component.restrictChildren.slider = {};
            const valid = validator.validate(reporter);
            expect(valid).toBeFalsy();
            expect(reporter).toHaveBeenCalledWith(`Component property "restrictChildren.slider" of component "slider" points to itself`);
        });
        it('should not pass if restrictChildren property points to non existing component', () => {
            definition.components.slider.component.restrictChildren.unknown = {};
            const valid = validator.validate(reporter);
            expect(valid).toBeFalsy();
            expect(reporter).toHaveBeenCalledWith(`Component property "restrictChildren.unknown" of component "slider" points to non existing component`);
        });
        it('should not pass if restrictChildren property points to more then one component', () => {
            definition.components.slider.component.restrictChildren.intro = {};
            const valid = validator.validate(reporter);
            expect(valid).toBeFalsy();
            expect(reporter).toHaveBeenCalledWith(`Component property "restrictChildren" of component "slider" must contain only one entry because the component contains a slideshow directive`);
        });
    });
});