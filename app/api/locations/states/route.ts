import { NextResponse } from "next/server";
import { State } from "country-state-city";

export async function GET(request: Request) {
  try {
    const states = State.getStatesOfCountry("IN");
    return NextResponse.json(states.map(s => ({ value: s.isoCode, label: s.name })));
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch states" }, { status: 500 });
  }
}
