import { ParsedComponentsDefinitionV10X } from '../models';

export abstract class Validator {
    constructor(
        protected error: (errorMessage: string) => false,
        protected definition: ParsedComponentsDefinitionV10X,
    ) {
    }

    /**
     * To be implemented by validator.
     * The implementation should call the error method when validation fails.
     * May be called multiple times.
     */
    abstract validate() : void;
}
