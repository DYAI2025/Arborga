import { describe, expect, it } from "vitest";

import { WorksiteDayDtoSchema } from "../src/planning/schemas.js";
import { LocalDateSchema } from "../src/primitives.js";

const WORKSITE_DAY = {
  worksiteDayId: "00000000-0000-4000-8000-00000000d001",
  configurationId: "00000000-0000-4000-8000-00000000c001",
  worksiteId: "00000000-0000-4000-8000-00000000a001",
  localDate: "2026-09-07",
};

describe("LocalDateSchema", () => {
  it("nimmt ein kanonisches lokales Geschaeftsdatum an", () => {
    expect(LocalDateSchema.safeParse("2026-09-07").success).toBe(true);
  });

  it.each(["2026-02-30", "2025-02-29", "2026-04-31", "2026-13-01"])(
    "lehnt den nicht existierenden Kalendertag %s ab",
    (value) => {
      expect(LocalDateSchema.safeParse(value).success).toBe(false);
    },
  );

  it("nimmt den 29. Februar eines Schaltjahres an", () => {
    expect(LocalDateSchema.safeParse("2028-02-29").success).toBe(true);
  });
});

describe("WorksiteDayDtoSchema — Identitaets- und Revisionsfundament", () => {
  it("validiert Identitaet und Revision ohne geplante Arbeitszeit", () => {
    expect(WorksiteDayDtoSchema.safeParse(WORKSITE_DAY).success).toBe(true);
  });

  it("materialisiert keine Arbeitszeit, wenn keine geliefert wurde", () => {
    const parsed = WorksiteDayDtoSchema.parse(WORKSITE_DAY);

    expect(parsed).toEqual(WORKSITE_DAY);
    expect(parsed).not.toHaveProperty("plannedWorkingTime");
    expect(parsed).not.toHaveProperty("workingTime");
    expect(parsed).not.toHaveProperty("interval");
  });

  it("haelt stabile Identitaet und revisionsgebundene Konfiguration getrennt", () => {
    const parsed = WorksiteDayDtoSchema.parse(WORKSITE_DAY);

    expect(parsed.worksiteDayId).not.toBe(parsed.configurationId);
    expect(
      WorksiteDayDtoSchema.safeParse({ ...WORKSITE_DAY, worksiteDayId: undefined }).success,
    ).toBe(false);
    expect(
      WorksiteDayDtoSchema.safeParse({ ...WORKSITE_DAY, configurationId: undefined }).success,
    ).toBe(false);
  });

  it("akzeptiert kein clientautoritatives orgId", () => {
    expect(
      WorksiteDayDtoSchema.safeParse({
        ...WORKSITE_DAY,
        orgId: "00000000-0000-4000-8000-00000000f001",
      }).success,
    ).toBe(false);
  });
});
