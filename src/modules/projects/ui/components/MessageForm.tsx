import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import TextAreaAutoSize from 'react-textarea-autosize'
import {z} from 'zod';
import {Button} from '@/components/ui/button';
import { toast } from 'sonner';
import { ArrowUpIcon,Loader2Icon } from 'lucide-react';
import {useMutation,useQuery,useQueryClient} from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { useTRPC } from '@/trpc/client';
import { Form,FormField } from '@/components/ui/form';
import { useState } from 'react';

interface Props{
    projectId: string;
}
const formSchema = z.object({
    value: z.string()
        .min(1, "Message cannot be empty")
        .max(10000, "Message cannot be longer than 1000 characters"),

})
function MessageForm({ projectId }: Props) {
    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const [isFocused, setIsFocused] = useState(false);
    const showUsage = false;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            value: '',
        },
    });
    const createMessage = useMutation(trpc.messages.create.mutationOptions({
        onSuccess: () => {
            form.reset();
            queryClient.invalidateQueries(trpc.messages.getMany.queryOptions({
                projectId: projectId,
            }));
        },
        onError: (error) => {
            toast.error(`Failed to send message: ${error.message}`);
        },
    }))
    const isPending = createMessage.isPending
    const isButtonDisabled = isPending || !form.formState.isValid

    const onSubmit = async(values:z.infer<typeof formSchema>)=>{
        await createMessage.mutateAsync({
            value: values.value,
            projectId: projectId,
        })
    }
  return (
    <Form {...form}>
        <form
            onSubmit={form.handleSubmit(onSubmit)}
            className={cn(
                "flex flex-col border p-4 pt-1 rounded-xl bg-sidebar dark:bg-sidebar transition-all",
                isFocused && "shadow-xs",
                showUsage && "rounded-t-none"
            )}
        >
            <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                    <TextAreaAutoSize
                    {...field}
                    disabled={isPending}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    minRows={2}
                    maxRows={10}
                    className='pt-4 resize-none border-none w-full outline-none bg-transparent'
                    placeholder='Type your message here...'
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                            e.preventDefault();
                            form.handleSubmit(onSubmit)(e);
                        }
                    }}
                    />
                )}
            />
            <div className='flex gap-x-2 items-end justify-between pt-2'>
                <div className='text-[10px] text-muted-foreground font-mono'>
                    <kbd className='ml-auto pointer-events-none inline-flex h-5 select-none itmes-center gap-1 rounded border bg-muted px-4 font-mono text-[10px] font-bold text-muted-foreground'>
                        <span className='font-bold'>&#8984;</span>Enter
                    </kbd>
                </div>
                <Button
                    disabled={isButtonDisabled}
                >
                    {isPending ? <Loader2Icon className='animate-spin size-4'/> : <ArrowUpIcon/>}
                </Button>
            </div>
        </form>
    </Form>
  )
}

export default MessageForm