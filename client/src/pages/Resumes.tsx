import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertResumeSchema, type Resume } from "@shared/schema";
import { useResumes, useCreateResume, useUpdateResume, useDeleteResume } from "@/hooks/use-resumes";
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
import { Plus, FileText, Download, ExternalLink, Trash2, Edit2, Link as LinkIcon } from "lucide-react";
import { format } from "date-fns";

export default function Resumes() {
  const { data: resumes = [], isLoading } = useResumes();
  const deleteMutation = useDeleteResume();

  if (isLoading) {
    return <div className="flex items-center justify-center h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Resumes</h1>
          <p className="text-muted-foreground mt-1">Manage links to your different resume versions</p>
        </div>
        <ResumeDialog />
      </div>

      {resumes.length === 0 ? (
        <div className="bg-card border border-border border-dashed rounded-2xl p-12 text-center mt-12">
          <FileText className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No resumes added</h3>
          <p className="text-muted-foreground mb-6">Keep track of your Google Docs or PDF links here.</p>
          <ResumeDialog />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {resumes.map((resume) => (
            <div key={resume.id} className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <h3 className="font-bold text-lg truncate" title={resume.name}>{resume.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Added {format(new Date(resume.createdAt || new Date()), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
              
              {resume.notes && (
                <p className="text-sm text-muted-foreground mb-6 line-clamp-3 flex-1">
                  {resume.notes}
                </p>
              )}
              
              {!resume.notes && <div className="flex-1 mb-6"></div>}

              <div className="flex items-center gap-2 pt-4 border-t border-border">
                <Button 
                  className="flex-1 rounded-xl shadow-sm hover:-translate-y-0.5 transition-transform" 
                  onClick={() => window.open(resume.url, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" /> Open Link
                </Button>
                <ResumeDialog resume={resume}>
                  <Button variant="secondary" size="icon" className="rounded-xl shrink-0">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </ResumeDialog>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-xl shrink-0 border-destructive/30 text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    if (confirm("Delete this resume link?")) deleteMutation.mutate(resume.id);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ResumeDialog({ 
  resume,
  children 
}: { 
  resume?: Resume,
  children?: React.ReactNode 
}) {
  const [open, setOpen] = useState(false);
  const createMutation = useCreateResume();
  const updateMutation = useUpdateResume();
  const isEditing = !!resume;

  const form = useForm({
    resolver: zodResolver(insertResumeSchema),
    defaultValues: resume || {
      name: "",
      url: "",
      notes: "",
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    if (isEditing) {
      updateMutation.mutate({ id: resume.id, ...data }, { onSuccess: () => setOpen(false) });
    } else {
      createMutation.mutate(data, { onSuccess: () => setOpen(false) });
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="rounded-xl shadow-md shadow-primary/20 hover:shadow-lg hover:-translate-y-0.5 transition-all">
            <Plus className="w-4 h-4 mr-2" />
            Add Resume Link
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display">
            {isEditing ? "Edit Resume Link" : "Add Resume Link"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Version Name</Label>
            <Input className="rounded-xl" placeholder="Frontend Engineer - V2" {...form.register("name")} />
            {form.formState.errors.name && <p className="text-xs text-destructive">Name is required</p>}
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-muted-foreground" /> Document URL
            </Label>
            <Input className="rounded-xl" type="url" placeholder="https://docs.google.com/..." {...form.register("url")} />
            {form.formState.errors.url && <p className="text-xs text-destructive">Valid URL is required</p>}
          </div>
          <div className="space-y-2">
            <Label>Notes (Optional)</Label>
            <Textarea className="rounded-xl resize-none h-24" placeholder="Tailored for React/Next.js roles" {...form.register("notes")} />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-xl">Cancel</Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="rounded-xl shadow-md">
              {isEditing ? "Update" : "Save Resume"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
