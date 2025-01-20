'use client';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { createTodo, getCategories, getTodos } from './action';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckedState } from '@radix-ui/react-checkbox';
import { updateTodo } from './action';

const formSchema = z.object({
  title: z.string().nonempty('Title is required'),
  categoryId: z.string().regex(/^\d+$/, 'Please choose a valid category')
});

export default function CreateTodo() {
  const [categories, setCategories] = useState<any[] | null>(null);
  const [todos, setTodos] = useState<any[] | null>(null);

  useEffect(() => {
    getCategories().then(categories => {
      setCategories(categories);
    });
  }, []);

  useEffect(() => {
    getTodos().then(todos => {
      setTodos(todos);
    });
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      categoryId: ''
    }
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('category_id', values.categoryId);
      await createTodo(formData);
      toast(
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(values, null, 2)}</code>
        </pre>
      );
    } catch (error) {
      console.error('Form submission error', error);
      toast.error('Failed to submit the form. Please try again.');
    }
  }

  const handleTodoCheck = (id: string) => async (checked: CheckedState) => {
    await updateTodo(id, { completed: checked });
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 max-w-3xl mx-auto py-10 clear-both"
        >
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Todo Title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-4">
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value=" ">Select a category</SelectItem>
                        {categories?.map(category => (
                          <SelectItem
                            key={category.id}
                            value={category.id.toString()}
                          >
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <Button type="submit" className="float-right">
            Submit
          </Button>
        </form>
      </Form>
      <ScrollArea className="h-[400px] rounded-md border p-4">
        <div className="flex flex-col gap-4">
          {todos?.map(todo => (
            <div key={todo.id} className="space-y-2">
              <div className="flex justify-between items-center">
                <Checkbox
                  id={todo.id}
                  checked={todo.completed}
                  onCheckedChange={handleTodoCheck(todo.id)}
                />
                <label htmlFor={todo.id}>{todo.title}</label>
                <p>{todo.category.name}</p>
              </div>
              <Separator />
            </div>
          ))}
        </div>
      </ScrollArea>
    </>
  );
}
