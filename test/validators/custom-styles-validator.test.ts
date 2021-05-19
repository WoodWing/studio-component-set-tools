import * as path from 'path';
import { CustomStylesValidator } from '../../lib/validators/custom-styles-validator';

describe('CustomStylesValidator', () => {
    let definition: any;
    let error: jasmine.Spy;
    let validator: CustomStylesValidator;

    beforeEach(() => {
        // valid definition
        definition = {
            components: {},
        };
        error = jasmine.createSpy('error');
    });

    describe('validate', () => {
        it('should error when a styles/customStyles directory is found', async () => {
            validator = new CustomStylesValidator(
                error,
                definition,
                new Set<string>([path.normalize('styles/customStyles/apple-news.json')]),
            );
            await validator.validate();
            expect(error).toHaveBeenCalledWith(
                `The "styles" directory can't contain a directory called "customStyles".`,
            );
        });
    });
});
