import * as path from 'path';
import { CustomStylesValidator } from '../../lib/validators/custom-styles-validator';

describe('CustomStylesValidator', () => {
    let definition: any;
    let error: jasmine.Spy;
    let validator: CustomStylesValidator;

    beforeEach(() => {
        // valid definition
        definition = {
            customStyles: [],
        };
        error = jasmine.createSpy('error');
    });

    describe('validate', () => {
        it('should do nothing when no custom styles are given', async () => {
            delete definition.customStyles;
            validator = new CustomStylesValidator(error, definition, new Set());
            await validator.validate();
            expect(error).not.toHaveBeenCalled();
        });

        it('should do nothing when no custom styles are given', async () => {
            validator = new CustomStylesValidator(error, definition, new Set());
            await validator.validate();
            expect(error).not.toHaveBeenCalled();
        });

        it(`should throw no errors when the style doesn't have a default defined`, async () => {
            definition.customStyles.push({
                key: 'test-style',
                label: 'Test Style',
                type: 'JSON',
            });
            validator = new CustomStylesValidator(error, definition, new Set());
            await validator.validate();
            expect(error).not.toHaveBeenCalled();
        });

        it(`should throw now errors when the default file is available`, async () => {
            definition.customStyles.push({
                key: 'test-style',
                label: 'Test Style',
                type: 'JSON',
                default: './styles/default-custom-styles/existing-file.json',
            });
            validator = new CustomStylesValidator(
                error,
                definition,
                new Set([path.normalize('styles/default-custom-styles/existing-file.json')]),
            );
            await validator.validate();
            expect(error).not.toHaveBeenCalled();
        });

        it(`should error when the default file isn't available`, async () => {
            definition.customStyles.push({
                key: 'test-style',
                label: 'Test Style',
                type: 'JSON',
                default: 'non-existing-file.json',
            });
            validator = new CustomStylesValidator(error, definition, new Set());
            await validator.validate();
            expect(error).toHaveBeenCalledWith('The default file for custom style "Test Style" does not exist');
        });

        it('should error when a styles/customStyles directory is found', async () => {
            delete definition.customStyles;
            validator = new CustomStylesValidator(
                error,
                definition,
                new Set([path.normalize('styles/customStyles/apple-news.json')]),
            );
            await validator.validate();
            expect(error).toHaveBeenCalledWith(
                `The "styles" directory can't contain a directory called "customStyles".`,
            );
        });
    });
});
