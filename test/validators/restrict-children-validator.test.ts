import { RestrictChildrenValidator } from '../../lib/validators/restrict-children-validator';

describe('RestrictChildrenValidator', () => {
    let definition: any;
    let error: jasmine.Spy;
    let validator: RestrictChildrenValidator;
    beforeEach(() => {
        // valid definition (cut)
        definition = {
            'components': {
                'body': {
                    'name': 'body',
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
                    'name': 'intro',
                    'directives': {
                        'text': {
                            'type': 'editable',
                            'tag': 'p'
                        }
                    },
                },
                'slider': {
                    'name': 'slider',
                    'restrictChildren': {
                        'body': {}
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
        error = jasmine.createSpy('error');
        validator = new RestrictChildrenValidator(error, definition);
    });
    describe('validate', () => {
        it('should pass on valid definition', () => {
            validator.validate();
            expect(error).not.toHaveBeenCalled();
        });
        it('should pass on valid definition with additional withContent property', () => {
            definition.components.slider.restrictChildren.body.withContent = 'text';
            validator.validate();
            expect(error).not.toHaveBeenCalled();
        });
        it('should not pass if there is not restrictChildren property in slideshow component', () => {
            delete definition.components.slider.restrictChildren;
            validator.validate();
            expect(error).toHaveBeenCalledWith(`Component property "restrictChildren" must be defined in component "slider" because the component contains a slideshow directive`);
        });
        it('should not pass if restrictChildren property additional withContent property point to wrong directive', () => {
            definition.components.slider.restrictChildren.body.withContent = 'unknown';
            validator.validate();
            expect(error).toHaveBeenCalledWith(`Additional property "withContent" of property "restrictChildren.body" of component "slider" points to non existing directive key "unknown" of component "body"`);
        });
        it('should not pass if restrictChildren property points to the parent component', () => {
            definition.components.slider.restrictChildren.slider = {};
            validator.validate();
            expect(error).toHaveBeenCalledWith(`Component property "restrictChildren.slider" of component "slider" points to itself`);
        });
        it('should not pass if restrictChildren property points to non existing component', () => {
            definition.components.slider.restrictChildren.unknown = {};
            validator.validate();
            expect(error).toHaveBeenCalledWith(`Component property "restrictChildren.unknown" of component "slider" points to non existing component`);
        });
        it('should not pass if restrictChildren property points to more then one component', () => {
            definition.components.slider.restrictChildren.intro = {};
            validator.validate();
            expect(error).toHaveBeenCalledWith(`Component property "restrictChildren" of component "slider" must contain only one entry because the component contains a slideshow directive`);
        });
    });
});
