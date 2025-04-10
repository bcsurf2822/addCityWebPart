import * as React from "react";
import type { IWeatherWpProps } from "./IWeatherWpProps";
import SPFxList from "./SPFxList";
import Map from "./Map";
import { useState } from "react";
import { IAddedLocation } from "./IMapState";

const WeatherWp: React.FC<IWeatherWpProps> = (props) => {
  const { context } = props;

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
    <section>
      <Map
        context={context}
        description="Select a location using the picker:"
        onLocationSelected={handleLocationSelected}
      />
      <hr style={{ margin: "20px 0" }} />
      <SPFxList
        listName="Cities"
        locationToAdd={locationToAdd}
        onAddedLocation={handleAddedLocation}
      />
    </section>
  );
};

export default WeatherWp;
