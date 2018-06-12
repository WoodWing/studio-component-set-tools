import { DirectivePropertiesValidator } from '../../lib/validators/directive-properties-validator';

describe('DirectivePropertiesValidator', () => {
    let definition;
    let validator: DirectivePropertiesValidator;
    beforeEach(() => {
        // valid definition (cut)
        definition = {
            components: {
                picture: {
                    component: {
                        name: 'picture',
                    },
                    directives: {
                        slide: {
                            type: 'image',
                            tag: 'div'
                        },
                    },
                    properties: {
                        p1: {
                            property: {
                                name: 'test',
                                control: {
                                    type: 'image-editor',
                                    focuspoint: true
                                }
                            },
                            directiveKey: 'slide',
                        },
                        p2: {
                            property: {
                                name: 'test',
                                control: {
                                    type: 'test',
                                },
                                dataType: 'doc-editable'
                            },
                            directiveKey: 'slide',
                        },
                    }
                }
            }
        };
        validator = new DirectivePropertiesValidator(definition);
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
        it('should pass on valid definition (other control type)', () => {
            definition.components.picture.properties.p1.property.control.type = 'interactive';
            const valid = validator.validate(reporter);
            expect(valid).toBeTruthy();
            expect(reporter).not.toHaveBeenCalled();
        });
        it('should not pass if directive key is not set', () => {
            delete definition.components.picture.properties.p1.directiveKey;
            const valid = validator.validate(reporter);
            expect(valid).toBeFalsy();
            expect(reporter).toHaveBeenCalledWith(`Property "test" of component "picture" must reference to a directive`);
        });
        it('should not pass if directive key is not set for directive dataType', () => {
            delete definition.components.picture.properties.p2.directiveKey;
            const valid = validator.validate(reporter);
            expect(valid).toBeFalsy();
            expect(reporter).toHaveBeenCalledWith(`Property "test" of component "picture" must reference to a directive because its dataType is a directive type`);
        });
    });
});