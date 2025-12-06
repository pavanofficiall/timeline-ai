"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles } from "lucide-react"

export function DraftForm() {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-card-foreground">Draft Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Draft Type</Label>
          <Select defaultValue="notice">
            <SelectTrigger>
              <SelectValue placeholder="Select draft type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="notice">Legal Notice</SelectItem>
              <SelectItem value="reply">Reply to Notice</SelectItem>
              <SelectItem value="petition">Petition</SelectItem>
              <SelectItem value="affidavit">Affidavit</SelectItem>
              <SelectItem value="agreement">Agreement</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Case</Label>
          <Select defaultValue="case-001">
            <SelectTrigger>
              <SelectValue placeholder="Select case" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="case-001">CASE-001: Smith vs. Johnson Corp</SelectItem>
              <SelectItem value="case-002">CASE-002: Estate of Williams</SelectItem>
              <SelectItem value="case-003">CASE-003: Tech Solutions Ltd Dispute</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Facts</Label>
          <Textarea
            placeholder="Enter the key facts of the case..."
            rows={4}
            defaultValue="The defendant, Johnson Corp, entered into a service agreement with the plaintiff on October 1, 2024. The agreement stipulated payment of $75,000 for IT consulting services. Despite receiving the services as agreed, the defendant has failed to make payment..."
          />
        </div>

        <div className="space-y-2">
          <Label>Prayer / Relief Sought</Label>
          <Textarea
            placeholder="Enter the relief you are seeking..."
            rows={3}
            defaultValue="The plaintiff seeks payment of the outstanding amount of $75,000 along with interest at 18% per annum from the date of default, plus legal costs and any other relief the court deems fit."
          />
        </div>

        <Button className="w-full gap-2">
          <Sparkles className="h-4 w-4" />
          Generate Draft
        </Button>
      </CardContent>
    </Card>
  )
}
