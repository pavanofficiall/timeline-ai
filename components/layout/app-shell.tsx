"use client"

import type React from "react"

import { Sidebar } from "./sidebar"
import { TopNavbar } from "./top-navbar"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="ml-64 flex flex-1 flex-col transition-all duration-300">
        <TopNavbar />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
