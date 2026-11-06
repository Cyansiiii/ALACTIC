import { ArrowIcon, ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="container-x flex min-h-[80svh] flex-col items-start justify-center pt-[var(--nav-h)]">
      <p className="label-bracket">404 · not in the snapshot</p>
      <h1 className="mt-5 max-w-2xl font-display text-display-xl font-semibold text-fg">
        This page has no <em className="font-serif font-normal italic">valid proof.</em>
      </h1>
      <p className="mt-4 max-w-md text-fg-muted">Like an unlisted address, it can&apos;t be reached. Head back somewhere committed.</p>
      <ButtonLink href="/" variant="outline" className="mt-8">
        Back home <ArrowIcon />
      </ButtonLink>
    </section>
  );
}
