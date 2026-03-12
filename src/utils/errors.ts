export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthError extends Error {
  constructor(message = 'Missing ZAI_API_KEY. Set it in your environment before using pi-zai-tools.') {
    super(message);
    this.name = 'AuthError';
  }
}

export class RemoteMcpError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RemoteMcpError';
  }
}
