import * as path from 'path';
import { ScriptsValidator } from '../../lib/validators/scripts-validator';

describe('ScriptsValidator', () => {
    let error: jasmine.Spy;
    beforeEach(() => {
        error = jasmine.createSpy('error');
    });
    describe('validate', () => {
        it('should pass on valid definition', () => {
            const validator = new ScriptsValidator(error, new Set<string>([
                path.normalize('scripts/vendor.js'),
            ]), <any>{
                scripts: ['scripts/vendor.js'],
            });
            validator.validate();
            expect(error).not.toHaveBeenCalled();
        });
        it('should pass when scripts is missing', () => {
            const validator = new ScriptsValidator(error, new Set<string>([]), <any>{});
            validator.validate();
            expect(error).not.toHaveBeenCalled();
        });
        it('should not pass if "vendor.js" is missing', () => {
            const validator = new ScriptsValidator(error, new Set<string>([
            ]), <any>{
                scripts: ['scripts/vendor.js'],
            });
            validator.validate();
            expect(error).toHaveBeenCalledWith(`Script "scripts/vendor.js" does not exist`);
        });
    });
});