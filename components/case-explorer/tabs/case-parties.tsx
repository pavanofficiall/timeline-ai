import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Mail, Phone, MapPin } from "lucide-react"

const parties = [
  {
    name: "Robert Smith",
    role: "Plaintiff / Client",
    type: "client",
    email: "robert.smith@email.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main St, New York, NY",
    avatar: "RS",
  },
  {
    name: "Johnson Corp",
    role: "Defendant",
    type: "opponent",
    email: "legal@johnsoncorp.com",
    phone: "+1 (555) 987-6543",
    address: "456 Business Ave, New York, NY",
    avatar: "JC",
  },
  {
    name: "Sarah Lee",
    role: "Witness",
    type: "witness",
    email: "sarah.lee@email.com",
    phone: "+1 (555) 456-7890",
    address: "789 Oak Lane, Brooklyn, NY",
    avatar: "SL",
  },
]

const typeColors: Record<string, string> = {
  client: "bg-success/10 text-success",
  opponent: "bg-destructive/10 text-destructive",
  witness: "bg-warning/10 text-warning",
}

export function CaseParties() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {parties.map((party) => (
        <Card key={party.name} className="border-border bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={`/.jpg?height=40&width=40&query=${party.name} professional`} />
                <AvatarFallback>{party.avatar}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-base font-semibold text-card-foreground">{party.name}</CardTitle>
                <Badge className={typeColors[party.type]}>{party.role}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              {party.email}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              {party.phone}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {party.address}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
