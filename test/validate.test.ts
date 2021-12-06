import * as path from 'path';
import { validate, validateFolder, getValidators, validatePackageSize, readFile, getSize } from '../lib/validate';
import * as chalk from 'chalk';
import { listFilesRelativeToFolder } from '../lib/util/files';
import { GetFileContentOptionsType } from '../lib/models';

describe('validateFolder', () => {
    function createValidator(fileCustomiser: (filePath: string, content: string) => string) {
        const errorSpy = jest.fn();

        async function validateFolderWithCustomiser(folderPath: string): Promise<boolean> {
            const files = await listFilesRelativeToFolder(folderPath);
            const getFileContent = async (filePath: string, options?: GetFileContentOptionsType) => {
                const content = await readFile(path.resolve(folderPath, filePath), options);
                return fileCustomiser(filePath, Buffer.isBuffer(content) ? content.toString('utf-8') : content);
            };
            const getFileSize = async (filePath: string) => getSize(path.resolve(folderPath, filePath));
            return validate(files, getFileContent, getFileSize, (errorMessage) => {
                errorSpy(errorMessage);
            });
        }

        return { validateFolderWithCustomiser: validateFolderWithCustomiser, errorSpy: errorSpy };
    }

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

    it('should fail on invalid character styles', async () => {
        const { validateFolderWithCustomiser, errorSpy } = createValidator((filePath: string, content: string) => {
            if (filePath === 'components-definition.json') {
                const componentsDefinition = JSON.parse(content);
                componentsDefinition.characterStyles = [
                    {
                        label: 'Invalid character style',
                        id: 'invalid-prefix',
                    },
                ];
                return JSON.stringify(componentsDefinition);
            }
            return content;
        });

        expect(await validateFolderWithCustomiser('./test/resources/minimal-sample-next')).toBe(false);

        expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('/characterStyles/0/id should match pattern'));
    });

    it('should fail on invalid object-select property', async () => {
        const { validateFolderWithCustomiser, errorSpy } = createValidator((filePath: string, content: string) => {
            if (filePath === 'components-definition.json') {
                const componentsDefinition = JSON.parse(content);
                delete componentsDefinition.componentProperties.find((prop: any) => prop.name === 'background-image')
                    .control.source;
                return JSON.stringify(componentsDefinition);
            }
            return content;
        });

        expect(await validateFolderWithCustomiser('./test/resources/minimal-sample-next')).toBe(false);

        expect(errorSpy).toHaveBeenCalled();
    });

    it('should fail on sample with incorrect schema property', async () => {
        jest.spyOn(global.console, 'log').mockReturnValueOnce();

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
        jest.spyOn(global.console, 'log').mockReturnValueOnce();

        expect(await validateFolder('./test/resources/missing-components-definition-sample')).toBe(false);
        expect(global.console.log).toHaveBeenCalledWith(
            chalk.redBright('Components definition file "components-definition.json" is missing'),
        );
    });

    it('should fail on sample with invalid json', async () => {
        jest.spyOn(global.console, 'log').mockReturnValueOnce();

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
    function getValidatorsForVersion(version: string) {
        return getValidators(version, <any>null, <any>null, <any>null, <any>null, <any>null);
    }

    it('should return null for version < 1.0.0', () => {
        expect(getValidatorsForVersion('0.9.9')).toBeNull();
    });
    it('should return amount of validators for version >= 1.0.0 and < 1.1.0', () => {
        const validators = getValidatorsForVersion('1.0.0');
        expect(validators && validators.length).toEqual(25);
    });
    it('should return amount of validators for version >= 1.1.0', () => {
        const validators = getValidatorsForVersion('1.1.0');
        expect(validators && validators.length).toEqual(28);
    });
    it('should return amount of validators for version >= 1.3.0', () => {
        const validators = getValidatorsForVersion('1.3.0');
        expect(validators && validators.length).toEqual(29);
    });

    it('should return amount of validators for version >= 1.4.0', () => {
        const validators = getValidatorsForVersion('1.4.0');
        expect(validators && validators.length).toEqual(28);
    });

    it('should return amount of validators for version >= 1.5.0', () => {
        const validators = getValidatorsForVersion('1.5.0');
        expect(validators && validators.length).toEqual(28);
    });

    it('should return amount of validators for version >= 1.6.0', () => {
        const validators = getValidatorsForVersion('1.6.0');
        expect(validators && validators.length).toEqual(29);
    });

    it('should return amount of validators for version >= 1.7.0', () => {
        const validators = getValidatorsForVersion('1.7.0');
        expect(validators && validators.length).toEqual(29);
    });

    it('should return amount of validators for version >= 1.8.0', () => {
        const validators = getValidatorsForVersion('1.8.0');
        expect(validators && validators.length).toEqual(29);
    });

    it('should return amount of validators for version >= 1.9.0-next', () => {
        const validators = getValidatorsForVersion('1.9.0-next');
        expect(validators && validators.length).toEqual(29);
    });
});
