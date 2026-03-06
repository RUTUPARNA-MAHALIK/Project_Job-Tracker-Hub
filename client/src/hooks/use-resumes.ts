import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type ResumeInput } from "@shared/routes";

export function useResumes() {
  return useQuery({
    queryKey: [api.resumes.list.path],
    queryFn: async () => {
      const res = await fetch(api.resumes.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch resumes");
      return api.resumes.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateResume() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: ResumeInput) => {
      const validated = api.resumes.create.input.parse(data);
      const res = await fetch(api.resumes.create.path, {
        method: api.resumes.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create resume");
      return api.resumes.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.resumes.list.path] }),
  });
}

export function useUpdateResume() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<ResumeInput>) => {
      const validated = api.resumes.update.input.parse(updates);
      const url = buildUrl(api.resumes.update.path, { id });
      const res = await fetch(url, {
        method: api.resumes.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update resume");
      return api.resumes.update.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.resumes.list.path] }),
  });
}

export function useDeleteResume() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.resumes.delete.path, { id });
      const res = await fetch(url, { method: api.resumes.delete.method, credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete resume");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.resumes.list.path] }),
  });
}
