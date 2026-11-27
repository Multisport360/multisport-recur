import { SITE } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="mt-8 border-t-2 border-chalk">
      <div className="mx-auto max-w-120 px-2 py-4 text-[0.9375rem]">
        <p className="font-display text-[1.25rem] leading-none font-extrabold">{SITE.name}</p>
        <p className="mt-1 max-w-80">
          Benchmarks are senior-year targets taken from public recruiting guides. They show where a number stands
          today. They are not a promise of a roster spot or a scholarship.
        </p>
      </div>
    </footer>
  );
}
