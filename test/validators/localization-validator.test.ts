import { LocalizationValidator } from '../../lib/validators/localization-validator';

describe('LocalizationValidator', () => {
    let definition: any;
    let error: jasmine.Spy;
    let validator: LocalizationValidator;
    let filePaths: Set<string>;
    let getFileContent: any;
    let fileContent: { [path: string]: string };

    beforeEach(() => {
        // valid definition
        definition = {
            components: {},
        };
        filePaths = new Set();
        fileContent = {};
        getFileContent = jasmine.createSpy('getFileContent').and.callFake(async (path) => {
            return fileContent[path];
        });
        error = jasmine.createSpy('error');
    });

    function mockValidJsonContent() {
        return JSON.stringify({});
    }

    describe('validate', () => {
        it('should pass when there are no localization files', async () => {
            validator = new LocalizationValidator(error, definition, filePaths, getFileContent);

            await validator.validate();
            expect(error).not.toHaveBeenCalled();
        });

        it('should skip non json files', async () => {
            filePaths = new Set([
                'localization/some-file',
            ]);

            validator = new LocalizationValidator(error, definition, filePaths, getFileContent);

            await validator.validate();
            expect(error).not.toHaveBeenCalled();
        });

        it('should pass for all supported localization files', async () => {
            filePaths = new Set([
                'localization/csCZ.json',
                'localization/deDE.json',
                'localization/enUS.json',
                'localization/esES.json',
                'localization/frFR.json',
                'localization/itIT.json',
                'localization/jaJP.json',
                'localization/koKR.json',
                'localization/nlNL.json',
                'localization/plPL.json',
                'localization/ptBR.json',
                'localization/ruRU.json',
                'localization/zhCN.json',
                'localization/zhTW.json',
                'localization/fiFI.json',
            ]);
            fileContent = {
                'localization/csCZ.json': mockValidJsonContent(),
                'localization/deDE.json': mockValidJsonContent(),
                'localization/enUS.json': mockValidJsonContent(),
                'localization/esES.json': mockValidJsonContent(),
                'localization/frFR.json': mockValidJsonContent(),
                'localization/itIT.json': mockValidJsonContent(),
                'localization/jaJP.json': mockValidJsonContent(),
                'localization/koKR.json': mockValidJsonContent(),
                'localization/nlNL.json': mockValidJsonContent(),
                'localization/plPL.json': mockValidJsonContent(),
                'localization/ptBR.json': mockValidJsonContent(),
                'localization/ruRU.json': mockValidJsonContent(),
                'localization/zhCN.json': mockValidJsonContent(),
                'localization/zhTW.json': mockValidJsonContent(),
                'localization/fiFI.json': mockValidJsonContent(),
            };

            validator = new LocalizationValidator(error, definition, filePaths, getFileContent);

            await validator.validate();
            expect(error).not.toHaveBeenCalled();
        });

        it('should complain about invalid language', async () => {
            filePaths = new Set([
                'localization/invalid.json',
            ]);

            validator = new LocalizationValidator(error, definition, filePaths, getFileContent);

            await validator.validate();
            expect(error).toHaveBeenCalledWith(expect.stringMatching(
                /^Localization file "localization\/invalid.json" is not a supported language. Supported languages:/));
        });

        it('should complain about invalid json', async () => {
            filePaths = new Set([
                'localization/enUS.json',
            ]);
            fileContent = {
                'localization/enUS.json': '{ "bla": "bla", }',
            };

            validator = new LocalizationValidator(error, definition, filePaths, getFileContent);

            await validator.validate();
            expect(error).toHaveBeenCalledWith(expect.stringMatching(
                /^Localization file "localization\/enUS.json" is not valid json:/));
        });
    });
});
