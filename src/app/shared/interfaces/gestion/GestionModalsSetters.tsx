import { ModalsInterfaceProps } from "../modals/ModalsInterfaceProps";

export interface GestionModalsSetters extends ModalsInterfaceProps{
    OpenManagerSetter : boolean
    SetOpenManagerGestionComponentSetter : (value : boolean) => void;
}