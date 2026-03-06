import { useInterviews, useDeleteInterview } from "@/hooks/use-interviews";
import { useApplications } from "@/hooks/use-applications";
import { InterviewDialog } from "@/components/interviews/InterviewDialog";
import { Calendar as CalendarIcon, Video, Phone, Users, CheckCircle, Trash2, Clock, MapPin } from "lucide-react";
import { format, isFuture, isPast } from "date-fns";
import { Button } from "@/components/ui/button";

export default function Interviews() {
  const { data: interviews = [], isLoading: intLoading } = useInterviews();
  const { data: applications = [], isLoading: appLoading } = useApplications();
  const deleteMutation = useDeleteInterview();

  if (intLoading || appLoading) {
    return <div className="flex items-center justify-center h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  // Enrich interviews with application data
  const enrichedInterviews = interviews.map(i => ({
    ...i,
    application: applications.find(a => a.id === i.applicationId)
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const upcoming = enrichedInterviews.filter(i => isFuture(new Date(i.date)));
  const past = enrichedInterviews.filter(i => isPast(new Date(i.date))).reverse();

  const getIcon = (type: string) => {
    switch (type) {
      case 'phone': return <Phone className="w-5 h-5 text-blue-500" />;
      case 'technical': return <Video className="w-5 h-5 text-orange-500" />;
      case 'behavioral': return <Users className="w-5 h-5 text-purple-500" />;
      case 'onsite': return <MapPin className="w-5 h-5 text-green-500" />;
      default: return <Video className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Interviews</h1>
          <p className="text-muted-foreground mt-1">Keep track of your scheduled interviews</p>
        </div>
        <InterviewDialog />
      </div>

      <section>
        <h2 className="text-xl font-bold font-display mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" /> Upcoming
        </h2>
        {upcoming.length === 0 ? (
          <div className="bg-card border border-border border-dashed rounded-2xl p-8 text-center text-muted-foreground">
            No upcoming interviews. Schedule one to get started!
          </div>
        ) : (
          <div className="space-y-4">
            {upcoming.map(interview => (
              <InterviewCard key={interview.id} interview={interview} getIcon={getIcon} onDelete={() => deleteMutation.mutate(interview.id)} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-bold font-display mb-4 flex items-center gap-2 text-muted-foreground">
          <CheckCircle className="w-5 h-5" /> Past Interviews
        </h2>
        {past.length === 0 ? (
          <p className="text-muted-foreground">No past interviews yet.</p>
        ) : (
          <div className="space-y-4 opacity-75">
            {past.map(interview => (
              <InterviewCard key={interview.id} interview={interview} getIcon={getIcon} onDelete={() => deleteMutation.mutate(interview.id)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function InterviewCard({ interview, getIcon, onDelete }: { interview: any, getIcon: any, onDelete: () => void }) {
  return (
    <div className="bg-card border border-border shadow-sm rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center shrink-0">
          {getIcon(interview.interviewType)}
        </div>
        <div>
          <h3 className="font-bold text-lg leading-tight">
            {interview.application?.company || 'Unknown Company'}
          </h3>
          <p className="text-muted-foreground font-medium">
            {interview.application?.position || 'Unknown Role'} • <span className="capitalize">{interview.interviewType}</span>
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-6 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-none border-border">
        <div className="flex-1 text-left md:text-right">
          <div className="font-bold text-foreground flex items-center md:justify-end gap-2">
            <CalendarIcon className="w-4 h-4 text-primary" />
            {format(new Date(interview.date), 'MMM d, yyyy')}
          </div>
          <div className="text-sm text-muted-foreground">
            {format(new Date(interview.date), 'h:mm a')}
          </div>
        </div>
        
        <div className="flex gap-2">
          <InterviewDialog interview={interview}>
            <Button variant="outline" size="sm" className="rounded-xl">Edit</Button>
          </InterviewDialog>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
            onClick={() => {
              if (confirm("Delete this interview?")) onDelete();
            }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
