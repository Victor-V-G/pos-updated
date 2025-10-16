import { ProductoInterface } from "../producto/ProductoInterface";

export interface PropsProductoFind {
    ProductoFindSetter: ProductoInterface[],
    setProductoAgregado: (productos: ProductoInterface[]) => void;
    setLimpiarInput: (value: boolean) => void;
}