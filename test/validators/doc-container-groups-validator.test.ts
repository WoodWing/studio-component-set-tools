import { DocContainerGroupsValidator } from '../../lib/validators/doc-container-groups-validator';

describe('DocContainerGroupsValidator', () => {
    let definition: any;
    let validator: DocContainerGroupsValidator;
    beforeEach(() => {
        // valid definition (cut)
        definition = {
            components: {
                'c1': {
                    component: {
                        name: 'c1',
                        restrictChildren: {
                            c2: { withContent: 'image' }
                        },
                        groups: {
                            'main': [
                                {
                                    name: 'g1',
                                    components: ['picture'],
                                },
                            ],
                        },
                    },
                    directives: {
                        main: {
                            type: 'container',
                        },
                    },
                },
                'picture': {
                    component: {},
                },
            },
        };

    });
    describe('validate', () => {
        let reporter: any;
        beforeEach(() => {
            reporter = jasmine.createSpy('reporter');
        });

        it('should validate a correct definition', () => {
            validator = new DocContainerGroupsValidator(definition);

            const valid = validator.validate(reporter);

            expect(reporter).not.toHaveBeenCalled();
            expect(valid).toBeTruthy();
        });

        it('should fail validation for invalid directive', () => {
            delete definition.components.c1.directives.main;

            validator = new DocContainerGroupsValidator(definition);

            const valid = validator.validate(reporter);

            expect(reporter).toHaveBeenCalledWith(`Component \"c1\" has a group for invalid directive \"main\"`);
            expect(valid).toBeFalsy();
        });

        it('should fail validation for invalid directive type', () => {
            definition.components.c1.directives.main.type = 'editable';

            validator = new DocContainerGroupsValidator(definition);

            const valid = validator.validate(reporter);

            expect(reporter).toHaveBeenCalledWith(`Component \"c1\" has a group for directive \"main\" with incompatible type \"editable\"`);
            expect(valid).toBeFalsy();
        });

        it('should fail validation if component misses', () => {
            // Remove the component
            delete definition.components.picture;

            validator = new DocContainerGroupsValidator(definition);

            const valid = validator.validate(reporter);

            expect(reporter).toHaveBeenCalledWith(`Component \"picture\" of group \"g1\" does not exist`);
            expect(valid).toBeFalsy();
        });
    });
});