import { ModalsInterfaceProps } from "@/shared/types";
import VentaComponent from "./VentaComponent";

export const VentaModals = ({ OpenManager }: ModalsInterfaceProps) => {
  if (OpenManager === false) {
    return null;
  }

  return <VentaComponent />;
};

export default VentaModals;