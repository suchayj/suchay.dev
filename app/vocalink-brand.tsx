import Image from "next/image";

export function VocalinkBrand({ mark = false }: { mark?: boolean }) {
  if (!mark) return <span className="vocalink-brand">Vocalink <small>by Mastercard</small></span>;
  return <span className="vocalink-brand vocalink-brand-mark"><span className="vocalink-brand-text">Vocalink <small>by Mastercard</small></span><Image className="vocalink-logo vocalink-logo-positive" src="/brands/vocalink-by-mastercard-positive.png" width={2020} height={567} alt="" sizes="150px" /><Image className="vocalink-logo vocalink-logo-reverse" src="/brands/vocalink-by-mastercard-reverse.png" width={2020} height={567} alt="" sizes="150px" /></span>;
}
