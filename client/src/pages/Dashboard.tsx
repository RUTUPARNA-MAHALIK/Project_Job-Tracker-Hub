import { useAuth } from "@/hooks/use-auth";
import { useAnalytics } from "@/hooks/use-analytics";
import { Briefcase, Send, Target, Award, XCircle, CalendarClock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { format } from "date-fns";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: analytics, isLoading } = useAnalytics();

  if (isLoading || !analytics) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const chartData = [
    { name: 'Wishlist', value: analytics.wishlistCount, color: 'hsl(var(--status-wishlist))' },
    { name: 'Applied', value: analytics.appliedCount, color: 'hsl(var(--status-applied))' },
    { name: 'Interviewing', value: analytics.interviewingCount, color: 'hsl(var(--status-interview))' },
    { name: 'Offers', value: analytics.offersCount, color: 'hsl(var(--status-offer))' },
    { name: 'Rejected', value: analytics.rejectionsCount, color: 'hsl(var(--status-rejected))' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-display font-bold">Welcome back, {user?.firstName || 'Seeker'}! 👋</h1>
        <p className="text-muted-foreground mt-2 text-lg">Here's an overview of your job search progress.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total Apps" value={analytics.totalApplications} icon={Briefcase} />
        <StatCard title="Applied" value={analytics.appliedCount} icon={Send} />
        <StatCard title="Interviewing" value={analytics.interviewingCount} icon={Target} />
        <StatCard title="Offers" value={analytics.offersCount} icon={Award} highlight />
        <StatCard title="Rejected" value={analytics.rejectionsCount} icon={XCircle} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border shadow-sm p-6">
          <h2 className="text-xl font-bold font-display mb-6">Pipeline Funnel</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold font-display">Upcoming Interviews</h2>
            <CalendarClock className="w-5 h-5 text-muted-foreground" />
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {analytics.upcomingInterviews.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground border-2 border-dashed border-border rounded-xl">
                <CalendarClock className="w-12 h-12 mb-3 opacity-20" />
                <p>No upcoming interviews scheduled.</p>
              </div>
            ) : (
              analytics.upcomingInterviews.map((interview) => (
                <div key={interview.id} className="p-4 rounded-xl border border-border bg-secondary/30 hover:bg-secondary/60 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">
                      {interview.interviewType}
                    </span>
                    <span className="text-sm font-medium text-muted-foreground">
                      {format(new Date(interview.date), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <p className="font-semibold text-foreground truncate">
                    {/* Assuming we join with application to show company, but simple schema doesn't nest it natively without relations inclusion. We will just show type/date. */}
                    Interview #{interview.id}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, highlight = false }: { title: string, value: number, icon: any, highlight?: boolean }) {
  return (
    <div className={`p-6 rounded-2xl border ${highlight ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20' : 'bg-card border-border shadow-sm'} transition-transform hover:-translate-y-1`}>
      <div className="flex justify-between items-start mb-4">
        <h3 className={`text-sm font-semibold ${highlight ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>{title}</h3>
        <Icon className={`w-5 h-5 ${highlight ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
      </div>
      <p className="text-3xl font-display font-bold">{value}</p>
    </div>
  );
}
