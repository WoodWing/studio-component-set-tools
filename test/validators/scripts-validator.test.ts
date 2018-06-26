import * as path from 'path';
import { ScriptsValidator } from '../../lib/validators/scripts-validator';

describe('ScriptsValidator', () => {
    describe('validate', () => {
        let reporter: jasmine.Spy;
        beforeEach(() => {
            reporter = jasmine.createSpy('reporter');
        });
        it('should pass on valid definition', () => {
            const validator = new ScriptsValidator(new Set<string>([
                path.normalize('scripts/vendor.js'),
            ]), <any>{
                scripts: ['scripts/vendor.js'],
            });
            const valid = validator.validate(reporter);
            expect(reporter).not.toHaveBeenCalled();
            expect(valid).toBeTruthy();
        });
        it('should pass when scripts is missing', () => {
            const validator = new ScriptsValidator(new Set<string>([]), <any>{});
            const valid = validator.validate(reporter);
            expect(reporter).not.toHaveBeenCalled();
            expect(valid).toBeTruthy();
        });
        it('should not pass if "vendor.js" is missing', () => {
            const validator = new ScriptsValidator(new Set<string>([
            ]), <any>{
                scripts: ['scripts/vendor.js'],
            });

            const valid = validator.validate(reporter);
            expect(reporter).toHaveBeenCalledWith(`Script "scripts/vendor.js" does not exist`);
            expect(valid).toBeFalsy();
        });
    });
});