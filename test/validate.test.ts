import { validateFolder, getValidators, validatePackageSize } from '../lib/validate';
import * as chalk from 'chalk';

describe('validateFolder', () => {
    it('should pass on minimal sample', async () => {
        expect(await validateFolder('./test/resources/minimal-sample')).toBe(true);
    });

    it('should pass on restrict children sample', async () => {
        expect(await validateFolder('./test/resources/restrict-children-sample')).toBe(true);
    });

    it('should pass on minimal sample for version 1.4', async () => {
        expect(await validateFolder('./test/resources/minimal-sample-1_4_x')).toBe(true);
    });

    it('should pass on minimal sample for version 1.5', async () => {
        expect(await validateFolder('./test/resources/minimal-sample-1_5_x')).toBe(true);
    });

    it('should pass on minimal sample for version 1.6', async () => {
        expect(await validateFolder('./test/resources/minimal-sample-1_6_x')).toBe(true);
    });

    it('should pass on minimal sample for version 1.7', async () => {
        expect(await validateFolder('./test/resources/minimal-sample-1_7_x')).toBe(true);
    });

    it('should pass on minimal sample for version 1.8', async () => {
        expect(await validateFolder('./test/resources/minimal-sample-1_8_x')).toBe(true);
    });

    it('should pass on minimal sample for version 1.9.0-next', async () => {
        expect(await validateFolder('./test/resources/minimal-sample-next')).toBe(true);
    });

    it('should fail on sample with incorrect schema property', async () => {
        jest.spyOn(global.console, 'log');

        expect(await validateFolder('./test/resources/minimal-sample-invalid-comp-property')).toBe(false);
        expect(global.console.log).toHaveBeenCalledWith(
            chalk.redBright(`/components/0 should NOT have additional properties
{
    "additionalProperty": "invalid-component-property"
}
components-definition.json - line 7, column 8:
>         {
>             "name": "body",
>             "label": "Body Label",
>             "icon": "icons/component.svg",
>             "properties": [],
>             "invalid-component-property": "Invalid component property"
`),
        );
    });

    it('should fail on sample with components definition missing', async () => {
        jest.spyOn(global.console, 'log');

        expect(await validateFolder('./test/resources/missing-components-definition-sample')).toBe(false);
        expect(global.console.log).toHaveBeenCalledWith(
            chalk.redBright('Components definition file "components-definition.json" is missing'),
        );
    });

    it('should fail on sample with invalid json', async () => {
        jest.spyOn(global.console, 'log');

        expect(await validateFolder('./test/resources/invalid-definition-json-sample')).toBe(false);
        expect(global.console.log).toHaveBeenCalledWith(
            expect.stringMatching('Components definition file "components-definition.json" is not valid json:'),
        );
    });
});

describe('validatePackageSize', () => {
    it('should pass when the component set is within size limits', async () => {
        const errorMessages: string[] = [];
        validatePackageSize(99 * 1000 * 1000, (errorMessage) => errorMessages.push(errorMessage));
        expect(errorMessages.length).toBe(0);
    });
    it('should fail when the component set is too large', async () => {
        const errorMessages: string[] = [];
        validatePackageSize(101 * 1000 * 1000, (errorMessage) => errorMessages.push(errorMessage));
        expect(errorMessages.length).toBe(1);
        expect(errorMessages[0]).toMatch('At 101MB, the component set exceeds the total maximum size of 100MB.');
    });
});

describe('getValidators', () => {
    it('should return null for version < 1.0.0', () => {
        expect(getValidators('0.9.9', <any>null, <any>null, <any>null, <any>null, <any>null)).toBeNull();
    });
    it('should return amount of validators for version >= 1.0.0 and < 1.1.0', () => {
        const validators = getValidators('1.0.0', <any>null, <any>null, <any>null, <any>null, <any>null);
        expect(validators && validators.length).toEqual(25);
    });
    it('should return amount of validators for version >= 1.1.0', () => {
        const validators = getValidators('1.1.0', <any>null, <any>null, <any>null, <any>null, <any>null);
        expect(validators && validators.length).toEqual(28);
    });
    it('should return amount of validators for version >= 1.3.0', () => {
        const validators = getValidators('1.3.0', <any>null, <any>null, <any>null, <any>null, <any>null);
        expect(validators && validators.length).toEqual(29);
    });

    it('should return amount of validators for version >= 1.4.0', () => {
        const validators = getValidators('1.4.0', <any>null, <any>null, <any>null, <any>null, <any>null);
        expect(validators && validators.length).toEqual(28);
    });

    it('should return amount of validators for version >= 1.5.0', () => {
        const validators = getValidators('1.5.0', <any>null, <any>null, <any>null, <any>null, <any>null);
        expect(validators && validators.length).toEqual(28);
    });

    it('should return amount of validators for version >= 1.6.0', () => {
        const validators = getValidators('1.6.0', <any>null, <any>null, <any>null, <any>null, <any>null);
        expect(validators && validators.length).toEqual(29);
    });

    it('should return amount of validators for version >= 1.7.0', () => {
        const validators = getValidators('1.7.0', <any>null, <any>null, <any>null, <any>null, <any>null);
        expect(validators && validators.length).toEqual(29);
    });

    it('should return amount of validators for version >= 1.8.0-next', () => {
        const validators = getValidators('1.8.0-next', <any>null, <any>null, <any>null, <any>null, <any>null);
        expect(validators && validators.length).toEqual(29);
    });
});
