// src/errors/CustomError.ts

class CsrfError extends Error {
  constructor(message: string = "Failed to fetch CSRF token") {
    super(message);
    this.name = "CsrfError";
  }
}

export default CsrfError;
