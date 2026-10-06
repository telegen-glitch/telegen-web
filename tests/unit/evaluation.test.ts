import { describe, expect, it } from "vitest";
import { evaluations, getEvaluation } from "@/content/evaluations";
import { stopFor, visibleQuestions } from "@/lib/evaluation";
import { serviceOpen } from "@/lib/flags";

describe("evaluation definitions", () => {
  it("every stop rule points to an existing hard-stop screen", () => {
    for (const def of evaluations) {
      for (const q of def.questions) {
        if (q.stop) {
          expect(
            def.stops.map((s) => s.id),
            `${def.topic}/${q.id}`,
          ).toContain(q.stop.stopId);
          for (const v of q.stop.anyOf) expect(q.options.map((o) => o.value)).toContain(v);
        }
      }
    }
  });

  it("question ids are unique and showIf references an earlier question", () => {
    for (const def of evaluations) {
      const ids = def.questions.map((q) => q.id);
      expect(new Set(ids).size, def.topic).toBe(ids.length);
      def.questions.forEach((q, i) => {
        if (q.showIf) expect(ids.slice(0, i), `${def.topic}/${q.id}`).toContain(q.showIf.question);
      });
    }
  });

  it("adults only: under-18 ends every evaluation", () => {
    for (const def of evaluations) {
      const age = def.questions.find((q) => q.id === "age")!;
      expect(stopFor(def, age, ["u18"])?.id, def.topic).toBe("minor");
    }
  });
});

describe("erectile dysfunction safety screens (CLAUDE.md 7c.D)", () => {
  const ed = getEvaluation("disfunctie-erectila")!;
  const mandatory = [
    "nitrates",
    "cardiac-event",
    "chest-pain",
    "blood-pressure",
    "liver-kidney",
    "alpha-blockers",
  ];

  it("all mandatory safety questions exist, one per screen, and are always shown", () => {
    for (const id of mandatory) {
      const q = ed.questions.find((x) => x.id === id);
      expect(q, id).toBeDefined();
      expect(q!.type).toBe("single");
      expect(q!.showIf).toBeUndefined();
    }
  });

  it("a positive answer to any safety question hard-stops", () => {
    for (const id of mandatory) {
      const q = ed.questions.find((x) => x.id === id)!;
      expect(stopFor(ed, q, ["yes"]), id).toBeDefined();
      expect(stopFor(ed, q, ["no"]), id).toBeUndefined();
    }
  });

  it("uncertainty about interacting medicines also hard-stops", () => {
    for (const id of ["nitrates", "alpha-blockers"]) {
      const q = ed.questions.find((x) => x.id === id)!;
      expect(stopFor(ed, q, ["unsure"]), id).toBeDefined();
    }
  });

  it("onset after injury and penile curvature or pain hard-stop", () => {
    expect(
      stopFor(
        ed,
        ed.questions.find((q) => q.id === "onset")!,
        ["injury"],
      ),
    ).toBeDefined();
    expect(
      stopFor(
        ed,
        ed.questions.find((q) => q.id === "curvature")!,
        ["yes"],
      ),
    ).toBeDefined();
  });
});

describe("acne red flags (CLAUDE.md 7c.C/D)", () => {
  const acne = getEvaluation("acnee")!;
  const cases: [string, string[], string][] = [
    ["lesions", ["nodules"], "nodular"],
    ["scars", ["yes"], "scarring"],
    ["onset", ["adult-sudden"], "sudden-adult"],
    ["systemic", ["yes"], "systemic"],
    ["isotretinoin", ["current"], "isotretinoin-current"],
    ["pregnancy", ["yes"], "pregnancy"],
  ];
  it.each(cases)("%s = %s stops on %s", (qid, values, stopId) => {
    const q = acne.questions.find((x) => x.id === qid)!;
    expect(stopFor(acne, q, values)?.id).toBe(stopId);
  });

  it("the pregnancy question is shown only when relevant", () => {
    const ids = (a: Record<string, string[]>) => visibleQuestions(acne, a).map((q) => q.id);
    expect(ids({ sex: ["m"] })).not.toContain("pregnancy");
    expect(ids({ sex: ["f"] })).toContain("pregnancy");
  });
});

describe("service switch", () => {
  it("every condition with an evaluation has a serviceOpen flag, OFF by default", () => {
    for (const def of evaluations) expect(serviceOpen[def.topic], def.topic).toBe(false);
  });
});
