import type React from "react"
import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"
import { Search } from "@/components/search"
import { OnboardingTutorial } from "@/components/onboarding-tutorial"
import { Suspense } from "react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b bg-background">
        <div className="flex h-16 items-center px-4 sm:px-6">
          <MainNav />
          <div className="ml-auto flex items-center space-x-4">
            <Suspense>
              <Search />
            </Suspense>
            <UserNav />
          </div>
        </div>
      </header>
      <main className="flex-1 p-4 sm:p-6 md:p-8">{children}</main>
      <OnboardingTutorial />
    </div>
  )
}
