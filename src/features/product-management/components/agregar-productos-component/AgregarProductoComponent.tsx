import { ProductoInterface } from '@/core/domain/entities';
import { useState } from 'react';
import { registrarMovimientosPromise, registrarProductoPromise } from '@/core/infrastructure/firebase';
import { ArrowLeft, Package, X } from 'lucide-react';

const InitialStateProducto: ProductoInterface = {
  NombreProducto: "",
  CodigoDeBarras: "",
  Precio: "",
  Stock: "",
  TipoProducto: "unidad",
};

interface ProductFormProps {
  onClose: () => void;
}

export function ProductForm({ onClose }: ProductFormProps) {
  const [Producto, setProducto] = useState<ProductoInterface>(InitialStateProducto);

  const handleInputProducto = (name: string, value: string) => {
    setProducto({ ...Producto, [name]: value });
  };

  const handleCallPromiseRegistrarProductos = () => {
    registrarProductoPromise(Producto)
      .then(() => {
        alert("PRODUCTO REGISTRADO CORRECTAMENTE");
        setProducto(InitialStateProducto);
      })
      .catch((error) => {
        alert("OCURRIO UN ERROR AL REGISTRAR");
        console.log(error);
      });
  };

  const handleCallRegistrarMovimiento = () => {
    const accion = Producto;
    registrarMovimientosPromise(
      "REGISTRAR PRODUCTO",
      `Se ha Registrado el producto con nombre: ${accion.NombreProducto}, codigo de barras: ${accion.CodigoDeBarras}, precio unitario: ${accion.Precio}, stock: ${accion.Stock} (${accion.TipoProducto === "peso" ? "kg" : "unidades"})`
    )
      .then(() => {
        console.log("MOVIMIENTO REGISTRADO");
      })
      .catch(() => {
        alert("NO SE PUDO REGISTRAR LA ACCION");
      });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    handleInputProducto(name, value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!Producto.NombreProducto || !Producto.CodigoDeBarras || !Producto.TipoProducto || !Producto.Precio || !Producto.Stock) {
      alert('Todos los campos son obligatorios');
      return;
    }
    handleCallPromiseRegistrarProductos();
    handleCallRegistrarMovimiento();
  };

  return (
    // CAMBIO CLAVE: max-h-[90vh] y overflow-y-auto evitan que se estire fuera de la pantalla
    <div className="w-full bg-white rounded-2xl shadow-xl relative p-8 max-h-[90vh] overflow-y-auto scrollbar-hide">
      
      {/* Botón Cerrar */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-5 right-5 p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors z-10"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-blue-100 rounded-lg text-blue-600">
            <Package className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Registrar Producto</h1>
        </div>
        <p className="text-gray-500 ml-12 text-sm">Agrega un nuevo producto al inventario</p>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        
        {/* Nombre */}
        <div>
          <label htmlFor="NombreProducto" className="block text-sm font-semibold text-gray-700 mb-1.5">
            Nombre del Producto
          </label>
          <input
            type="text"
            id="NombreProducto"
            name="NombreProducto"
            value={Producto.NombreProducto}
            onChange={handleChange}
            placeholder="Ej: Coca Cola 2L"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm text-gray-800"
          />
        </div>

        {/* Código de Barras */}
        <div>
          <label htmlFor="CodigoDeBarras" className="block text-sm font-semibold text-gray-700 mb-1.5">
            Código de Barras
          </label>
          <input
            type="text"
            id="CodigoDeBarras"
            name="CodigoDeBarras"
            value={Producto.CodigoDeBarras}
            onChange={handleChange}
            placeholder="7790123456789"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm text-gray-800"
          />
        </div>

        {/* Tipo de Producto */}
        <div>
          <label htmlFor="TipoProducto" className="block text-sm font-semibold text-gray-700 mb-1.5">
            Tipo de Producto
          </label>
          <select
            id="TipoProducto"
            name="TipoProducto"
            value={Producto.TipoProducto}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white text-sm text-gray-800"
          >
            <option value="unidad">Por unidad</option>
            <option value="peso">Por peso (kg)</option>
          </select>
        </div>

        {/* Precio */}
        <div>
          <label htmlFor="Precio" className="block text-sm font-semibold text-gray-700 mb-1.5">
            {Producto.TipoProducto === 'peso' ? 'Precio (kg)' : 'Precio'}
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              id="Precio"
              name="Precio"
              value={Producto.Precio}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm text-gray-800"
            />
          </div>
        </div>

        {/* Stock */}
        <div>
          <label htmlFor="Stock" className="block text-sm font-semibold text-gray-700 mb-1.5">
            Stock
          </label>
          <input
            type="number"
            id="Stock"
            name="Stock"
            value={Producto.Stock}
            onChange={handleChange}
            placeholder="0"
            step={Producto.TipoProducto === 'peso' ? '0.01' : '1'}
            min="0"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm text-gray-800"
          />
        </div>

        {/* Footer: Botones y Alerta */}
        <div className="pt-2 flex flex-col gap-3">
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
          >
            Registrar Producto
          </button>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 px-4">
            <p className="text-amber-700 text-xs text-center font-medium">
              Todos los campos son obligatorios. Asegúrate de ingresar la información correcta.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-600 font-medium py-3 px-6 rounded-lg transition duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver Atrás
          </button>
        </div>
      </form>
    </div>
  );
}