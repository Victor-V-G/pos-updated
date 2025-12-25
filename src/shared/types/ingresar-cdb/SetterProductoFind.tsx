import { ProductoInterface } from "../producto/ProductoInterface";

export interface SetterProductoFind {
  LimpiarImput: boolean
  setLimpiarInput: (value: boolean) => void;
  setProductoFindSetter: (productos: ProductoInterface[]) => void;
}