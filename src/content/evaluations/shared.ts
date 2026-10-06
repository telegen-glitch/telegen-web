import type { HardStop, Question } from "./types";

export const adultQuestion = (stopId: string): Question => ({
  id: "age",
  title: "Câți ani ai?",
  type: "single",
  options: [
    { value: "u18", label: "Sub 18 ani" },
    { value: "18-24", label: "18–24 de ani" },
    { value: "25-34", label: "25–34 de ani" },
    { value: "35-44", label: "35–44 de ani" },
    { value: "45-54", label: "45–54 de ani" },
    { value: "55+", label: "55 de ani sau peste" },
  ],
  stop: { anyOf: ["u18"], stopId },
});

export const minorStop: HardStop = {
  id: "minor",
  title: "Serviciul Telegen este doar pentru adulți",
  text: "Pentru persoanele sub 18 ani, recomandăm un consult în persoană la medicul de familie sau la un medic specialist, împreună cu un părinte.",
};
