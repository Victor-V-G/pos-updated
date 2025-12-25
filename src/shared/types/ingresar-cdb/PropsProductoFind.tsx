import { ProductoInterface } from "../producto/ProductoInterface";

export interface PropsProductoFind {
  ProductoFindSetter: ProductoInterface[];
  setProductoAgregado: (p: ProductoInterface[]) => void;
  setLimpiarInput: (b: boolean) => void;

  // 🔥 Para evitar error TS
  modoAutomatico?: boolean;
}