import { createSignal, onCleanup, Show } from "solid-js";

interface PhotoUploadProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  label?: string;
  size?: number; // px, default 100
  disabled?: boolean;
}

export function PhotoUpload(props: PhotoUploadProps) {
  let fileInputRef: HTMLInputElement | undefined;
  const [error, setError] = createSignal<string | null>(null);
  const sizePx = () => props.size || 100;
  
  const previewUrl = () => {
    const f = props.file;
    if (f) {
      const url = URL.createObjectURL(f);
      onCleanup(() => URL.revokeObjectURL(url));
      return url;
    }
    return null;
  };

  const handleFileChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const selected = target.files?.[0];
    setError(null);
    if (selected) {
      if (selected.size > 5 * 1024 * 1024) {
        setError("A imagem deve ter no máximo 5MB");
        props.onFileChange(null);
        return;
      }
      props.onFileChange(selected);
    }
  };

  const clearPhoto = (e: Event) => {
    e.stopPropagation();
    props.onFileChange(null);
    if (fileInputRef) {
      fileInputRef.value = '';
    }
    setError(null);
  };

  return (
    <div class="flex flex-col items-center gap-2 mt-3">
      <div class="relative" style={{ width: `${sizePx()}px`, height: `${sizePx()}px` }}>
        <div 
          class="flex h-full w-full cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-border bg-secondary transition-colors hover:border-primary hover:bg-secondary/80"
          onClick={() => !props.disabled && fileInputRef?.click()}
        >
          <Show 
            when={previewUrl()} 
            fallback={
              <div class="text-3xl text-muted-foreground">
                📷
              </div>
            }
          >
            <img src={previewUrl()!} alt="Preview" class="h-full w-full object-cover" />
          </Show>
        </div>

        <Show when={props.file && !props.disabled}>
          <button
            type="button"
            onClick={clearPhoto}
            class="absolute right-0 top-0 flex h-6 w-6 -translate-y-1/4 translate-x-1/4 items-center justify-center rounded-full bg-error text-white shadow-md transition-transform hover:scale-110"
            title="Remover foto"
          >
            ×
          </button>
        </Show>
      </div>
      
      <Show when={props.label}>
        <span class="text-sm font-medium text-foreground">{props.label}</span>
      </Show>

      <Show when={error()}>
        <span class="text-xs text-error">{error()}</span>
      </Show>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg, image/png, image/webp"
        class="hidden"
        onChange={handleFileChange}
        disabled={props.disabled}
      />
    </div>
  );
}
