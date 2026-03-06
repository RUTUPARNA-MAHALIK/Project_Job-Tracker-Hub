import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertInterviewSchema, type Interview, type Application } from "@shared/schema";
import { useCreateInterview, useUpdateInterview } from "@/hooks/use-interviews";
import { useApplications } from "@/hooks/use-applications";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Video, Calendar, Clock } from "lucide-react";

export function InterviewDialog({ 
  interview,
  preselectedAppId,
  children 
}: { 
  interview?: Interview;
  preselectedAppId?: number;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { data: applications = [] } = useApplications();
  const createMutation = useCreateInterview();
  const updateMutation = useUpdateInterview();
  const isEditing = !!interview;
  const isPending = createMutation.isPending || updateMutation.isPending;

  const form = useForm({
    resolver: zodResolver(insertInterviewSchema),
    defaultValues: {
      applicationId: preselectedAppId || 0,
      interviewType: "phone",
      date: new Date(),
      notes: "",
    },
  });

  useEffect(() => {
    if (interview && open) {
      form.reset({
        applicationId: interview.applicationId,
        interviewType: interview.interviewType,
        date: new Date(interview.date),
        notes: interview.notes || "",
      });
    } else if (!interview && open) {
      form.reset({
        applicationId: preselectedAppId || (applications.length > 0 ? applications[0].id : 0),
        interviewType: "phone",
        date: new Date(),
        notes: "",
      });
    }
  }, [interview, open, form, preselectedAppId, applications]);

  const onSubmit = form.handleSubmit((data) => {
    if (isEditing) {
      updateMutation.mutate({ id: interview.id, ...data }, {
        onSuccess: () => setOpen(false)
      });
    } else {
      createMutation.mutate(data, {
        onSuccess: () => setOpen(false)
      });
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="rounded-xl shadow-md shadow-primary/20 hover:shadow-lg hover:-translate-y-0.5 transition-all">
            <Plus className="w-4 h-4 mr-2" />
            Schedule Interview
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px] rounded-2xl border-border/50 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display">
            {isEditing ? "Edit Interview" : "Schedule Interview"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={onSubmit} className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Application</Label>
            <Select 
              value={form.watch("applicationId").toString()} 
              onValueChange={(val) => form.setValue("applicationId", parseInt(val))}
              disabled={!!preselectedAppId && !isEditing}
            >
              <SelectTrigger className="rounded-xl bg-secondary/50 focus:ring-primary/20">
                <SelectValue placeholder="Select Application" />
              </SelectTrigger>
              <SelectContent className="rounded-xl max-h-60">
                {applications.map((app) => (
                  <SelectItem key={app.id} value={app.id.toString()}>
                    {app.company} - {app.position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.applicationId && (
              <p className="text-xs text-destructive">Application is required</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <Video className="w-4 h-4 text-muted-foreground" />
                Type
              </Label>
              <Select 
                value={form.watch("interviewType")} 
                onValueChange={(val) => form.setValue("interviewType", val)}
              >
                <SelectTrigger className="rounded-xl bg-secondary/50 focus:ring-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="behavioral">Behavioral</SelectItem>
                  <SelectItem value="onsite">On-site</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                Date & Time
              </Label>
              <Input 
                id="date" 
                type="datetime-local"
                className="rounded-xl bg-secondary/50 focus-visible:ring-primary/20"
                {...form.register("date", { valueAsDate: true })} 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-semibold">Preparation Notes & Links</Label>
            <Textarea 
              id="notes" 
              placeholder="Zoom link, key topics to review..." 
              className="rounded-xl bg-secondary/50 focus-visible:ring-primary/20 min-h-[120px] resize-none"
              {...form.register("notes")} 
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => setOpen(false)}
              className="rounded-xl hover:bg-secondary"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isPending}
              className="rounded-xl shadow-md shadow-primary/20 hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              {isPending ? "Saving..." : "Save Interview"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
