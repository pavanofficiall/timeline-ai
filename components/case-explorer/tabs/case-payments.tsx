import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowRight } from "lucide-react"

const payments = [
  {
    date: "Dec 3, 2024",
    amount: "$25,000",
    from: "Johnson Corp",
    to: "Robert Smith",
    linkedEvent: "Initial Payment Received",
    status: "Completed",
  },
  {
    date: "Nov 1, 2024",
    amount: "$50,000",
    from: "Johnson Corp",
    to: "Robert Smith",
    linkedEvent: "Contract Signed",
    status: "Pending",
  },
  {
    date: "Oct 15, 2024",
    amount: "$5,000",
    from: "Robert Smith",
    to: "Court",
    linkedEvent: "Filing Fee",
    status: "Completed",
  },
]

export function CasePayments() {
  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Transaction</TableHead>
            <TableHead>Linked Event</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment, i) => (
            <TableRow key={i}>
              <TableCell>{payment.date}</TableCell>
              <TableCell className="font-semibold text-card-foreground">{payment.amount}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span>{payment.from}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <span>{payment.to}</span>
                </div>
              </TableCell>
              <TableCell>{payment.linkedEvent}</TableCell>
              <TableCell>
                <Badge
                  className={
                    payment.status === "Completed" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                  }
                >
                  {payment.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
