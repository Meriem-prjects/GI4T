// Médiathèque entries for the DRI campaign videos, hosted on YouTube. An
// entry is published only once its link is set in YOUTUBE_LINKS.
// `id` is a stable key named after the source file in the Drive zips
// (video:<group>:<file name slug>); the YouTube videos were matched to those
// files by exact duration (±1 s).
// Array order = display order on the public page (newest-created first,
// so the publisher creates them in reverse).

export type VideoCategory = "campaigns" | "testimonials" | "trainings" | "fiction" | "taktouk";

/** Video key → YouTube link and duration (as shown on YouTube). */
export const YOUTUBE_LINKS: Record<string, { url: string; duration: string }> = {
  // Playlist « طقطوق يدور مع cinémaTdour » (Democracy Reporting International Tunisia)
  "video:general:taktouk-on-the-road": { url: "https://www.youtube.com/watch?v=wkzQ-zbgXJk", duration: "1:35" },
  "video:beja:reel-2-dri": { url: "https://www.youtube.com/watch?v=6sVSkqe26Ps", duration: "1:02" },
  "video:kef:recap-kef-1": { url: "https://www.youtube.com/watch?v=V-H7Ngm3I7A", duration: "1:47" },
  "video:mareth:g-w-dri": { url: "https://www.youtube.com/watch?v=j2e02sF0Yfc", duration: "1:07" },
  "video:mareth:feedbck-dri": { url: "https://www.youtube.com/watch?v=norGhy8JY8I", duration: "1:00" },
  "video:djerba:copie-de-recap": { url: "https://www.youtube.com/watch?v=qJkMGhHTnCE", duration: "2:14" },
  "video:djerba:copie-de-reel-1-consultation": { url: "https://www.youtube.com/watch?v=FiHB41lbJoI", duration: "1:00" },
  "video:djerba:copie-de-interviews-temoignages": { url: "https://www.youtube.com/watch?v=KJev8JFvV_0", duration: "1:21" },
  "video:zaghouan:video-2": { url: "https://www.youtube.com/watch?v=4Gcq2v8a8LE", duration: "1:14" },
  "video:zaghouan:video-4": { url: "https://www.youtube.com/watch?v=IE_7wXtUzYE", duration: "0:57" },
  "video:nefta:taktouk-nafta": { url: "https://www.youtube.com/watch?v=k8fRf4sO6x4", duration: "0:49" },
  "video:ettadhamen:video": { url: "https://www.youtube.com/watch?v=EnSgJSyHM40", duration: "1:34" },
  "video:mahdia:dri": { url: "https://www.youtube.com/watch?v=tG5l7-GOyp0", duration: "1:19" },
};

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

// From the YouTube descriptions of the playlist.
const ydour = (stageFr: string, stageAr: string): [string, string] => [
  `${stageFr} — De l'écran à la rue : avec CinémaTdour, #Taktouk_Ydour fait de la culture un pont pour transmettre l'information, simplifier la justice administrative et faire connaître à chacun ses droits et les moyens d'y accéder.`,
  `${stageAr} — من الشاشة إلى الشارع : مع « سينما تدور »، تجعل مبادرة #طقطوق_يدور الثقافة جسرا يوصل المعلومة لكلّ مواطن ومواطنة، وتبسّط مفاهيم القضاء الإداري وتوعّي الناس بحقوقهم وكيفية النفاذ إليها.`,
];

// Titles: the YouTube title in Arabic (spelled « طقطوق » like the posters,
// where YouTube writes « طقطق »), translated into French.
export const VIDEOS: Video[] = [
  // ── Published (YouTube playlist), most recent stage first ──
  video("video:general:taktouk-on-the-road", "campaigns", null,
    ["Taktouk en tournée avec CinémaTdour : une année sur les routes de Tunisie", "طقطوق يدور / Taktouk on the road with CinémaTdour"],
    ["Une année sur les routes de Tunisie avec Taktouk : l'art pour transmettre l'information, le cinéma pour aller à la rencontre des citoyens. L'aventure continue en 2026.",
      "عام دار فيه طقطوق في ربوع تونس : جمعنا الفنّ بالمعلومة… والسينما بالمواطن، والرحلة مازالت مكمّلة في 2026."], true),
  video("video:beja:reel-2-dri", "campaigns", "Béja",
    ["Taktouk en tournée avec CinémaTdour à Béja", "طقطوق يدور مع CinémaTdour في باجة"],
    ydour("Étape de Béja, 15-25 mai 2026", "محطة باجة، 15-25 ماي 2026")),
  video("video:kef:recap-kef-1", "campaigns", "Le Kef",
    ["Taktouk en tournée avec CinémaTdour au Kef", "طقطوق يدور مع CinémaTdour في الكاف"],
    ydour("Étape du Kef, 2-15 mai 2026", "محطة الكاف، 2-15 ماي 2026")),
  video("video:mareth:g-w-dri", "campaigns", "Gabès",
    ["Taktouk emporte à Mareth les histoires des « Archives de la rue Eddabbaghine »", "طقطوق هزّ حكايات « أرشيف نهج الدباغين » معاه لمارث"],
    ydour("Étape de Mareth, 1er-12 avril 2026", "محطة مارث، 1-12 أفريل 2026")),
  video("video:mareth:feedbck-dri", "testimonials", "Gabès",
    ["Au cœur de l'expérience : Taktouk vu par les bénévoles et ambassadeurs du projet", "من قلب التجربة… « طقطوق » بأعين متطوّعين وسفراء المشروع"],
    ["Les bénévoles et ambassadeurs du projet racontent la campagne, lors de l'étape de Mareth (avril 2026).",
      "متطوّعو المشروع وسفراؤه يتحدّثون عن الحملة خلال محطة مارث (أفريل 2026)."]),
  video("video:djerba:copie-de-recap", "campaigns", "Médenine",
    ["Taktouk en tournée avec CinémaTdour à Djerba", "طقطوق يدور مع CinémaTdour في جربة"],
    ydour("Étape de Djerba, 17-25 janvier 2026", "محطة جربة، 17-25 جانفي 2026"), true),
  video("video:djerba:copie-de-reel-1-consultation", "campaigns", "Médenine",
    ["Depuis Djerba, Taktouk poursuit l'aventure", "من جربة، طقطوق يواصل التجربة"],
    ydour("Étape de Djerba, janvier 2026", "محطة جربة، جانفي 2026")),
  video("video:djerba:copie-de-interviews-temoignages", "testimonials", "Médenine",
    ["L'expérience Taktouk vue par les bénévoles et ambassadeurs du projet", "تجربة طقطوق يدور بأعين متطوّعي وسفراء المشروع"],
    ["Les bénévoles et ambassadeurs du projet témoignent, lors de l'étape de Djerba (janvier 2026).",
      "متطوّعو المشروع وسفراؤه يدلون بشهاداتهم خلال محطة جربة (جانفي 2026)."]),
  video("video:zaghouan:video-2", "campaigns", "Zaghouan",
    ["Taktouk en tournée avec CinémaTdour à Zaghouan", "طقطوق يدور مع CinémaTdour في زغوان"],
    ydour("Étape de Zaghouan, 28 octobre-8 novembre 2025", "محطة زغوان، 28 أكتوبر-8 نوفمبر 2025")),
  video("video:zaghouan:video-4", "campaigns", "Zaghouan",
    ["Taktouk en tournée avec CinémaTdour à Zaghouan : les consultations", "طقطوق يدور مع CinémaTdour في زغوان : الاستشارات"],
    ydour("Étape de Zaghouan, consultations avec des experts", "محطة زغوان، استشارات مع خبراء")),
  video("video:nefta:taktouk-nafta", "campaigns", "Tozeur",
    ["Taktouk en tournée avec CinémaTdour à Nefta", "طقطوق يدور مع CinémaTdour في نفطة"],
    ydour("Étape de Nefta, 17-26 octobre 2025", "محطة نفطة، 17-26 أكتوبر 2025")),
  video("video:ettadhamen:video", "campaigns", "Ariana",
    ["Taktouk en tournée avec CinémaTdour à Cité Ettadhamen", "طقطوق يدور مع CinémaTdour في حي التضامن"],
    ydour("Étape de Cité Ettadhamen, 31 août-4 septembre 2025", "محطة حي التضامن، 31 أوت-4 سبتمبر 2025")),
  video("video:mahdia:dri", "campaigns", "Mahdia",
    ["Taktouk en tournée avec CinémaTdour à Mahdia", "طقطوق يدور مع CinémaTdour في المهدية"],
    ydour("Étape de Mahdia et Chebba, 18-28 août 2025", "محطة المهدية والشابة، 18-28 أوت 2025")),

  // ── Not on YouTube yet (no link): drafted from the file names ──
  video("video:fiction:ep-1-amal-1", "fiction", null,
    ["Série fiction – Épisode 1 : Amal", "السلسلة الدرامية – الحلقة 1 : أمل"],
    [FICTION_FR, FICTION_AR]),
  video("video:fiction:ep-2-jbal-aali-1", "fiction", null,
    ["Série fiction – Épisode 2 : Jbal Aali", "السلسلة الدرامية – الحلقة 2 : جبل عالي"],
    [FICTION_FR, FICTION_AR]),
  video("video:fiction:ep-3-b3-1", "fiction", null,
    ["Série fiction – Épisode 3 : B3", "السلسلة الدرامية – الحلقة 3 : بطاقة عدد 3"],
    [FICTION_FR, FICTION_AR]),
  video("video:fiction:ep-4-sonede", "fiction", null,
    ["Série fiction – Épisode 4 : SONEDE", "السلسلة الدرامية – الحلقة 4 : الصوناد"],
    [FICTION_FR, FICTION_AR]),
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
  video("video:kef:dri-kef", "campaigns", "Le Kef",
    ["Le Kef – Taktouk en ville", "الكاف – طقطوق في المدينة"],
    ["Taktouk et les médiateurs à la rencontre des habitants du Kef.", "طقطوق والوسطاء يلتقون بمتساكني الكاف."]),
  video("video:kef:dri-g-w", "campaigns", "Le Kef",
    ["Le Kef – la caravane CinémaTdour", "الكاف – قافلة سينما تدور"],
    ["La caravane CinémaTdour et l'équipe de la campagne au Kef.", "قافلة « سينما تدور » وفريق الحملة في الكاف."]),
  video("video:mareth:video-dri-1", "campaigns", "Gabès",
    ["Mareth – la caravane CinémaTdour", "مارث – قافلة سينما تدور"],
    ["Distribution du Guide du citoyen et projections pendant l'étape de Mareth.", "توزيع دليل المواطن وعروض خلال محطة مارث."]),
  video("video:djerba:copie-de-mahfel", "campaigns", "Médenine",
    ["Djerba – la grande soirée", "جربة – المحفل"],
    ["La soirée de la campagne à Djerba.", "سهرة الحملة في جربة."]),
  video("video:djerba:copie-de-formation", "trainings", "Médenine",
    ["Djerba – formation des bénévoles", "جربة – تكوين المتطوّعين"],
    ["La formation des bénévoles de la campagne avant l'étape de Djerba.", "تكوين متطوّعي الحملة قبل محطة جربة."]),
  video("video:zaghouan:video-1", "campaigns", "Zaghouan",
    ["Zaghouan – les médiateurs en action", "زغوان – الوسطاء في الميدان"],
    ["Les médiateurs distribuent le Guide du citoyen dans les rues et au marché de Zaghouan.", "الوسطاء يوزّعون دليل المواطن في أنهج زغوان وسوقها."]),
  video("video:nefta:recap", "campaigns", "Tozeur",
    ["Nefta – récap de l'étape", "نفطة – ملخّص المحطة"],
    ["Distribution du Guide du citoyen, consultations et projection : l'étape de Nefta en images.", "توزيع دليل المواطن واستشارات وعروض : محطة نفطة بالصور."]),
  video("video:nefta:video-reel-2", "campaigns", "Tozeur",
    ["Nefta – à la rencontre des habitants", "نفطة – لقاء مع المتساكنين"],
    ["Les médiateurs dans les commerces et les lieux de travail de Nefta.", "الوسطاء في محلات نفطة وأماكن العمل."]),
  video("video:ettadhamen:dri-tadhamen-v2", "campaigns", "Ariana",
    ["Cité Ettadhamen – récap de l'étape", "حي التضامن – ملخّص المحطة"],
    ["Retour en images sur l'étape de Cité Ettadhamen (31 août-4 septembre 2025).", "عودة بالصور على محطة حي التضامن (31 أوت-4 سبتمبر 2025)."]),
  video("video:ettadhamen:copy-c0871323-37af-4d86-a52e-8f122d5b3458", "campaigns", "Ariana",
    ["Cité Ettadhamen – les médiateurs en action", "حي التضامن – الوسطاء في الميدان"],
    ["Les médiateurs distribuent le Guide du citoyen à Cité Ettadhamen.", "الوسطاء يوزّعون دليل المواطن في حي التضامن."]),
  video("video:ettadhamen:copy-fd932c3a-afb2-48cb-946a-9e933c57cf93", "campaigns", "Ariana",
    ["Cité Ettadhamen – ambiance", "حي التضامن – أجواء"],
    ["Musique, rencontres et distribution du guide à Cité Ettadhamen.", "موسيقى ولقاءات وتوزيع الدليل في حي التضامن."]),
  video("video:mahdia:reel-1", "campaigns", "Mahdia",
    ["Mahdia et Chebba – Taktouk sur la côte", "المهدية والشابة – طقطوق على الساحل"],
    ["Médiateurs, Taktouk et projection nocturne à Mahdia et Chebba.", "وسطاء وطقطوق وعرض ليلي في المهدية والشابة."]),
];
