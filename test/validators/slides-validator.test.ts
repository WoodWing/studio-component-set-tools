import { SlidesValidator } from '../../lib/validators/slides-validator';

describe('SlidesValidator', () => {
    let definition: any;
    let error: jasmine.Spy;
    let validator: SlidesValidator;
    beforeEach(() => {
        // valid definition (cut)
        definition = {
            components: {
                'c1': {
                    name: 'c1',
                    restrictChildren: {
                        c2: { withContent: 'image' }
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
                    name: 'c2',
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
        error = jasmine.createSpy('error');
        validator = new SlidesValidator(error, definition);
    });
    describe('validate', () => {
        it('should pass on valid definition', () => {
            validator.validate();
            expect(error).not.toHaveBeenCalled();
        });

        it('should pass on valid definition with include', () => {
            definition.components.c1.properties[0].control.include = ['p2'];
            validator.validate();
            expect(error).not.toHaveBeenCalled();
        });

        it('should pass on valid definition with exclude', () => {
            definition.components.c1.properties[0].control.exclude = ['p3'];
            validator.validate();
            expect(error).not.toHaveBeenCalled();
        });

        it('should not pass if include has an invalid property', () => {
            definition.components.c1.properties[0].control.include = ['p_invalid'];
            validator.validate();
            expect(error).toHaveBeenCalledWith('Property \"p1\" is referring to an invalid property \"p_invalid\"not part of \"c2\"');
        });

        it('should not pass if exclude has an invalid property', () => {
            definition.components.c1.properties[0].control.exclude = ['p_invalid'];
            validator.validate();
            expect(error).toHaveBeenCalledWith('Property \"p1\" is referring to an invalid property \"p_invalid\"not part of \"c2\"');
        });

        it('should require restrictChildren to be set on slideshow component', () => {
            definition.components.c1.restrictChildren = null;
            validator.validate();
            expect(error).toHaveBeenCalledWith('Component \"c1\" must have restrictChildren set to use the slides property');
        });
    });
});
