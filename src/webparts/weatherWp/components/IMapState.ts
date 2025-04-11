import { ILocationPickerItem } from "@pnp/spfx-controls-react/lib/LocationPicker";

export interface IAddedLocation {
  displayName: string;
  city: string;
  state: string;
}

export interface IMapState {
  selectedLocation: ILocationPickerItem | undefined;
  errorMessage?: string;
}
