import { useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { zodResolver } from "@hookform/resolvers/zod";
import { GameConfig } from "$/server-types/server-msgs";
import { WORD_LIST_CODES, WORD_LIST_NAMES } from "$/server-types/word-consts";
import { SessionStates } from "$/session/constants";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { GAME_CONFIG_QK } from "@/lib/constants/query_keys";
import { useSessionState, useUserInfo } from "@/lib/hooks";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useWS } from "../ws-provider";
import { DrawBoardOverlayContainer } from "./DrawBoardOverlay";

const selectVals = {
    drawtime: ["20", "40", "60", "80", "100", "120", "140", "160", "180", "200"] as const,
    rounds: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"] as const,
    hints: ["1", "2", "3", "4", "5"] as const,
    words: ["2", "3", "4", "5"] as const,
    wordlist: Object.entries(WORD_LIST_NAMES),
};

const FormSchema = z.object({
    drawtime: z.enum(selectVals.drawtime),
    rounds: z.enum(selectVals.rounds),
    hints: z.enum(selectVals.hints),
    words: z.enum(selectVals.words),
    wordlist: z.enum(WORD_LIST_CODES),
});

const GameConfigResolver = z.object({
    drawtime: z.coerce.number(),
    rounds: z.coerce.number(),
    hints: z.coerce.number(),
    words: z.coerce.number(),
    wordlist: z.enum(WORD_LIST_CODES),
});

export function GameSettingsOverlay() {
    const {
        ws: { raw: ws, addMessageEventListener, sendMessage },
        isConnected,
    } = useWS();

    const sessionState = useSessionState();
    const { isOwner } = useUserInfo();
    const show = sessionState === SessionStates.WAITING && isOwner;

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            drawtime: "60",
            rounds: "3",
            hints: "2",
            words: "3",
            wordlist: "astronomy"
        },
    });

    function onSubmit(data: z.infer<typeof FormSchema>) {
        console.log(data);
    }

    const queryClient = useQueryClient();

    const onValidChange = useCallback((data: z.infer<typeof FormSchema>) => {
        const { data: values, error, success } = GameConfigResolver.safeParse(data);
        queryClient.setQueryData(GAME_CONFIG_QK, (oldData: GameConfig = {}) => {
            return { ...oldData, ...values };
        });
    }, []);

    const onInvalidChange = useCallback((errors: any) => {
        console.log(errors);
    }, []);

    // Callback version of watch.  It's your responsibility to unsubscribe when done.
    const watch = form.watch;
    useEffect(() => {
        form.handleSubmit(onValidChange, onInvalidChange)();
        const subscription = watch((value, { name, type }) => {
            if (type == "change") {
                //console.log(value, name, type);
                form.handleSubmit(onValidChange, onInvalidChange)();
            }
        });
        return () => subscription.unsubscribe();
    }, [watch]);

    return (
        <>
            <DrawBoardOverlayContainer show={show}>
                <div className="text-secondary-foreground bg-secondary/80 flex h-full w-full flex-col items-center p-10">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="w-1/3 space-y-6">
                            <FormField
                                control={form.control}
                                name="drawtime"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex w-full justify-between">
                                            <FormLabel>Drawtime</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select (in seconds)" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="border-secondary">
                                                    {selectVals.drawtime.map((e) => (
                                                        <div key={`option_${e}`}>
                                                            <SelectItem value={e}>{e}</SelectItem>
                                                        </div>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="rounds"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex w-full justify-between">
                                            <FormLabel>Rounds</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="border-secondary">
                                                    {selectVals.rounds.map((e) => (
                                                        <div key={`option_${e}`}>
                                                            <SelectItem value={e}>{e}</SelectItem>
                                                        </div>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="hints"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex w-full justify-between">
                                            <FormLabel>Hints</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="border-secondary">
                                                    {selectVals.hints.map((e) => (
                                                        <div key={`option_${e}`}>
                                                            <SelectItem value={e}>{e}</SelectItem>
                                                        </div>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="words"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex w-full justify-between">
                                            <FormLabel>Words</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="border-secondary">
                                                    {selectVals.words.map((e) => (
                                                        <div key={`option_${e}`}>
                                                            <SelectItem value={e}>{e}</SelectItem>
                                                        </div>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="wordlist"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex w-full justify-between">
                                            <FormLabel>Word List</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="border-secondary">
                                                    {selectVals.wordlist.map(([code, label]) => (
                                                        <div key={`option_${code}`}>
                                                            <SelectItem value={code}>
                                                                {label}
                                                            </SelectItem>
                                                        </div>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </form>
                    </Form>
                </div>
            </DrawBoardOverlayContainer>
        </>
    );
}
