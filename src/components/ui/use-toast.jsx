import { toast as sonnerToast } from "sonner";

export function toast(props) {
  const { title, description, variant, ...rest } = props;
  
  if (variant === "destructive" || (title && title.toLowerCase().includes("erro"))) {
    return sonnerToast.error(title, { description, ...rest });
  }
  
  return sonnerToast.success(title, { description, ...rest });
}

export function useToast() {
  return {
    toast,
    dismiss: sonnerToast.dismiss,
  };
}