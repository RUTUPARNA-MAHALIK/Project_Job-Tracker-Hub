import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type ContactInput } from "@shared/routes";

export function useContacts() {
  return useQuery({
    queryKey: [api.contacts.list.path],
    queryFn: async () => {
      const res = await fetch(api.contacts.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch contacts");
      return api.contacts.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: ContactInput) => {
      const validated = api.contacts.create.input.parse(data);
      const res = await fetch(api.contacts.create.path, {
        method: api.contacts.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create contact");
      return api.contacts.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.contacts.list.path] }),
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<ContactInput>) => {
      const validated = api.contacts.update.input.parse(updates);
      const url = buildUrl(api.contacts.update.path, { id });
      const res = await fetch(url, {
        method: api.contacts.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update contact");
      return api.contacts.update.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.contacts.list.path] }),
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.contacts.delete.path, { id });
      const res = await fetch(url, { method: api.contacts.delete.method, credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete contact");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.contacts.list.path] }),
  });
}
