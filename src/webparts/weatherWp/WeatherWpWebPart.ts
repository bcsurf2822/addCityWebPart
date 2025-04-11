import * as React from "react";
import * as ReactDom from "react-dom";
import { Version } from "@microsoft/sp-core-library";
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField,
} from "@microsoft/sp-property-pane";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import { IReadonlyTheme } from "@microsoft/sp-component-base";

import * as strings from "WeatherWpWebPartStrings";
import LocationListAndMap from "./components/WeatherWp";
import { IWeatherWpProps } from "./components/IWeatherWpProps";
import { initializePnP } from "./pnpConfig";

import {
  IDynamicDataSource,
  IDynamicDataPropertyDefinition,
  IDynamicDataSourceMetadata,
  IDynamicDataAnnotatedPropertyValue,
} from "@microsoft/sp-dynamic-data";

export interface IWeatherWpWebPartProps {
  description: string;
}

export default class WeatherWpWebPart
  extends BaseClientSideWebPart<IWeatherWpWebPartProps>
  implements IDynamicDataSource
{
  public getPropertyDefinitionsAsync(): Promise<
    ReadonlyArray<IDynamicDataPropertyDefinition>
  > {

    console.warn(
      "getPropertyDefinitionsAsync called but not implemented; returning sync definitions."
    );
    return Promise.resolve(this.getPropertyDefinitions());
  }

  public getPropertyValueAsync(propertyId: string): Promise<number> {
    console.warn(
      `getPropertyValueAsync called for ${propertyId} but not implemented; returning sync value.`
    );
    try {
      return Promise.resolve(this.getPropertyValue(propertyId));
    } catch (error) {
      return Promise.reject(error); 
    }
  }

  public getAnnotatedPropertyValueAsync(
    propertyId: string
  ): Promise<IDynamicDataAnnotatedPropertyValue> {
   
    console.warn(
      `getAnnotatedPropertyValueAsync called for ${propertyId} but not implemented.`
    );
    return Promise.resolve({
      value: undefined,
      sampleValue: undefined,
    });
  }

  public getAnnotatedPropertyValue(
    propertyId: string
  ): IDynamicDataAnnotatedPropertyValue {
    console.warn(
      `getAnnotatedPropertyValue called for ${propertyId} but not implemented.`
    );
    return {
      sampleValue: undefined,
    };
  }
  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = "";

  private _dataVersion: number = 0;

  public get id(): string {
    return "7c3fd91e-c64b-4f92-8795-02317e1ca9a5-CitiesProvider";
  }

  public get metadata(): IDynamicDataSourceMetadata {
    return {
      title: "City List Provider",
    };
  }

  public getPropertyDefinitions(): ReadonlyArray<IDynamicDataPropertyDefinition> {
    return [
      {
        id: "citiesUpdated", 
        title: "Cities List Updated Notification",
      },
    ];
  }

  public getPropertyValue(propertyId: string): number {
    switch (propertyId) {
      case "citiesUpdated":
        return this._dataVersion; 
    }
    throw new Error("Unknown property id");
  }

  private _handleCityAdded = (): void => {
    console.log(
      "WeatherWpWebPart: City added notification received from component."
    );
    this._dataVersion++;
    this.context.dynamicDataSourceManager.notifyPropertyChanged(
      "citiesUpdated"
    );
    console.log("WeatherWpWebPart: Notified consumers: citiesUpdated");
  };

  public render(): void {
    const element: React.ReactElement<IWeatherWpProps> = React.createElement(
      LocationListAndMap,
      {
        description: this.properties.description,
        isDarkTheme: this._isDarkTheme,
        environmentMessage: this._environmentMessage,
        hasTeamsContext: !!this.context.sdks.microsoftTeams,
        userDisplayName: this.context.pageContext.user.displayName,
        context: this.context,
        onCityAddedSuccessfully: this._handleCityAdded,
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected async onInit(): Promise<void> {
    initializePnP(this.context);

    this.context.dynamicDataSourceManager.initializeSource(this);
    console.log("Provider: Dynamic Data Source Initialized in onInit.");

    const message = await this._getEnvironmentMessage();
    this._environmentMessage = message;
  }

  private _getEnvironmentMessage(): Promise<string> {
    if (!!this.context.sdks.microsoftTeams) {
      return this.context.sdks.microsoftTeams.teamsJs.app
        .getContext()
        .then((context) => {
          let environmentMessage: string = "";
          switch (context.app.host.name) {
            case "Office": 
              environmentMessage = this.context.isServedFromLocalhost
                ? strings.AppLocalEnvironmentOffice
                : strings.AppOfficeEnvironment;
              break;
            case "Outlook": 
              environmentMessage = this.context.isServedFromLocalhost
                ? strings.AppLocalEnvironmentOutlook
                : strings.AppOutlookEnvironment;
              break;
            case "Teams": 
            case "TeamsModern":
              environmentMessage = this.context.isServedFromLocalhost
                ? strings.AppLocalEnvironmentTeams
                : strings.AppTeamsTabEnvironment;
              break;
            default:
              environmentMessage = strings.UnknownEnvironment;
          }

          return environmentMessage;
        });
    }

    return Promise.resolve(
      this.context.isServedFromLocalhost
        ? strings.AppLocalEnvironmentSharePoint
        : strings.AppSharePointEnvironment
    );
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

    this._isDarkTheme = !!currentTheme.isInverted;
    const { semanticColors } = currentTheme;

    if (semanticColors) {
      this.domElement.style.setProperty(
        "--bodyText",
        semanticColors.bodyText || null
      );
      this.domElement.style.setProperty("--link", semanticColors.link || null);
      this.domElement.style.setProperty(
        "--linkHovered",
        semanticColors.linkHovered || null
      );
    }
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse("1.0");
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription,
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField("description", {
                  label: strings.DescriptionFieldLabel,
                }),
              ],
            },
          ],
        },
      ],
    };
  }
}
