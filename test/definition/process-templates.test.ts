import * as fs from 'fs';
import * as path from 'path';
import { processTemplates } from '../../lib/definition/process-templates';
import { ComponentsDefinition } from '../../lib/models';

describe('Process Templates', () => {
    const componentPath = path.resolve('./test/resources/minimal-sample');
    let definition: ComponentsDefinition;
    beforeEach(async () => {
        definition = JSON.parse(
            (await fs.promises.readFile(path.join(componentPath, 'components-definition.json'))).toString(),
        );
    });

    describe('processTemplates', () => {
        it('should add the renditions to the definition', async () => {
            await processTemplates(async (relativePath: string) => {
                const file = path.join(componentPath, relativePath);
                try {
                    return (await fs.promises.readFile(file)).toString();
                } catch (e) {
                    return;
                }
            }, definition);

            expect(definition.components).toEqual([
                {
                    countStatistics: true,
                    icon: 'icons/component.svg',
                    label: 'Body Label',
                    name: 'body',
                    properties: ['selectProperty'],
                    renditions: {
                        html: `<p class="body" doc-editable="text">Placeholder text</p>\n`,
                        psv: '',
                    },
                },
                {
                    icon: 'icons/component.svg',
                    label: {
                        key: 'INTRO_KEY',
                    },
                    name: 'intro',
                    properties: [{ control: { type: 'header' }, label: 'header' }, 'checkboxProperty'],
                    renditions: {
                        html: `<p class="intro" doc-editable="text">Placeholder text</p>\n`,
                        psv: '',
                    },
                },
            ]);
        });

        it(`should add an empty string when the html rendition couldn't be found`, async () => {
            await processTemplates(async (_relativePath: string) => {
                return undefined;
            }, definition);

            expect(definition.components).toEqual([
                {
                    countStatistics: true,
                    icon: 'icons/component.svg',
                    label: 'Body Label',
                    name: 'body',
                    properties: ['selectProperty'],
                    renditions: {
                        html: '',
                        psv: '',
                    },
                },
                {
                    icon: 'icons/component.svg',
                    label: {
                        key: 'INTRO_KEY',
                    },
                    name: 'intro',
                    properties: [{ control: { type: 'header' }, label: 'header' }, 'checkboxProperty'],
                    renditions: {
                        html: '',
                        psv: '',
                    },
                },
            ]);
        });
    });
});
