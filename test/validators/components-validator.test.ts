import * as path from 'path';
import { ComponentsValidator } from '../../lib/validators/components-validator';

describe('ComponentsValidator', () => {
    let definition: any;
    let validator: ComponentsValidator;
    let fileList: Set<string>;
    beforeEach(() => {
        // valid definition (cut)
        definition = {
            components: [
                {
                    name: 'body',
                    label: 'Body Label',
                    icon: 'path1',
                },
                {
                    name: 'intro',
                    label: { key: 'Intro Label {{0}}', values: {'0': 'replacement'} },
                    icon: 'path2',
                }
            ]
        };
        fileList = new Set<string>([
            'path1',
            'path2',
            path.normalize('./templates/html/body.html'),
            path.normalize('./templates/html/intro.html'),
            path.normalize('./styles/_body.scss'),
            path.normalize('./styles/_intro.scss'),
            path.normalize('./styles/_common.scss'),
            path.normalize('./styles/design.scss'),
            path.normalize('./styles/design.css'),
        ]);
        validator = new ComponentsValidator(fileList, definition);
    });
    describe('validate', () => {
        let reporter: any;
        beforeEach(() => {
            reporter = jasmine.createSpy('reporter');
        });
        it('should pass on valid definition', () => {
            const valid = validator.validate(reporter);
            expect(valid).toBeTruthy();
            expect(reporter).not.toHaveBeenCalled();
        });
        it('should not pass if the names are not unique', () => {
            definition.components[0].name = 'intro';
            const valid = validator.validate(reporter);
            expect(valid).toBeFalsy();
            expect(reporter).toHaveBeenCalledWith(`Component "intro" is not unique`);
        });
        it('should not pass if reserved word is used as a name (__internal__)', () => {
            definition.components[0].name = '__internal__bla';
            const valid = validator.validate(reporter);
            expect(valid).toBeFalsy();
            expect(reporter).toHaveBeenCalledWith(`Component name "__internal__bla" is a reserved word`);
        });
        it('should not pass if there is no icon file', () => {
            definition.components[1].icon = 'pathU';
            const valid = validator.validate(reporter);
            expect(valid).toBeFalsy();
            expect(reporter).toHaveBeenCalledWith(`Component "intro" icon missing "pathU"`);
        });
        it('should not pass if "design.css" is missing', () => {
            const file = path.normalize('./styles/design.css');
            fileList.delete(file);
            const valid = validator.validate(reporter);
            expect(valid).toBeFalsy();
            expect(reporter).toHaveBeenCalledWith(`File "${file}" is missing`);
        });
        it('should not pass if "design.scss" is missing', () => {
            const file = path.normalize('./styles/design.scss');
            fileList.delete(file);
            const valid = validator.validate(reporter);
            expect(valid).toBeFalsy();
            expect(reporter).toHaveBeenCalledWith(`File "${file}" is missing`);
        });
        it('should not pass if "_common.scss" is missing', () => {
            const file = path.normalize('./styles/_common.scss');
            fileList.delete(file);
            const valid = validator.validate(reporter);
            expect(valid).toBeFalsy();
            expect(reporter).toHaveBeenCalledWith(`File "${file}" is missing`);
        });
    });
});