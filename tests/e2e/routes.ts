export const routes = [
  "/",
  "/afectiuni",
  "/afectiuni/caderea-parului",
  "/ghiduri",
  "/ghiduri/semnele-alopeciei-androgenetice",
  "/ghiduri/cauzele-caderii-parului",
  "/ghiduri/caderea-parului-intrebari-frecvente",
  "/tratamente",
  "/tratamente/minoxidil",
  "/tratamente/finasterida",
  "/cum-functioneaza",
  "/standarde-clinice",
  "/echipa-medicala",
  "/echipa-medicala/medic-dermatolog-coordonator",
  "/evaluare",
  "/termeni-si-conditii",
  "/politica-de-confidentialitate",
  "/politica-cookie",
];

export const slug = (r: string) => (r === "/" ? "home" : r.slice(1).replace(/\//g, "__"));
