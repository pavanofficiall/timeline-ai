import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User } from "lucide-react"

export function SettingsProfile() {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-card-foreground">
          <User className="h-4 w-4" />
          Profile Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src="/lawyer-professional.jpg" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <Button variant="outline" size="sm">
            Change Photo
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input defaultValue="John Doe" />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Input defaultValue="Senior Attorney" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Email</Label>
            <Input defaultValue="john.doe@lawfirm.com" type="email" />
          </div>
        </div>

        <Button>Save Changes</Button>
      </CardContent>
    </Card>
  )
}
