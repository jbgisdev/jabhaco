import React, { useState, useEffect } from 'react';
import { Header } from './components/common/Header';
import { TabsNav } from './components/common/TabsNav';
import type { TabType } from './components/common/TabsNav';
import { BaseGlicerinaTab } from './components/tabs/BaseGlicerinaTab';
import { AditivosTab } from './components/tabs/AditivosTab';
import { FraganciaColorTab } from './components/tabs/FraganciaColorTab';
import { EmpaqueMoldesTab } from './components/tabs/EmpaqueMoldesTab';
import { CostosIndirectosTab } from './components/tabs/CostosIndirectosTab';
import { ResumenCostosTab } from './components/tabs/ResumenCostosTab';
import { JabonesGuardadosTab } from './components/tabs/JabonesGuardadosTab';
import { AgregarBaseModal } from './components/modals/AgregarBaseModal';
import { AgregarAditivoModal } from './components/modals/AgregarAditivoModal';
import { AgregarFraganciaColorModal } from './components/modals/AgregarFraganciaColorModal';
import { AgregarEmpaqueMoldesModal } from './components/modals/AgregarEmpaqueMoldesModal';
import { AgregarCostoIndirectoModal } from './components/modals/AgregarCostoIndirectoModal';
import { ConfigSupabaseModal } from './components/modals/ConfigSupabaseModal';
import { GuardarJabonModal } from './components/modals/GuardarJabonModal';
import { JabonGuardadoExitoModal } from './components/modals/JabonGuardadoExitoModal';
import { ConfirmModal } from './components/common/ConfirmModal';
import { ToastContainer } from './components/common/Toast';
import type { ToastMessage } from './components/common/Toast';
import type {
  Insumo,
  RecetaItem,
  JabonFormData,
  JabonGuardadoItem,
  Jabon,
  AuthUser,
} from './types/database.types';
import {
  guardarJabonCompleto,
  obtenerJabonesGuardados,
  eliminarJabonGuardado,
} from './lib/supabase';
import { getCurrentUser, logout } from './lib/auth';
import { LoginView } from './components/auth/LoginView';
import { CatalogoPublico } from './components/public/CatalogoPublico';
import { CalculadoraJabonModal } from './components/public/CalculadoraJabonModal';
import { formatDecimal, formatUnidadLabel } from './utils/formatters';
import { Sparkles, ArrowRight } from 'lucide-react';

const INITIAL_FORM_DATA: JabonFormData = {
  nombre: '',
  lema: '',
  descripcion: '',
  tipo_piel: '',
  beneficios: '',
  modo_uso: '',
  observaciones: '',
  cliente: '',
  valor_venta: 0,
  publicado_catalogo: true,
  foto_producto_url: null,
  foto_etiqueta_url: null,
};

export const App: React.FC = () => {
  // Modo de vista principal de la aplicación: 'catalogo' (inicio público), 'login', 'admin_app'
  const [viewMode, setViewMode] = useState<'catalogo' | 'login' | 'admin_app'>('catalogo');

  // Estado de usuario autenticado
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => getCurrentUser());

  const handleLogout = async () => {
    await logout();
    setCurrentUser(null);
    setViewMode('catalogo');
    addToast('info', 'Sesión cerrada', 'Has cerrado sesión con éxito.');
  };

  // Estado de navegación entre pestañas
  const [activeTab, setActiveTab] = useState<TabType>('base_glicerina');

  // Estado del formulario de Jabón
  const [formData, setFormData] = useState<JabonFormData>(INITIAL_FORM_DATA);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof JabonFormData, string>>>({});

  // Componentes agregados a la receta actual
  const [componentes, setComponentes] = useState<RecetaItem[]>([]);

  // Modales de adición de insumos
  const [isAgregarBaseModalOpen, setIsAgregarBaseModalOpen] = useState(false);
  const [isAgregarAditivoModalOpen, setIsAgregarAditivoModalOpen] = useState(false);
  const [isAgregarFraganciaColorModalOpen, setIsAgregarFraganciaColorModalOpen] = useState(false);
  const [isAgregarEmpaqueMoldesModalOpen, setIsAgregarEmpaqueMoldesModalOpen] = useState(false);
  const [isAgregarCostoIndirectoModalOpen, setIsAgregarCostoIndirectoModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isCalculadoraOpen, setIsCalculadoraOpen] = useState(false);

  // Modales del flujo de Guardado de Jabón
  const [isGuardarModalOpen, setIsGuardarModalOpen] = useState(false);
  const [isExitoModalOpen, setIsExitoModalOpen] = useState(false);
  const [jabonRecienGuardado, setJabonRecienGuardado] = useState<Jabon | null>(null);
  const [isGuardadoMock, setIsGuardadoMock] = useState(false);

  // Modal de confirmación de eliminación de insumo
  const [itemAEliminar, setItemAEliminar] = useState<RecetaItem | null>(null);

  // Modal de confirmación para eliminar jabón del catálogo
  const [jabonAEliminar, setJabonAEliminar] = useState<Jabon | null>(null);

  // Estados de guardado y catálogo de jabones
  const [isSaving, setIsSaving] = useState(false);
  const [jabonesGuardados, setJabonesGuardados] = useState<JabonGuardadoItem[]>([]);
  const [isLoadingJabones, setIsLoadingJabones] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (tipo: 'success' | 'error' | 'info', titulo: string, descripcion?: string) => {
    const id = 'toast-' + Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, tipo, titulo, descripcion }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Carga inicial y refresco del catálogo de jabones
  const cargarCatalogoJabones = async () => {
    setIsLoadingJabones(true);
    try {
      const res = await obtenerJabonesGuardados();
      setJabonesGuardados(res.data);
    } catch (err: any) {
      console.error('Error al cargar catálogo:', err);
    } finally {
      setIsLoadingJabones(false);
    }
  };

  useEffect(() => {
    cargarCatalogoJabones();
  }, []);

  const handleFormChange = (field: keyof JabonFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Agregar insumo genérico o especializado a la receta
  const handleSelectInsumoGenerico = (insumo: Insumo, cantidad: number, esEnGotas = false) => {
    setComponentes((prev) => {
      const indexExistente = prev.findIndex((item) => item.insumo_id === insumo.id);

      if (indexExistente >= 0) {
        const itemActual = prev[indexExistente];
        const nuevaCantidad = itemActual.cantidad_usada + cantidad;
        const subtotal = nuevaCantidad * itemActual.costo_unitario_aplicado;

        const updated = [...prev];
        updated[indexExistente] = {
          ...itemActual,
          cantidad_usada: nuevaCantidad,
          es_en_gotas: esEnGotas || itemActual.es_en_gotas,
          subtotal_costo: Number(subtotal.toFixed(2)),
        };
        addToast(
          'info',
          'Cantidad actualizada',
          `Se sumaron ${formatDecimal(cantidad)} ${insumo.unidad === 'gramos' ? 'g' : insumo.unidad === 'mililitros' ? 'ml' : insumo.unidad} a ${insumo.nombre}`
        );
        return updated;
      }

      const subtotal = cantidad * insumo.costo_unitario;
      const nuevoItem: RecetaItem = {
        tempId: 'comp-' + Date.now() + Math.random().toString(36).substring(2, 5),
        insumo_id: insumo.id,
        insumo: insumo,
        cantidad_usada: cantidad,
        es_en_gotas: esEnGotas,
        costo_unitario_aplicado: insumo.costo_unitario,
        subtotal_costo: Number(subtotal.toFixed(2)),
      };

      addToast(
        'success',
        'Insumo agregado a la receta',
        `${formatDecimal(cantidad)} ${insumo.unidad === 'gramos' ? 'g' : insumo.unidad === 'mililitros' ? 'ml' : insumo.unidad} de ${insumo.nombre}`
      );
      return [...prev, nuevoItem];
    });
  };

  // Actualizar cantidad usada de un componente
  const handleUpdateCantidad = (tempId: string, nuevaCantidad: number) => {
    setComponentes((prev) =>
      prev.map((item) => {
        if (item.tempId === tempId) {
          const subtotal = nuevaCantidad * item.costo_unitario_aplicado;
          return {
            ...item,
            cantidad_usada: nuevaCantidad,
            subtotal_costo: Number(subtotal.toFixed(2)),
          };
        }
        return item;
      })
    );
    addToast('info', 'Cantidad modificada correctamente');
  };

  // Solicitar eliminación de insumo
  const handleRequestEliminar = (item: RecetaItem) => {
    setItemAEliminar(item);
  };

  // Confirmar eliminación de insumo
  const handleConfirmEliminar = () => {
    if (!itemAEliminar) return;
    const item = itemAEliminar;
    setComponentes((prev) => prev.filter((c) => c.tempId !== item.tempId));
    addToast('info', 'Insumo eliminado de la receta', item.insumo.nombre);
    setItemAEliminar(null);
  };

  // Abrir modal de Guardado de Jabón con comprobaciones
  const handleOpenGuardarModal = () => {
    if (componentes.length === 0) {
      addToast(
        'info',
        'Receta sin materias primas',
        'Agrega al menos una base de glicerina o insumo a la receta antes de registrar el jabón.'
      );
      setActiveTab('base_glicerina');
      return;
    }
    setIsGuardarModalOpen(true);
  };

  // Ejecución del guardado (desde Modal o desde Resumen)
  const handleConfirmSave = async () => {
    const errors: Partial<Record<keyof JabonFormData, string>> = {};

    if (!formData.nombre.trim()) {
      errors.nombre = 'El nombre del jabón es obligatorio para registrarlo.';
    }
    if (!formData.valor_venta || formData.valor_venta <= 0) {
      errors.valor_venta = 'Debes ingresar un precio de venta mayor a $ 0 COP.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      addToast('error', 'Faltan campos obligatorios', 'Completa el nombre y precio del jabón.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await guardarJabonCompleto(formData, componentes);

      if (res.error && !res.data) {
        addToast('error', 'Error al guardar', res.error);
        return;
      }

      setIsGuardarModalOpen(false);
      setJabonRecienGuardado(res.data);
      setIsGuardadoMock(res.isMock);
      setIsExitoModalOpen(true);

      // Refrescar lista de jabones guardados
      await cargarCatalogoJabones();

      addToast(
        'success',
        '¡Jabón registrado exitosamente!',
        res.isMock
          ? `Guardado en Sandbox Local con ${componentes.length} componentes.`
          : `Persistido en Supabase PostgreSQL con ${componentes.length} componentes.`
      );
    } catch (err: any) {
      addToast('error', 'Error inesperado al guardar', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Crear una nueva formulación desde cero (receta limpia)
  const handleNuevaFormulacion = () => {
    setComponentes([]);
    setFormData(INITIAL_FORM_DATA);
    setFormErrors({});
    setIsExitoModalOpen(false);
    setActiveTab('base_glicerina');
    addToast('info', 'Mesa de formulación limpia', 'Comienza seleccionando tu base de glicerina.');
  };

  // Cargar un jabón guardado en la mesa de formulación
  const handleCargarEnFormulador = (item: JabonGuardadoItem) => {
    setFormData({
      nombre: item.jabon.nombre,
      lema: item.jabon.lema || '',
      descripcion: item.jabon.descripcion || '',
      tipo_piel: item.jabon.tipo_piel || '',
      beneficios: item.jabon.beneficios || '',
      modo_uso: item.jabon.modo_uso || '',
      observaciones: item.jabon.observaciones || '',
      cliente: item.jabon.cliente || '',
      valor_venta: item.jabon.valor_venta,
      publicado_catalogo: item.jabon.publicado_catalogo,
      foto_producto_url: item.jabon.foto_producto_url,
      foto_etiqueta_url: item.jabon.foto_etiqueta_url,
    });
    setComponentes(item.componentes);
    setActiveTab('resumen');
    addToast(
      'success',
      'Jabón cargado en la mesa',
      `Se cargó "${item.jabon.nombre}" con ${item.componentes.length} componentes para consultar o ajustar.`
    );
  };

  // Confirmar y eliminar jabón del catálogo
  const handleConfirmEliminarJabon = async () => {
    if (!jabonAEliminar) return;
    try {
      const res = await eliminarJabonGuardado(jabonAEliminar.id);
      if (res.success) {
        addToast('info', 'Jabón eliminado', `"${jabonAEliminar.nombre}" se eliminó del catálogo.`);
        await cargarCatalogoJabones();
      } else {
        addToast('error', 'No se pudo eliminar', res.error || 'Error desconocido');
      }
    } catch (err: any) {
      addToast('error', 'Error al eliminar', err.message);
    } finally {
      setJabonAEliminar(null);
    }
  };

  // Filtrado de componentes de la receta activa
  const basesReceta = componentes.filter((c) => c.insumo.categoria === 'base_glicerina');
  const basesExistentesIds = basesReceta.map((b) => b.insumo_id);

  const aditivosReceta = componentes.filter((c) => c.insumo.categoria === 'aditivo');
  const aditivosExistentesIds = aditivosReceta.map((a) => a.insumo_id);

  const fraganciaColorReceta = componentes.filter(
    (c) => c.insumo.categoria === 'fragancia' || c.insumo.categoria === 'color'
  );
  const fraganciaColorExistentesIds = fraganciaColorReceta.map((i) => i.insumo_id);

  const empaqueMoldesReceta = componentes.filter(
    (c) => c.insumo.categoria === 'empaque' || c.insumo.categoria === 'molde'
  );
  const empaqueMoldesExistentesIds = empaqueMoldesReceta.map((i) => i.insumo_id);

  const costosIndirectosReceta = componentes.filter(
    (c) => c.insumo.categoria === 'costo_indirecto'
  );
  const costosIndirectosExistentesIds = costosIndirectosReceta.map((i) => i.insumo_id);

  const totalPesoBases = basesReceta.reduce((acc, curr) => acc + curr.cantidad_usada, 0);

  const canSave = Boolean(formData.nombre.trim() && formData.valor_venta > 0);

  // 1. VISTA: Catálogo Público (Inicio por defecto de la aplicación)
  if (viewMode === 'catalogo') {
    return (
      <>
        <CatalogoPublico
          jabonesGuardados={jabonesGuardados}
          currentUser={currentUser}
          onIrAlLogin={() => setViewMode(currentUser ? 'admin_app' : 'login')}
          onIrAlLaboratorio={() => setViewMode(currentUser ? 'admin_app' : 'login')}
        />
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </>
    );
  }

  // 2. VISTA: Iniciar Sesión / Registro
  if (viewMode === 'login' || !currentUser) {
    return (
      <>
        <LoginView
          onVolverAlCatalogo={() => setViewMode('catalogo')}
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            setViewMode('admin_app');
            addToast('success', '¡Bienvenido a Jabhaco Lab!', `Sesión iniciada como ${user.nombre}`);
          }}
        />
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans overflow-x-hidden w-full">
      {/* Header Fijo */}
      <Header
        onOpenConfig={() => setIsConfigModalOpen(true)}
        onGuardar={handleOpenGuardarModal}
        onVerJabones={() => setActiveTab('jabones_guardados')}
        onVerCatalogoPublico={() => setViewMode('catalogo')}
        onOpenCalculadora={() => setIsCalculadoraOpen(true)}
        onLogout={handleLogout}
        currentUser={currentUser}
        isSaving={isSaving}
        canSave={canSave}
        totalComponentes={componentes.length}
        jabonesGuardadosCount={jabonesGuardados.length}
      />

      {/* Navegación por Pestañas */}
      <TabsNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        basesCount={basesReceta.length}
        aditivosCount={aditivosReceta.length}
        fraganciaColorCount={fraganciaColorReceta.length}
        empaqueMoldesCount={empaqueMoldesReceta.length}
        costosIndirectosCount={costosIndirectosReceta.length}
        jabonesGuardadosCount={jabonesGuardados.length}
      />

      {/* Contenedor Principal con padding-right generoso en mobile */}
      <main className="flex-1 max-w-7xl w-full mx-auto pl-3.5 pr-6 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-8 box-border">
        
        {/* Banner Informativo Superior */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-brand-900 to-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 shadow-md">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-brand-500/20 text-brand-300 flex items-center justify-center shrink-0 border border-brand-500/30">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-brand-400" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold tracking-tight text-white flex items-center gap-2 flex-wrap">
                <span>Módulo de Formulación & Costeo</span>
                <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-brand-500 text-white rounded-md">
                  Taller Botánico
                </span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-300 line-clamp-2 sm:line-clamp-none">
                Formula materias primas por etapas y guarda tu jabón con un solo clic para conservarlo en tu catálogo comercial.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap pt-1 sm:pt-0">
            {componentes.length > 0 && activeTab !== 'resumen' && (
              <button
                type="button"
                onClick={() => setActiveTab('resumen')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-all border border-white/10 active:scale-95"
              >
                <span>Ficha Técnica & Costeo ({componentes.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {componentes.length > 0 && (
              <button
                type="button"
                onClick={handleOpenGuardarModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-xs font-bold text-white transition-all shadow-md active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Guardar este Jabón</span>
              </button>
            )}
          </div>
        </div>

        {/* Contenido según la Pestaña Activa */}
        <section aria-label="Contenido de Formulación">
          {activeTab === 'base_glicerina' && (
            <BaseGlicerinaTab
              basesReceta={basesReceta}
              onOpenAgregarModal={() => setIsAgregarBaseModalOpen(true)}
              onUpdateCantidad={handleUpdateCantidad}
              onRequestEliminarItem={handleRequestEliminar}
            />
          )}

          {activeTab === 'aditivos' && (
            <AditivosTab
              aditivosReceta={aditivosReceta}
              pesoTotalBases={totalPesoBases}
              onOpenAgregarModal={() => setIsAgregarAditivoModalOpen(true)}
              onUpdateCantidad={handleUpdateCantidad}
              onRequestEliminarItem={handleRequestEliminar}
            />
          )}

          {activeTab === 'fragancia_color' && (
            <FraganciaColorTab
              itemsReceta={fraganciaColorReceta}
              onOpenAgregarModal={() => setIsAgregarFraganciaColorModalOpen(true)}
              onUpdateCantidad={handleUpdateCantidad}
              onRequestEliminarItem={handleRequestEliminar}
            />
          )}

          {activeTab === 'empaque_moldes' && (
            <EmpaqueMoldesTab
              itemsReceta={empaqueMoldesReceta}
              onOpenAgregarModal={() => setIsAgregarEmpaqueMoldesModalOpen(true)}
              onUpdateCantidad={handleUpdateCantidad}
              onRequestEliminarItem={handleRequestEliminar}
            />
          )}

          {activeTab === 'costos_indirectos' && (
            <CostosIndirectosTab
              itemsReceta={costosIndirectosReceta}
              onOpenAgregarModal={() => setIsAgregarCostoIndirectoModalOpen(true)}
              onUpdateCantidad={handleUpdateCantidad}
              onRequestEliminarItem={handleRequestEliminar}
            />
          )}

          {activeTab === 'resumen' && (
            <ResumenCostosTab
              formData={formData}
              onFormChange={handleFormChange}
              formErrors={formErrors}
              componentes={componentes}
              onGuardarJabon={handleOpenGuardarModal}
              isSaving={isSaving}
              onGoToBaseTab={() => setActiveTab('base_glicerina')}
            />
          )}

          {activeTab === 'jabones_guardados' && (
            <JabonesGuardadosTab
              jabones={jabonesGuardados}
              isLoading={isLoadingJabones}
              onRefresh={cargarCatalogoJabones}
              onCargarEnFormulador={handleCargarEnFormulador}
              onRequestEliminarJabon={(jabon) => setJabonAEliminar(jabon)}
              onIrAFormular={() => setActiveTab('base_glicerina')}
            />
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto pl-3.5 pr-6 sm:px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Jabhaco Lab • Formulación, Costeo y Catálogo de Jabones</span>
          <span>Arquitectura React + TypeScript + Tailwind CSS + Supabase PostgreSQL</span>
        </div>
      </footer>

      {/* Modales de Formulación */}
      <AgregarBaseModal
        isOpen={isAgregarBaseModalOpen}
        onClose={() => setIsAgregarBaseModalOpen(false)}
        onSelectBase={(insumo, cantidad) => handleSelectInsumoGenerico(insumo, cantidad, false)}
        basesExistentesEnRecetaIds={basesExistentesIds}
      />

      <AgregarAditivoModal
        isOpen={isAgregarAditivoModalOpen}
        onClose={() => setIsAgregarAditivoModalOpen(false)}
        onSelectAditivo={handleSelectInsumoGenerico}
        aditivosExistentesEnRecetaIds={aditivosExistentesIds}
      />

      <AgregarFraganciaColorModal
        isOpen={isAgregarFraganciaColorModalOpen}
        onClose={() => setIsAgregarFraganciaColorModalOpen(false)}
        onSelectInsumo={handleSelectInsumoGenerico}
        itemsExistentesEnRecetaIds={fraganciaColorExistentesIds}
      />

      <AgregarEmpaqueMoldesModal
        isOpen={isAgregarEmpaqueMoldesModalOpen}
        onClose={() => setIsAgregarEmpaqueMoldesModalOpen(false)}
        onSelectInsumo={(insumo, cantidad) => handleSelectInsumoGenerico(insumo, cantidad, false)}
        itemsExistentesEnRecetaIds={empaqueMoldesExistentesIds}
      />

      <AgregarCostoIndirectoModal
        isOpen={isAgregarCostoIndirectoModalOpen}
        onClose={() => setIsAgregarCostoIndirectoModalOpen(false)}
        onSelectInsumo={(insumo, cantidad) => handleSelectInsumoGenerico(insumo, cantidad, false)}
        itemsExistentesEnRecetaIds={costosIndirectosExistentesIds}
      />

      {/* Modal para Guardar Jabón desde cualquier pestaña */}
      <GuardarJabonModal
        isOpen={isGuardarModalOpen}
        onClose={() => setIsGuardarModalOpen(false)}
        onConfirmSave={handleConfirmSave}
        formData={formData}
        onFormChange={handleFormChange}
        componentes={componentes}
        isSaving={isSaving}
      />

      {/* Modal de Éxito tras Guardar */}
      <JabonGuardadoExitoModal
        isOpen={isExitoModalOpen}
        onClose={() => setIsExitoModalOpen(false)}
        jabonGuardado={jabonRecienGuardado}
        componentes={componentes}
        isMock={isGuardadoMock}
        onVerCatalogo={() => {
          setIsExitoModalOpen(false);
          setActiveTab('jabones_guardados');
        }}
        onNuevaFormulacion={handleNuevaFormulacion}
      />

      {/* Modal para Configurar Supabase */}
      <ConfigSupabaseModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        onCredentialsUpdated={() => {
          addToast('success', 'Configuración de Supabase actualizada');
          cargarCatalogoJabones();
        }}
      />

      {/* Modal de Confirmación para Eliminar Insumo */}
      <ConfirmModal
        isOpen={Boolean(itemAEliminar)}
        onClose={() => setItemAEliminar(null)}
        onConfirm={handleConfirmEliminar}
        titulo="¿Eliminar este insumo de la receta?"
        mensaje="Esta materia prima se quitará de la fórmula actual y los costos se recalcularán automáticamente."
        itemNombre={
          itemAEliminar
            ? `${itemAEliminar.insumo.nombre} (${formatDecimal(itemAEliminar.cantidad_usada)} ${formatUnidadLabel(itemAEliminar.insumo.unidad)})`
            : undefined
        }
      />

      {/* Modal de Confirmación para Eliminar Jabón del Catálogo */}
      <ConfirmModal
        isOpen={Boolean(jabonAEliminar)}
        onClose={() => setJabonAEliminar(null)}
        onConfirm={handleConfirmEliminarJabon}
        titulo="¿Eliminar este jabón del catálogo?"
        mensaje="Esta formulación y su histórico de componentes se eliminarán permanentemente del catálogo."
        itemNombre={jabonAEliminar?.nombre}
      />

      {/* Modal de Calculadora de Proporciones */}
      <CalculadoraJabonModal
        isOpen={isCalculadoraOpen}
        onClose={() => setIsCalculadoraOpen(false)}
        onIrAlLaboratorio={() => setIsCalculadoraOpen(false)}
      />

      {/* Notificaciones flotantes */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default App;
