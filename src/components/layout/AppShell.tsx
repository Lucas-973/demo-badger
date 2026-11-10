import { ReactNode } from 'react';
import { Room, Reservation } from '../../types/pms';
import { PMS_MODULES } from '../../data/navigation';
import { Topbar } from './Topbar';
import { PrimaryRail } from './PrimaryRail';

const ignoreShellAction = () => {};

function disableRegion(node: HTMLDivElement | null) {
  // Use the native attribute through a ref for React 18 type compatibility.
  node?.setAttribute('inert', '');
}

function DisabledShellRegion({ children, className }: { children: ReactNode; className: string }) {
  return (
    <div ref={disableRegion} aria-disabled="true" className={`pointer-events-none ${className}`}>
      {children}
    </div>
  );
}

interface AppShellProps {
  rooms: Room[];
  reservations: Reservation[];
  children: ReactNode;
}

export function AppShell({ rooms, reservations, children }: AppShellProps) {
  return (
    <>
      <DisabledShellRegion className="shrink-0">
        <Topbar
          searchQuery=""
          onSearchChange={ignoreShellAction}
          reservations={reservations}
          rooms={rooms}
          onSelectModule={ignoreShellAction}
          onOpenNewBooking={ignoreShellAction}
          onToggleCopilot={ignoreShellAction}
          isCopilotOpen={false}
          topbarTheme="cobalt"
          onChangeTheme={ignoreShellAction}
          activeSuiteAppId="pms"
          onSelectSuiteApp={ignoreShellAction}
        />
      </DisabledShellRegion>
      <div className="relative flex min-h-0 flex-1">
        <DisabledShellRegion className="flex min-h-0 shrink-0">
          <PrimaryRail modules={PMS_MODULES} activeModuleId="rooms" onSelectModule={ignoreShellAction} />
        </DisabledShellRegion>
        <main aria-label="UH Map" className="flex min-h-0 min-w-0 flex-1 overflow-hidden bg-[#F5F5F5] p-2">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200/90 bg-white px-5 pt-3.5 shadow-subtle lg:px-7 lg:pt-5">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
