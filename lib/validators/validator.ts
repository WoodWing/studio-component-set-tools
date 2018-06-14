export interface Validator {
    validate(
        errorReporter: (errorMessage: string) => void,
    ) : boolean;
}
