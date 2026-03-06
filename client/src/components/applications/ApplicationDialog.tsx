import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertApplicationSchema, type Application } from "@shared/schema";
import { useCreateApplication, useUpdateApplication } from "@/hooks/use-applications";
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
import { Plus, Briefcase, Building2, Link as LinkIcon, CalendarIcon } from "lucide-react";
import { format } from "date-fns";

export function ApplicationDialog({ 
  application, 
  children,
  open: controlledOpen,
  onOpenChange
}: { 
  application?: Application; 
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? onOpenChange! : setInternalOpen;
  
  const createMutation = useCreateApplication();
  const updateMutation = useUpdateApplication();
  const isEditing = !!application;
  const isPending = createMutation.isPending || updateMutation.isPending;

  const form = useForm({
    resolver: zodResolver(insertApplicationSchema),
    defaultValues: {
      company: "",
      position: "",
      status: "wishlist",
      url: "",
      notes: "",
      dateApplied: null as Date | null,
    },
  });

  useEffect(() => {
    if (application && open) {
      form.reset({
        company: application.company,
        position: application.position,
        status: application.status,
        url: application.url || "",
        notes: application.notes || "",
        dateApplied: application.dateApplied ? new Date(application.dateApplied) : null,
      });
    } else if (!application && open) {
      form.reset({
        company: "",
        position: "",
        status: "wishlist",
        url: "",
        notes: "",
        dateApplied: null,
      });
    }
  }, [application, open, form]);

  const onSubmit = form.handleSubmit((data) => {
    if (isEditing) {
      updateMutation.mutate({ id: application.id, ...data }, {
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
            Add Application
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] rounded-2xl border-border/50 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display">
            {isEditing ? "Edit Application" : "New Application"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={onSubmit} className="space-y-5 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company" className="text-sm font-semibold flex items-center gap-2">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                Company
              </Label>
              <Input 
                id="company" 
                placeholder="Acme Corp" 
                className="rounded-xl bg-secondary/50 focus-visible:ring-primary/20"
                {...form.register("company")} 
              />
              {form.formState.errors.company && (
                <p className="text-xs text-destructive">{form.formState.errors.company.message?.toString()}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="position" className="text-sm font-semibold flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-muted-foreground" />
                Role
              </Label>
              <Input 
                id="position" 
                placeholder="Frontend Engineer" 
                className="rounded-xl bg-secondary/50 focus-visible:ring-primary/20"
                {...form.register("position")} 
              />
              {form.formState.errors.position && (
                <p className="text-xs text-destructive">{form.formState.errors.position.message?.toString()}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Status</Label>
              <Select 
                value={form.watch("status")} 
                onValueChange={(val) => form.setValue("status", val)}
              >
                <SelectTrigger className="rounded-xl bg-secondary/50 focus:ring-primary/20">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="wishlist">Wishlist</SelectItem>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="interview">Interviewing</SelectItem>
                  <SelectItem value="offer">Offer</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateApplied" className="text-sm font-semibold flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                Date Applied
              </Label>
              <Input 
                id="dateApplied" 
                type="date"
                className="rounded-xl bg-secondary/50 focus-visible:ring-primary/20"
                {...form.register("dateApplied", { valueAsDate: true })} 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="url" className="text-sm font-semibold flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-muted-foreground" />
              Job URL
            </Label>
            <Input 
              id="url" 
              type="url"
              placeholder="https://company.com/careers/job" 
              className="rounded-xl bg-secondary/50 focus-visible:ring-primary/20"
              {...form.register("url")} 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-semibold">Notes</Label>
            <Textarea 
              id="notes" 
              placeholder="Key details, connections, thoughts..." 
              className="rounded-xl bg-secondary/50 focus-visible:ring-primary/20 min-h-[100px] resize-none"
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
              {isPending ? "Saving..." : "Save Application"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
