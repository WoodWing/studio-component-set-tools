import { AutofillValidator } from '../../lib/validators/autofill-validator';

describe('AutofillValidator', () => {
    let definition: any;
    let validator: AutofillValidator;
    beforeEach(() => {
        // valid definition (cut)
        definition = {
            components: {
                c1: {
                    component: {
                        name: 'c1',
                    },
                    directives: {
                        slide: {
                            type: 'image',
                            tag: 'div'
                        },
                    },
                },
                c2: {
                    component: {
                        name: 'c2',
                        directiveOptions: {
                            title: {
                                autofill: {
                                    source: 'figure',
                                    metadataField: 'group/property',
                                },
                            },
                        },
                    },
                    directives: {
                        figure: {
                            type: 'image',
                            tag: 'div',
                        },
                        title: {
                            type: 'editable',
                            tag: 'p',
                        },
                    },
                },
            },
        };
        validator = new AutofillValidator(definition);
    });
    describe('validate', () => {
        let reporter: any;
        beforeEach(() => {
            reporter = jasmine.createSpy('reporter');
        });
        it('should pass on valid definition', () => {
            const valid = validator.validate(reporter);
            expect(valid).toBeTruthy();
            expect(reporter).not.toHaveBeenCalled();
        });
        it('should not pass if destination directive does not exist', () => {
            delete definition.components.c2.directives.title;
            const valid = validator.validate(reporter);
            expect(valid).toBeFalsy();
            expect(reporter).toHaveBeenCalledWith(`Component "c2" has incorrect autofill rule "title". This component doesn't have directive "title".`);
        });
        it('should not pass if destination directive is not supported', () => {
            definition.components.c2.directives.title.type = 'image';
            const valid = validator.validate(reporter);
            expect(valid).toBeFalsy();
            expect(reporter).toHaveBeenCalledWith(`Component "c2" has incorrect autofill rule "title". Supported types of destination directive are "editable", "link" only.`);
        });
        it('should not pass if source directive does not exist', () => {
            definition.components.c2.component.directiveOptions.title.autofill.source = 'figure2';
            const valid = validator.validate(reporter);
            expect(valid).toBeFalsy();
            expect(reporter).toHaveBeenCalledWith(`Component "c2" has incorrect autofill rule "title". This component doesn't have directive "figure2".`);
        });
        it('should not pass if source directive is image and metadataField is not set', () => {
            delete definition.components.c2.component.directiveOptions.title.autofill.metadataField;
            const valid = validator.validate(reporter);
            expect(valid).toBeFalsy();
            expect(reporter).toHaveBeenCalledWith(`Component "c2" has incorrect autofill rule "title". If source directive is image kind then "metadataField" must be set.`);
        });
        it('should not pass if source and destination directives are the same', () => {
            definition.components.c2.component.directiveOptions.title.autofill.source = 'title';
            const valid = validator.validate(reporter);
            expect(valid).toBeFalsy();
            expect(reporter).toHaveBeenCalledWith(`Component "c2" has incorrect autofill rule "title". There is no sense to fill directive content from itself.`);
        });
    });
});