import type { BenchmarkSet } from "@/lib/benchmarks/sets";

/** Every benchmark shown links to its source. One source: one link. Several: one short link per level. */
export function SourceLine({ set }: { set: BenchmarkSet }) {
  const [only] = set.sources;
  if (set.sources.length === 1 && only) {
    return (
      <p className="mt-1 text-[0.9375rem]">
        Source:{" "}
        <a href={only.url} rel="noopener noreferrer" target="_blank" className="inline-block py-1">
          {only.name}
        </a>
      </p>
    );
  }

  return (
    <p className="mt-1 text-[0.9375rem]">
      Source for each level:{" "}
      {set.levels.map((level, index) => (
        <span key={level.levelCode}>
          {index > 0 ? ", " : null}
          <a
            href={level.source.url}
            rel="noopener noreferrer"
            target="_blank"
            aria-label={`${level.label}: ${level.source.name}`}
            className="inline-block px-0.5 py-1"
          >
            {level.label}
          </a>
        </span>
      ))}
    </p>
  );
}
