"use client";

import * as React from "react";
import { Slot } from "radix-ui";
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const Form = FormProvider;

const FormFieldContext = React.createContext<{ name: string }>({ name: "" });
const FormItemContext = React.createContext<{ id: string }>({ id: "" });

function FormField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: ControllerProps<TFieldValues, TName>) {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
}

function useFormField() {
  const { name } = React.useContext(FormFieldContext);
  const { id } = React.useContext(FormItemContext);
  const { getFieldState } = useFormContext();
  const formState = useFormState({ name });
  const { error } = getFieldState(name, formState);

  return { error, inputId: `${id}-campo`, messageId: `${id}-mensagem` };
}

function FormItem({ className, ...props }: React.ComponentProps<"div">) {
  const id = React.useId();
  return (
    <FormItemContext.Provider value={{ id }}>
      <div data-slot="form-item" className={cn("flex flex-col gap-1.5", className)} {...props} />
    </FormItemContext.Provider>
  );
}

function FormLabel(props: React.ComponentProps<typeof Label>) {
  const { inputId } = useFormField();
  return <Label htmlFor={inputId} {...props} />;
}

function FormControl(props: React.ComponentProps<typeof Slot.Root>) {
  const { error, inputId, messageId } = useFormField();
  return (
    <Slot.Root
      id={inputId}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? messageId : undefined}
      {...props}
    />
  );
}

function FormMessage({ className, ...props }: React.ComponentProps<"p">) {
  const { error, messageId } = useFormField();
  if (!error?.message) return null;

  return (
    <p id={messageId} className={cn("text-xs text-erro", className)} {...props}>
      {error.message}
    </p>
  );
}

export { Form, FormControl, FormField, FormItem, FormLabel, FormMessage };
