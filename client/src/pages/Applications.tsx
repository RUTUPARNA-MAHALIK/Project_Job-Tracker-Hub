import { useState } from "react";
import { useApplications, useUpdateApplication, useDeleteApplication } from "@/hooks/use-applications";
import { ApplicationDialog } from "@/components/applications/ApplicationDialog";
import { InterviewDialog } from "@/components/interviews/InterviewDialog";
import { MoreVertical, Building2, MapPin, ExternalLink, Calendar, MessageSquare, Trash2, Edit2, Video } from "lucide-react";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const COLUMNS = [
  { id: "wishlist", title: "Wishlist", color: "bg-slate-500" },
  { id: "applied", title: "Applied", color: "bg-blue-500" },
  { id: "interview", title: "Interview", color: "bg-orange-500" },
  { id: "offer", title: "Offer", color: "bg-green-500" },
  { id: "rejected", title: "Rejected", color: "bg-red-500" },
];

export default function Applications() {
  const { data: applications = [], isLoading } = useApplications();
  const updateMutation = useUpdateApplication();

  if (isLoading) {
    return <div className="flex items-center justify-center h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  const handleStatusChange = (id: number, newStatus: string) => {
    updateMutation.mutate({ id, status: newStatus });
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div>
          <h1 className="text-3xl font-display font-bold">Applications</h1>
          <p className="text-muted-foreground">Manage your job search pipeline</p>
        </div>
        <ApplicationDialog />
      </div>

      <div className="flex-1 flex gap-6 overflow-x-auto pb-4 kanban-scroll items-start">
        {COLUMNS.map((column) => {
          const colApps = applications.filter((app) => app.status === column.id);
          
          return (
            <div key={column.id} className="flex flex-col w-[320px] shrink-0 h-full max-h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${column.color}`} />
                  <h3 className="font-bold text-lg">{column.title}</h3>
                </div>
                <span className="bg-secondary text-secondary-foreground text-xs font-bold px-2.5 py-1 rounded-full">
                  {colApps.length}
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-4 kanban-scroll pr-2 pb-10">
                {colApps.length === 0 ? (
                  <div className="h-24 border-2 border-dashed border-border rounded-2xl flex items-center justify-center text-muted-foreground/50 text-sm">
                    Empty
                  </div>
                ) : (
                  colApps.map((app) => (
                    <ApplicationCard 
                      key={app.id} 
                      application={app} 
                      onStatusChange={handleStatusChange} 
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ApplicationCard({ application, onStatusChange }: { application: any, onStatusChange: (id: number, status: string) => void }) {
  const deleteMutation = useDeleteApplication();
  const [isEditOpen, setIsEditOpen] = useState(false);

  return (
    <>
      <ApplicationDialog application={application} open={isEditOpen} onOpenChange={setIsEditOpen} />
      
      <div className="group relative bg-card border border-border shadow-sm rounded-2xl p-5 hover:shadow-md hover:border-primary/30 transition-all">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div className="overflow-hidden pr-4">
              <h4 className="font-bold text-foreground truncate" title={application.company}>{application.company}</h4>
              <p className="text-sm text-muted-foreground truncate" title={application.position}>{application.position}</p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-muted-foreground group-hover:text-foreground">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl">
              <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                <Edit2 className="w-4 h-4 mr-2" /> Edit Details
              </DropdownMenuItem>
              {application.url && (
                <DropdownMenuItem onClick={() => window.open(application.url, '_blank')}>
                  <ExternalLink className="w-4 h-4 mr-2" /> View Posting
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator />
              <div className="p-2">
                <p className="text-xs font-semibold text-muted-foreground mb-2 px-2 uppercase tracking-wider">Move to...</p>
                {COLUMNS.map(col => (
                  <DropdownMenuItem 
                    key={col.id} 
                    disabled={col.id === application.status}
                    onClick={() => onStatusChange(application.id, col.id)}
                    className="text-sm"
                  >
                    {col.title}
                  </DropdownMenuItem>
                ))}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                onClick={() => {
                  if (confirm("Are you sure you want to delete this application?")) {
                    deleteMutation.mutate(application.id);
                  }
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-2 mb-4">
          {application.dateApplied && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5 mr-2 opacity-70" />
              Applied {format(new Date(application.dateApplied), 'MMM d, yyyy')}
            </div>
          )}
          {application.notes && (
            <div className="flex items-start text-xs text-muted-foreground">
              <MessageSquare className="w-3.5 h-3.5 mr-2 mt-0.5 opacity-70 shrink-0" />
              <span className="line-clamp-2">{application.notes}</span>
            </div>
          )}
        </div>

        <div className="pt-3 mt-3 border-t border-border flex gap-2">
          <InterviewDialog preselectedAppId={application.id}>
            <Button variant="secondary" size="sm" className="w-full text-xs font-semibold h-8 rounded-lg">
              <Video className="w-3.5 h-3.5 mr-1.5" />
              Add Interview
            </Button>
          </InterviewDialog>
        </div>
      </div>
    </>
  );
}
