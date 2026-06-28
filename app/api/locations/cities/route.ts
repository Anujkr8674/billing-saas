import { NextResponse } from "next/server";
import { City } from "country-state-city";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const stateCode = searchParams.get("stateCode");
    
    if (!stateCode) {
      return NextResponse.json({ error: "State code is required" }, { status: 400 });
    }

    const cities = City.getCitiesOfState("IN", stateCode);
    return NextResponse.json(cities.map(c => ({ value: c.name, label: c.name })));
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch cities" }, { status: 500 });
  }
}
