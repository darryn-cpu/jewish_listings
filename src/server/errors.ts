export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export class TransitionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "TransitionError"
  }
}
