import React from "react";

// Default Link component that works in both Next.js and regular React
export const Link = ({
  href,
  children,
  className,
  ...props
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}) => {
  return (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  );
};
// Next.js specific Link component that can be used to override the default
export const NextJsLink = ({
  href,
  children,
  className,
  ...props
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}) => {
  // This will be dynamically imported in Next.js applications
  const NextLink = React.lazy(() =>
    import("next/link").then((mod) => ({ default: mod.default })),
  );

  return (
    <React.Suspense
      fallback={
        <a href={href} className={className} {...props}>
          {children}
        </a>
      }
    >
      <NextLink href={href} className={className} {...props}>
        {children}
      </NextLink>
    </React.Suspense>
  );
};
