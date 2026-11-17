import Link from "next/link";
import { BenchmarkExplorer } from "@/components/BenchmarkExplorer";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { priceWithInterval } from "@/config/billing";
import { loadBenchmarkSets } from "@/lib/benchmarks/repository";
import type { BenchmarkSet } from "@/lib/benchmarks/sets";
import type { Source } from "@/lib/benchmarks/types";

// The benchmarks rarely change, so the page is rebuilt at most every five minutes.
export const revalidate = 300;

function uniqueSources(sets: readonly BenchmarkSet[]): Source[] {
  const byId = new Map(sets.flatMap((set) => set.sources).map((source) => [source.id, source] as const));
  return [...byId.values()];
}

export default async function HomePage() {
  const benchmarks = await loadBenchmarkSets();

  return (
    <>
      <SiteHeader>
        <Link href="/login">Sign in</Link>
      </SiteHeader>

      <main className="mx-auto max-w-120 px-2">
        <section className="pt-4 pb-6 sm:pt-6">
          <h1 className="max-w-100 text-[2.75rem] sm:text-[4.5rem]">Find out what college level your numbers reach.</h1>
          <div className="mt-4">
            {benchmarks.status === "ok" ? (
              <BenchmarkExplorer sets={benchmarks.sets} />
            ) : (
              <div data-testid="benchmarks-unavailable" className="border-l-4 border-infield-navy pl-2">
                <p className="text-[1.25rem] font-bold">The benchmarks can&apos;t be loaded right now.</p>
                <p className="mt-1">Reload the page in a few minutes to try the ruler.</p>
              </div>
            )}
          </div>
        </section>

        <section className="border-t-2 border-chalk py-5">
          <h2 className="text-[2.25rem]">How the full report works</h2>
          <ol className="mt-2 max-w-80 list-decimal space-y-1 pl-3">
            <li>Create a parent account and add your athlete. We ask for a first name, graduation year, and birth year.</li>
            <li>Enter the numbers coaches ask for, like fastball velocity, 40-yard dash, or 100m time.</li>
            <li>Get a ruler for every number: the level it reaches today and how far the next level is.</li>
          </ol>
          <p className="mt-2 max-w-80">Baseball, football, and track &amp; field are covered today.</p>
        </section>

        <section className="border-t-2 border-chalk py-5">
          <h2 className="text-[2.25rem]">What it costs</h2>
          <p className="mt-2 max-w-80">
            The gap report is free. The training plan is a paid subscription: {priceWithInterval()}, and you can cancel
            online at any time. Every plan is reviewed by a coach before it goes live.
          </p>
        </section>

        {benchmarks.status === "ok" ? (
          <section className="border-t-2 border-chalk py-5">
            <h2 className="text-[2.25rem]">Where the numbers come from</h2>
            <p className="mt-2 max-w-80">
              Every number on a ruler comes from a published recruiting guide, and every ruler links to its guide. When
              a guide is less certain, the ruler says &ldquo;rough guide&rdquo;.
            </p>
            <ul className="mt-2 max-w-80 list-disc space-y-0.5 pl-3">
              {uniqueSources(benchmarks.sets).map((source) => (
                <li key={source.id}>
                  <a href={source.url} rel="noopener noreferrer" target="_blank">
                    {source.name}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>

      <SiteFooter />
    </>
  );
}
