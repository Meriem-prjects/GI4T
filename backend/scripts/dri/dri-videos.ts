// Médiathèque entries for the DRI campaign videos. The videos are hosted on
// YouTube: an entry is published only once its link is set in
// YOUTUBE_LINKS. `id` is a stable key named after the source file in the
// Drive zips (video:<group>:<file name slug>).
// Array order = display order on the public page (newest-created first,
// so the publisher creates them in reverse).
// Titles were drafted from the file names and a few frames of each video:
// check them against the YouTube titles when the links are added.

export type VideoCategory = "campaigns" | "testimonials" | "trainings" | "fiction" | "taktouk";

/** Video key → YouTube link (watch, youtu.be or shorts URL). */
export const YOUTUBE_LINKS: Record<string, string> = {};

// media_items.category is a French label; the public page translates it
// from category_id (CATEGORY_META in MediathequeContent.tsx).
const LABELS: Record<VideoCategory, string> = {
  campaigns: "Campagnes terrain",
  testimonials: "Témoignages",
  trainings: "Formations",
  fiction: "Série fiction",
  taktouk: "Capsules Taktouk",
};

export interface Video {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  categoryId: VideoCategory;
  categoryLabel: string;
  /** French governorate name, as on the map. */
  governorate: string | null;
  featured: boolean;
}

const video = (
  id: string,
  categoryId: VideoCategory,
  governorate: string | null,
  [title, titleAr]: [string, string],
  [description, descriptionAr]: [string, string],
  featured = false,
): Video => ({
  id,
  title,
  titleAr,
  description,
  descriptionAr,
  categoryId,
  categoryLabel: LABELS[categoryId],
  governorate,
  featured,
});

const FICTION_FR =
  "La série de fiction de la Campagne nationale pour l'accès à la justice administrative : des histoires du quotidien pour comprendre comment faire valoir ses droits face à l'administration.";
const FICTION_AR =
  "السلسلة الدرامية للحملة الوطنية للنفاذ إلى القضاء الإداري : قصص من الحياة اليومية لفهم كيفية الدفاع عن حقوقنا إزاء الإدارة.";

const TAKTOUK_FR =
  "Capsule animée : Taktouk, la mascotte de la campagne, explique un cas concret et le recours possible devant le Tribunal administratif.";
const TAKTOUK_AR =
  "كبسولة متحرّكة : طقطوق، تميمة الحملة، يشرح حالة واقعية وسبيل الطعن الممكن أمام المحكمة الإدارية.";

export const VIDEOS: Video[] = [
  // ── Fiction series ──
  video("video:fiction:ep-1-amal-1", "fiction", null,
    ["Série fiction – Épisode 1 : Amal", "السلسلة الدرامية – الحلقة 1 : أمل"],
    [FICTION_FR, FICTION_AR], true),
  video("video:fiction:ep-2-jbal-aali-1", "fiction", null,
    ["Série fiction – Épisode 2 : Jbal Aali", "السلسلة الدرامية – الحلقة 2 : جبل عالي"],
    [FICTION_FR, FICTION_AR]),
  video("video:fiction:ep-3-b3-1", "fiction", null,
    ["Série fiction – Épisode 3 : B3", "السلسلة الدرامية – الحلقة 3 : بطاقة عدد 3"],
    [FICTION_FR, FICTION_AR]),
  video("video:fiction:ep-4-sonede", "fiction", null,
    ["Série fiction – Épisode 4 : SONEDE", "السلسلة الدرامية – الحلقة 4 : الصوناد"],
    [FICTION_FR, FICTION_AR]),

  // ── Taktouk capsules ──
  video("video:taktouk:video-1-taktouk-2d-cafe", "taktouk", null,
    ["Taktouk 2D – Au café", "طقطوق – في المقهى"], [TAKTOUK_FR, TAKTOUK_AR]),
  video("video:taktouk:video-2-taktouk-2d-salle-des-fetes", "taktouk", null,
    ["Taktouk 2D – La salle des fêtes", "طقطوق – قاعة الأفراح"], [TAKTOUK_FR, TAKTOUK_AR]),
  video("video:taktouk:video-3-taktouk-2d-accident", "taktouk", null,
    ["Taktouk 2D – L'accident", "طقطوق – الحادث"], [TAKTOUK_FR, TAKTOUK_AR]),
  video("video:taktouk:video-4-taktouk-2d-faculte", "taktouk", null,
    ["Taktouk 2D – À la faculté", "طقطوق – في الكلية"], [TAKTOUK_FR, TAKTOUK_AR]),
  video("video:taktouk:video-5-taktouk-2d-steg", "taktouk", null,
    ["Taktouk 2D – La STEG", "طقطوق – الستاغ"], [TAKTOUK_FR, TAKTOUK_AR]),
  video("video:taktouk:dri-tn-video-taktouk-n-1-responsabilite-medicale-final", "taktouk", null,
    ["Taktouk n°1 – La responsabilité médicale", "طقطوق عدد 1 – المسؤولية الطبية"], [TAKTOUK_FR, TAKTOUK_AR]),
  video("video:taktouk:dri-tn-video-taktouk-n-2-s17-final", "taktouk", null,
    ["Taktouk n°2 – La mesure S17", "طقطوق عدد 2 – الإجراء S17"], [TAKTOUK_FR, TAKTOUK_AR]),
  video("video:taktouk:dri-tn-video-taktouk-n-3-complet-avec-site-ta-final", "taktouk", null,
    ["Taktouk n°3 – Le site du Tribunal administratif", "طقطوق عدد 3 – موقع المحكمة الإدارية"], [TAKTOUK_FR, TAKTOUK_AR]),

  // ── Field campaign, most recent stage first ──
  video("video:beja:reel-2-dri", "campaigns", "Béja",
    ["Béja – les médiateurs dans la rue", "باجة – الوسطاء في الشارع"],
    ["Les médiateurs de la campagne distribuent le Guide du citoyen dans les rues et les cafés de Béja.",
      "وسطاء الحملة يوزّعون دليل المواطن في أنهج باجة ومقاهيها."]),
  video("video:kef:recap-kef-1", "campaigns", "Le Kef",
    ["Le Kef – récap de l'étape", "الكاف – ملخّص المحطة"],
    ["Retour en images sur l'étape du Kef (2-15 mai 2026).", "عودة بالصور على محطة الكاف (2-15 ماي 2026)."]),
  video("video:kef:dri-kef", "campaigns", "Le Kef",
    ["Le Kef – Taktouk en ville", "الكاف – طقطوق في المدينة"],
    ["Taktouk et les médiateurs à la rencontre des habitants du Kef.", "طقطوق والوسطاء يلتقون بمتساكني الكاف."]),
  video("video:kef:dri-g-w", "campaigns", "Le Kef",
    ["Le Kef – la caravane CinémaTdour", "الكاف – قافلة سينما تدور"],
    ["La caravane CinémaTdour et l'équipe de la campagne au Kef.", "قافلة « سينما تدور » وفريق الحملة في الكاف."]),
  video("video:mareth:video-dri-1", "campaigns", "Gabès",
    ["Mareth – la caravane CinémaTdour", "مارث – قافلة سينما تدور"],
    ["Distribution du Guide du citoyen et projections pendant l'étape de Mareth.", "توزيع دليل المواطن وعروض خلال محطة مارث."]),
  video("video:mareth:g-w-dri", "campaigns", "Gabès",
    ["Mareth – ambiance de l'étape", "مارث – أجواء المحطة"],
    ["Les temps forts de l'étape de Mareth (1er-12 avril 2026).", "أبرز لحظات محطة مارث (1-12 أفريل 2026)."]),
  video("video:mareth:feedbck-dri", "testimonials", "Gabès",
    ["Mareth – la parole aux médiateurs", "مارث – الكلمة للوسطاء"],
    ["Les médiateurs de la campagne racontent leur expérience à Mareth.", "وسطاء الحملة يتحدّثون عن تجربتهم في مارث."]),
  video("video:djerba:copie-de-recap", "campaigns", "Médenine",
    ["Djerba – récap de l'étape", "جربة – ملخّص المحطة"],
    ["Retour en images sur l'étape de Djerba (17-25 janvier 2026), la plus suivie de la tournée.",
      "عودة بالصور على محطة جربة (17-25 جانفي 2026)، الأكثر إقبالا في الجولة."], true),
  video("video:djerba:copie-de-mahfel", "campaigns", "Médenine",
    ["Djerba – la grande soirée", "جربة – المحفل"],
    ["La soirée de la campagne à Djerba.", "سهرة الحملة في جربة."]),
  video("video:djerba:copie-de-reel-1-consultation", "campaigns", "Médenine",
    ["Djerba – consultations juridiques gratuites", "جربة – استشارات قانونية مجانية"],
    ["Des experts reçoivent les citoyens pour des consultations gratuites pendant l'étape de Djerba.",
      "خبراء يستقبلون المواطنين لاستشارات مجانية خلال محطة جربة."]),
  video("video:djerba:copie-de-interviews-temoignages", "testimonials", "Médenine",
    ["Djerba – interviews et témoignages", "جربة – حوارات وشهادات"],
    ["Habitants, bénévoles et experts témoignent pendant l'étape de Djerba.", "متساكنون ومتطوّعون وخبراء يدلون بشهاداتهم خلال محطة جربة."]),
  video("video:djerba:copie-de-formation", "trainings", "Médenine",
    ["Djerba – formation des bénévoles", "جربة – تكوين المتطوّعين"],
    ["La formation des bénévoles de la campagne avant l'étape de Djerba.", "تكوين متطوّعي الحملة قبل محطة جربة."]),
  video("video:zaghouan:video-2", "campaigns", "Zaghouan",
    ["Zaghouan – récap de l'étape", "زغوان – ملخّص المحطة"],
    ["Les médiateurs de la campagne dans la médina et les rues de Zaghouan.", "وسطاء الحملة في المدينة العتيقة وأنهج زغوان."]),
  video("video:zaghouan:video-4", "campaigns", "Zaghouan",
    ["Zaghouan – consultations avec des experts", "زغوان – استشارات مع خبراء"],
    ["Rencontres et consultations avec des experts pendant l'étape de Zaghouan.", "لقاءات واستشارات مع خبراء خلال محطة زغوان."]),
  video("video:zaghouan:video-1", "campaigns", "Zaghouan",
    ["Zaghouan – les médiateurs en action", "زغوان – الوسطاء في الميدان"],
    ["Les médiateurs distribuent le Guide du citoyen dans les rues et au marché de Zaghouan.", "الوسطاء يوزّعون دليل المواطن في أنهج زغوان وسوقها."]),
  video("video:nefta:recap", "campaigns", "Tozeur",
    ["Nefta – récap de l'étape", "نفطة – ملخّص المحطة"],
    ["Distribution du Guide du citoyen, consultations et projection : l'étape de Nefta en images.", "توزيع دليل المواطن واستشارات وعروض : محطة نفطة بالصور."]),
  video("video:nefta:taktouk-nafta", "campaigns", "Tozeur",
    ["Taktouk à Nefta", "طقطوق في نفطة"],
    ["Taktouk et les médiateurs au cœur de Nefta.", "طقطوق والوسطاء في قلب نفطة."]),
  video("video:nefta:video-reel-2", "campaigns", "Tozeur",
    ["Nefta – à la rencontre des habitants", "نفطة – لقاء مع المتساكنين"],
    ["Les médiateurs dans les commerces et les lieux de travail de Nefta.", "الوسطاء في محلات نفطة وأماكن العمل."]),
  video("video:ettadhamen:dri-tadhamen-v2", "campaigns", "Ariana",
    ["Cité Ettadhamen – récap de l'étape", "حي التضامن – ملخّص المحطة"],
    ["Retour en images sur l'étape de Cité Ettadhamen (31 août-4 septembre 2025).", "عودة بالصور على محطة حي التضامن (31 أوت-4 سبتمبر 2025)."]),
  video("video:ettadhamen:video", "campaigns", "Ariana",
    ["Cité Ettadhamen – la caravane CinémaTdour", "حي التضامن – قافلة سينما تدور"],
    ["Projections et animations de la caravane CinémaTdour à Cité Ettadhamen.", "عروض وتنشيط قافلة « سينما تدور » في حي التضامن."]),
  video("video:ettadhamen:copy-c0871323-37af-4d86-a52e-8f122d5b3458", "campaigns", "Ariana",
    ["Cité Ettadhamen – les médiateurs en action", "حي التضامن – الوسطاء في الميدان"],
    ["Les médiateurs distribuent le Guide du citoyen à Cité Ettadhamen.", "الوسطاء يوزّعون دليل المواطن في حي التضامن."]),
  video("video:ettadhamen:copy-fd932c3a-afb2-48cb-946a-9e933c57cf93", "campaigns", "Ariana",
    ["Cité Ettadhamen – ambiance", "حي التضامن – أجواء"],
    ["Musique, rencontres et distribution du guide à Cité Ettadhamen.", "موسيقى ولقاءات وتوزيع الدليل في حي التضامن."]),
  video("video:mahdia:dri", "campaigns", "Mahdia",
    ["Mahdia et Chebba – récap de l'étape", "المهدية والشابة – ملخّص المحطة"],
    ["Retour en images sur la première étape de la tournée (18-28 août 2025).", "عودة بالصور على أوّل محطة في الجولة (18-28 أوت 2025)."]),
  video("video:mahdia:reel-1", "campaigns", "Mahdia",
    ["Mahdia et Chebba – Taktouk sur la côte", "المهدية والشابة – طقطوق على الساحل"],
    ["Médiateurs, Taktouk et projection nocturne à Mahdia et Chebba.", "وسطاء وطقطوق وعرض ليلي في المهدية والشابة."]),
];
