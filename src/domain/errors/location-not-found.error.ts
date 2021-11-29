export class LocationNotFoundError extends Error {
  constructor() {
    super('Localização não encontrada!');
    super.name = 'LocationNotFoundError';
  }
}
