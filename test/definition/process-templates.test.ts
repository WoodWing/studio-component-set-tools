import * as AdmZip from 'adm-zip';
import * as path from 'path';
import { processTemplates } from '../../lib/definition/process-templates';
import { ComponentsDefinition } from '../../lib/models';

describe('Process Templates', () => {
    let zip: AdmZip;
    let definition: ComponentsDefinition;
    beforeAll(async () => {
        zip = new AdmZip(path.resolve(__dirname, '../resources/minimal-component-set.zip'));
        definition = JSON.parse(zip.getEntry('components-definition.json').getData().toString());
    });

    describe('processTemplates', () => {
        it('should add the renditions to the definition', async () => {
            await processTemplates(async (relativePath: string) => {
                const entry = zip.getEntry(relativePath);
                return entry ? entry.getData().toString() : undefined;
            }, definition);

            expect(definition.components).toEqual([
                {
                    countStatistics: true,
                    icon: 'icons/components/body.svg',
                    label: {
                        key: 'COMPONENT_BODY_LABEL',
                    },
                    name: 'body',
                    properties: [],
                    renditions: {
                        html: `<p class="text body" doc-editable="text">\r\n  {{ COMPONENT_BODY_LABEL }}\r\n</p>`,
                        psv: undefined,
                    },
                },
            ]);
        });

        it(`should add undefined when the html rendition couldn't be found`, async () => {
            await processTemplates(async (_relativePath: string) => {
                return undefined;
            }, definition);

            expect(definition.components).toEqual([
                {
                    countStatistics: true,
                    icon: 'icons/components/body.svg',
                    label: {
                        key: 'COMPONENT_BODY_LABEL',
                    },
                    name: 'body',
                    properties: [],
                    renditions: {
                        html: undefined,
                        psv: undefined,
                    },
                },
            ]);
        });
    });
});
