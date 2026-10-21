interface GoogleGLogoProps {
  className?: string;
}

export function GoogleGLogo({ className }: GoogleGLogoProps) {
  return (
    <img
      className={className}
      src="/assets/brand/google-g-logo.svg"
      width={20}
      height={20}
      alt=""
      aria-hidden="true"
    />
  );
}
