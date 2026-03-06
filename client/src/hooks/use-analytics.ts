import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useAnalytics() {
  return useQuery({
    queryKey: [api.analytics.get.path],
    queryFn: async () => {
      const res = await fetch(api.analytics.get.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch analytics");
      const data = await res.json();
      return api.analytics.get.responses[200].parse({
        ...data,
        upcomingInterviews: data.upcomingInterviews?.map((i: any) => ({ ...i, date: new Date(i.date) })) || []
      });
    },
  });
}
