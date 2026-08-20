export function FormField({ label, name, type = "text", autoComplete }: { label: string; name: string; type?: string; autoComplete?: string }) {
  return <label className="form-field"><span>{label}</span><input name={name} type={type} autoComplete={autoComplete} required /></label>;
}
