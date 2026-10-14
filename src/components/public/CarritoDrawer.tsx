import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, MessageCircle } from 'lucide-react';
import { formatCOP } from '../../utils/formatters';
import type { SoapProduct } from './DetalleJabonModal';

export interface CartItem {
  product: SoapProduct;
  quantity: number;
}

interface CarritoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
}

export const CarritoDrawer: React.FC<CarritoDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  if (!isOpen) return null;

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrecio = items.reduce(
    (sum, item) => sum + item.product.valor_venta * item.quantity,
    0
  );

  const handlePedirWhatsApp = () => {
    if (items.length === 0) return;

    const listaProductos = items
      .map(
        (i) =>
          `• ${i.quantity}x ${i.product.nombre} (${formatCOP(
            i.product.valor_venta * i.quantity
          )} COP)`
      )
      .join('\n');

    const mensaje = `¡Hola Jabhaco Lab! 🧼 Quiero realizar el siguiente pedido desde el catálogo web:

${listaProductos}

━━━━━━━━━━━━━━━━━━━
💰 *Total Estimado: ${formatCOP(totalPrecio)} COP*
━━━━━━━━━━━━━━━━━━━

¿Tienen disponibilidad y cómo coordinamos el envío? ¡Muchas gracias!`;

    window.open(`https://wa.me/?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Carrito */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#0b5c3b]/10 text-[#0b5c3b] flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                Mi Bolsa de Compras
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                {totalItems === 0
                  ? 'Bolsa vacía'
                  : `${totalItems} ${totalItems === 1 ? 'producto' : 'productos'}`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            title="Cerrar bolsa"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lista de Productos Scrolleable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 divide-y divide-slate-100">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 text-slate-400 my-auto">
              <div className="w-20 h-20 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300">
                <ShoppingBag className="w-10 h-10 stroke-1" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-700">Tu bolsa está vacía</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Explora nuestros jabones botánicos y pulsa en "Enviar a bolsa" para armar tu pedido.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 px-5 py-2.5 rounded-2xl bg-[#0b5c3b] hover:bg-[#08482e] text-white font-bold text-xs shadow-md shadow-[#0b5c3b]/20 transition-all cursor-pointer"
              >
                Ver Catálogo
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.product.id}
                className="pt-3 first:pt-0 flex items-center gap-3 group"
              >
                {/* Miniatura del Producto */}
                <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200/80 overflow-hidden shrink-0">
                  {item.product.foto_producto_url ? (
                    <img
                      src={item.product.foto_producto_url}
                      alt={item.product.nombre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl">🧼</div>
                  )}
                </div>

                {/* Info del Producto */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                    {item.product.nombre}
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate">
                    {item.product.tipo_piel || 'Jabón botánico'}
                  </p>
                  <p className="text-xs font-black text-[#0b5c3b] mt-0.5">
                    {formatCOP(item.product.valor_venta)} COP
                  </p>
                </div>

                {/* Control Stepper de Cantidad */}
                <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200 shrink-0">
                  <button
                    type="button"
                    onClick={() => onUpdateQuantity(item.product.id, -1)}
                    className="w-6 h-6 rounded-lg bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shadow-xs"
                    title="Disminuir"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-5 text-center text-xs font-extrabold text-slate-900">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => onUpdateQuantity(item.product.id, 1)}
                    className="w-6 h-6 rounded-lg bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shadow-xs"
                    title="Aumentar"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Botón Eliminar */}
                <button
                  type="button"
                  onClick={() => onRemoveItem(item.product.id)}
                  className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors"
                  title="Eliminar de la bolsa"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer con Resumen y Checkout por WhatsApp */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/80 space-y-3 shrink-0">
            <div className="space-y-1.5 text-xs text-slate-500">
              <div className="flex justify-between">
                <span>Subtotal ({totalItems} items):</span>
                <span className="font-bold text-slate-700">{formatCOP(totalPrecio)} COP</span>
              </div>
              <div className="flex justify-between">
                <span>Entrega / Envío:</span>
                <span className="font-semibold text-emerald-700">Por coordinar</span>
              </div>
              <div className="border-t border-slate-200/80 pt-2 flex justify-between text-base font-black text-slate-900">
                <span>Total a pagar:</span>
                <span className="text-[#0b5c3b]">{formatCOP(totalPrecio)} COP</span>
              </div>
            </div>

            {/* Botón Principal: Pedir por WhatsApp */}
            <button
              type="button"
              onClick={handlePedirWhatsApp}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#0b5c3b] hover:bg-[#08482e] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#0b5c3b]/25 active:scale-98 transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Pedir por WhatsApp ({formatCOP(totalPrecio)})</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Vaciar bolsa */}
            <div className="text-center pt-0.5">
              <button
                type="button"
                onClick={onClearCart}
                className="text-[11px] text-slate-400 hover:text-rose-600 transition-colors underline"
              >
                Vaciar toda la bolsa
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
