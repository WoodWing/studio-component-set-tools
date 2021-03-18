import * as AdmZip from 'adm-zip';
import * as path from 'path';
import { processInfo, processFields } from '../../lib/definition/component-info';
import { processTemplates } from '../../lib/definition/process-templates';
import { ComponentsDefinition } from '../../lib/models';

describe('Component Info', () => {
    let zip: AdmZip;
    let definition: ComponentsDefinition;
    beforeEach(async () => {
        zip = new AdmZip(path.resolve(__dirname, '../resources/minimal-component-set.zip'));
        definition = JSON.parse(zip.getEntry('components-definition.json').getData().toString());
    });

    async function processTemplatesFromZip() {
        await processTemplates(async (relativePath: string) => {
            const entry = zip.getEntry(relativePath);
            return entry ? entry.getData().toString() : undefined;
        }, definition);
    }

    async function processEmptyTemplates() {
        await processTemplates(async (_relativePath: string) => {
            return '<div></div>';
        }, definition);
    }

    describe('processInfo', () => {
        it('should return the component set information data', async () => {
            await processTemplatesFromZip();

            await expect(processInfo(definition)).toEqual({
                components: {
                    body: {
                        fields: [
                            {
                                contentKey: 'text',
                                type: 'editable',
                            },
                        ],
                    },
                },
            });
        });

        it('should return the component set info for empty templates', async () => {
            await processEmptyTemplates();

            expect(processInfo(definition)).toEqual({
                components: {
                    body: {
                        fields: [],
                    },
                },
            });
        });
    });

    describe('processFields', () => {
        it('should return the component set field data', async () => {
            await processTemplatesFromZip();

            expect(processFields(definition)).toEqual({
                body: {
                    fields: [
                        {
                            contentKey: 'text',
                            type: 'editable',
                        },
                    ],
                    iconUrl: 'icons/components/body.svg',
                    label: {
                        key: 'COMPONENT_BODY_LABEL',
                    },
                },
            });
        });

        it('should return the component set field data for empty templates', async () => {
            await processEmptyTemplates();

            expect(processFields(definition)).toEqual({
                components: {
                    body: {
                        fields: [],
                        iconUrl: 'icons/components/body.svg',
                        label: {
                            key: 'COMPONENT_BODY_LABEL',
                        },
                    },
                },
            });
        });
    });
});
