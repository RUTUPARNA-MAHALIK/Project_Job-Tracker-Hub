import { Link } from "wouter";
import { Briefcase, Activity, Target, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";

export default function Landing() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;
  if (isAuthenticated) return <Redirect to="/" />;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      {/* Navbar */}
      <nav className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Briefcase className="w-8 h-8 text-primary" />
          <span className="text-2xl font-display font-bold">TrackIt</span>
        </div>
        <Button 
          onClick={() => window.location.href = '/api/login'} 
          className="rounded-full px-6 font-medium shadow-md shadow-primary/20 hover:shadow-lg hover:-translate-y-0.5 transition-all"
        >
          Login
        </Button>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 pt-24 pb-16 flex flex-col lg:flex-row items-center gap-16">
        <div className="flex-1 space-y-8 text-center lg:text-left">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
            The smart way to land your next job
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-extrabold leading-[1.1] tracking-tight text-foreground">
            Manage your job search <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-500">like a pro</span>.
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
            Keep track of all your applications, interview schedules, recruiter contacts, and resume versions in one beautiful, organized dashboard.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-4">
            <Button 
              size="lg" 
              onClick={() => window.location.href = '/api/login'}
              className="w-full sm:w-auto rounded-full px-8 h-14 text-lg font-semibold shadow-xl shadow-primary/25 hover:shadow-2xl hover:-translate-y-1 transition-all"
            >
              Get Started for Free <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Hero Visual/Mockup */}
        <div className="flex-1 w-full max-w-2xl relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-cyan-500/20 blur-3xl rounded-full opacity-50 z-0"></div>
          {/* landing page hero dashboard mockup abstract representation */}
          <div className="relative z-10 glass-panel rounded-3xl p-6 overflow-hidden">
            <div className="flex gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center">
                <Briefcase className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-display">Senior Developer</h3>
                <p className="text-muted-foreground">Acme Corp • San Francisco</p>
              </div>
              <div className="ml-auto">
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">Offer Received</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="h-4 bg-secondary rounded-full w-full"></div>
              <div className="h-4 bg-secondary rounded-full w-4/5"></div>
              <div className="h-4 bg-secondary rounded-full w-5/6"></div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="bg-background rounded-2xl p-4 border border-border">
                <p className="text-sm text-muted-foreground">Interviews</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <div className="bg-background rounded-2xl p-4 border border-border">
                <p className="text-sm text-muted-foreground">Applications</p>
                <p className="text-2xl font-bold">48</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features */}
      <section className="w-full bg-secondary/30 py-24 border-t border-border mt-auto">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Track Everything</h3>
            <p className="text-muted-foreground">From initial application to final offer, keep your entire pipeline organized and visible at a glance.</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Never Miss an Interview</h3>
            <p className="text-muted-foreground">Schedule and manage all your technical, behavioral, and onsite interviews with dedicated prep notes.</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Secure & Private</h3>
            <p className="text-muted-foreground">Your career moves are your business. Log in securely with Replit Auth and own your data.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
