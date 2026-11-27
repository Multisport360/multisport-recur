"use client";

import { useActionState, useState } from "react";
import { FormAlert, SelectField } from "@/components/forms/Fields";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { EMPTY_FORM_STATE } from "@/lib/forms";
import { addSport } from "@/lib/stats/actions";

/** Pick a sport, then a position or event that has benchmarks for this athlete. */
export function SportForm({ athleteId, positionsBySport }: { athleteId: string; positionsBySport: Record<string, string[]> }) {
  const [state, action] = useActionState(addSport.bind(null, athleteId), EMPTY_FORM_STATE);
  const sports = Object.keys(positionsBySport);
  const [sport, setSport] = useState(state.values.sport ?? sports[0] ?? "");
  const positions = positionsBySport[sport] ?? [];
  const isTrack = sport === "Track & Field";

  return (
    <form action={action} className="space-y-3" noValidate>
      <FormAlert message={state.message} />
      <div>
        <label htmlFor="sport" className="block font-bold">
          Sport
        </label>
        <select id="sport" name="sport" className="field mt-0.5" value={sport} onChange={(event) => setSport(event.target.value)}>
          {sports.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </div>
      <SelectField
        key={sport}
        name="positionOrEvent"
        label={isTrack ? "Event" : "Position"}
        hint={isTrack ? "Add each event as its own sport entry." : undefined}
        options={positions.map((position) => ({ value: position, label: position }))}
        defaultValue={state.values.positionOrEvent}
        error={state.fields.positionOrEvent}
      />
      <SubmitButton pendingText="Adding the sport">Add this sport</SubmitButton>
    </form>
  );
}
