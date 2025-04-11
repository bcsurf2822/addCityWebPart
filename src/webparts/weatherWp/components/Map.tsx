import {
  LocationPicker,
  ILocationPickerItem,
} from "@pnp/spfx-controls-react/lib/LocationPicker";
import { IAddedLocation, IMapState } from "./IMapState";
import { IMapProps } from "./IMapProps";
import * as React from "react";
import { normalizeStateNames } from "../utils/stateNormalizer";
import { PrimaryButton } from "@fluentui/react/lib/Button";
import styles from "./Map.module.scss";

export default class Map extends React.Component<IMapProps, IMapState> {
  constructor(props: IMapProps) {
    super(props);
    this.state = {
      selectedLocation: undefined,
      errorMessage: undefined,
    };
  }

  private _onLocationChange = (
    location: ILocationPickerItem | undefined
  ): void => {
    if (location) {
      let processedState = "";
      console.log("Location Selected:", location);

      const originalState = location.Address?.State;
      processedState = normalizeStateNames(originalState);
      console.log(
        `Original State: '${originalState}', Processed State: '${processedState}'`
      );
      this.setState({ selectedLocation: location, errorMessage: undefined });
    } else {
      console.log("Location Cleared");
      this.setState({ selectedLocation: undefined, errorMessage: undefined });
    }
  };

  private _addLocationToList = (): void => {
    const { selectedLocation } = this.state;

    if (!selectedLocation || !selectedLocation.Address) {
      console.error(
        "Cannot add location: No location selected or address info missing."
      );
      this.setState({
        errorMessage:
          "Cannot add location: Selection or address info is missing.",
      });
      return;
    }

    const city = selectedLocation.Address.City || "";
    const originalState = selectedLocation.Address.State;
    const abbreviatedState = normalizeStateNames(originalState || "");

    if (!city || !abbreviatedState) {
      console.error(
        "Cannot add location: City or State information is missing or could not be processed."
      );
      this.setState({
        errorMessage:
          "Selected location is missing valid City or State information.",
      });
      return;
    }

    const newLocation: IAddedLocation = {
      displayName: `${city}, ${abbreviatedState}`,
      city: city,
      state: abbreviatedState,
    };

    this.props.onLocationSelected(newLocation);

    this.setState({
      selectedLocation: undefined,
      errorMessage: undefined,
    });
  };

  public render(): React.ReactElement<IMapProps> {
    const { selectedLocation, errorMessage } = this.state;
    const displayState = selectedLocation
      ? normalizeStateNames(selectedLocation.Address?.State)
      : "N/A";

    return (
      <div className={styles.mapContainer}>
        <h2 className={styles.title}>Add A Location To List</h2>
        <LocationPicker
          context={this.props.context}
          label="Search for a location"
          placeholder="Enter address, city, or place name..."
          onChange={this._onLocationChange}
          errorMessage={errorMessage}
        />
        <hr className={styles.divider} />
        <h3 className={styles.subtitle}>Selected Location Details:</h3>

        {selectedLocation ? (
          <div className={styles.locationDetails}>
            <p className={styles.locationProperty}>
              <span className={styles.propertyLabel}>Display Name:</span>
              <span>{selectedLocation.DisplayName}</span>
            </p>

            {selectedLocation.Address && (
              <>
                <p className={styles.locationProperty}>
                  <span className={styles.propertyLabel}>Street:</span>
                  <span>{selectedLocation.Address.Street || "N/A"}</span>
                </p>
                <p className={styles.locationProperty}>
                  <span className={styles.propertyLabel}>City:</span>
                  <span>{selectedLocation.Address.City || "N/A"}</span>
                </p>
                <p className={styles.locationProperty}>
                  <span className={styles.propertyLabel}>State/Province:</span>
                  <span>{selectedLocation.Address.State || "N/A"}</span>
                </p>
              </>
            )}
            <div className={styles.buttonContainer}>
              <PrimaryButton
                text="Add Location"
                onClick={this._addLocationToList}
                disabled={
                  !selectedLocation.Address?.City ||
                  !displayState ||
                  displayState === "N/A"
                }
              />
            </div>
          </div>
        ) : (
          <p>No location selected yet.</p>
        )}
      </div>
    );
  }
}
