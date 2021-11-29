import { HaversineService } from 'ng2-haversine';

import { City } from '../entities/city';
import { CityRepository } from './protocols/city-repository';
import { Coordinate } from '../entities/coordinate';
import { LocationRepository } from './protocols/location-repository';

import { LocationNotFoundError } from '../errors/location-not-found.error';

export class FindLocationService {
  constructor(
    private readonly locationRepository: LocationRepository,
    private readonly cityRepo: CityRepository,
    private haversineService: HaversineService
  ) { }

  async findLocation(proximity: number): Promise<City[]> {
    const coordinate = await this.locationRepository.getCoordinate();

    if (!coordinate) {
      throw new LocationNotFoundError();
    }
    if (proximity < 1) {
      proximity = 1;
    }

    /* Metodo alternativo ao `getByProximity`, para encontrar as cidades mais
     * proximas do dispositivo, em ordem crescente. Porem, menos efifiente, ja
     * que este ordena todas as `cities` para retornar apenas a quantidade
     * de `proximity`.
    const cities = await this.cityRepo.getAll();

    const sortedCities = cities.sort((a, b) => {
      return (
        this.haversineService.getDistanceInMeters(a.coord, coordinate)
        -
        this.haversineService.getDistanceInMeters(b.coord, coordinate)
      );
    });

    return sortedCities.slice(0, proximity); */

    return this.getByProximity(proximity, coordinate);
  }

  /**
   * Encontra as cidades mais proximas da `coordinate`, parando quando o valor de `proximity` for atingido.
   * @param proximity Quantidade de cidades proximas a `coordinate`.
   * @param coordinate Coordenadas do dispositivo.
   * @returns As cidades mais proximas do dispositivo, em ordem crescente.
   */
  private async getByProximity(proximity: number, coordinate: Coordinate): Promise<City[]> {
    const cities = await this.cityRepo.getAll();

    const citiesDistances = cities.map(
      (item) => this.haversineService.getDistanceInMeters(item.coord, coordinate)
    );

    const nearestCities = new Array<number>();

    nearestCities[0] = 0;
    let quantityFound = 1;
    for (let i = 1; i < citiesDistances.length; i++) {
      for (let j = 0; j < quantityFound; j++) {
        if (citiesDistances[i] <= citiesDistances[nearestCities[j]]) {
          if (quantityFound < proximity)
            quantityFound++;
          for (let k = quantityFound - 1; k > j; k--) {
            nearestCities[k] = nearestCities[k - 1];
          }
          nearestCities[j] = i;

          j = quantityFound;
        }
      }
      if (
        citiesDistances[i] > citiesDistances[nearestCities[quantityFound - 1]]
        &&
        quantityFound < proximity
      ) {
        nearestCities[quantityFound] = i;
        quantityFound++;
      }
    }

    return nearestCities.map(
      (item) => cities[item]
    );
  }
}
