import { validateFolder, getValidators } from '../lib/index';
import * as colors from 'colors/safe';

describe('validateFolder', () => {
    it('should pass on minimal sample', async () => {
        expect(await validateFolder('./test/resources/minimal-sample')).toBe(true);
    });
    it('should pass on minimal sample for version 1.4', async () => {
        expect(await validateFolder('./test/resources/minimal-sample-1_4_x')).toBe(true);
    });

    it('should fail on sample with components definition missing', async () => {
        spyOn(global.console, 'log');

        expect(await validateFolder('./test/resources/missing-components-definition-sample')).toBe(false);
        expect(global.console.log).toHaveBeenCalledWith(
            colors.red('Components definition file "components-definition.json" is missing'),
        );
    });

    it('should fail on sample with invalid json', async () => {
        spyOn(global.console, 'log');

        expect(await validateFolder('./test/resources/invalid-definition-json-sample')).toBe(false);
        expect(global.console.log).toHaveBeenCalledWith(
            expect.stringMatching('Components definition file "components-definition.json" is not valid json:'),
        );
    });
});

describe('getValidators', () => {
    it('should return null for version < 1.0.0', () => {
        expect(getValidators('0.9.9', <any>null, <any>null, <any>null, <any>null)).toBeNull();
    });
    it('should return amount of validators for version >= 1.0.0 and < 1.1.0', () => {
        const validators = getValidators('1.0.0', <any>null, <any>null, <any>null, <any>null);
        expect(validators && validators.length).toEqual(22);
    });
    it('should return amount of validators for version >= 1.1.0', () => {
        const validators = getValidators('1.1.0', <any>null, <any>null, <any>null, <any>null);
        expect(validators && validators.length).toEqual(25);
    });
    it('should return amount of validators for version >= 1.3.0', () => {
        const validators = getValidators('1.3.0', <any>null, <any>null, <any>null, <any>null);
        expect(validators && validators.length).toEqual(26);
    });
});
