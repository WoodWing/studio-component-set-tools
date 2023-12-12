import { createValidator } from './test-utils';

describe('validate chart', () => {
    it('should pass on minimal sample with chart property', async () => {
        const { validateFolderWithCustomiser, errorSpy } = createValidator(
            (filePath: string, content: string) => {
                if (filePath === 'components-definition.json') {
                    const componentsDefinition = JSON.parse(content);
                    componentsDefinition.components.push({
                        name: 'chart',
                        label: 'Chart Label',
                        icon: 'icons/component.svg',
                        properties: [
                            {
                                name: 'chart',
                                directiveKey: 'chart',
                            },
                        ],
                    });
                    componentsDefinition.componentProperties.push({
                        name: 'chart',
                        label: 'Chart property example',
                        control: {
                            type: 'chart',
                            chartType: 'infogram',
                        },
                        dataType: 'doc-chart',
                    });
                    return JSON.stringify(componentsDefinition);
                }
                if (filePath === 'templates/html/chart.html') {
                    return `<figure class="chart"><div doc-chart="chart"></div></figure>`;
                }
                if (filePath === 'styles/_chart.scss') {
                    return `.chart { color: deeppink; }`;
                }
                return content;
            },
            ['templates/html/chart.html', 'styles/_chart.scss'],
        );

        expect(await validateFolderWithCustomiser('./test/resources/minimal-sample-next')).toBe(true);
    });
});
