import { GroupsValidator } from '../../lib/validators/groups-validator';

describe('GroupsValidator', () => {
    let error: jest.Mock, definition: any;
    let validator: GroupsValidator;
    beforeEach(() => {
        // valid definition (cut)
        definition = {
            components: {
                picture: {
                    name: 'picture',
                    directives: {
                        slide: {
                            type: 'image',
                            tag: 'div',
                        },
                    },
                    properties: {
                        p1: {
                            property: {
                                name: 'test',
                                control: {
                                    type: 'image-editor',
                                    focuspoint: true,
                                },
                            },
                            directiveKey: 'slide',
                        },
                    },
                },
            },
            groups: [
                {
                    name: 'g1',
                    components: ['picture'],
                },
            ],
        };
        error = jest.fn();
        validator = new GroupsValidator(error, definition);
    });
    describe('validate', () => {
        it('should pass on valid definition', () => {
            validator.validate();
            expect(error).not.toHaveBeenCalled();
        });
        it('should not pass if a group name is not unique', () => {
            definition.groups.push({
                name: 'g1',
                components: ['picture'],
            });
            validator.validate();
            expect(error).toHaveBeenCalledWith(`Component group "g1" is not unique`);
        });
        it('should not pass if a group contains non existing component', () => {
            definition.groups.push({
                name: 'g2',
                components: ['none'],
            });
            validator.validate();
            expect(error).toHaveBeenCalledWith(`Component "none" of group "g2" does not exist`);
        });

        it('should not pass if a group with integrationLogo is missing properties', () => {
            definition.groups.push({
                name: 'g2',
                components: ['picture'],
                integrationLogo: {},
            });
            validator.validate();
            expect(error).toHaveBeenCalledWith(
                `Component group "g2" is missing mandatory property "logoPath" in "integrationLogo"`,
            );
        });

        it('should not pass if a group with integrationLogo properties have wrong type', () => {
            definition.groups.push({
                name: 'g2',
                components: ['picture'],
                integrationLogo: { logoPath: 123 },
            });
            definition.groups.push({
                name: 'g3',
                components: ['picture'],
                integrationLogo: { logoPath: 'path', link: {} },
            });
            validator.validate();
            expect(error).toHaveBeenCalledWith(
                `Component group "g3" property "link" in "integrationLogo" should be of type string`,
            );
        });
    });
});
