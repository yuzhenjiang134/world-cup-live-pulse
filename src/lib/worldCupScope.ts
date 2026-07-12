export const txlineWorldCupCompetitionId = 72;

export type CompetitionScopedFixture = {
  Competition?: string;
  CompetitionId?: number;
};

export function isTxlineWorldCupFixture(fixture: CompetitionScopedFixture) {
  if (typeof fixture.CompetitionId === "number") {
    return fixture.CompetitionId === txlineWorldCupCompetitionId;
  }

  return /\bworld cup\b/i.test(fixture.Competition ?? "");
}

export function filterTxlineWorldCupFixtures<T extends CompetitionScopedFixture>(fixtures: T[]) {
  return fixtures.filter(isTxlineWorldCupFixture);
}
