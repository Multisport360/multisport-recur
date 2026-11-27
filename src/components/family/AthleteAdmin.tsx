import Link from "next/link";
import { canHaveLogin, firstLoginYear } from "@/lib/athletes/rules";
import { removeAthlete, removeAthleteLogin } from "@/lib/family/actions";
import type { AthleteRow } from "@/lib/supabase/database.types";

/** Parent-only: the athlete's own login. Under 13 never gets one. */
export function AthleteLoginSection({ athlete, today }: { athlete: AthleteRow; today: Date }) {
  const name = athlete.first_name;

  return (
    <section data-testid="athlete-login" className="border-t-2 border-chalk py-4">
      <h2 className="text-[1.75rem]">{name}&apos;s own login</h2>
      {athlete.login_user_id ? (
        <>
          <p className="mt-1">{name} has a login. It shows only {name}&apos;s report.</p>
          <details className="mt-1">
            <summary className="py-1.5 text-track-blue underline underline-offset-4">Take {name}&apos;s login away</summary>
            <p className="mt-1 mb-2">{name} won&apos;t be able to sign in any more. Their numbers stay in your account.</p>
            <form action={removeAthleteLogin.bind(null, athlete.id)}>
              <button type="submit" className="button w-full sm:w-auto">
                Yes, remove {name}&apos;s login
              </button>
            </form>
          </details>
        </>
      ) : canHaveLogin(athlete.birth_year, today) ? (
        <>
          <p className="mt-1">
            {name} is old enough to have a login of their own. It shows only their report and lets them add numbers.
          </p>
          <p className="mt-2">
            <Link href={`/athletes/${athlete.id}/invite`} className="button button-quiet w-full sm:w-auto">
              Invite {name} to their own login
            </Link>
          </p>
        </>
      ) : (
        <p data-testid="no-login-under-13" className="mt-1">
          Athletes under 13 can&apos;t have their own login, so you enter {name}&apos;s numbers. You can invite {name} to their own login from January {firstLoginYear(athlete.birth_year)}.
        </p>
      )}
    </section>
  );
}

/** Parent-only: remove the athlete and everything saved about them. Two deliberate steps. */
export function RemoveAthleteSection({ athlete }: { athlete: AthleteRow }) {
  const name = athlete.first_name;
  return (
    <section className="border-t-2 border-chalk py-4">
      <h2 className="text-[1.75rem]">Remove {name}</h2>
      <details className="mt-1">
        <summary className="py-1.5 text-track-blue underline underline-offset-4">
          Remove {name} and everything saved about them
        </summary>
        <p className="mt-1 mb-2">
          This deletes {name}&apos;s profile, sports, every number entered, the consent record and their login. It
          can&apos;t be undone.
        </p>
        <form action={removeAthlete.bind(null, athlete.id)}>
          <button type="submit" className="button w-full sm:w-auto">
            Yes, remove {name} for good
          </button>
        </form>
      </details>
    </section>
  );
}
