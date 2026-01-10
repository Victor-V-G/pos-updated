import {
  doc,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDoc,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";

import { db } from "./Conexion";

import {
  ProductoInterface,
  ProductoConIDInterface,
} from "../../domain/entities";

import { IDDocumentosInterface } from "@/shared/types";
import { RegistrosYMovimientosInterface } from "@/shared/types";
import { ProductoVenta } from "@/shared/types";

/*----------------------------------PRODUCTOS--------------------------------------*/

export const registrarProductoPromise = async (
  productoGet: ProductoInterface
) => {
  const docRef = await addDoc(collection(db, "Productos"), {
    NombreProducto: productoGet.NombreProducto,
    CodigoDeBarras: productoGet.CodigoDeBarras,
    Precio: productoGet.Precio,
    Stock: productoGet.Stock,
    TipoProducto: productoGet.TipoProducto ?? "unidad",
  });

  console.log("PRODUCTO REGISTRADO ID:", docRef.id);
};

export const obtenerProductoPorCodigoPromise = async (
  codigoDeBarras: string
): Promise<ProductoConIDInterface | null> => {
  try {
    const q = query(
      collection(db, "Productos"),
      where("CodigoDeBarras", "==", codigoDeBarras)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const docSnap = querySnapshot.docs[0];
    const data = docSnap.data();

    return {
      id: docSnap.id,
      NombreProducto: data.NombreProducto,
      CodigoDeBarras: data.CodigoDeBarras,
      Precio: data.Precio,
      Stock: data.Stock,
      TipoProducto: data.TipoProducto ?? "unidad",
    };
  } catch (error) {
    console.error("Error al obtener producto por código:", error);
    return null;
  }
};

export const obtenerProductoPorNombrePromise = async (
  nombreProducto: string
): Promise<ProductoConIDInterface | null> => {
  try {
    const q = query(
      collection(db, "Productos"),
      where("NombreProducto", "==", nombreProducto)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const docSnap = querySnapshot.docs[0];
    const data = docSnap.data();

    return {
      id: docSnap.id,
      NombreProducto: data.NombreProducto,
      CodigoDeBarras: data.CodigoDeBarras,
      Precio: data.Precio,
      Stock: data.Stock,
      TipoProducto: data.TipoProducto ?? "unidad",
    };
  } catch (error) {
    console.error("Error al obtener producto por nombre:", error);
    return null;
  }
};

export const obtenerProductosPromise = async () => {
  let listadoObtenidoGet: ProductoInterface[] = [];
  const querySnapshot = await getDocs(collection(db, "Productos"));

  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    listadoObtenidoGet.push({
      NombreProducto: data.NombreProducto,
      CodigoDeBarras: data.CodigoDeBarras,
      Precio: data.Precio,
      Stock: data.Stock,
      TipoProducto: data.TipoProducto ?? "unidad",
    });
  });

  return listadoObtenidoGet;
};

export const obtenerIDProductosPromise = async () => {
  let ids: IDDocumentosInterface[] = [];
  const querySnapshot = await getDocs(collection(db, "Productos"));

  querySnapshot.forEach((docSnap) => {
    ids.push({ IDDocumento: docSnap.id });
  });

  return ids;
};

export const obtenerProductosPromiseUpdate = async (): Promise<
  ProductoConIDInterface[]
> => {
  let listado: ProductoConIDInterface[] = [];
  const querySnapshot = await getDocs(collection(db, "Productos"));

  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();

    listado.push({
      id: docSnap.id,
      NombreProducto: data.NombreProducto,
      CodigoDeBarras: data.CodigoDeBarras,
      Precio: data.Precio,
      Stock: data.Stock,
      TipoProducto: data.TipoProducto ?? "unidad",
    });
  });

  return listado;
};

export const modificarProductoPromise = async (
  id: string,
  producto: ProductoConIDInterface
) => {
  await updateDoc(doc(db, "Productos", id), {
    NombreProducto: producto.NombreProducto,
    CodigoDeBarras: producto.CodigoDeBarras,
    Precio: producto.Precio,
    Stock: producto.Stock,
    TipoProducto: producto.TipoProducto ?? "unidad",
  });
};

export const reponerStockPromise = async (
  id: string,
  cantidad: number
) => {
  const docRef = doc(db, "Productos", id);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) return null;

  const stockActual = Number(snapshot.data().Stock) || 0;
  const stockNuevo = stockActual + Number(cantidad);

  await updateDoc(docRef, { Stock: stockNuevo });

   try {
     const data = snapshot.data() as ProductoConIDInterface;
     const nombre = data.NombreProducto || "Producto";
     const codigo = data.CodigoDeBarras || "-";

     await registrarMovimientosPromise(
       "Reestock",
       `Stock repuesto: nombre: ${nombre}, código de barras: ${codigo}, cantidad agregada: ${cantidad}, stock anterior: ${stockActual}, stock final: ${stockNuevo}`
     );
   } catch (err) {
     console.error("Error registrando movimiento de reestock", err);
   }

  return stockNuevo;
};

export const eliminarProductoPromise = async (id: string) => {
  await deleteDoc(doc(db, "Productos", id));
};

/*----------------------------------SEARCH--------------------------------------*/

export const obtenerIDProductoSearchModificarPromise = async (
  campo: string,
  valor: string
) => {
  let ids: IDDocumentosInterface[] = [];
  const qSnap = query(collection(db, "Productos"), where(campo, "==", valor));
  const rs = await getDocs(qSnap);

  rs.forEach((docSnap) => ids.push({ IDDocumento: docSnap.id }));

  return ids;
};

export const searchObtenerProductoPorIdPromise = async (
  idGet: IDDocumentosInterface
) => {
  const docRef = doc(db, "Productos", idGet.IDDocumento);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return [];

  const data = docSnap.data();

  return [
    {
      NombreProducto: data.NombreProducto,
      CodigoDeBarras: data.CodigoDeBarras,
      Precio: data.Precio,
      Stock: data.Stock,
      TipoProducto: data.TipoProducto ?? "unidad",
    },
  ];
};

/*-------------------------------REGISTROS-------------------------------------*/

export const registrarMovimientosPromise = async (
  accion: string,
  cambios: string
) => {
  await addDoc(collection(db, "Movimientos"), {
    accion,
    cambios,
    fechaHora: serverTimestamp(),
  });
};

export const obtenerMovimientosPromise = async () => {
  let listado: RegistrosYMovimientosInterface[] = [];
  const rs = await getDocs(collection(db, "Movimientos"));

  rs.forEach((docSnap) =>
    listado.push({
      accion: docSnap.data().accion,
      cambios: docSnap.data().cambios,
      fechaHora: docSnap.data().fechaHora
        ? docSnap.data().fechaHora.toDate().toLocaleString()
        : "Sin fecha",
    })
  );

  return listado;
};

/*-------------------------------VENTAS-------------------------------------*/

interface RegistrarVentaPayload {
  ProductosVenta: ProductoVenta[];
  TotalGeneral: number;
  metodoPago: "EFECTIVO" | "DEBITO";
  pagoCliente: number | null;
  vueltoEntregado: number | null;
}

export const registrarVentaYActualizarStockPromise = async ({
  ProductosVenta,
  TotalGeneral,
  metodoPago,
  pagoCliente,
  vueltoEntregado,
}: RegistrarVentaPayload) => {
  try {
    const ventaRef = await addDoc(collection(db, "Ventas"), {
      ProductosVenta,
      TotalGeneral,
      metodoPago,
      pagoCliente,
      vueltoEntregado,
      fechaHora: serverTimestamp(),
    });

    console.log("VENTA OK ID:", ventaRef.id);

    // Actualizar stock
    for (const item of ProductosVenta) {
      const qProd = query(
        collection(db, "Productos"),
        where("CodigoDeBarras", "==", item.CodigoDeBarras)
      );

      const rs = await getDocs(qProd);

      for (const docSnap of rs.docs) {
        const data = docSnap.data();
        const stockActual = Number(data.Stock);
        const stockNuevo = stockActual - Number(item.cantidad);

        await updateDoc(doc(db, "Productos", docSnap.id), {
          Stock: stockNuevo < 0 ? 0 : stockNuevo,
        });
      }
    }

    return true;
  } catch (err) {
    console.error("ERROR VENTA:", err);
    return false;
  }
};

export const obtenerVentasPromise = async () => {
  const q = query(collection(db, "Ventas"), orderBy("fechaHora", "desc"));
  const rs = await getDocs(q);

  return rs.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
    fechaHora:
      docSnap.data().fechaHora?.toDate().toLocaleString("es-CL") ?? "Sin fecha",
  }));
};

export const eliminarVentaPromise = async (id: string) => {
  await deleteDoc(doc(db, "Ventas", id));
  return true;
};

