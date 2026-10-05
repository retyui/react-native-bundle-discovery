import Image, { type StaticImageData } from "next/image";

export function ThemedImage({
  light,
  dark,
  alt,
  className = "",
}: {
  light: StaticImageData;
  dark: StaticImageData;
  alt: string;
  className?: string;
}) {
  return (
    <>
      <Image src={light} alt={alt} className={`dark:hidden ${className}`} />
      <Image
        src={dark}
        alt={alt}
        className={`hidden dark:block ${className}`}
      />
    </>
  );
}
