import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IAddedLocation } from "./IMapState";

export interface IMapProps {
  description: string;
  context: WebPartContext;
  onLocationSelected: (locationData: IAddedLocation) => void;
}
