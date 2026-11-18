import type { BenchmarkSet } from "@/lib/benchmarks/sets";

const LINE = "mt-1 text-[0.9375rem] leading-normal";
/** Padding on an inline link grows its tap area without spreading the lines apart. */
const LINK = "py-2";

/** Every benchmark shown links to its source. One source: one link. Several: one short link per level. */
export function SourceLine({ set }: { set: BenchmarkSet }) {
  const [only] = set.sources;
  if (set.sources.length === 1 && only) {
    return (
      <p className={LINE}>
        Source:{" "}
        <a href={only.url} rel="noopener noreferrer" target="_blank" className={LINK}>
          {only.name}
        </a>{" "}
        (opens in a new tab)
      </p>
    );
  }

  return (
    <p className={LINE}>
      Source for each level (opens in a new tab):{" "}
      {set.levels.map((level, index) => (
        <span key={level.levelCode}>
          {index > 0 ? ", " : null}
          <a href={level.source.url} rel="noopener noreferrer" target="_blank" className={LINK} aria-label={`${level.label}: ${level.source.name}`}>
            {level.label}
          </a>
        </span>
      ))}
    </p>
  );
}
