import { createSignal, createEffect } from "solid-js";
import { Input } from "../Widgets/Input";

interface MaskedInputProps {
  mask: 'cpf' | 'cnpj' | 'phone' | 'cep';
  value: string; // raw digits only
  onInput: (rawDigits: string) => void; // emits raw digits
  labelText?: string;
  placeholder?: string;
  error?: string;
  validate?: (value: string) => string | null | undefined;
  disabled?: boolean;
  required?: boolean;
}

export function MaskedInput(props: MaskedInputProps) {
  const [displayValue, setDisplayValue] = createSignal("");

  const format = (raw: string, maskType: string) => {
    let digits = raw.replace(/\D/g, '');
    if (maskType === 'cpf') {
      digits = digits.slice(0, 11);
      return digits
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else if (maskType === 'cnpj') {
      digits = digits.slice(0, 14);
      return digits
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
    } else if (maskType === 'phone') {
      digits = digits.slice(0, 11);
      if (digits.length <= 10) {
        return digits
          .replace(/(\d{2})(\d)/, '($1) $2')
          .replace(/(\d{4})(\d{1,4})$/, '$1-$2');
      } else {
        return digits
          .replace(/(\d{2})(\d)/, '($1) $2')
          .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
      }
    } else if (maskType === 'cep') {
      digits = digits.slice(0, 8);
      return digits.replace(/(\d{5})(\d{1,3})$/, '$1-$2');
    }
    return digits;
  };

  createEffect(() => {
    setDisplayValue(format(props.value || "", props.mask));
  });

  const handleInput = (e: InputEvent) => {
    const target = e.target as HTMLInputElement;
    const raw = target.value.replace(/\D/g, '');
    
    let truncated = raw;
    if (props.mask === 'cpf') truncated = raw.slice(0, 11);
    else if (props.mask === 'cnpj') truncated = raw.slice(0, 14);
    else if (props.mask === 'phone') truncated = raw.slice(0, 11);
    else if (props.mask === 'cep') truncated = raw.slice(0, 8);
    
    props.onInput(truncated);
  };

  return (
    <Input
      type="tel"
      value={displayValue()}
      onInput={handleInput}
      labelText={props.labelText}
      placeholder={props.placeholder}
      error={props.error}
      validate={props.validate ? (val) => props.validate!(val.replace(/\D/g, '')) : undefined}
      disabled={props.disabled}
      required={props.required}
    />
  );
}
