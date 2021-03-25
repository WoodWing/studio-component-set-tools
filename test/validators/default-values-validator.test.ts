import { DefaultValuesValidator } from '../../lib/validators/default-values-validator';
import { COMPONENT_PROPERTY_CONTROL_FITTING_VALUES } from '../../lib/models/component-property-controls';

describe('DefaultValuesValidator', () => {
    let definition: any;
    let error: jasmine.Spy;
    let validator: DefaultValuesValidator;

    beforeEach(() => {
        // valid definition (cut)
        definition = {
            components: {
                text: {
                    name: 'text',
                    properties: [],
                },
            },
        };
        error = jasmine.createSpy('error');
    });

    it('should pass validation if property has no defaultValue set', () => {
        validator = new DefaultValuesValidator(error, definition);
        validator.validate();

        expect(error).not.toHaveBeenCalled();
    });

    ['styles', 'inlineStyles', 'data'].forEach((dataType) => {
        it(`should pass with defaultValue for data type ${dataType}`, () => {
            definition.components.text.properties.push({
                name: 'propertyName',
                defaultValue: 'value',
                dataType: dataType,
                control: { type: 'text' },
            });

            validator = new DefaultValuesValidator(error, definition);
            validator.validate();

            expect(error).not.toHaveBeenCalled();
        });
    });

    it('should not pass validation with defaultValue for unsupported dataType', () => {
        definition.components.text.properties.push({
            name: 'propertyName',
            defaultValue: 'value',
            dataType: 'doc-editable',
            control: { type: 'text' },
        });

        validator = new DefaultValuesValidator(error, definition);
        validator.validate();

        expect(error).toHaveBeenCalledWith(
            'Property propertyName has a default value for an unsupported data type doc-editable',
        );
    });

    it('should not pass with unsupported control type', () => {
        definition.components.text.properties.push({
            name: 'propertyName',
            defaultValue: 'value',
            dataType: 'styles',
            control: {
                type: 'unsupported',
            },
        });

        validator = new DefaultValuesValidator(error, definition);
        validator.validate();

        expect(error).toHaveBeenCalledWith(
            'Property propertyName has a default value used with an unsupported control type unsupported',
        );
    });

    ['text', 'select', 'radio', 'checkbox', 'fitting'].forEach((controlType) => {
        it(`should not pass with control type ${controlType} and defaultValue not being string`, () => {
            definition.components.text.properties.push({
                name: 'propertyName',
                defaultValue: {},
                dataType: 'styles',
                control: {
                    type: `${controlType}`,
                },
            });

            validator = new DefaultValuesValidator(error, definition);
            validator.validate();

            expect(error).toHaveBeenCalledWith('Property propertyName defaultValue must be a string');
        });
    });

    it('should pass with control type select and defaultValue being present in options', () => {
        definition.components.text.properties.push({
            name: 'propertyName',
            defaultValue: 'value',
            dataType: 'styles',
            control: {
                type: 'select',
                options: [{ caption: '1' }, { caption: '2', value: 'value' }],
            },
        });

        validator = new DefaultValuesValidator(error, definition);
        validator.validate();

        expect(error).not.toHaveBeenCalled();
    });

    it('should not pass with control type select and defaultValue not being present in options', () => {
        definition.components.text.properties.push({
            name: 'propertyName',
            defaultValue: 'value',
            dataType: 'styles',
            control: {
                type: 'select',
                options: [{ caption: '1' }, { caption: '2', value: 'other-value' }],
            },
        });

        validator = new DefaultValuesValidator(error, definition);
        validator.validate();

        expect(error).toHaveBeenCalledWith(
            'Property propertyName defaultValue has no matching entry in select options',
        );
    });

    it('should pass with control type radio and defaultValue being present in options', () => {
        definition.components.text.properties.push({
            name: 'propertyName',
            defaultValue: 'value',
            dataType: 'styles',
            control: {
                type: 'radio',
                options: [{ caption: '1' }, { caption: '2', value: 'value' }],
            },
        });

        validator = new DefaultValuesValidator(error, definition);
        validator.validate();

        expect(error).not.toHaveBeenCalled();
    });

    it('should not pass with control type radio and defaultValue not being present in options', () => {
        definition.components.text.properties.push({
            name: 'propertyName',
            defaultValue: 'value',
            dataType: 'styles',
            control: {
                type: 'radio',
                options: [{ caption: '1' }, { caption: '2', value: 'other-value' }],
            },
        });

        validator = new DefaultValuesValidator(error, definition);
        validator.validate();

        expect(error).toHaveBeenCalledWith('Property propertyName defaultValue has no matching entry in radio options');
    });

    it('should pass with control type checkbox and defaultValue being the checked value', () => {
        definition.components.text.properties.push({
            name: 'propertyName',
            defaultValue: 'value',
            dataType: 'styles',
            control: {
                type: 'checkbox',
                value: 'value',
            },
        });

        validator = new DefaultValuesValidator(error, definition);
        validator.validate();

        expect(error).not.toHaveBeenCalled();
    });

    it('should pass with control type checkbox and defaultValue being the checked value', () => {
        definition.components.text.properties.push({
            name: 'propertyName',
            defaultValue: 'value',
            dataType: 'styles',
            control: {
                type: 'checkbox',
                value: 'other-value',
            },
        });

        validator = new DefaultValuesValidator(error, definition);
        validator.validate();

        expect(error).toHaveBeenCalledWith('Property propertyName defaultValue does not match checkbox value');
    });

    it('should pass with control type drop-capital and defaultValue being a correct object', () => {
        definition.components.text.properties.push({
            name: 'propertyName',
            defaultValue: { numberOfCharacters: 2, numberOfLines: 3, padding: 5 },
            dataType: 'data',
            control: {
                type: 'drop-capital',
            },
        });

        validator = new DefaultValuesValidator(error, definition);
        validator.validate();

        expect(error).not.toHaveBeenCalled();
    });

    it('should not pass with control type drop-capital and defaultValue not being an object', () => {
        definition.components.text.properties.push({
            name: 'propertyName',
            defaultValue: 5,
            dataType: 'data',
            control: {
                type: 'drop-capital',
            },
        });

        validator = new DefaultValuesValidator(error, definition);
        validator.validate();

        expect(error).toHaveBeenCalledWith('Property propertyName defaultValue must be an object');
    });

    it('should not pass with control type drop-capital and defaultValue not being a correct object', () => {
        definition.components.text.properties.push({
            name: 'propertyName',
            defaultValue: { numberOfCharacters: 2, a: 2 },
            dataType: 'data',
            control: {
                type: 'drop-capital',
            },
        });

        validator = new DefaultValuesValidator(error, definition);
        validator.validate();

        expect(error).toHaveBeenCalledWith(
            'Property propertyName defaultValue must be an object with keys "numberOfCharacters, numberOfLines, padding"',
        );
    });

    it('should not pass with control type drop-capital and defaultValue being a correct object but wrong values', () => {
        definition.components.text.properties.push({
            name: 'propertyName',
            defaultValue: { numberOfCharacters: 2, numberOfLines: '3', padding: 5 },
            dataType: 'data',
            control: {
                type: 'drop-capital',
            },
        });

        validator = new DefaultValuesValidator(error, definition);
        validator.validate();

        expect(error).toHaveBeenCalledWith(
            'Property propertyName defaultValue must be an object of number type values',
        );
    });

    Object.values(COMPONENT_PROPERTY_CONTROL_FITTING_VALUES).forEach((fittingOption) => {
        it(`should pass with control type fitting and defaultValue is '${fittingOption}'`, () => {
            definition.components.text.properties.push({
                name: 'propertyName',
                defaultValue: fittingOption,
                dataType: 'styles',
                control: {
                    type: 'fitting',
                },
            });

            validator = new DefaultValuesValidator(error, definition);
            validator.validate();

            expect(error).not.toHaveBeenCalled();
        });
    });

    it('should not pass with control type fitting and defaultValue not being present in options', () => {
        definition.components.text.properties.push({
            name: 'propertyName',
            defaultValue: 'value',
            dataType: 'styles',
            control: {
                type: 'fitting',
            },
        });

        validator = new DefaultValuesValidator(error, definition);
        validator.validate();

        expect(error).toHaveBeenCalledWith(
            `Property propertyName defaultValue has to be one of '_fit-frame-height-to-content', '_fit-frame-to-content'`,
        );
    });

    it('should pass with control type slider and defaultValue being a number', () => {
        definition.components.text.properties.push({
            name: 'propertyName',
            defaultValue: 0,
            dataType: 'data',
            control: {
                type: 'slider',
                minValue: -1,
                maxValue: 5,
                stepSize: 1,
            },
        });

        validator = new DefaultValuesValidator(error, definition);
        validator.validate();

        expect(error).not.toHaveBeenCalled();
    });

    it('should not pass with control type slider and defaultValue being out of minimum range', () => {
        definition.components.text.properties.push({
            name: 'propertyName',
            defaultValue: 0,
            dataType: 'data',
            control: {
                type: 'slider',
                minValue: 1,
                maxValue: 5,
                stepSize: 1,
            },
        });

        validator = new DefaultValuesValidator(error, definition);
        validator.validate();

        expect(error).toHaveBeenCalledWith(
            'Property propertyName defaultValue must be between the minimum and maximum values',
        );
    });

    it('should not pass with control type slider and defaultValue being out of maximum range', () => {
        definition.components.text.properties.push({
            name: 'propertyName',
            defaultValue: 4,
            dataType: 'data',
            control: {
                type: 'slider',
                minValue: 1,
                maxValue: 3,
                stepSize: 1,
            },
        });

        validator = new DefaultValuesValidator(error, definition);
        validator.validate();

        expect(error).toHaveBeenCalledWith(
            'Property propertyName defaultValue must be between the minimum and maximum values',
        );
    });

    it('should not pass with control type slider and defaultValue being a string', () => {
        definition.components.text.properties.push({
            name: 'propertyName',
            defaultValue: '4',
            dataType: 'data',
            control: {
                type: 'slider',
                minValue: 1,
                maxValue: 5,
                stepSize: 1,
            },
        });

        validator = new DefaultValuesValidator(error, definition);
        validator.validate();

        expect(error).toHaveBeenCalledWith('Property propertyName defaultValue must be a number');
    });

    it('should not pass with control type slider and defaultValue being an empty string', () => {
        definition.components.text.properties.push({
            name: 'propertyName',
            defaultValue: '',
            dataType: 'data',
            control: {
                type: 'slider',
                minValue: 1,
                maxValue: 5,
                stepSize: 1,
            },
        });

        validator = new DefaultValuesValidator(error, definition);
        validator.validate();

        expect(error).toHaveBeenCalledWith('Property propertyName defaultValue must be a number');
    });

    it('should not pass with control type slider and defaultValue missing', () => {
        definition.components.text.properties.push({
            name: 'propertyName',
            dataType: 'data',
            control: {
                type: 'slider',
                minValue: 1,
                maxValue: 5,
                stepSize: 1,
            },
        });

        validator = new DefaultValuesValidator(error, definition);
        validator.validate();

        expect(error).toHaveBeenCalledWith('Property propertyName defaultValue is required for control type "slider"');
    });
});
