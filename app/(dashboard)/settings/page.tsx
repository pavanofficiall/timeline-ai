import { SettingsProfile } from "@/components/settings/settings-profile"
import { SettingsNotifications } from "@/components/settings/settings-notifications"
import { SettingsAI } from "@/components/settings/settings-ai"
import { SettingsPreferences } from "@/components/settings/settings-preferences"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your account and application preferences.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SettingsProfile />
        <SettingsNotifications />
        <SettingsAI />
        <SettingsPreferences />
      </div>
    </div>
  )
}
