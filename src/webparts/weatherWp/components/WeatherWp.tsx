import * as React from "react";
import type { IWeatherWpProps } from "./IWeatherWpProps";
import SPFxList from "./SPFxList";
import Map from "./Map";
import { useState } from "react";
import { IAddedLocation } from "./IMapState";

const LocationListAndMap: React.FC<IWeatherWpProps> = (props) => {
  const { context, onCityAddedSuccessfully } = props;

  const [locationToAdd, setLocationToAdd] = useState<
    IAddedLocation | undefined
  >(undefined);

  const handleLocationSelected = (data: IAddedLocation): void => {
    setLocationToAdd(data);
  };

  const handleAddedLocation = (): void => {
    setLocationToAdd(undefined);
  };

  return (
    <section style={{ display: "flex", gap: "20px" }}>
      <div style={{ flex: 1 }}>
        <Map
          context={context}
          description="Select a location using the picker:"
          onLocationSelected={handleLocationSelected}
        />
      </div>
      <div style={{ flex: 1 }}>
        <SPFxList
          listName="Cities"
          locationToAdd={locationToAdd}
          onAddedLocation={handleAddedLocation}
          onCityAddedSuccessfully={onCityAddedSuccessfully}
        />
      </div>
    </section>
  );
};

export default LocationListAndMap;
