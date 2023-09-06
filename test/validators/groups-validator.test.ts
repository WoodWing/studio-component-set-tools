import { GroupsValidator } from '../../lib/validators/groups-validator';

describe('GroupsValidator', () => {
    let error: jest.Mock, definition: any;
    let validator: GroupsValidator;
    let filePaths: Set<string>;

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
                {
                    name: 'g2',
                    components: ['picture'],
                    logo: {
                        icon: 'path-to-icon',
                        link: 'https://www.woodwing.com',
                    },
                },
            ],
        };
        filePaths = new Set<string>(['path-to-icon']);
        error = jest.fn();
        validator = new GroupsValidator(error, definition, filePaths);
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

        it('should not pass if there is no icon file', () => {
            definition.groups[1].logo.icon = 'non-existent-path';
            validator.validate();
            expect(error).toHaveBeenCalledWith(`Group "g2" logo icon missing: "non-existent-path"`);
        });
    });
});
