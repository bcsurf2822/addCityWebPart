import { SPFI, spfi, SPFx } from "@pnp/sp";
import { WebPartContext } from "@microsoft/sp-webpart-base";

let sp: SPFI;

export const initializePnP = (context: WebPartContext): void => {
    sp = spfi().using(SPFx(context));
};

export const getSP = (): SPFI => {
    if (!sp) {
        throw new Error("SPFI is not initialized");
    }
    return sp;
};