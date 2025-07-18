"use client";
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
import { useRouter } from 'next/navigation';
import { PROJECT_TEMPLATES } from '../../constants';

const formSchema = z.object({
    value: z.string()
        .min(1, "Message cannot be empty")
        .max(10000, "Message cannot be longer than 1000 characters"),

})
function ProjectForm() {
    const trpc = useTRPC();
    const router = useRouter()
    const queryClient = useQueryClient();
    const [isFocused, setIsFocused] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            value: '',
        },
    });
    const createProject = useMutation(trpc.projects.create.mutationOptions({
        onSuccess: (data) => {
            queryClient.invalidateQueries(trpc.projects.getMany.queryOptions());
            queryClient.invalidateQueries(trpc.useage.status.queryOptions());
            router.push(`/projects/${data.id}`);
        },
        onError: (error) => {
            toast.error(`Failed to send message: ${error.message}`);
            if (error.message === "TOO_MANY_REQUESTS") {
                router.push('/pricing');
            }
        },
    }))
    const isPending = createProject.isPending
    const isButtonDisabled = isPending || !form.formState.isValid

    const onSubmit = async(values:z.infer<typeof formSchema>)=>{
        await createProject.mutateAsync({
            value: values.value,
        })
    }
    const onSelect = (value:string)=>{
        form.setValue('value', value,{
            shouldDirty: true,
            shouldValidate: true,
            shouldTouch: true,
        });
    }
  return (
    <Form {...form}>
        <form
            onSubmit={form.handleSubmit(onSubmit)}
            className={cn(
                "flex flex-col border p-4 pt-1 rounded-xl bg-sidebar dark:bg-sidebar transition-all",
                isFocused && "shadow-xs",
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
        <div className='flex-wrap justify-center gap-2 mt-3 hidden md:flex max-w-3xl'>
            {PROJECT_TEMPLATES.map((template) => (
                <Button key={template.title} variant='outline' size='sm' className='bg-white dark:bg-sidebar' onClick={() => onSelect(template.prompt)}>
                    {template.emoji} {template.title}
                </Button>
            ))}
        </div>
    </Form>
  )
}

export default ProjectForm