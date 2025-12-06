import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Sparkles } from "lucide-react"

const aiSettings = [
  {
    id: "enhanced-model",
    label: "Use Enhanced Legal Reasoning Model",
    description: "More accurate analysis, may be slower",
    enabled: true,
  },
  {
    id: "auto-timeline",
    label: "Auto-Generate Timeline",
    description: "Automatically create timeline from uploads",
    enabled: true,
  },
  {
    id: "smart-suggestions",
    label: "Smart Draft Suggestions",
    description: "AI-powered writing improvements",
    enabled: false,
  },
]

export function SettingsAI() {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-card-foreground">
          <Sparkles className="h-4 w-4" />
          AI Model Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {aiSettings.map((setting) => (
          <div key={setting.id} className="flex items-start justify-between">
            <div className="space-y-0.5">
              <Label htmlFor={setting.id}>{setting.label}</Label>
              <p className="text-xs text-muted-foreground">{setting.description}</p>
            </div>
            <Switch id={setting.id} defaultChecked={setting.enabled} />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
