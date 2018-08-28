import { SlidesValidator } from '../../lib/validators/slides-validator';

describe('SlidesValidator', () => {
    let definition: any;
    let validator: SlidesValidator;
    beforeEach(() => {
        // valid definition (cut)
        definition = {
            components: {
                'c1': {
                    component: {
                        name: 'c1',
                        restrictChildren: {
                            c2: { withContent: 'image' }
                        },
                    },
                    properties: [
                        {
                            name: 'p1',
                            control: {
                                type: 'slides',
                            },
                        },
                    ],
                },
                'c2': {
                    component: { name: 'c2' },
                    properties: [
                        {
                            name: 'p2',
                            control: {},
                        },
                        {
                            name: 'p3',
                            control: {},
                        },
                    ],
                },
            },
        };
        validator = new SlidesValidator(definition);
    });
    describe('validate', () => {
        let reporter: jasmine.Spy;
        beforeEach(() => {
            reporter = jasmine.createSpy('reporter');
        });
        it('should pass on valid definition', () => {
            const valid = validator.validate(reporter);
            expect(valid).toBeTruthy();
            expect(reporter).not.toHaveBeenCalled();
        });

        it('should pass on valid definition with include', () => {
            definition.components.c1.properties[0].control.include = ['p2'];
            const valid = validator.validate(reporter);
            expect(valid).toBeTruthy();
            expect(reporter).not.toHaveBeenCalled();
        });

        it('should pass on valid definition with exclude', () => {
            definition.components.c1.properties[0].control.exclude = ['p3'];
            const valid = validator.validate(reporter);
            expect(valid).toBeTruthy();
            expect(reporter).not.toHaveBeenCalled();
        });

        it('should not pass if include has an invalid property', () => {
            definition.components.c1.properties[0].control.include = ['p_invalid'];
            const valid = validator.validate(reporter);
            expect(valid).toBeFalsy();
            expect(reporter).toHaveBeenCalledWith('Property \"p1\" is referring to an invalid property \"p_invalid\"not part of \"c2\"');
        });

        it('should not pass if exclude has an invalid property', () => {
            definition.components.c1.properties[0].control.exclude = ['p_invalid'];
            const valid = validator.validate(reporter);
            expect(valid).toBeFalsy();
            expect(reporter).toHaveBeenCalledWith('Property \"p1\" is referring to an invalid property \"p_invalid\"not part of \"c2\"');
        });

        it('should require restrictChildren to be set on slideshow component', () => {
            definition.components.c1.component.restrictChildren = null;
            const valid = validator.validate(reporter);
            expect(valid).toBeFalsy();
            expect(reporter).toHaveBeenCalledWith('Component \"c1\" must have restrictChildren set to use the slides property');
        });
    });
});