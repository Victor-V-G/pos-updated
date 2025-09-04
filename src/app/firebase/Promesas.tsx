import { doc, collection, addDoc, getDocs, updateDoc, deleteDoc, query, where } from "firebase/firestore";
import { db } from "./Conexion"
import { ProductoInterface } from "../shared/interfaces/producto/ProductoInterface";
import { IDDocumentosInterface } from "../shared/interfaces/id-documentos/IDDocumentosInterface";


export const registrarProductoPromise = async(productoGet : ProductoInterface) => {
    const docRef = await addDoc(collection(db, "Productos"), productoGet);
    console.log("Producto registrado con ID: ", docRef.id);
}


export const obtenerProductosPromise = async () => {
    let listadoObtenidoGet : ProductoInterface[] = []
        const querySnapshot = await getDocs(collection(db, "Productos"));
        querySnapshot.forEach((doc) => {
            let productoGet : ProductoInterface = {
                    NombreProducto : doc.data().NombreProducto,
                    CodigoDeBarras : doc.data().CodigoDeBarras,
                    Precio : doc.data().Precio,
                    Stock : doc.data().Stock
            }
        listadoObtenidoGet.push(productoGet);
        console.log("PRODUCTO RECUPERADO");
    });
    return listadoObtenidoGet;
}


export const obtenerIDProductosPromise = async () => {
    let idsDocumentosGet : IDDocumentosInterface[] = []
        const querySnapshot = await getDocs(collection(db, "Productos"));
        querySnapshot.forEach((doc) => {
            let idDocumentoGet : IDDocumentosInterface = {
                IDDocumento : doc.id
            }
        idsDocumentosGet.push(idDocumentoGet);
        console.log("ID DEL DOCUMENTO RECUPERADO: ", doc.id)
        });
    return idsDocumentosGet;
}


export const modificarProductoPromise = async (idGet : IDDocumentosInterface, productoModificadoGet : ProductoInterface) => {
    const docRef = doc(db, "Productos", idGet.IDDocumento);
        await updateDoc(docRef, {
            NombreProducto : productoModificadoGet.NombreProducto,
            CodigoDeBarras : productoModificadoGet.CodigoDeBarras,
            Precio : productoModificadoGet.Precio,
            Stock : productoModificadoGet.Stock
        });
    console.log("PRODUCTO MODIFICADO CON ID: ", idGet.IDDocumento);
}


export const eliminarProductoPromise = async (idGet : IDDocumentosInterface) => {
    await deleteDoc(doc(db, "Productos", idGet.IDDocumento));
    console.log("PRODUCTO ELIMINADO CON ID: ", idGet.IDDocumento);
}



export const obtenerIDProductoSearchModificarPromise = async (campo : string, valor : string) => {
    const DatosAPreguntar = query(collection(db, "Productos"), where(campo, "==", valor));
    const querySnapshot = await getDocs(DatosAPreguntar);
    if (querySnapshot.empty) {
        alert("NO SE ENCONTRO EL PRODUCTO EN LA BASE DE DATOS");
        return null;
    }

    const doc = querySnapshot.docs[0];
    const idDocumentoGet : IDDocumentosInterface = {
        IDDocumento: doc.id,
    };
    console.log("DOCUMENTO ENCONTRADO:")
    console.log(idDocumentoGet)

    return idDocumentoGet;
}