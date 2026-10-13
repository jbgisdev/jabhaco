import React from 'react';
import {
  Layers,
  Sparkles,
  Palette,
  Package,
  Coins,
  FileSpreadsheet,
  BookOpen,
} from 'lucide-react';

export type TabType =
  | 'base_glicerina'
  | 'aditivos'
  | 'fragancia_color'
  | 'empaque_moldes'
  | 'costos_indirectos'
  | 'resumen'
  | 'jabones_guardados';

interface TabDefinition {
  id: TabType;
  label: string;
  icon: React.ElementType;
  disabled: boolean;
  phaseBadge?: string;
}

const TABS: TabDefinition[] = [
  {
    id: 'base_glicerina',
    label: 'Base Glicerina',
    icon: Layers,
    disabled: false,
  },
  {
    id: 'aditivos',
    label: 'Aditivos',
    icon: Sparkles,
    disabled: false,
  },
  {
    id: 'fragancia_color',
    label: 'Fragancia & Color',
    icon: Palette,
    disabled: false,
  },
  {
    id: 'empaque_moldes',
    label: 'Empaque & Moldes',
    icon: Package,
    disabled: false,
  },
  {
    id: 'costos_indirectos',
    label: 'Costos Indirectos',
    icon: Coins,
    disabled: false,
  },
  {
    id: 'resumen',
    label: 'Resumen & Costeo',
    icon: FileSpreadsheet,
    disabled: false,
  },
  {
    id: 'jabones_guardados',
    label: 'Mis Jabones',
    icon: BookOpen,
    disabled: false,
  },
];

interface TabsNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  basesCount: number;
  aditivosCount: number;
  fraganciaColorCount: number;
  empaqueMoldesCount: number;
  costosIndirectosCount: number;
  jabonesGuardadosCount?: number;
}

export const TabsNav: React.FC<TabsNavProps> = ({
  activeTab,
  onChangeTab,
  basesCount,
  aditivosCount,
  fraganciaColorCount,
  empaqueMoldesCount,
  costosIndirectosCount,
  jabonesGuardadosCount = 0,
}) => {
  const getTabCount = (id: TabType) => {
    switch (id) {
      case 'base_glicerina':
        return basesCount;
      case 'aditivos':
        return aditivosCount;
      case 'fragancia_color':
        return fraganciaColorCount;
      case 'empaque_moldes':
        return empaqueMoldesCount;
      case 'costos_indirectos':
        return costosIndirectosCount;
      case 'jabones_guardados':
        return jabonesGuardadosCount;
      default:
        return 0;
    }
  };

  const activeTabObj = TABS.find((t) => t.id === activeTab) || TABS[0];
  const activeIdx = TABS.findIndex((t) => t.id === activeTab);

  return (
    <div className="w-full border-b border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto pl-3 pr-5 sm:px-6 lg:px-8">
        <nav
          className="flex items-center justify-between sm:justify-start space-x-1 sm:space-x-2 py-2 overflow-x-auto no-scrollbar scroll-smooth"
          aria-label="Fases de Formulación"
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isDisabled = tab.disabled;
            const count = getTabCount(tab.id);

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => !isDisabled && onChangeTab(tab.id)}
                disabled={isDisabled}
                title={tab.label}
                aria-label={tab.label}
                className={`group relative flex items-center justify-center gap-1.5 p-2 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all select-none shrink-0 ${
                  isActive
                    ? 'bg-brand-50 text-brand-900 border border-brand-200 shadow-2xs font-semibold'
                    : isDisabled
                    ? 'text-slate-400 bg-slate-50/70 border border-transparent cursor-not-allowed opacity-60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border border-transparent'
                }`}
              >
                <Icon
                  className={`w-5 h-5 sm:w-4 sm:h-4 transition-colors ${
                    isActive
                      ? 'text-brand-600'
                      : isDisabled
                      ? 'text-slate-300'
                      : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />

                {/* En MOBILE solo se muestra el icono; en tablet/desktop se muestra el texto */}
                <span className="hidden md:inline whitespace-nowrap">{tab.label}</span>

                {/* Badge de conteo de insumos / jabones */}
                {count > 0 && (
                  <span
                    className={`text-[10px] sm:text-[11px] font-bold px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? 'bg-brand-600 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {count}
                  </span>
                )}

                {/* Indicador de pestaña activa en desktop */}
                {isActive && (
                  <span className="hidden md:block absolute -bottom-[9px] left-3 right-3 h-[2px] bg-brand-600 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Sub-barra informativa solo para mobile: Indica claramente la etapa activa */}
        <div className="md:hidden flex items-center justify-between px-2 py-1.5 border-t border-slate-100 text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5 truncate">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
            <span>Pestaña:</span>
            <strong className="text-slate-800 font-bold truncate">
              {activeTabObj.label}
            </strong>
          </span>
          <span className="text-slate-400 text-[10px] shrink-0 font-medium ml-2">
            Paso {activeIdx + 1} de {TABS.length}
          </span>
        </div>
      </div>
    </div>
  );
};
