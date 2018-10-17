import { DefaultValuesValidator } from '../../lib/validators/default-values-validator';

describe('DefaultValuesValidator', () => {
    let definition: any;
    let error: jasmine.Spy;
    let validator: DefaultValuesValidator;

    beforeEach(() => {
        // valid definition (cut)
        definition = {
            'components': {
                'text': {
                    'name': 'text',
                    'properties': [],
                },
            },
        };
        error = jasmine.createSpy('error');
    });
    describe('validate', () => {
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
                'Property propertyName has a default value for an unsupported data type doc-editable');
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
                'Property propertyName has a default value used with an unsupported control type unsupported');
        });

        it('should pass with control type select and defaultValue being present in options', () => {
            definition.components.text.properties.push({
                name: 'propertyName',
                defaultValue: 'value',
                dataType: 'styles',
                control: {
                    type: 'select',
                    options: [
                        { caption: '1' },
                        { caption: '2', value: 'value' },
                    ],
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
                    options: [
                        { caption: '1' },
                        { caption: '2', value: 'other-value' },
                    ],
                },
            });

            validator = new DefaultValuesValidator(error, definition);
            validator.validate();

            expect(error).toHaveBeenCalledWith(
                'Property propertyName defaultValue has no matching entry in select options');
        });

        it('should pass with control type radio and defaultValue being present in options', () => {
            definition.components.text.properties.push({
                name: 'propertyName',
                defaultValue: 'value',
                dataType: 'styles',
                control: {
                    type: 'radio',
                    options: [
                        { caption: '1' },
                        { caption: '2', value: 'value' },
                    ],
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
                    options: [
                        { caption: '1' },
                        { caption: '2', value: 'other-value' },
                    ],
                },
            });

            validator = new DefaultValuesValidator(error, definition);
            validator.validate();

            expect(error).toHaveBeenCalledWith(
                'Property propertyName defaultValue has no matching entry in radio options');
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

            expect(error).toHaveBeenCalledWith(
                'Property propertyName defaultValue does not match checkbox value');
        });
    });
});