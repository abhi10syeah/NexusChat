
"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useChatStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { useAuth } from "@/context/AuthContext";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Room name must be at least 2 characters.",
  }).max(50, {
    message: "Room name must not exceed 50 characters."
  }),
  members: z.array(z.string()).optional(),
});

export function CreateRoomDialog() {
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { users, createRoom } = useChatStore();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  const otherUsers = users.filter(u => u._id !== currentUser?._id);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      members: [],
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsCreating(true);
    try {
      const roomName = values.name.startsWith('#') ? values.name : `#${values.name}`;
      await createRoom(roomName, true, values.members);
      toast({
        title: "Channel Created",
        description: `The channel "${roomName}" has been successfully created.`,
      });
      form.reset();
      setOpen(false);
    } catch (error: any) {
      toast({
        title: "Failed to Create Channel",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <Plus className="h-4 w-4" />
          <span className="sr-only">Create Channel</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a new channel</DialogTitle>
          <DialogDescription>
            Channels are where your team communicates. They’re best when organized around a topic — #marketing, for example.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Channel Name</FormLabel>
                  <FormControl>
                    <Input placeholder="# e.g. project-nexus" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="members"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Invite Members (optional)</FormLabel>
                    <FormDescription>
                      Select users to invite to this new channel.
                    </FormDescription>
                  </div>
                   <ScrollArea className="h-40">
                    {otherUsers.map((item) => (
                        <FormField
                        key={item._id}
                        control={form.control}
                        name="members"
                        render={({ field }) => {
                            return (
                            <FormItem
                                key={item._id}
                                className="flex flex-row items-start space-x-3 space-y-0 p-2 hover:bg-muted rounded-md"
                            >
                                <FormControl>
                                <Checkbox
                                    checked={field.value?.includes(item._id)}
                                    onCheckedChange={(checked) => {
                                    return checked
                                        ? field.onChange([...(field.value || []), item._id])
                                        : field.onChange(
                                            field.value?.filter(
                                            (value) => value !== item._id
                                            )
                                        )
                                    }}
                                />
                                </FormControl>
                                <FormLabel className="font-normal w-full cursor-pointer">
                                  {item.username}
                                </FormLabel>
                            </FormItem>
                            )
                        }}
                        />
                    ))}
                  </ScrollArea>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Channel
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
