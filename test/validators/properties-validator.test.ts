import { PropertiesValidator } from '../../lib/validators/properties-validator';

describe('PropertiesValidator', () => {
    let definition: any;
    let error: jasmine.Spy;
    let validator: PropertiesValidator;
    let fileList: Set<string>;
    beforeEach(() => {
        // valid definition (cut)
        definition = {
            version: '1.0.0',
            components: {
                c1: {
                    properties: [
                        {
                            name: 'p1',
                            control: {
                                type: 'text',
                            },
                        },
                        {
                            name: 'p2',
                            control: {
                                type: 'radio',
                                options: [
                                    { icon: 'path1' },
                                    { icon: 'path2' },
                                    { icon: 'path5' },
                                ],
                            },
                        },
                        {
                            name: 'p3',
                            control: {
                                type: 'media-properties'
                            },
                            dataType: 'doc-media'
                        }
                    ],
                },
                // Add another component with same property to test uniqueness validation passes correctly
                c2: {
                    properties: [
                        {
                            name: 'p1',
                            control: {
                                type: 'text',
                            },
                        },
                    ]
                },
            },
        };
        fileList = new Set<string>([
            'path1',
            'path2',
            'path3',
            'path4',
            'path5',
        ]);
        error = jasmine.createSpy('error');
        validator = new PropertiesValidator(error, definition, fileList);
    });
    describe('validate', () => {
        it('should pass on valid definition', () => {
            validator.validate();
            expect(error).not.toHaveBeenCalled();
        });
        it('should not pass if the names are not unique', () => {
            definition.components.c1.properties[0].name = 'p2';
            validator.validate();
            expect(error).toHaveBeenCalledWith(`Component property "p2" is not unique`);
        });
        it('should not pass if reserved word is used as a name', () => {
            definition.components.c1.properties[0].name = 'parallax';
            validator.validate();
            expect(error).toHaveBeenCalledWith(`Component property name "parallax" is a reserved word`);
        });
        it('should not pass if there is no icon file', () => {
            definition.components.c1.properties[1].control.options[0].icon = 'pathU';
            validator.validate();
            expect(error).toHaveBeenCalledWith(`Component properties "p2" icon missing "pathU"`);
        });
        it('should pass if parallax word is used as a name in version 1.4.0 or higher', () => {
            definition.version = '1.4.0';
            definition.components.c1.properties[0].name = 'parallax';
            validator.validate();
            expect(error).not.toHaveBeenCalled();
        });
        it('should pass if parallax word is used as a name in version 1.5.0 or higher', () => {
            definition.version = '1.5.0';
            definition.components.c1.properties[0].name = 'parallax';
            validator.validate();
            expect(error).not.toHaveBeenCalled();
        });
    });
});
