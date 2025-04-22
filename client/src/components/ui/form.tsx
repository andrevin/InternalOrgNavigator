"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { Slot } from "@radix-ui/react-slot"
import {
  Controller,
  FormProvider,
  useFormContext,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

const Form = FormProvider

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
)

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  
  if (!fieldContext?.name) {
    throw new Error("useFormField should be used within <FormField>")
  }

  // Check if we're in a form context
  const formContext = useFormContext()
  if (!formContext) {
    throw new Error("useFormField should be used within <Form>")
  }

  const { getFieldState, formState } = formContext
  const fieldState = getFieldState(fieldContext.name, formState)
  
  if (!itemContext) {
    throw new Error("useFormField should be used within <FormItem>")
  }

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

type FormItemContextValue = {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
)

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const id = React.useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={cn("space-y-2", className)} {...props} />
    </FormItemContext.Provider>
  )
})
FormItem.displayName = "FormItem"

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  // Check if we're in a form context
  const formContext = useFormContext();
  const fieldContext = React.useContext(FormFieldContext);
  
  // If not in a form context, just render the label
  if (!formContext || !fieldContext?.name) {
    return (
      <Label
        ref={ref}
        className={className}
        {...props}
      />
    );
  }
  
  // Otherwise, use form field context
  const { getFieldState, formState } = formContext;
  const fieldState = getFieldState(fieldContext.name, formState);
  const itemContext = React.useContext(FormItemContext);
  const { id } = itemContext || { id: '' };
  const formItemId = id ? `${id}-form-item` : undefined;
  
  return (
    <Label
      ref={ref}
      className={cn(fieldState?.error && "text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  );
})
FormLabel.displayName = "FormLabel"

const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  try {
    const { error, formItemId, formDescriptionId, formMessageId } = useFormField()
    
    return (
      <Slot
        ref={ref}
        id={formItemId}
        aria-describedby={
          !error
            ? `${formDescriptionId}`
            : `${formDescriptionId} ${formMessageId}`
        }
        aria-invalid={!!error}
        {...props}
      />
    )
  } catch (e) {
    // Fallback when not in a form context
    return <Slot ref={ref} {...props} />
  }
})
FormControl.displayName = "FormControl"

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  try {
    const { formDescriptionId } = useFormField()
    return (
      <p
        ref={ref}
        id={formDescriptionId}
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
      />
    )
  } catch (e) {
    // Fallback when not in a form context
    return (
      <p
        ref={ref}
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
      />
    )
  }
})
FormDescription.displayName = "FormDescription"

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  try {
    const { error, formMessageId } = useFormField()
    const body = error ? String(error?.message ?? "") : children

    if (!body) {
      return null
    }

    return (
      <p
        ref={ref}
        id={formMessageId}
        className={cn("text-sm font-medium text-destructive", className)}
        {...props}
      >
        {body}
      </p>
    )
  } catch (e) {
    // Fallback when not in a form context
    if (!children) {
      return null
    }
    
    return (
      <p
        ref={ref}
        className={cn("text-sm font-medium text-destructive", className)}
        {...props}
      >
        {children}
      </p>
    )
  }
})
FormMessage.displayName = "FormMessage"

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
}
