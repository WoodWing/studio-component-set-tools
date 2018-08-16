import { validateFolder, getValidators } from '../lib/index';

describe('validateFolder', () => {
    it('Should pass on minimal sample', async () => {
        expect(await validateFolder('./test/resources/minimal-sample')).toBe(true);
    });
});

describe('getValidators', () => {
    it('should return null for version < 1.0.0', () => {
        expect(getValidators('0.9.9', <any>null, <any>null, <any>null, <any>null)).toBeNull();
    });
    it('should return amount of validators for version >= 1.0.0 and < 1.1.0', () => {
        const validators = getValidators('1.0.0', <any>null, <any>null, <any>null, <any>null);
        expect(validators && validators.length).toEqual(21);
    });
    it('should return amount of validators for version >= 1.1.0 and < 1.2.0', () => {
        const validators = getValidators('1.1.0', <any>null, <any>null, <any>null, <any>null);
        expect(validators && validators.length).toEqual(22);
    });
    it('should return amount of validators for version >= 1.2.0', () => {
        const validators = getValidators('1.2.0', <any>null, <any>null, <any>null, <any>null);
        expect(validators && validators.length).toEqual(23);
    });
});
