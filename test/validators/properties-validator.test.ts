import { PropertiesValidator } from '../../lib/validators';
import type { ComponentProperty } from '../../lib/models';

describe('PropertiesValidator', () => {
    function createTextProperty(): ComponentProperty {
        return {
            name: 'textProperty',
            control: {
                type: 'text',
            },
        } as any;
    }

    function createRadioProperty(): ComponentProperty {
        return {
            name: 'radioProperty',
            control: {
                type: 'radio',
                options: [{ icon: 'path1' }, { icon: 'path2' }, { icon: 'path5' }],
            },
        } as any;
    }

    function createMediaProperty(): ComponentProperty {
        return {
            name: 'mediaProperty',
            control: {
                type: 'media-properties',
            },
            dataType: 'doc-media',
        } as any;
    }

    function createHeaderProperty(): ComponentProperty {
        return {
            control: {
                type: 'header',
            },
            label: 'header-label',
        } as any;
    }

    function createCheckboxProperty(): ComponentProperty {
        return {
            name: 'checkboxProperty',
            control: {
                type: 'checkbox',
                value: true,
            },
        } as any;
    }

    function createStudioObjectSelectProperty(): ComponentProperty {
        return {
            name: 'objectSelectProperty',
            label: 'Object Select',
            control: {
                type: 'studio-object-select',
                source: 'dossier',
                filterObjectTypes: ['Image'],
            },
            dataType: 'studio-object',
        };
    }

    function createAnchorProperty(): ComponentProperty {
        return {
            name: 'anchorProperty',
            label: 'Anchor',
            control: {
                type: 'anchor',
            },
            dataType: 'data',
        };
    }

    function createConditionalProperty(children: unknown[]) {
        return {
            name: 'conditionalProperty',
            control: {
                type: 'text',
            },
            childProperties: [
                {
                    matchType: 'exact-value',
                    matchExpression: 'some arbitrary value',
                    properties: children,
                },
            ],
        };
    }

    function createPropertiesValidator(params?: { version?: string; properties: any[] }) {
        const definition = {
            version: params?.version ?? '1.0.0',
            components: {
                c1: {
                    name: 'c1',
                    properties: params?.properties ?? [
                        createTextProperty(),
                        createRadioProperty(),
                        createMediaProperty(),
                        createHeaderProperty(),
                    ],
                },
                // Add another component with same property to test uniqueness validation passes correctly
                c2: {
                    name: 'c2',
                    properties: [createTextProperty()],
                },
            },
        };
        const errorSpy = jest.fn();
        return {
            validator: new PropertiesValidator(
                errorSpy,
                definition as any,
                new Set<string>(['path1', 'path2', 'path3', 'path4', 'path5']),
            ),
            errorSpy: errorSpy,
        };
    }
    describe('validate', () => {
        it('should pass on valid definition', () => {
            const { validator, errorSpy } = createPropertiesValidator();
            validator.validate();
            expect(errorSpy).not.toHaveBeenCalled();
        });

        it('should not pass if the names are not unique', () => {
            const { validator, errorSpy } = createPropertiesValidator({
                properties: [{ ...createTextProperty(), name: 'radioProperty' }, createRadioProperty()],
            });
            validator.validate();
            expect(errorSpy).toHaveBeenCalledWith(
                `Component property "radioProperty" used in component "c1" is not unique`,
            );
        });

        it('should not pass if reserved word is used as a name', () => {
            const { validator, errorSpy } = createPropertiesValidator({
                properties: [{ ...createTextProperty(), name: 'parallax' }],
            });
            validator.validate();
            expect(errorSpy).toHaveBeenCalledWith(`Component property name "parallax" is a reserved word`);
        });

        it('should not pass if there is no icon file', () => {
            const otherRadioProperty = createRadioProperty() as any;
            otherRadioProperty.control.options[0].icon = 'pathU';
            const { validator, errorSpy } = createPropertiesValidator({
                properties: [otherRadioProperty],
            });
            validator.validate();
            expect(errorSpy).toHaveBeenCalledWith(`Component properties "radioProperty" icon missing "pathU"`);
        });

        it('should pass if parallax word is used as a name in version 1.4.0 or higher', () => {
            const { validator, errorSpy } = createPropertiesValidator({
                version: '1.4.0',
                properties: [{ ...createTextProperty(), name: 'parallax' }],
            });
            validator.validate();
            expect(errorSpy).not.toHaveBeenCalled();
        });

        it('should pass if parallax word is used as a name in version 1.5.0 or higher', () => {
            const { validator, errorSpy } = createPropertiesValidator({
                version: '1.5.0',
                properties: [{ ...createTextProperty(), name: 'parallax' }],
            });
            validator.validate();
            expect(errorSpy).not.toHaveBeenCalled();
        });

        it('should pass if there are multiple nameless properties of control type "header" in same component', () => {
            const { validator, errorSpy } = createPropertiesValidator({
                version: '1.5.0',
                properties: [
                    createTextProperty(),
                    { label: 'Header', control: { type: 'header' } },
                    { label: 'Another Header', control: { type: 'header' } },
                ],
            });
            validator.validate();
            expect(errorSpy).not.toHaveBeenCalled();
        });

        it('should not pass if properties that save data have no name', () => {
            const { validator, errorSpy } = createPropertiesValidator({
                version: '1.5.0',
                properties: [
                    { ...createTextProperty(), name: undefined },
                    { ...createMediaProperty(), name: undefined },
                ],
            });
            validator.validate();
            expect(errorSpy).toHaveBeenCalledWith(
                `Property in component "c1" must have a name when using control type "text"`,
            );
            expect(errorSpy).toHaveBeenCalledWith(
                `Property in component "c1" must have a name when using control type "media-properties"`,
            );
        });

        it('should not pass if a header has a dataType', () => {
            const { validator, errorSpy } = createPropertiesValidator({
                properties: [{ ...createHeaderProperty(), dataType: 'data' }],
            });
            validator.validate();
            expect(errorSpy).toHaveBeenCalledWith(
                `Nameless property with control type "header" and label "header-label" in component "c1" cannot have a dataType`,
            );
        });

        it('should pass on valid conditional property definition (uses same property definition in other component)', () => {
            const { validator, errorSpy } = createPropertiesValidator({
                version: '1.7.0',
                properties: [createConditionalProperty([createTextProperty()])],
            });
            validator.validate();
            expect(errorSpy).not.toHaveBeenCalled();
        });

        it('should pass when using the same conditional property definition in other conditions', () => {
            const conditionalProperty = createConditionalProperty([createTextProperty()]);
            conditionalProperty.childProperties.push({
                matchType: 'exact-value',
                matchExpression: 'some arbitrary value',
                properties: [createTextProperty()],
            });
            const { validator, errorSpy } = createPropertiesValidator({
                version: '1.7.0',
                properties: [conditionalProperty],
            });
            validator.validate();
            expect(errorSpy).not.toHaveBeenCalled();
        });

        it('should not pass when using property with the same name in the conditional property definition as the parent', () => {
            const { validator, errorSpy } = createPropertiesValidator({
                version: '1.7.0',
                properties: [createTextProperty(), createConditionalProperty([createTextProperty()])],
            });
            validator.validate();
            expect(errorSpy).toHaveBeenCalledWith(
                `Component property "textProperty" used in component "c1" is not unique`,
            );
        });

        it('should not pass when using property with the same name in the conditional property definition', () => {
            const { validator, errorSpy } = createPropertiesValidator({
                version: '1.7.0',
                properties: [
                    createConditionalProperty([
                        { ...createTextProperty(), name: 'radioProperty' },
                        createRadioProperty(),
                    ]),
                ],
            });
            validator.validate();
            expect(errorSpy).toHaveBeenCalledWith(
                `Component property "radioProperty" used in component "c1" is not unique`,
            );
        });

        it('should not pass if a conditional child property has no icon file', () => {
            const otherRadioProperty = createRadioProperty() as any;
            otherRadioProperty.control.options[0].icon = 'pathU';
            const { validator, errorSpy } = createPropertiesValidator({
                version: '1.7.0',
                properties: [createConditionalProperty([otherRadioProperty])],
            });
            validator.validate();
            expect(errorSpy).toHaveBeenCalledWith(`Component properties "radioProperty" icon missing "pathU"`);
        });

        it('should pass if there are multiple nameless properties of control type "header" in same component', () => {
            const { validator, errorSpy } = createPropertiesValidator({
                version: '1.7.0',
                properties: [
                    createConditionalProperty([
                        createTextProperty(),
                        { label: 'Header', control: { type: 'header' } },
                        { label: 'Another Header', control: { type: 'header' } },
                    ]),
                ],
            });
            validator.validate();
            expect(errorSpy).not.toHaveBeenCalled();
        });

        it('should not pass if conditional child properties that save data have no name', () => {
            const { validator, errorSpy } = createPropertiesValidator({
                version: '1.7.0',
                properties: [
                    createConditionalProperty([
                        { ...createTextProperty(), name: undefined },
                        { ...createMediaProperty(), name: undefined },
                    ]),
                ],
            });
            validator.validate();
            expect(errorSpy).toHaveBeenCalledWith(
                `Property in component "c1" must have a name when using control type "text"`,
            );
            expect(errorSpy).toHaveBeenCalledWith(
                `Property in component "c1" must have a name when using control type "media-properties"`,
            );
        });

        it('should not pass if conditional child header has a dataType', () => {
            const { validator, errorSpy } = createPropertiesValidator({
                version: '1.7.0',
                properties: [createConditionalProperty([{ ...createHeaderProperty(), dataType: 'data' }])],
            });
            validator.validate();
            expect(errorSpy).toHaveBeenCalledWith(
                `Nameless property with control type "header" and label "header-label" in component "c1" cannot have a dataType`,
            );
        });

        it('should not pass if conditional properties are in an unsupported type of property', () => {
            const { validator, errorSpy } = createPropertiesValidator({
                version: '1.7.0',
                properties: [
                    {
                        ...createConditionalProperty([createTextProperty()]),
                        control: {
                            type: 'fitting',
                        },
                    },
                ],
            });
            validator.validate();
            expect(errorSpy).toHaveBeenCalledWith(
                `Property in component "c1" with control type "fitting" cannot contain child properties`,
            );
        });

        it('should pass if a checkbox with dataType "data" is used with a boolean value', () => {
            const prop = createCheckboxProperty();
            prop.dataType = 'data';
            const { validator, errorSpy } = createPropertiesValidator({
                version: '1.7.0',
                properties: [prop],
            });
            validator.validate();
            expect(errorSpy).not.toHaveBeenCalled();
        });

        it('should not pass if a checkbox with dataType other than "data" is used with a boolean value', () => {
            const prop = createCheckboxProperty();
            prop.dataType = 'styles';
            const { validator, errorSpy } = createPropertiesValidator({
                version: '1.7.0',
                properties: [prop],
            });
            validator.validate();
            expect(errorSpy).toHaveBeenCalledWith(
                `Checkbox property "checkboxProperty" cannot have a boolean value for dataType "styles", boolean values are only allowed for dataType "data"`,
            );
        });
    });

    describe('studio object data type', () => {
        it('should pass with dataType "studio-object"', () => {
            const prop = createStudioObjectSelectProperty();
            prop.dataType = 'studio-object';
            const { validator, errorSpy } = createPropertiesValidator({
                version: '1.9.0',
                properties: [prop],
            });
            validator.validate();
            expect(errorSpy).not.toHaveBeenCalled();
        });

        it('should not pass with dataType other than "studio-object"', () => {
            const prop = createStudioObjectSelectProperty();
            prop.dataType = 'data';
            const { validator, errorSpy } = createPropertiesValidator({
                version: '1.9.0',
                properties: [prop],
            });
            validator.validate();
            expect(errorSpy).toHaveBeenCalledWith(
                `Object select property "objectSelectProperty" cannot use dataType "data", only dataType "studio-object" is allowed`,
            );
        });

        it('should not be able to use with regular property controls like text', () => {
            const prop = createTextProperty();
            prop.dataType = 'studio-object';
            const { validator, errorSpy } = createPropertiesValidator({
                version: '1.9.0',
                properties: [prop],
            });
            validator.validate();
            expect(errorSpy).toHaveBeenCalledWith(`Cannot use dataType "studio-object" with control type "text"`);
        });
    });

    describe('anchor property', () => {
        it('should pass with dataType "data"', () => {
            const prop = createAnchorProperty();
            prop.dataType = 'data';
            const { validator, errorSpy } = createPropertiesValidator({
                version: '1.10.0',
                properties: [prop],
            });
            validator.validate();
            expect(errorSpy).not.toHaveBeenCalled();
        });

        it('should not pass with dataType other than "data"', () => {
            const prop = createAnchorProperty();
            prop.dataType = 'styles';
            const { validator, errorSpy } = createPropertiesValidator({
                version: '1.10.0',
                properties: [prop],
            });
            validator.validate();
            expect(errorSpy).toHaveBeenCalledWith(
                `Anchor property "anchorProperty" cannot use dataType "styles", only dataType "data" is allowed`,
            );
        });

        it('should allow child properties on anchor property', () => {
            const prop = createAnchorProperty();
            prop.dataType = 'data';
            prop.childProperties = [
                {
                    matchType: 'any-value',
                    properties: [createTextProperty()],
                },
            ];
            const { validator, errorSpy } = createPropertiesValidator({
                version: '1.10.0',
                properties: [prop],
            });
            validator.validate();
            expect(errorSpy).not.toHaveBeenCalled();
        });
    });
});
