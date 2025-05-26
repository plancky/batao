"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
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

import { useWS } from "../ws-provider";

const FormSchema = z.object({
    uname: z.string().min(2, {
        message: "Username must be at least 2 characters.",
    }),
});

interface Props extends React.HTMLAttributes<HTMLElement> {}

export function InputForm({ ...props }: Props) {
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            uname: "",
        },
    });

    const { connectUser } = useWS();

    function onSubmit(data: z.infer<typeof FormSchema>) {
        connectUser!({ uname: data.uname });
    }

    return (
        <div className="w-full h-full grid place-items-center">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="max-w-xl rounded-(--radius-sm) bg-primary/20 p-10 w-full space-y-10"
                >
                    <FormField
                        control={form.control}
                        name="uname"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                    <Input placeholder="random cat" {...field} />
                                </FormControl>
                                <FormDescription>This is your public display name.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="flex justify-center">
                        <Button type="submit" className=" cursor-pointer rounded-(--radius-sm)">
                            Join
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
