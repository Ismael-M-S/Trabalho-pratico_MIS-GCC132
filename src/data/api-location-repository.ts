import { Geolocation } from '@ionic-native/geolocation/ngx';

import { Coordinate } from '../domain/entities/coordinate';
import { LocationRepository } from '../domain/services/protocols/location-repository';

import { throwError } from 'rxjs';
import { UnavailableServiceError } from '../domain/errors/unavailable-service.error';

export class ApiLocationRepository extends LocationRepository {
  constructor(private readonly geolocation: Geolocation) {
    super();
  }

  async getCoordinate(): Promise<Coordinate> {
    return this.geolocation
      .getCurrentPosition()
      .catch((error) => throwError(new UnavailableServiceError()))
      .then(
        this.toCoordinate
      );
  }

  private toCoordinate(position: any): Coordinate {
    if (!position || position.coords == undefined) {
      return null;
    }

    const coordinate: Coordinate = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    };

    return coordinate;
  }
}
