
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
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useChatStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserPlus } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import type { Room } from "@/lib/types";

const formSchema = z.object({
  members: z.array(z.string()).min(1, "You must select at least one member to add."),
});

interface AddMembersDialogProps {
    room: Room;
}

export function AddMembersDialog({ room }: AddMembersDialogProps) {
  const [open, setOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { users, addMembersToRoom } = useChatStore();
  const { toast } = useToast();

  const currentMemberIds = room.members;
  const potentialNewMembers = users.filter(u => !currentMemberIds.includes(u._id));

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      members: [],
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsAdding(true);
    try {
      await addMembersToRoom(room._id, values.members);
      toast({
        title: "Members Added",
        description: `Successfully added ${values.members.length} new member(s) to ${room.name}.`,
      });
      form.reset();
      setOpen(false);
    } catch (error: any) {
      toast({
        title: "Failed to Add Members",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
            <UserPlus className="mr-2 h-4 w-4" />
            Add Members
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add members to {room.name}</DialogTitle>
          <DialogDescription>
            Select users to invite to this channel.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="members"
              render={() => (
                <FormItem>
                   <ScrollArea className="h-48">
                    {potentialNewMembers.length > 0 ? potentialNewMembers.map((item) => (
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
                    )) : (
                        <p className="text-sm text-muted-foreground p-4 text-center">No new users to add.</p>
                    )}
                  </ScrollArea>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isAdding}>
                {isAdding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Members
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
