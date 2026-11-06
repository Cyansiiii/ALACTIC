import { EmptyState } from "@/components/ui/states";

export const metadata = { title: "Approver" };

export default function Page() {
  return (
    <section className="container-x pb-24 pt-[calc(var(--nav-h)+4rem)]">
      <p className="label-bracket">/approver</p>
      <EmptyState className="mt-6" title="Coming in a later phase" description="This route is scaffolded; the UI lands in its build phase." />
    </section>
  );
}
