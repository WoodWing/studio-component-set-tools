import { DocChartValidator } from '../../lib/validators/doc-chart-validator';

describe('DocChartValidator', () => {
    let definition: any;
    let error: jest.Mock;
    let validator: DocChartValidator;

    beforeEach(() => {
        definition = {
            // valid definition (cut)
            components: {
                chart: {
                    name: 'chart',
                    directives: {
                        d1: {
                            type: 'chart',
                            tag: 'div',
                        },
                    },
                    properties: [
                        {
                            name: 'chartproperty',
                            directiveKey: 'd1',
                            control: {
                                type: 'chart-properties',
                                logo: 'logos/chart.svg',
                                link: 'www.chart.com',
                            },
                        },
                    ],
                },
                // Do not fail on different components without chart directive
                body: {
                    name: 'body',
                    directives: {
                        d1: {
                            type: 'editable',
                            tag: 'p',
                        },
                    },
                    properties: [],
                },
            },
        };
        error = jest.fn();
        validator = new DocChartValidator(error, definition);
    });
    describe('validate', () => {
        it('should pass on a valid definition', () => {
            validator.validate();
            expect(error).not.toHaveBeenCalled();
        });
        it('should not pass when there is a chart directive but no chart properties', () => {
            definition.components.chart.properties = [];

            validator.validate();
            expect(error).toHaveBeenCalledWith(
                `Component "chart" with "doc-chart" directive must have exactly one "chart-properties" property (found 0)`,
            );
        });
        it('should pass with one chart directives and other directive types', () => {
            definition.components.chart.directives.d2 = {
                type: 'editable',
                tag: 'p',
            };
            definition.components.chart.directives.d3 = {
                type: 'link',
                tag: 'a',
            };
            validator.validate();
            expect(error).not.toHaveBeenCalled();
        });
        it('should not pass with multiple chart type directives', () => {
            definition.components.chart.directives.d2 = {
                type: 'chart',
                tag: 'div',
            };
            validator.validate();
            expect(error).toHaveBeenCalledWith(
                `Component "chart" can only have one "doc-chart" directive in the HTML definition`,
            );
        });
        it('should fail if a component property with a chart-properties control type is not applied to a chart directive', () => {
            definition.components.wrongdirectivekey = {
                name: 'wrongdirectivekey',
                directives: {
                    d1: {
                        type: 'editable',
                        tag: 'p',
                    },
                    d2: {
                        type: 'chart',
                        tag: 'div',
                    },
                },
                properties: [
                    {
                        name: 'chartproperty',
                        directiveKey: 'd1',
                        control: {
                            type: 'chart-properties',
                            logo: 'logos/chart.svg',
                            link: 'www.chart.com',
                        },
                    },
                ],
            };
            validator.validate();
            expect(error).toHaveBeenCalledWith(
                `Component "wrongdirectivekey" has a control type "chart-properties" applied to the wrong directive, which can only be used with "doc-chart" directives`,
            );
        });
        it('should fail in case a "chart-properties" property does not have a directive key', () => {
            definition.components.nodirectivekey = {
                name: 'nodirectivekey',
                directives: {
                    d1: {
                        type: 'chart',
                        tag: 'div',
                    },
                },
                properties: [
                    {
                        name: 'chartproperty',
                        control: {
                            type: 'chart-properties',
                        },
                    },
                ],
            };
            validator.validate();
            expect(error).toHaveBeenCalledWith(
                `Component "nodirectivekey" must configure "directiveKey" for the property with control type "chart-properties"`,
            );
        });

        it('should fail in case a component without a chart directive has "chart-properties" property', () => {
            definition.components.body.properties = [
                {
                    name: 'chartproperty',
                    directiveKey: 'd1',
                    control: {
                        type: 'chart-properties',
                        logo: 'logos/chart.svg',
                        link: 'www.chart.com',
                    },
                },
            ];

            validator.validate();
            expect(error).toHaveBeenCalledWith(
                `Component "body" has a "chart-properties" control type, but only components with a "doc-chart" directive can have a property with this control type`,
            );
        });
    });
});
