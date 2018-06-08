import { PropertiesValidator } from '../../lib/validators/properties-validator';

describe('PropertiesValidator', () => {
    let definition;
    let validator: PropertiesValidator;
    let fileList: Set<string>;
    beforeEach(() => {
        // valid definition (cut)
        definition = {
            componentProperties: [
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
            ]
        };
        fileList = new Set<string>([
            'path1',
            'path2',
            'path3',
            'path4',
            'path5',
        ]);
        validator = new PropertiesValidator(fileList, definition);
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
        it('should not pass if the names are not unique', () => {
            definition.componentProperties[0].name = 'p2';
            const valid = validator.validate(reporter);
            expect(valid).toBeFalsy();
            expect(reporter).toHaveBeenCalledWith(`Component property "p2" is not unique`);
        });
        it('should not pass if reserved word is used as a name', () => {
            definition.componentProperties[0].name = 'parallax';
            const valid = validator.validate(reporter);
            expect(valid).toBeFalsy();
            expect(reporter).toHaveBeenCalledWith(`Component property name "parallax" is a reserved word`);
        });
        it('should not pass if there is no icon file', () => {
            definition.componentProperties[1].control.options[0].icon = 'pathU';
            const valid = validator.validate(reporter);
            expect(valid).toBeFalsy();
            expect(reporter).toHaveBeenCalledWith(`Component properties "p2" icon missing "pathU"`);
        });
    });
});