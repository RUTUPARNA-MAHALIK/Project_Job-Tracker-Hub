import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertContactSchema, type Contact } from "@shared/schema";
import { useContacts, useCreateContact, useUpdateContact, useDeleteContact } from "@/hooks/use-contacts";
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
import { Plus, Users, Building2, Mail, Phone, MoreVertical, Edit2, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Contacts() {
  const { data: contacts = [], isLoading } = useContacts();

  if (isLoading) {
    return <div className="flex items-center justify-center h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Contacts</h1>
          <p className="text-muted-foreground mt-1">Manage recruiters and referrals</p>
        </div>
        <ContactDialog />
      </div>

      {contacts.length === 0 ? (
        <div className="bg-card border border-border border-dashed rounded-2xl p-12 text-center max-w-2xl mx-auto mt-12">
          <Users className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No contacts yet</h3>
          <p className="text-muted-foreground mb-6">Add recruiters or people in your network to stay organized.</p>
          <ContactDialog />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {contacts.map((contact) => (
            <ContactCard key={contact.id} contact={contact} />
          ))}
        </div>
      )}
    </div>
  );
}

function ContactCard({ contact }: { contact: Contact }) {
  const deleteMutation = useDeleteContact();
  const [isEditOpen, setIsEditOpen] = useState(false);

  return (
    <>
      <ContactDialog contact={contact} open={isEditOpen} onOpenChange={setIsEditOpen} />
      <div className="bg-card border border-border shadow-sm hover:shadow-md transition-all rounded-2xl p-6 group">
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary font-bold font-display text-lg flex items-center justify-center uppercase">
            {contact.name.charAt(0)}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                <Edit2 className="w-4 h-4 mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive focus:bg-destructive/10"
                onClick={() => {
                  if (confirm("Delete this contact?")) deleteMutation.mutate(contact.id);
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <h3 className="font-bold text-lg mb-1 truncate">{contact.name}</h3>
        {contact.company && (
          <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5 mb-4">
            <Building2 className="w-3.5 h-3.5" /> {contact.company}
          </p>
        )}

        <div className="space-y-2 mt-4 pt-4 border-t border-border">
          {contact.email && (
            <a href={`mailto:${contact.email}`} className="text-sm flex items-center gap-2 text-primary hover:underline">
              <Mail className="w-4 h-4 shrink-0" />
              <span className="truncate">{contact.email}</span>
            </a>
          )}
          {contact.phone && (
            <a href={`tel:${contact.phone}`} className="text-sm flex items-center gap-2 text-foreground hover:underline">
              <Phone className="w-4 h-4 shrink-0 text-muted-foreground" />
              <span>{contact.phone}</span>
            </a>
          )}
        </div>
      </div>
    </>
  );
}

function ContactDialog({ 
  contact,
  open: controlledOpen,
  onOpenChange 
}: { 
  contact?: Contact,
  open?: boolean,
  onOpenChange?: (open: boolean) => void 
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? onOpenChange! : setInternalOpen;
  
  const createMutation = useCreateContact();
  const updateMutation = useUpdateContact();
  const isEditing = !!contact;

  const form = useForm({
    resolver: zodResolver(insertContactSchema),
    defaultValues: contact || {
      name: "",
      company: "",
      email: "",
      phone: "",
      notes: "",
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    if (isEditing) {
      updateMutation.mutate({ id: contact.id, ...data }, { onSuccess: () => setOpen(false) });
    } else {
      createMutation.mutate(data, { onSuccess: () => setOpen(false) });
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button className="rounded-xl shadow-md shadow-primary/20 hover:shadow-lg hover:-translate-y-0.5 transition-all">
            <Plus className="w-4 h-4 mr-2" />
            Add Contact
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[450px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display">
            {isEditing ? "Edit Contact" : "New Contact"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input className="rounded-xl" placeholder="Jane Doe" {...form.register("name")} />
            {form.formState.errors.name && <p className="text-xs text-destructive">Name is required</p>}
          </div>
          <div className="space-y-2">
            <Label>Company</Label>
            <Input className="rounded-xl" placeholder="Acme Corp" {...form.register("company")} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input className="rounded-xl" type="email" placeholder="jane@acme.com" {...form.register("email")} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input className="rounded-xl" type="tel" placeholder="555-0123" {...form.register("phone")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea className="rounded-xl resize-none h-24" placeholder="Met at networking event..." {...form.register("notes")} />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-xl">Cancel</Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="rounded-xl shadow-md">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
