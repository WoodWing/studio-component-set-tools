import { PropertiesValidator } from '../../lib/validators';
import type { ComponentProperty } from '../../lib/models';
import cloneDeep = require('lodash.clonedeep');

describe('PropertiesValidator', () => {
    const textProperty: ComponentProperty = {
        name: 'textProperty',
        control: {
            type: 'text',
        },
    } as any;
    const radioProperty: ComponentProperty = {
        name: 'radioProperty',
        control: {
            type: 'radio',
            options: [{ icon: 'path1' }, { icon: 'path2' }, { icon: 'path5' }],
        },
    } as any;
    const mediaProperty: ComponentProperty = {
        name: 'mediaProperty',
        control: {
            type: 'media-properties',
        },
        dataType: 'doc-media',
    } as any;
    const headerProperty: ComponentProperty = {
        control: {
            type: 'header',
        },
        label: 'header-label',
    } as any;

    function createPropertiesValidator(params?: { version?: string; properties: any[] }) {
        const definition = {
            version: params?.version ?? '1.0.0',
            components: {
                c1: {
                    name: 'c1',
                    properties: params?.properties ?? [textProperty, radioProperty, mediaProperty, headerProperty],
                },
                // Add another component with same property to test uniqueness validation passes correctly
                c2: {
                    name: 'c2',
                    properties: [textProperty],
                },
            },
        };
        const errorSpy = jasmine.createSpy('error');
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
                properties: [{ ...cloneDeep(textProperty), name: 'radioProperty' }, radioProperty],
            });
            validator.validate();
            expect(errorSpy).toHaveBeenCalledWith(`Component property "radioProperty" is not unique`);
        });

        it('should not pass if reserved word is used as a name', () => {
            const { validator, errorSpy } = createPropertiesValidator({
                properties: [{ ...cloneDeep(textProperty), name: 'parallax' }],
            });
            validator.validate();
            expect(errorSpy).toHaveBeenCalledWith(`Component property name "parallax" is a reserved word`);
        });

        it('should not pass if there is no icon file', () => {
            const otherRadioProperty = cloneDeep(radioProperty) as any;
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
                properties: [{ ...cloneDeep(textProperty), name: 'parallax' }],
            });
            validator.validate();
            expect(errorSpy).not.toHaveBeenCalled();
        });

        it('should pass if parallax word is used as a name in version 1.5.0 or higher', () => {
            const { validator, errorSpy } = createPropertiesValidator({
                version: '1.5.0',
                properties: [{ ...cloneDeep(textProperty), name: 'parallax' }],
            });
            validator.validate();
            expect(errorSpy).not.toHaveBeenCalled();
        });

        it('should pass if there are multiple nameless properties of control type "header" in same component', () => {
            const { validator, errorSpy } = createPropertiesValidator({
                version: '1.4.0',
                properties: [
                    textProperty,
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
                    { ...cloneDeep(textProperty), name: undefined },
                    { ...cloneDeep(mediaProperty), name: undefined },
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
                properties: [{ ...cloneDeep(headerProperty), dataType: 'data' }],
            });
            validator.validate();
            expect(errorSpy).toHaveBeenCalledWith(
                `Nameless property with control type "header" and label "header-label" in component "c1" cannot have a dataType`,
            );
        });
    });
});
