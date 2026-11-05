import type { ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CampoFormularioProps = ComponentProps<typeof Input> & {
  id: string;
  rotulo: string;
};

export function CampoFormulario({ id, rotulo, ...props }: CampoFormularioProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{rotulo}</Label>
      <Input id={id} name={id} required {...props} />
    </div>
  );
}
