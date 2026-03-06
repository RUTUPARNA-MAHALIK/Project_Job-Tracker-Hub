import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InterviewInput } from "@shared/routes";

export function useInterviews() {
  return useQuery({
    queryKey: [api.interviews.list.path],
    queryFn: async () => {
      const res = await fetch(api.interviews.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch interviews");
      // Coerce dates correctly when parsing
      const data = await res.json();
      return api.interviews.list.responses[200].parse(data.map((i: any) => ({ ...i, date: new Date(i.date) })));
    },
  });
}

export function useCreateInterview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InterviewInput) => {
      const validated = api.interviews.create.input.parse(data);
      const res = await fetch(api.interviews.create.path, {
        method: api.interviews.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create interview");
      return api.interviews.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.interviews.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.analytics.get.path] });
    },
  });
}

export function useUpdateInterview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InterviewInput>) => {
      const validated = api.interviews.update.input.parse(updates);
      const url = buildUrl(api.interviews.update.path, { id });
      const res = await fetch(url, {
        method: api.interviews.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update interview");
      return api.interviews.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.interviews.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.analytics.get.path] });
    },
  });
}

export function useDeleteInterview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.interviews.delete.path, { id });
      const res = await fetch(url, { method: api.interviews.delete.method, credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete interview");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.interviews.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.analytics.get.path] });
    },
  });
}
