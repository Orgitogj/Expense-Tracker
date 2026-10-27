export class HttpError extends Error {
  readonly status: number;
  readonly expose: boolean;

  constructor(status: number, message: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.expose = status < 500;
  }
}
