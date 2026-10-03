// Curated FR/AR content of the national campaign for access to
// administrative justice (DRI — Taktouk / CinémaTdour), published to the
// "Accès aux droits" section by publish-dri-content.ts.
//
// Sources (C:\Users\…\Desktop\DRI): announcement posters (official dates),
// "Personnes touchées par région" and "Planning par date" (docx), the
// citizen guide PDF (May 2025, pp. 13-17 and 43-45 for the addresses) and
// the campaign photos/videos. Media are referenced by the ids written in
// _web/manifest.json by prepare_dri_media.py.

export type StageKey =
  | "mahdia"
  | "ettadhamen"
  | "nefta"
  | "zaghouan"
  | "djerba"
  | "mareth"
  | "kef"
  | "beja";

export interface Stage {
  key: StageKey;
  /** Exact `governorates.name` in the DB (the map matches on it). */
  governorate: string;
  title: string;
  titleAr: string;
  /** Titles this event had before, so reruns PATCH instead of duplicating. */
  legacyTitles: string[];
  start: string; // YYYY-MM-DD, from the announcement poster
  end: string;
  peopleImpacted: number; // "Personnes touchées par région" (June 2026)
  latitude: number;
  longitude: number;
  description: string;
  descriptionAr: string;
}

const CAMPAIGN_FR = "la Campagne nationale pour l'accès à la justice administrative";

export const STAGES: Stage[] = [
  {
    key: "mahdia",
    governorate: "Mahdia",
    title: "Taktouk à Mahdia et Chebba",
    titleAr: "طقطوق في المهدية والشابة",
    legacyTitles: ["Taktouk à Mahdia"],
    start: "2025-08-18",
    end: "2025-08-28",
    peopleImpacted: 11185,
    latitude: 35.50270424,
    longitude: 11.04544777,
    description:
      `Du 18 au 28 août 2025, la caravane CinémaTdour de ${CAMPAIGN_FR} s'est installée à Mahdia et à Chebba avec Taktouk : projections de films et de spots de sensibilisation, médiateurs allant à la rencontre des habitants pour distribuer le Guide du citoyen, débats et consultations avec des experts. 11 185 personnes touchées.`,
    descriptionAr:
      "من 18 إلى 28 أوت 2025، حطّت قافلة « سينما تدور » التابعة للحملة الوطنية للنفاذ إلى القضاء الإداري رحالها في المهدية والشابة مع طقطوق : عروض أفلام وومضات تحسيسية، ووسطاء يلتقون بالمتساكنين ويوزّعون دليل المواطن، ونقاشات واستشارات مع خبراء. تمّ الوصول إلى 11185 شخصا.",
  },
  {
    key: "ettadhamen",
    governorate: "Ariana",
    title: "Taktouk à Cité Ettadhamen",
    titleAr: "طقطوق في حي التضامن",
    legacyTitles: ["Taktouk Cité Tadhamon"],
    start: "2025-08-31",
    end: "2025-09-04",
    peopleImpacted: 7933,
    latitude: 36.84136528,
    longitude: 10.09828069,
    description:
      "Du 31 août au 4 septembre 2025, Taktouk et la caravane CinémaTdour étaient à Cité Ettadhamen (Grand Tunis) : projections en plein air et spots de sensibilisation, distribution du Guide du citoyen par les médiateurs, débats et consultations avec des experts, et soirée de performances artistiques. 7 933 personnes touchées.",
    descriptionAr:
      "من 31 أوت إلى 4 سبتمبر 2025، كان طقطوق وقافلة « سينما تدور » في حي التضامن (تونس الكبرى) : عروض في الهواء الطلق وومضات تحسيسية، وتوزيع دليل المواطن من قبل الوسطاء، ونقاشات واستشارات مع خبراء، وسهرة عروض فنية. تمّ الوصول إلى 7933 شخصا.",
  },
  {
    key: "nefta",
    governorate: "Tozeur",
    title: "Taktouk à Nefta",
    titleAr: "طقطوق في نفطة",
    legacyTitles: ["Taktouk à Nefta (Tozeur)"],
    start: "2025-10-17",
    end: "2025-10-26",
    peopleImpacted: 11843,
    latitude: 33.88047813,
    longitude: 7.88307821,
    description:
      "Du 17 au 26 octobre 2025, la campagne s'est arrêtée à Nefta (gouvernorat de Tozeur) : les médiateurs de Taktouk sont allés à la rencontre des habitants dans la médina, les commerces et les lieux de travail pour distribuer le Guide du citoyen, avec des consultations gratuites et des projections dans la salle CinémaTdour. 11 843 personnes touchées.",
    descriptionAr:
      "من 17 إلى 26 أكتوبر 2025، توقّفت الحملة في نفطة (ولاية توزر) : التقى وسطاء طقطوق بالمتساكنين في المدينة العتيقة وفي المحلات وأماكن العمل لتوزيع دليل المواطن، مع استشارات مجانية وعروض في قاعة « سينما تدور ». تمّ الوصول إلى 11843 شخصا.",
  },
  {
    key: "zaghouan",
    governorate: "Zaghouan",
    title: "Taktouk à Zaghouan",
    titleAr: "طقطوق في زغوان",
    legacyTitles: [],
    start: "2025-10-28",
    end: "2025-11-08",
    peopleImpacted: 12675,
    latitude: 36.4095652,
    longitude: 10.14226003,
    description:
      "Du 28 octobre au 8 novembre 2025, le camion-cinéma CinémaTdour et Taktouk ont sillonné Zaghouan : projections et spots de sensibilisation, distribution du Guide du citoyen dans la rue et sur les sites de la ville, et consultations avec des experts. 12 675 personnes touchées.",
    descriptionAr:
      "من 28 أكتوبر إلى 8 نوفمبر 2025، جابت شاحنة « سينما تدور » وطقطوق مدينة زغوان : عروض وومضات تحسيسية، وتوزيع دليل المواطن في الشارع وفي مواقع المدينة، واستشارات مع خبراء. تمّ الوصول إلى 12675 شخصا.",
  },
  {
    key: "djerba",
    governorate: "Médenine",
    title: "Taktouk à Djerba",
    titleAr: "طقطوق في جربة",
    legacyTitles: [],
    start: "2026-01-17",
    end: "2026-01-25",
    peopleImpacted: 22609,
    latitude: 33.8754,
    longitude: 10.8575,
    description:
      "Du 17 au 25 janvier 2026, Taktouk a fait étape à Djerba (gouvernorat de Médenine), après une formation des bénévoles de la campagne : projections dans la salle CinémaTdour, distribution du Guide du citoyen dans les souks et les quartiers, consultations juridiques gratuites et rencontres-débats. 22 609 personnes touchées, le plus fort chiffre de la tournée.",
    descriptionAr:
      "من 17 إلى 25 جانفي 2026، حطّ طقطوق رحاله في جربة (ولاية مدنين) بعد تكوين متطوّعي الحملة : عروض في قاعة « سينما تدور »، وتوزيع دليل المواطن في الأسواق والأحياء، واستشارات قانونية مجانية ولقاءات حوارية. تمّ الوصول إلى 22609 شخصا، وهو أعلى رقم في الجولة.",
  },
  {
    key: "mareth",
    governorate: "Gabès",
    title: "Taktouk à Mareth (Gabès)",
    titleAr: "طقطوق في مارث (قابس)",
    legacyTitles: [],
    start: "2026-04-01",
    end: "2026-04-12",
    peopleImpacted: 17071,
    latitude: 33.6247,
    longitude: 10.2967,
    description:
      "Du 1er au 12 avril 2026, la caravane CinémaTdour s'est installée à Mareth, dans le gouvernorat de Gabès : projections pour petits et grands, animation musicale, distribution du Guide du citoyen et rencontres avec les habitants. 17 071 personnes touchées.",
    descriptionAr:
      "من 1 إلى 12 أفريل 2026، حطّت قافلة « سينما تدور » رحالها في مارث بولاية قابس : عروض للصغار والكبار، وتنشيط موسيقي، وتوزيع دليل المواطن ولقاءات مع المتساكنين. تمّ الوصول إلى 17071 شخصا.",
  },
  {
    key: "kef",
    governorate: "Le Kef",
    title: "Taktouk au Kef",
    titleAr: "طقطوق في الكاف",
    legacyTitles: [],
    start: "2026-05-02",
    end: "2026-05-15",
    peopleImpacted: 11563,
    latitude: 36.1742,
    longitude: 8.7049,
    description:
      "Du 2 au 15 mai 2026, Taktouk et l'équipe de la campagne étaient au Kef : le camion-cinéma CinémaTdour a accueilli des projections pour tous les âges, pendant que les médiateurs distribuaient le Guide du citoyen au marché, dans les rues et jusqu'aux automobilistes. 11 563 personnes touchées.",
    descriptionAr:
      "من 2 إلى 15 ماي 2026، كان طقطوق وفريق الحملة في الكاف : احتضنت شاحنة « سينما تدور » عروضا لكلّ الأعمار، فيما وزّع الوسطاء دليل المواطن في السوق والأنهج وحتى على أصحاب السيارات. تمّ الوصول إلى 11563 شخصا.",
  },
  {
    key: "beja",
    governorate: "Béja",
    title: "Taktouk à Béja",
    titleAr: "طقطوق في باجة",
    legacyTitles: [],
    start: "2026-05-15",
    end: "2026-05-25",
    peopleImpacted: 12485,
    latitude: 36.7256,
    longitude: 9.1817,
    description:
      "Du 15 au 25 mai 2026, dernière étape de la tournée à Béja : projections dans la salle CinémaTdour pour les enfants et les familles, distribution du Guide du citoyen dans les cafés, les commerces et la rue, et échanges avec les habitants sur leurs droits face à l'administration. 12 485 personnes touchées.",
    descriptionAr:
      "من 15 إلى 25 ماي 2026، آخر محطة في الجولة بباجة : عروض في قاعة « سينما تدور » للأطفال والعائلات، وتوزيع دليل المواطن في المقاهي والمحلات والشارع، وحوار مع المتساكنين حول حقوقهم إزاء الإدارة. تمّ الوصول إلى 12485 شخصا.",
  },
];

export const TOTAL_PEOPLE = STAGES.reduce((sum, s) => sum + s.peopleImpacted, 0);

/** "2025-08-18" → "18/08/2025" */
export const frDate = (iso: string) => iso.split("-").reverse().join("/");

// ── Photo albums ──────────────────────────────────────────────────────────

export interface Album {
  /** Album key used by the manifest (`photo:<key>:…`). */
  key: string;
  stage: StageKey;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  location: string;
  locationAr: string;
  category: "Campagnes" | "Formations";
  /** Displayed as-is: "18/08/2025 – 28/08/2025". */
  date: string;
  /** Photo file stem (manifest id suffix) used as the cover. */
  cover: string;
  featured: boolean;
}

const period = (key: StageKey) => {
  const s = STAGES.find((x) => x.key === key)!;
  return `${frDate(s.start)} – ${frDate(s.end)}`;
};

// Display order (the public page lists the most recently created first,
// so the publisher creates these in reverse).
export const ALBUMS: Album[] = [
  {
    key: "beja",
    stage: "beja",
    title: "Taktouk à Béja",
    titleAr: "طقطوق في باجة",
    description:
      "Projections dans la salle CinémaTdour et distribution du Guide du citoyen dans les rues, les cafés et les commerces de Béja.",
    descriptionAr: "عروض في قاعة « سينما تدور » وتوزيع دليل المواطن في أنهج باجة ومقاهيها ومحلاتها.",
    location: "Béja",
    locationAr: "باجة",
    category: "Campagnes",
    date: period("beja"),
    cover: "dscf7785",
    featured: false,
  },
  {
    key: "kef",
    stage: "kef",
    title: "Taktouk au Kef",
    titleAr: "طقطوق في الكاف",
    description:
      "Le camion-cinéma CinémaTdour, l'équipe de Taktouk et la distribution du Guide du citoyen au marché et dans les rues du Kef.",
    descriptionAr: "شاحنة « سينما تدور » وفريق طقطوق وتوزيع دليل المواطن في سوق الكاف وأنهجها.",
    location: "Le Kef",
    locationAr: "الكاف",
    category: "Campagnes",
    date: period("kef"),
    cover: "dscf5693",
    featured: false,
  },
  {
    key: "mareth",
    stage: "mareth",
    title: "Taktouk à Mareth",
    titleAr: "طقطوق في مارث",
    description: "Projections, animation musicale et rencontres avec les habitants de Mareth.",
    descriptionAr: "عروض وتنشيط موسيقي ولقاءات مع متساكني مارث.",
    location: "Mareth, Gabès",
    locationAr: "مارث، قابس",
    category: "Campagnes",
    date: period("mareth"),
    cover: "img-3899",
    featured: false,
  },
  {
    key: "djerba",
    stage: "djerba",
    title: "Taktouk à Djerba",
    titleAr: "طقطوق في جربة",
    description:
      "Distribution du Guide du citoyen dans les souks et les quartiers, projections et consultations juridiques gratuites à Djerba.",
    descriptionAr: "توزيع دليل المواطن في أسواق جربة وأحيائها، وعروض واستشارات قانونية مجانية.",
    location: "Djerba, Médenine",
    locationAr: "جربة، مدنين",
    category: "Campagnes",
    date: period("djerba"),
    cover: "dscf4293",
    featured: true,
  },
  {
    key: "djerba-formation",
    stage: "djerba",
    title: "Djerba : formation des bénévoles",
    titleAr: "جربة : تكوين المتطوّعين",
    description: "Formation des bénévoles de la campagne avant l'étape de Djerba.",
    descriptionAr: "تكوين متطوّعي الحملة قبل محطة جربة.",
    location: "Djerba, Médenine",
    locationAr: "جربة، مدنين",
    category: "Formations",
    date: "14/01/2026 – 16/01/2026",
    cover: "dscf6642",
    featured: false,
  },
  {
    key: "zaghouan",
    stage: "zaghouan",
    title: "Taktouk à Zaghouan",
    titleAr: "طقطوق في زغوان",
    description:
      "Le camion-cinéma CinémaTdour, les consultations et la distribution du Guide du citoyen à Zaghouan.",
    descriptionAr: "شاحنة « سينما تدور » والاستشارات وتوزيع دليل المواطن في زغوان.",
    location: "Zaghouan",
    locationAr: "زغوان",
    category: "Campagnes",
    date: period("zaghouan"),
    cover: "img-1815",
    featured: false,
  },
  {
    key: "nefta",
    stage: "nefta",
    title: "Taktouk à Nefta",
    titleAr: "طقطوق في نفطة",
    description:
      "Les médiateurs de Taktouk dans la médina, les commerces et les lieux de travail de Nefta, les consultations et la projection.",
    descriptionAr: "وسطاء طقطوق في المدينة العتيقة بنفطة وفي محلاتها وأماكن العمل، مع الاستشارات والعروض.",
    location: "Nefta, Tozeur",
    locationAr: "نفطة، توزر",
    category: "Campagnes",
    date: period("nefta"),
    cover: "img-0915",
    featured: false,
  },
  {
    key: "ettadhamen",
    stage: "ettadhamen",
    title: "Taktouk à Cité Ettadhamen",
    titleAr: "طقطوق في حي التضامن",
    description:
      "Projections en plein air, médiateurs et distribution du Guide du citoyen, débats et consultations avec des experts, performances artistiques.",
    descriptionAr: "عروض في الهواء الطلق، ووسطاء وتوزيع دليل المواطن، ونقاشات واستشارات مع خبراء، وعروض فنية.",
    location: "Cité Ettadhamen, Ariana",
    locationAr: "حي التضامن، أريانة",
    category: "Campagnes",
    date: period("ettadhamen"),
    cover: "img-3307",
    featured: true,
  },
  {
    key: "chebba",
    stage: "mahdia",
    title: "Taktouk à Chebba",
    titleAr: "طقطوق في الشابة",
    description:
      "Médiateurs et distribution du Guide du citoyen sur la plage et en ville, débats et consultations avec des experts à Chebba.",
    descriptionAr: "وسطاء وتوزيع دليل المواطن على الشاطئ وفي المدينة، ونقاشات واستشارات مع خبراء في الشابة.",
    location: "Chebba, Mahdia",
    locationAr: "الشابة، المهدية",
    category: "Campagnes",
    date: period("mahdia"),
    cover: "img-1852",
    featured: false,
  },
  {
    key: "mahdia",
    stage: "mahdia",
    title: "Taktouk à Mahdia",
    titleAr: "طقطوق في المهدية",
    description: "Projections nocturnes CinémaTdour et distribution du Guide du citoyen par les médiateurs à Mahdia.",
    descriptionAr: "عروض ليلية لـ« سينما تدور » وتوزيع دليل المواطن من قبل الوسطاء في المهدية.",
    location: "Mahdia",
    locationAr: "المهدية",
    category: "Campagnes",
    date: period("mahdia"),
    cover: "img-2606-3",
    featured: false,
  },
];

// ── News (section acces_droits) ──────────────────────────────────────────

export interface NewsItem {
  stage: StageKey | null; // null = campaign summary
  title: string;
  titleAr: string;
  excerpt: string;
  excerptAr: string;
  content: string; // HTML paragraphs
  contentAr: string;
  category: "Campagne terrain" | "Bilan de campagne";
  tags: string[];
  tagsAr: string[];
  publishedAt: string;
  featured: boolean;
  /** Image: the stage poster, or a photo `album/stem` for the summary. */
  imagePhoto?: { album: string; stem: string };
}

const p = (...paragraphs: string[]) => paragraphs.map((x) => `<p>${x}</p>`).join("\n");
const fmtFr = (n: number) => n.toLocaleString("fr-FR").replace(/\u202f/g, " ");

const STAGE_NEWS_FR: Record<StageKey, { lead: string; regionTag: string; regionTagAr: string }> = {
  mahdia: { lead: "Première étape de la tournée", regionTag: "Mahdia", regionTagAr: "المهدية" },
  ettadhamen: { lead: "Deuxième étape de la tournée", regionTag: "Cité Ettadhamen", regionTagAr: "حي التضامن" },
  nefta: { lead: "Troisième étape de la tournée", regionTag: "Nefta", regionTagAr: "نفطة" },
  zaghouan: { lead: "Quatrième étape de la tournée", regionTag: "Zaghouan", regionTagAr: "زغوان" },
  djerba: { lead: "Cinquième étape de la tournée", regionTag: "Djerba", regionTagAr: "جربة" },
  mareth: { lead: "Sixième étape de la tournée", regionTag: "Mareth", regionTagAr: "مارث" },
  kef: { lead: "Septième étape de la tournée", regionTag: "Le Kef", regionTagAr: "الكاف" },
  beja: { lead: "Huitième et dernière étape de la tournée", regionTag: "Béja", regionTagAr: "باجة" },
};

const STAGE_NEWS_AR: Record<StageKey, string> = {
  mahdia: "المحطة الأولى من الجولة",
  ettadhamen: "المحطة الثانية من الجولة",
  nefta: "المحطة الثالثة من الجولة",
  zaghouan: "المحطة الرابعة من الجولة",
  djerba: "المحطة الخامسة من الجولة",
  mareth: "المحطة السادسة من الجولة",
  kef: "المحطة السابعة من الجولة",
  beja: "المحطة الثامنة والأخيرة من الجولة",
};

const ABOUT_FR =
  "Portée par DRI (Democracy Reporting International), la Campagne nationale pour l'accès à la justice administrative fait connaître aux citoyens leurs recours face à l'administration : contester une décision, demander réparation, respecter les délais, obtenir l'aide judiciaire. Le Guide du citoyen est disponible dans la rubrique Publications ; les photos de chaque étape sont dans les Albums photos et sur la Carte interactive.";
const ABOUT_AR =
  "تهدف الحملة الوطنية للنفاذ إلى القضاء الإداري، التي تقودها منظمة Democracy Reporting International (DRI)، إلى تعريف المواطنين بسبل الطعن إزاء الإدارة : الطعن في قرار، وطلب التعويض، واحترام الآجال، والحصول على الإعانة القضائية. دليل المواطن متوفّر في ركن المنشورات، وصور كلّ محطة في ألبومات الصور وعلى الخريطة التفاعلية.";

export const NEWS: NewsItem[] = [
  ...STAGES.map((s): NewsItem => {
    const meta = STAGE_NEWS_FR[s.key];
    return {
      stage: s.key,
      title: `${s.title} : ${fmtFr(s.peopleImpacted)} personnes touchées`,
      titleAr: `${s.titleAr} : الوصول إلى ${s.peopleImpacted} شخصا`,
      excerpt: `${meta.lead} de la caravane CinémaTdour, du ${frDate(s.start)} au ${frDate(s.end)} : projections, distribution du Guide du citoyen et consultations avec des experts.`,
      excerptAr: `${STAGE_NEWS_AR[s.key]} لقافلة « سينما تدور »، من ${frDate(s.start)} إلى ${frDate(s.end)} : عروض وتوزيع دليل المواطن واستشارات مع خبراء.`,
      content: p(`${meta.lead}. ${s.description}`, ABOUT_FR),
      contentAr: p(`${STAGE_NEWS_AR[s.key]}. ${s.descriptionAr}`, ABOUT_AR),
      category: "Campagne terrain",
      tags: ["Taktouk", "CinémaTdour", meta.regionTag],
      tagsAr: ["طقطوق", "سينما تدور", meta.regionTagAr],
      publishedAt: s.end,
      featured: false,
    };
  }),
  {
    stage: null,
    title: `Bilan de la campagne Taktouk : 8 étapes, ${fmtFr(TOTAL_PEOPLE)} personnes touchées`,
    titleAr: `حصيلة حملة طقطوق : 8 محطات والوصول إلى ${TOTAL_PEOPLE} شخصا`,
    excerpt:
      "D'août 2025 à mai 2026, la caravane CinémaTdour a sillonné la Tunisie, de Mahdia à Béja, pour rapprocher les citoyens de la justice administrative.",
    excerptAr:
      "من أوت 2025 إلى ماي 2026، جابت قافلة « سينما تدور » تونس من المهدية إلى باجة لتقريب القضاء الإداري من المواطنين.",
    content: [
      p(
        `D'août 2025 à mai 2026, la caravane CinémaTdour et Taktouk, la mascotte de la campagne, ont fait étape dans huit régions et touché ${fmtFr(TOTAL_PEOPLE)} personnes. À chaque étape : projections de films et de spots, distribution du Guide du citoyen par des médiateurs, débats et consultations gratuites avec des experts.`,
      ),
      `<ul>\n${STAGES.map(
        (s) => `<li>${s.title} — du ${frDate(s.start)} au ${frDate(s.end)} : ${fmtFr(s.peopleImpacted)} personnes</li>`,
      ).join("\n")}\n</ul>`,
      p(
        "La campagne a aussi produit une série de fiction en quatre épisodes et des capsules vidéo avec Taktouk.",
        ABOUT_FR,
      ),
    ].join("\n"),
    contentAr: [
      p(
        `من أوت 2025 إلى ماي 2026، توقّفت قافلة « سينما تدور » وطقطوق، تميمة الحملة، في ثماني جهات وتمّ الوصول إلى ${TOTAL_PEOPLE} شخصا. في كلّ محطة : عروض أفلام وومضات، وتوزيع دليل المواطن من قبل الوسطاء، ونقاشات واستشارات مجانية مع خبراء.`,
      ),
      `<ul>\n${STAGES.map(
        (s) => `<li>${s.titleAr} — من ${frDate(s.start)} إلى ${frDate(s.end)} : ${s.peopleImpacted} شخصا</li>`,
      ).join("\n")}\n</ul>`,
      p(
        "كما أنتجت الحملة سلسلة درامية من أربع حلقات وكبسولات فيديو مع طقطوق.",
        ABOUT_AR,
      ),
    ].join("\n"),
    category: "Bilan de campagne",
    tags: ["Taktouk", "CinémaTdour", "Bilan"],
    tagsAr: ["طقطوق", "سينما تدور", "حصيلة"],
    publishedAt: "2026-06-23",
    featured: true,
    imagePhoto: { album: "kef", stem: "dscf5693" },
  },
];

// ── Practical resources (downloadable files) ─────────────────────────────

export interface Resource {
  /** Manifest id of the file. */
  doc: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  category: string;
  categoryAr: string;
  displayOrder: number;
}

export const RESOURCES: Resource[] = [
  {
    doc: "doc:guide-pdf",
    title: "Guide du citoyen pour l'accès à la justice administrative",
    titleAr: "دليل المواطن للنفاذ إلى القضاء الإداري",
    description:
      "Le guide complet de la campagne (48 pages, arabe tunisien) : organisation judiciaire, Tribunal administratif et chambres régionales, recours, délais, avocat, aide judiciaire et Médiateur administratif.",
    descriptionAr:
      "الدليل الكامل للحملة (48 صفحة بالدارجة التونسية) : التنظيم القضائي، المحكمة الإدارية ودوائرها الجهوية، الطعون، الآجال، المحامي، الإعانة القضائية والموفّق الإداري.",
    category: "Guides",
    categoryAr: "أدلة",
    displayOrder: 1,
  },
  {
    doc: "doc:planche-pdf",
    title: "BD Taktouk : suspendre un arrêté de démolition",
    titleAr: "قصة مصوّرة مع طقطوق : دعوى في إيقاف تنفيذ قرار هدم",
    description:
      "Un recours en annulation ne suspend pas l'arrêté de démolition : Taktouk explique comment demander au Tribunal administratif le sursis à exécution, avant, avec ou après le recours.",
    descriptionAr:
      "قضية الإلغاء لا توقف تنفيذ قرار الهدم : طقطوق يشرح كيف نطلب من المحكمة الإدارية إيقاف التنفيذ، قبل دعوى الإلغاء أو معها أو بعدها.",
    category: "Bandes dessinées",
    categoryAr: "قصص مصوّرة",
    displayOrder: 2,
  },
];

// ── Useful addresses: Tribunal administratif + Médiateur ─────────────────

export interface Address {
  /** Phone as displayed; also the natural key (digits only). */
  phone: string;
  name: string;
  nameAr: string;
  address: string;
  addressAr: string;
  category: string;
  categoryAr: string;
  governorate: string;
  email: string | null;
}

const TA_CATEGORY = "Tribunal administratif";
const TA_CATEGORY_AR = "المحكمة الإدارية";

interface Chamber {
  city: string;
  cityAr: string; // with the Arabic preposition, e.g. "بنابل"
  governorate: string;
  phone: string;
  address: string;
  addressAr: string;
  covers: string[];
  coversAr: string[];
}

// Pages 14-15 of the citizen guide.
const CHAMBERS: Chamber[] = [
  {
    city: "Nabeul", cityAr: "بنابل", governorate: "Nabeul", phone: "70 028 713",
    address: "Avenue Habib Bourguiba, siège du gouvernorat de Nabeul",
    addressAr: "شارع الحبيب بورقيبة، مقر ولاية نابل",
    covers: ["Nabeul", "Zaghouan"], coversAr: ["نابل", "زغوان"],
  },
  {
    city: "Bizerte", cityAr: "ببنزرت", governorate: "Bizerte", phone: "70 028 714",
    address: "Rue Ennadhour, Borj Ghmaz, résidence Ben Ammar, Bizerte-Nord",
    addressAr: "نهج الناظور، برج غماز، إقامة بن عمار، بنزرت الشمالية",
    covers: ["Bizerte", "Béja"], coversAr: ["بنزرت", "باجة"],
  },
  {
    city: "Le Kef", cityAr: "بالكاف", governorate: "Le Kef", phone: "70 028 721",
    address: "5, rue Hédi Chaker, cité Ed-Dir, Le Kef",
    addressAr: "نهج الهادي شاكر عدد 5، حي الدير، الكاف",
    covers: ["Le Kef", "Jendouba", "Siliana"], coversAr: ["الكاف", "جندوبة", "سليانة"],
  },
  {
    city: "Sousse", cityAr: "بسوسة", governorate: "Sousse", phone: "70 028 753",
    address: "Angle rue Mohamed Jerbi et rue 3 Bachir Salem, El Khairia, Sahloul 1, Sousse",
    addressAr: "زاوية نهج محمد الجربي ونهج 3 البشير سالم بالخيرية، سهلول 1، سوسة",
    covers: ["Sousse"], coversAr: ["سوسة"],
  },
  {
    city: "Monastir", cityAr: "بالمنستير", governorate: "Monastir", phone: "70 028 723",
    address:
      "Avenue Habib Bourguiba, route de Jemmal, carrefour El Fouz (à côté de la direction régionale des Domaines de l'État)",
    addressAr:
      "شارع الحبيب بورقيبة، طريق جمال، مفترق الفوز (ملاصق لمقر الإدارة الجهوية لأملاك الدولة والشؤون العقارية)",
    covers: ["Monastir", "Mahdia"], coversAr: ["المنستير", "المهدية"],
  },
  {
    city: "Sfax", cityAr: "بصفاقس", governorate: "Sfax", phone: "70 028 724",
    address: "Rue Raed Bejaoui (près de la station de louages, dans le siège de la SNIT Sud), centre-ville de Sfax",
    addressAr: "نهج الرائد البجاوي (بجانب محطة اللواج، جزء من مقر SNIT الجنوب)، وسط مدينة صفاقس",
    covers: ["Sfax"], coversAr: ["صفاقس"],
  },
  {
    city: "Gafsa", cityAr: "بقفصة", governorate: "Gafsa", phone: "70 028 727",
    address: "Centre-ville de Gafsa (à côté du siège de la Compagnie des phosphates de Gafsa)",
    addressAr: "وسط مدينة قفصة (ملاصق لمقر شركة فسفاط قفصة)",
    covers: ["Gafsa", "Tozeur"], coversAr: ["قفصة", "توزر"],
  },
  {
    city: "Gabès", cityAr: "بقابس", governorate: "Gabès", phone: "70 028 736",
    address: "360, avenue Habib Bourguiba, Gabès (à côté de la mosquée « Jara »)",
    addressAr: "شارع الحبيب بورقيبة عدد 360، قابس (بجانب جامع « جارة »)",
    covers: ["Gabès", "Kébili"], coversAr: ["قابس", "قبلي"],
  },
  {
    city: "Médenine", cityAr: "بمدنين", governorate: "Médenine", phone: "70 028 754",
    address: "Rue du Japon, à côté de la direction régionale de la Justice, Médenine (ou rue Salim, cité El Istiklal)",
    addressAr: "نهج اليابان، ملاصق للإدارة الجهوية للعدل، مدنين (أو نهج سليم، حي الاستقلال)",
    covers: ["Médenine", "Tataouine"], coversAr: ["مدنين", "تطاوين"],
  },
  {
    city: "Kasserine", cityAr: "بالقصرين", governorate: "Kasserine", phone: "70 028 750",
    address: "Avenue Habib Bourguiba, cité Olympique, Kasserine",
    addressAr: "شارع الحبيب بورقيبة، الحي الأولمبي، القصرين",
    covers: ["Kasserine"], coversAr: ["القصرين"],
  },
  {
    city: "Sidi Bouzid", cityAr: "بسيدي بوزيد", governorate: "Sidi Bouzid", phone: "70 028 751",
    address:
      "Avenue de la République, Sidi Bouzid (ancien siège de la direction régionale de la formation professionnelle et de l'emploi, à côté du siège du gouvernorat)",
    addressAr:
      "شارع الجمهورية، سيدي بوزيد (المقر السابق للإدارة الجهوية للتكوين المهني والتشغيل، بجانب مقر الولاية)",
    covers: ["Sidi Bouzid"], coversAr: ["سيدي بوزيد"],
  },
  {
    city: "Kairouan", cityAr: "بالقيروان", governorate: "Kairouan", phone: "70 028 752",
    address: "Rue Docteur Hamda Laouani, cité commerciale, Kairouan",
    addressAr: "نهج الدكتور حمدة العواني، الحي التجاري، القيروان",
    covers: ["Kairouan"], coversAr: ["القيروان"],
  },
];

const GRAND_TUNIS = ["Tunis", "Ariana", "Ben Arous", "Manouba"];
const GRAND_TUNIS_AR = ["تونس", "أريانة", "بن عروس", "منوبة"];

// Every governorate with the chamber that covers it (null = the seat in Tunis).
const GOVERNORATE_TO_CHAMBER: Array<[string, Chamber | null]> = [
  ...GRAND_TUNIS.map((g): [string, null] => [g, null]),
  ...CHAMBERS.flatMap((c) => c.covers.map((g): [string, Chamber] => [g, c])),
].sort(([a], [b]) => a.localeCompare(b, "fr"));

const GOVERNORATE_TO_CHAMBER_AR: Array<[string, string]> = [
  ...GRAND_TUNIS_AR.map((g): [string, string] => [g, "مقرّ المحكمة الإدارية بتونس"]),
  ...CHAMBERS.flatMap((c) => c.coversAr.map((g): [string, string] => [g, `الدائرة الابتدائية ${c.cityAr}`])),
];

export const ADDRESSES: Address[] = [
  {
    phone: "70 028 700",
    name: "Tribunal administratif – siège central (Tunis)",
    nameAr: "المحكمة الإدارية – المقرّ المركزي بتونس",
    address:
      "Rue Eddabbaghine, Tunis (bureau d'ordre : dépôt des requêtes) ; autres locaux rue de Rome et à Montplaisir, près du ministère du Transport — Compétent pour : Tunis, Ariana, Ben Arous, Manouba et les recours contre les autorités centrales — www.jat.tn",
    addressAr:
      "نهج الدبّاغين، تونس (مكتب الضبط : إيداع العرائض)، ومقرات أخرى بنهج روما وبمونبليزير بجانب وزارة النقل — الولايات التابعة : تونس، أريانة، بن عروس، منوبة والطعون ضدّ السلط المركزية — www.jat.tn",
    category: TA_CATEGORY,
    categoryAr: TA_CATEGORY_AR,
    governorate: "Tunis",
    email: null,
  },
  ...CHAMBERS.map(
    (c): Address => ({
      phone: c.phone,
      name: `Chambre régionale du Tribunal administratif – ${c.city}`,
      nameAr: `الدائرة الابتدائية للمحكمة الإدارية ${c.cityAr}`,
      address: `${c.address} — Compétente pour : ${c.covers.join(", ")}`,
      addressAr: `${c.addressAr} — الولايات التابعة : ${c.coversAr.join("، ")}`,
      category: TA_CATEGORY,
      categoryAr: TA_CATEGORY_AR,
      governorate: c.governorate,
      email: null,
    }),
  ),
  {
    phone: "71 792 655",
    name: "Médiateur administratif – siège (Tunis)",
    nameAr: "الموفّق الإداري – المقرّ بتونس",
    address:
      "85, avenue de la Liberté, 1002 Tunis — Reçoit les plaintes des gouvernorats de Tunis, Ariana, Ben Arous, Manouba, Bizerte, Zaghouan, Béja et Nabeul ; représentants régionaux à Sousse, Sfax, Le Kef et Gafsa",
    addressAr:
      "85 شارع الحرية، 1002 تونس — يقبل شكايات ولايات تونس وأريانة وبن عروس ومنوبة وبنزرت وزغوان وباجة ونابل، مع ممثّلين جهويين بسوسة وصفاقس والكاف وقفصة",
    category: "Médiateur administratif",
    categoryAr: "الموفّق الإداري",
    governorate: "Tunis",
    email: "mediateur.administratif@email.ati.tn",
  },
];

// ── Assistant knowledge (chatbot training documents) ─────────────────────

export interface TrainingDoc {
  title: string;
  titleAr: string;
  category: string;
  content: string;
}

export const TRAINING_DOCS: TrainingDoc[] = [
  {
    title: "Campagne Taktouk – accès à la justice administrative (DRI)",
    titleAr: "حملة طقطوق للنفاذ إلى القضاء الإداري",
    category: "Campagne de sensibilisation",
    content: [
      "CAMPAGNE NATIONALE POUR L'ACCÈS À LA JUSTICE ADMINISTRATIVE (Taktouk / CinémaTdour)",
      "La campagne, menée par DRI (Democracy Reporting International), explique aux citoyens comment faire valoir leurs droits face à l'administration devant le Tribunal administratif. Sa mascotte est Taktouk (طقطوق), un marteau de juge. La caravane « CinémaTdour » (سينما تدور), un cinéma itinérant, a parcouru huit régions : projections de films et de spots, distribution du Guide du citoyen par des médiateurs, débats et consultations gratuites avec des experts, performances artistiques.",
      "Étapes, dates et personnes touchées :",
      ...STAGES.map(
        (s) =>
          `- ${s.title} (gouvernorat : ${s.governorate}) : du ${frDate(s.start)} au ${frDate(s.end)} — ${s.peopleImpacted} personnes touchées.`,
      ),
      `Total : ${TOTAL_PEOPLE} personnes touchées en 8 étapes, d'août 2025 à mai 2026. L'étape de Djerba a été précédée d'une formation des bénévoles (14-16 janvier 2026).`,
      "Supports produits : le Guide du citoyen pour l'accès à la justice administrative (48 pages, en arabe tunisien, rubrique Publications), une planche de bande dessinée sur le sursis à exécution d'un arrêté de démolition, une série de fiction en 4 épisodes (Amal, Jbal Aali, B3, SONEDE) et des capsules vidéo Taktouk (animations 2D : café, salle des fêtes, accident, faculté, STEG ; capsules sur la responsabilité médicale, la mesure S17 et le site du Tribunal administratif). Les photos de chaque étape sont dans les Albums photos et sur la Carte interactive.",
      "",
      "الحملة الوطنية للنفاذ إلى القضاء الإداري (طقطوق / سينما تدور)",
      "تقود منظمة DRI هذه الحملة لتعريف المواطنين بكيفية الدفاع عن حقوقهم إزاء الإدارة أمام المحكمة الإدارية. تميمة الحملة طقطوق، وقافلة « سينما تدور » جالت في ثماني جهات :",
      ...STAGES.map(
        (s) => `- ${s.titleAr} : من ${frDate(s.start)} إلى ${frDate(s.end)} — ${s.peopleImpacted} شخصا.`,
      ),
      `المجموع : ${TOTAL_PEOPLE} شخصا في 8 محطات من أوت 2025 إلى ماي 2026.`,
    ].join("\n"),
  },
  {
    title: "Chambres régionales du Tribunal administratif : compétence et contacts",
    titleAr: "الدوائر الجهوية للمحكمة الإدارية : الاختصاص والعناوين",
    category: "Procédure",
    content: [
      "TRIBUNAL ADMINISTRATIF : OÙ DÉPOSER SA REQUÊTE (Guide du citoyen, mai 2025)",
      "Règle : la requête va au Tribunal administratif à Tunis quand l'administration visée est centrale (ministre, chef du gouvernement…). Quand la décision vient d'une autorité régionale ou locale (gouverneur, président de municipalité, direction régionale, doyen ou directeur d'un établissement d'enseignement supérieur), elle va à la chambre régionale dont relève le gouvernorat où siège cette autorité. Une requête déposée devant un tribunal non compétent est rejetée.",
      "Siège : Tribunal administratif, rue Eddabbaghine, Tunis (bureau d'ordre), aussi rue de Rome et Montplaisir ; tél. 70 028 700 ; www.jat.tn. Il couvre Tunis, Ariana, Ben Arous et Manouba.",
      // Governorate → chamber, spelled out: several governorates (Béja,
      // Zaghouan, Mahdia, Tozeur…) have no chamber of their own.
      "Gouvernorat → juridiction compétente pour les autorités régionales et locales :",
      ...GOVERNORATE_TO_CHAMBER.map(
        ([gov, chamber]) =>
          `- ${gov} : ${chamber ? `chambre régionale de ${chamber.city} (tél. ${chamber.phone})` : "siège du Tribunal administratif à Tunis (tél. 70 028 700)"}`,
      ),
      "Chambres régionales (gouvernorats couverts, adresse, téléphone) :",
      ...CHAMBERS.map((c) => `- ${c.city} : ${c.covers.join(", ")} — ${c.address} — tél. ${c.phone}`),
      "Délais : 60 jours pour demander l'annulation d'une décision à compter de sa notification ou publication ; recours préalable facultatif dans les 2 mois, silence de 2 mois = rejet, puis 2 nouveaux mois pour saisir le tribunal ; 15 ans pour demander réparation d'un dommage. Avocat facultatif pour l'annulation, le sursis et le référé ; obligatoire pour l'indemnisation.",
      "Médiateur administratif : 85, avenue de la Liberté, 1002 Tunis ; tél. 71 792 655 ; mediateur.administratif@email.ati.tn ; représentants régionaux à Sousse, Sfax, Le Kef et Gafsa. Le saisir ne suspend pas les délais de recours.",
      "",
      "المحكمة الإدارية : أين نودع العريضة ؟",
      "تُودَع العريضة بالمحكمة الإدارية بتونس إذا كانت الإدارة مركزية، وبالدائرة الابتدائية التي تتبعها الولاية التي يوجد بها مقرّ السلطة الجهوية أو المحلية في غير ذلك. القضية المرفوعة أمام محكمة غير مختصة يكون مآلها الرفض.",
      "المقرّ : نهج الدبّاغين، تونس — الهاتف 70 028 700 — www.jat.tn (تونس، أريانة، بن عروس، منوبة).",
      "الولاية ← الدائرة المختصة :",
      ...GOVERNORATE_TO_CHAMBER_AR.map(([gov, chamber]) => `- ${gov} : ${chamber}`),
      ...CHAMBERS.map((c) => `- الدائرة الابتدائية ${c.cityAr} : ${c.coversAr.join("، ")} — ${c.addressAr} — الهاتف ${c.phone}`),
      "الموفّق الإداري : 85 شارع الحرية، 1002 تونس — الهاتف 71 792 655.",
    ].join("\n"),
  },
];

// ── Videos (Médiathèque, hosted on YouTube) ──────────────────────────────
export { VIDEOS, YOUTUBE_LINKS } from "./dri-videos.js";
export type { Video } from "./dri-videos.js";
