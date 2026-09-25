export class DatabaseConfigurationError extends Error {
  constructor() {
    super(
      'Google Sheets is not configured. Add the service account email and private key to .env.',
    );
    this.name = 'DatabaseConfigurationError';
  }
}

export class DatabaseSchemaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseSchemaError';
  }
}
