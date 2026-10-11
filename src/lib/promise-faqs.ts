import { SLA_HOURS } from "./promise";

/** The FAQ every page about the service answers the same way. */
export function promiseFaqs(priceText: string | null): { question: string; answer: string }[] {
  return [
    {
      question: "Cât costă?",
      answer: `Evaluarea este gratuită. ${priceText ?? "Prețul planului îl vezi în cont, înainte să plătești."} Prețul include analiza medicului, mesajele cu medicul și livrarea. Plătești doar dacă medicul aprobă planul.`,
    },
    {
      question: "Când plătesc?",
      answer: `La final, după ce vezi planul propus și prețul. Suma doar se rezervă pe card și se încasează numai dacă medicul aprobă planul, în cel mult ${SLA_HOURS} de ore. Următoarele plăți vin la începutul fiecărei perioade și primești un e-mail cu 3 zile înainte.`,
    },
    {
      question: "Ce se întâmplă dacă medicul nu îmi prescrie?",
      answer:
        "Nu plătești nimic: rezervarea de pe card se anulează integral. Afli în cont motivul și unde să mergi pentru un consult în persoană.",
    },
    {
      question: "Cine este medicul meu?",
      answer:
        "Un medic Telegen cu drept de liberă practică în România și cu specialitatea potrivită afecțiunii tale. Când îți preia evaluarea, îi vezi în cont numele, specialitatea și codul de parafă.",
    },
    {
      question: "Cât durează?",
      answer: `Evaluarea durează câteva minute. Medicul decide în cel mult ${SLA_HOURS} de ore; dacă are o întrebare, termenul se reia după ce îi răspunzi. Când coletul pleacă, primești în cont codul de urmărire (AWB).`,
    },
    {
      question: "Cum se face livrarea?",
      answer:
        "Gratuit, prin curier, de la o farmacie parteneră, după aprobarea medicului. Coletul este discret: pe ambalaj nu apar afecțiunea sau tratamentul.",
    },
    {
      question: "Pot anula?",
      answer:
        "Da. Pui planul pe pauză sau îl anulezi oricând din cont, înainte de următoarea plată, fără să dai explicații. Mesajele cu medicul rămân gratuite.",
    },
  ];
}
