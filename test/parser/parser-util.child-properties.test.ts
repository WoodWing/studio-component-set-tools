import * as path from 'path';
import { parseDefinition } from '../../lib/parser';
import { ComponentsDefinition, DirectiveType } from '../../lib/models';
import { loadRenditions } from '../../lib/renditions';
import { deepFreeze } from '../../lib/util/freeze';

describe('Parser utils child properties', () => {
    let getFileContent: (filePath: string) => Promise<string>;
    let html: { [s: string]: string };
    let expectedComponentSet: any;

    function createComponentsDefinition(init?: (componentsDefinition: any) => void): ComponentsDefinition {
        const definition = {
            name: 'child properties',
            description: 'Description',
            version: '1.0.0',
            defaultComponentOnEnter: 'body',
            components: [
                {
                    name: 'body',
                    label: 'Body Label',
                    icon: 'icons/component.svg',
                    properties: ['conditionalProperty'],
                    countStatistics: true,
                },
            ],
            groups: [
                {
                    label: 'Minimal',
                    name: 'minimal',
                    components: ['body'],
                },
            ],
            componentProperties: [
                {
                    name: 'selectProperty',
                    label: 'Select property sample',
                    control: {
                        type: 'select',
                        options: [
                            {
                                caption: 'Default',
                            },
                            {
                                caption: 'Option 1',
                                value: '_option1',
                            },
                        ],
                    },
                    dataType: 'data',
                },
                {
                    name: 'checkboxProperty',
                    label: 'Checkbox property sample',
                    control: {
                        type: 'checkbox',
                        value: '_valueWhenOn',
                    },
                    dataType: 'styles',
                },
                {
                    name: 'conditionalProperty',
                    label: 'Conditional property sample',
                    control: {
                        type: 'select',
                        options: [
                            {
                                caption: 'No value',
                            },
                            {
                                caption: 'Value 1',
                                value: 'value1',
                            },
                            {
                                caption: 'Value 2',
                                value: 'value2',
                            },
                            {
                                caption: 'Value 3',
                                value: 'value3',
                            },
                        ],
                    },
                    defaultValue: 'value1',
                    dataType: 'data',
                    childProperties: [
                        {
                            matchType: 'exact-value',
                            properties: ['selectProperty'],
                        },
                        {
                            matchType: 'exact-value',
                            matchExpression: 'value1',
                            properties: ['checkboxProperty'],
                        },
                        {
                            matchType: 'exact-value',
                            matchExpression: 'value2',
                            properties: ['selectProperty', 'checkboxProperty'],
                        },
                    ],
                },
            ],
            conversionRules: {},
            shortcuts: {},
        };
        if (init) {
            init(definition);
        }
        return deepFreeze(definition as ComponentsDefinition);
    }

    beforeEach(() => {
        html = {
            body: `<p doc-editable="text"></p>`,
        };
        getFileContent = (filePath: string): Promise<string> => {
            const filename = path.basename(filePath).split('.').shift();
            if (!filename || !(filename in html)) {
                throw new Error(`Unknown filename "${filename}", cannot be handled`);
            }
            return Promise.resolve(html[filename]);
        };
        expectedComponentSet = {
            name: 'child properties',
            description: 'Description',
            version: '1.0.0',
            components: {
                body: {
                    name: 'body',
                    label: 'Body Label',
                    icon: 'icons/component.svg',
                    countStatistics: true,
                    directives: {
                        text: {
                            type: DirectiveType.editable,
                            tag: 'p',
                        },
                    },
                    properties: [
                        {
                            name: 'conditionalProperty',
                            label: 'Conditional property sample',
                            control: {
                                type: 'select',
                                options: [
                                    {
                                        caption: 'No value',
                                    },
                                    {
                                        caption: 'Value 1',
                                        value: 'value1',
                                    },
                                    {
                                        caption: 'Value 2',
                                        value: 'value2',
                                    },
                                    {
                                        caption: 'Value 3',
                                        value: 'value3',
                                    },
                                ],
                            },
                            defaultValue: 'value1',
                            dataType: 'data',
                            childProperties: [
                                {
                                    matchType: 'exact-value',
                                    properties: [
                                        {
                                            name: 'selectProperty',
                                            label: 'Select property sample',
                                            control: {
                                                type: 'select',
                                                options: [
                                                    {
                                                        caption: 'Default',
                                                    },
                                                    {
                                                        caption: 'Option 1',
                                                        value: '_option1',
                                                    },
                                                ],
                                            },
                                            dataType: 'data',
                                        },
                                    ],
                                },
                                {
                                    matchType: 'exact-value',
                                    matchExpression: 'value1',
                                    properties: [
                                        {
                                            name: 'checkboxProperty',
                                            label: 'Checkbox property sample',
                                            control: {
                                                type: 'checkbox',
                                                value: '_valueWhenOn',
                                            },
                                            dataType: 'styles',
                                        },
                                    ],
                                },
                                {
                                    matchType: 'exact-value',
                                    matchExpression: 'value2',
                                    properties: [
                                        {
                                            name: 'selectProperty',
                                            label: 'Select property sample',
                                            control: {
                                                type: 'select',
                                                options: [
                                                    {
                                                        caption: 'Default',
                                                    },
                                                    {
                                                        caption: 'Option 1',
                                                        value: '_option1',
                                                    },
                                                ],
                                            },
                                            dataType: 'data',
                                        },
                                        {
                                            name: 'checkboxProperty',
                                            label: 'Checkbox property sample',
                                            control: {
                                                type: 'checkbox',
                                                value: '_valueWhenOn',
                                            },
                                            dataType: 'styles',
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                    renditions: {
                        html: html.body,
                    },
                    noCreatePermission: false,
                },
            },
            groups: [
                {
                    label: 'Minimal',
                    name: 'minimal',
                    components: ['body'],
                },
            ],
            defaultComponentOnEnter: 'body',
            defaultComponentContent: {
                body: { data: { conditionalProperty: 'value1' } },
            },
            conversionRules: {},
            scripts: [],
            customStyles: [],
            shortcuts: {},
        };
    });

    it('should parse the components definition', async () => {
        const componentSet = await parseDefinition(await loadRenditions(createComponentsDefinition(), getFileContent));
        expect(componentSet).toEqual(expectedComponentSet);
    });

    it('should add default content of default child property when parent default is set', async () => {
        const componentSet = await parseDefinition(
            await loadRenditions(
                createComponentsDefinition((definition) => {
                    definition.componentProperties[0].defaultValue = '_option1';
                    definition.componentProperties[1].defaultValue = '_valueWhenOn';
                }),
                getFileContent,
            ),
        );

        expect(componentSet.defaultComponentContent).toEqual({
            body: { data: { conditionalProperty: 'value1' }, styles: { checkboxProperty: '_valueWhenOn' } },
        });
    });

    it('should add default content of default child property when parent has no default', async () => {
        const componentSet = await parseDefinition(
            await loadRenditions(
                createComponentsDefinition((definition) => {
                    definition.componentProperties[0].defaultValue = '_option1';
                    definition.componentProperties[1].defaultValue = '_valueWhenOn';
                    // Removing the defaultValue will match with the first option in the select which has no value
                    delete definition.componentProperties[2].defaultValue;
                }),
                getFileContent,
            ),
        );

        expect(componentSet.defaultComponentContent).toEqual({
            body: { data: { selectProperty: '_option1' } },
        });
    });
});
