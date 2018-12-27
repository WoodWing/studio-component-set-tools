import { DocContainerGroupsValidator } from '../../lib/validators/doc-container-groups-validator';

describe('DocContainerGroupsValidator', () => {
    let definition: any;
    let error: jasmine.Spy;
    let validator: DocContainerGroupsValidator;
    beforeEach(() => {
        // valid definition (cut)
        definition = {
            components: {
                'c1': {
                    name: 'c1',
                    restrictChildren: {
                        c2: { withContent: 'image' }
                    },
                    directiveOptions: {
                        main: {
                            groups: [
                                {
                                    name: 'g1',
                                    components: ['picture'],
                                },
                            ],
                        }
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
        error = jasmine.createSpy('error');
    });
    describe('validate', () => {
        it('should validate a correct definition', () => {
            validator = new DocContainerGroupsValidator(error, definition);

            validator.validate();

            expect(error).not.toHaveBeenCalled();
        });

        it('should fail validation for invalid directive', () => {
            delete definition.components.c1.directives.main;

            validator = new DocContainerGroupsValidator(error, definition);

            validator.validate();

            expect(error).toHaveBeenCalledWith(`Component \"c1\" has a group for invalid directive \"main\"`);
        });

        it('should fail validation for invalid directive type', () => {
            definition.components.c1.directives.main.type = 'editable';

            validator = new DocContainerGroupsValidator(error, definition);

            validator.validate();

            expect(error).toHaveBeenCalledWith(`Component \"c1\" has a group for directive \"main\" with incompatible type \"editable\". Only type \"container\" is allowed.`);
        });

        it('should fail validation if component misses', () => {
            // Remove the component
            delete definition.components.picture;

            validator = new DocContainerGroupsValidator(error, definition);

            validator.validate();

            expect(error).toHaveBeenCalledWith(`Component \"picture\" of group \"g1\" does not exist`);
        });
    });
});
