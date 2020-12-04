import * as path from 'path';
import { ComponentsValidator } from '../../lib/validators/components-validator';

describe('ComponentsValidator', () => {
    let definition: any;
    let error: jasmine.Spy;
    let validator: ComponentsValidator;
    let filePaths: Set<string>;
    beforeEach(() => {
        // valid definition (cut)
        definition = {
            components: {
                body: {
                    name: 'body',
                    label: 'Body Label',
                    icon: 'path1',
                },
                intro: {
                    name: 'intro',
                    label: { key: 'Intro Label {{0}}', values: { '0': 'replacement' } },
                    icon: 'path2',
                },
            },
        };
        filePaths = new Set<string>([
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
        error = jasmine.createSpy('error');
        validator = new ComponentsValidator(error, definition, filePaths);
    });
    describe('validate', () => {
        it('should pass on valid definition', () => {
            validator.validate();
            expect(error).not.toHaveBeenCalled();
        });
        it('should not pass if the names are not unique', () => {
            definition.components.body.name = 'intro';
            validator.validate();
            expect(error).toHaveBeenCalledWith(`Component "intro" is not unique`);
        });
        it('should not pass if reserved word is used as a name (__internal__)', () => {
            definition.components.body.name = '__internal__bla';
            validator.validate();
            expect(error).toHaveBeenCalledWith(`Component name "__internal__bla" is a reserved word`);
        });
        it('should not pass if there is no icon file', () => {
            definition.components.intro.icon = 'pathU';
            validator.validate();
            expect(error).toHaveBeenCalledWith(`Component "intro" icon missing "pathU"`);
        });
        it('should not pass if "design.css" is missing', () => {
            const file = path.normalize('./styles/design.css');
            filePaths.delete(file);
            validator.validate();
            expect(error).toHaveBeenCalledWith(`File "${file}" is missing`);
        });
        it('should not pass if "design.scss" is missing', () => {
            const file = path.normalize('./styles/design.scss');
            filePaths.delete(file);
            validator.validate();
            expect(error).toHaveBeenCalledWith(`File "${file}" is missing`);
        });
        it('should not pass if "_common.scss" is missing', () => {
            const file = path.normalize('./styles/_common.scss');
            filePaths.delete(file);
            validator.validate();
            expect(error).toHaveBeenCalledWith(`File "${file}" is missing`);
        });
    });
});
