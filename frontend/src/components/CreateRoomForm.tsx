"use client";

import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";

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

import Spinner from "./icons/spinner.svg?react";
import { useWS } from "./ws-provider";

const FormSchema = z.object({
    passcode: z.string().min(2, {
        message: "Username must be at least 2 characters.",
    }),
});

interface Props extends React.HTMLAttributes<HTMLElement> {}

export function CreateRoomForm({ ...props }: Props) {
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            passcode: "",
        },
    });

    const createRoomCallback = useCallback(async (key: string) => {
        const url = new URL("/gs/lobby", location.origin);
        return fetch(url, {
            method: "POST",
            headers: {
                "X-secret-key": key,
            },
        }).then((res) => (res.ok ? res.json() : Promise.reject(res.json())));
    }, []);

    const mutation = useMutation({
        mutationFn: createRoomCallback,
        onError: (error, variables, context) => {
            // An error happened!
            form.setError("passcode", error, {
                shouldFocus: true,
            });
        },
        onSuccess: (data, variables, context) => {
            // Boom baby!
            location.pathname = `/room/${data.id}`;
        },
        onSettled: (data, error, variables, context) => {
            // Error or success... doesn't matter!
        },
    });

    function onSubmit(data: z.infer<typeof FormSchema>) {
        mutation.mutate(data.passcode);
    }

    return (
        <div className="grid h-full w-full place-items-center">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="rounded-(--radius-sm) bg-primary/20 w-full max-w-xl space-y-10 p-10"
                >
                    <FormField
                        control={form.control}
                        name="passcode"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Passcode</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="this should not be shared"
                                        type="password"
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>
                                    This is the passcode that you must have to create a room
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="flex justify-center">
                        <Button type="submit" className="rounded-(--radius-sm) cursor-pointer">
                            {mutation.isPending ? (
                                <>
                                    <Spinner className=" animate-spin" />
                                </>
                            ) : (
                                "Create Room"
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
