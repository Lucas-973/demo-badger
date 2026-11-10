import React from 'react';
import { ModuleId, NavigationModule } from '../../types/pms';
import { PmsModuleIcon } from '../icons/PmsIcons';
import { CustomScrollArea } from '../ui/CustomScrollArea';
import { Tooltip } from '../ui/Tooltip';
import { SlidingAccentMark, useSlidingAccent } from '../ui/useSlidingAccent';

interface PrimaryRailProps {
  modules: NavigationModule[];
  activeModuleId: ModuleId;
  onSelectModule: (moduleId: ModuleId) => void;
}

/**
 * Primary Compact Navigation Rail (82px width)
 * All operational modules share a unified icon and label style without separators or hover scaling.
 */
export const PrimaryRail: React.FC<PrimaryRailProps> = ({
  modules,
  activeModuleId,
  onSelectModule,
}) => {
  const railModules = modules.filter((m) => m.id !== 'settings');
  const menuKey = railModules.map((m) => m.id).join('|');
  const { containerRef, setItemRef, box } = useSlidingAccent(activeModuleId, menuKey, {
    insetY: 6,
  });

  // Generate tooltip content - use module tooltip or fallback to label
  const getTooltipContent = (mod: NavigationModule) => {
    return mod.tooltip || mod.label;
  };

  const renderRailItem = (mod: NavigationModule) => {
    const isActive = mod.id === activeModuleId;

    return (
      <Tooltip content={getTooltipContent(mod)}>
        <button
          ref={setItemRef(mod.id)}
          onClick={() => onSelectModule(mod.id)}
          className={`group relative w-full py-2.5 px-1 flex flex-col items-center justify-center gap-1.5 transition-colors select-none ${
            isActive
              ? 'text-[#2B6CB0]'
              : 'text-[#3B3B3B] hover:bg-black/[0.045] hover:text-slate-950'
          }`}
        >
          {/* Custom vector hospitality icon (fixed size, no hover scaling) */}
          <div className="w-7 h-7 flex items-center justify-center">
            <PmsModuleIcon
              moduleId={mod.id}
              active={isActive}
              className="w-[24px] h-[24px]"
            />
          </div>

          {/* Unified label style */}
          <span
            className={`text-[11px] leading-[1.2] text-center tracking-[-0.01em] whitespace-nowrap transition-colors duration-300 ${
              isActive
                ? 'text-[#2B6CB0] font-medium'
                : 'text-[#3B3B3B] font-normal'
            }`}
          >
            {mod.shortLabel}
          </span>
        </button>
      </Tooltip>
    );
  };

  return (
    <aside
      aria-label="Primary Module Navigation"
      className="w-[82px] shrink-0 bg-[#EFEFEF] border-r border-slate-200/90 flex flex-col justify-start z-20 select-none min-h-0 overflow-visible relative"
    >
      <CustomScrollArea
        className="flex-1 min-h-0"
        viewportClassName="py-2 flex flex-col gap-1"
        gutter="overlay"
        showTrackWhenIdle={true}
      >
        <nav>
          <div ref={containerRef} className="relative">
            <SlidingAccentMark
              key={menuKey}
              box={box}
              className="left-[2px] w-[2.5px] bg-[#2B6CB0]"
            />
            <div className="flex flex-col gap-1">
              {railModules.map(renderRailItem)}
            </div>
          </div>
        </nav>
      </CustomScrollArea>
    </aside>
  );
};
