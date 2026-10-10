"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutDashboard, LogOut, Menu } from "lucide-react";
import { logout } from "../../_actions/logout";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type DashboardSidebarProps = {
  administratorName: string;
};

function SidebarContent({
  administratorName,
  onNavigate,
}: DashboardSidebarProps & { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col bg-[#0d0f14] text-white">
      <div className="flex min-h-28 items-center gap-3 border-b border-white/10 px-6">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-sm font-bold tracking-wide">
          AF
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold">Avaliação Farmácia</p>
          <p className="mt-1 text-xs text-white/55">Painel administrativo</p>
        </div>
      </div>

      <div className="border-b border-white/10 px-5 py-5">
        <p className="truncate text-sm font-medium">Olá, {administratorName}</p>
        <p className="mt-1 text-xs text-white/55">Acesso administrativo</p>
      </div>

      <nav aria-label="Navegação principal" className="flex-1 p-3">
        <Link
          href="/admin/dashboard"
          onClick={onNavigate}
          aria-current="page"
          className="flex min-h-11 items-center gap-3 rounded-lg bg-violet-500/15 px-3 text-sm font-medium text-violet-200 outline-none transition-colors hover:bg-violet-500/20 focus-visible:ring-2 focus-visible:ring-violet-400"
        >
          <LayoutDashboard aria-hidden="true" className="size-4" />
          Início
        </Link>
      </nav>

      <div className="border-t border-white/10 p-4">
        <form action={logout}>
          <Button
            type="submit"
            variant="ghost"
            className="h-11 w-full justify-start gap-3 rounded-lg px-3 text-white/80 hover:bg-white/10 hover:text-white"
          >
            <LogOut aria-hidden="true" className="size-4" />
            Fazer logout
          </Button>
        </form>
      </div>
    </div>
  );
}

export function DashboardSidebar({
  administratorName,
}: DashboardSidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-white/10 lg:block">
        <SidebarContent administratorName={administratorName} />
      </aside>

      <div className="flex items-center gap-3 lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            aria-label="Abrir menu"
            className="inline-flex size-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
          >
            <Menu aria-hidden="true" className="size-5" />
          </SheetTrigger>
          <SheetContent
            side="left"
            showCloseButton
            className="w-72 border-white/10 bg-[#0d0f14] p-0 text-white"
          >
            <SheetTitle className="sr-only">Menu do painel</SheetTitle>
            <SidebarContent
              administratorName={administratorName}
              onNavigate={() => setOpen(false)}
            />
          </SheetContent>
        </Sheet>
        <span className="text-sm font-semibold">Painel administrativo</span>
      </div>
    </>
  );
}
