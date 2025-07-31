/**
 * Casts the error to the `Error` type.
 * Returns the error if it already is of type `Error`.
 * Returns an error with message and cause being the error if the error is a string.
 * Returns an error with the message "Unknown error" and the cause property set to the error for all other types.
 * @param error The error which can be any type
 * @returns An error with type `Error`
 */
export function castError(error: unknown) {
  if (error instanceof Error) {
    return error;
  } else if (typeof error === "string") {
    return new Error(error, { cause: error });
  } else {
    return new Error("Unknown error", { cause: error });
  }
}
