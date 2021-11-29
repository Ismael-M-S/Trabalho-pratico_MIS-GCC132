import { Coordinate } from '../../entities/coordinate';

export abstract class LocationRepository {
  abstract getCoordinate(): Promise<Coordinate>;
}
