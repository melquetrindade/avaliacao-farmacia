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
  const nameParts = administratorName.trim().split(/\s+/).filter(Boolean);
  const initials =
    nameParts.length > 1
      ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toLocaleUpperCase(
          "pt-BR",
        )
      : nameParts[0]?.[0]?.toLocaleUpperCase("pt-BR") ?? "";

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex min-h-28 items-center gap-3 border-b border-sidebar-border px-6">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-sidebar-primary text-sm font-bold tracking-wide text-sidebar-primary-foreground">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold">Olá, {administratorName}</p>
          <p className="mt-1 text-xs text-sidebar-foreground/70">
              {new Intl.DateTimeFormat("pt-BR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              }).format(new Date())}
            </p>
        </div>
      </div>

      <nav
        aria-label="Navegação principal"
        className="flex flex-1 flex-col gap-3 p-3"
      >
        <Link
          href="/admin/funcionarios"
          onClick={onNavigate}
          aria-current="page"
          className="flex min-h-11 items-center gap-3 rounded-lg bg-sidebar-accent px-3 text-sm font-medium text-sidebar-accent-foreground outline-none transition-colors hover:bg-sidebar-accent/80 focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        >
          <LayoutDashboard aria-hidden="true" className="size-4" />
          Funcionários
        </Link>

        <Link
          href="/admin/dashboard"
          onClick={onNavigate}
          aria-current="page"
          className="flex min-h-11 items-center gap-3 rounded-lg bg-sidebar-accent px-3 text-sm font-medium text-sidebar-accent-foreground outline-none transition-colors hover:bg-sidebar-accent/80 focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        >
          <LayoutDashboard aria-hidden="true" className="size-4" />
          Dashboard
        </Link>
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <form action={logout}>
          <Button
            type="submit"
            variant="ghost"
            className="h-11 w-full justify-start gap-3 rounded-lg px-3 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
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
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-sidebar-border lg:block">
        <SidebarContent administratorName={administratorName} />
      </aside>

      <div className="flex items-center gap-3 lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            aria-label="Abrir menu"
            className="inline-flex size-10 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Menu aria-hidden="true" className="size-5" />
          </SheetTrigger>
          <SheetContent
            side="left"
            showCloseButton
            className="w-72 border-sidebar-border bg-sidebar p-0 text-sidebar-foreground"
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
