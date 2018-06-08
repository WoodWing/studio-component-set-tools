import { GroupsValidator } from '../../lib/validators/groups-validator';

describe('GroupsValidator', () => {
    let definition;
    let validator: GroupsValidator;
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
                        }
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
                        }
                    }
                }
            },
            groups: {
                g1: {
                    name: 'g1',
                    components: ['picture']
                }
            }
        };
        validator = new GroupsValidator(definition);
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
        it('should not pass if a group contains non existing component', () => {
            definition.groups.g2 = {
                name: 'g2',
                components: ['none']
            };
            const valid = validator.validate(reporter);
            expect(valid).toBeFalsy();
            expect(reporter).toHaveBeenCalledWith(`Component "none" of group "g2" does not exist`);
        });
    });
});