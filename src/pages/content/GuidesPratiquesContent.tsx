import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Clock,
  Users,
  ChevronRight,
  ChevronDown,
  Briefcase,
  Scale,
  Building2,
  UserCheck,
  HeartHandshake,
  ArrowRight,
  CheckCircle2,
  Download,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import AdminManagedSection from "@/components/accesdroits/AdminManagedSection";
import { GUIDE_VISUALS } from "@/components/accesdroits/GuideVisuals";

// Each guide condenses one chapter of the ODF "Guide du citoyen — Accès au
// juge administratif" (May 2025). Icons + colours mirror AdminJusticeIntro
// so a citizen who clicks a teaser card lands on the matching detailed guide.
interface GuideSection {
  headingFr: string;
  headingAr: string;
  bodyFr: string;
  bodyAr: string;
  bulletsFr?: string[];
  bulletsAr?: string[];
}

interface Guide {
  id: string;
  icon: typeof Scale;
  categoryFr: string;
  categoryAr: string;
  titleFr: string;
  titleAr: string;
  descFr: string;
  descAr: string;
  durationFr: string;
  durationAr: string;
  difficultyFr: string;
  difficultyAr: string;
  tagsFr: string[];
  tagsAr: string[];
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  sections: GuideSection[];
}

// Full guide (48 p., Tunisian Arabic), shipped as a static file in public/.
const GUIDE_PDF_URL = "/docs/guide-citoyen-justice-administrative.pdf";

const GUIDES: Guide[] = [
  {
    id: "organisation",
    icon: Scale,
    categoryFr: "Organisation",
    categoryAr: "التنظيم القضائي",
    titleFr: "Organisation judiciaire en Tunisie",
    titleAr: "التنظيم القضائي في تونس",
    descFr:
      "Comprendre les trois ordres de juridiction — judiciaire, administratif et financier — et savoir quel tribunal saisir selon votre litige.",
    descAr:
      "فهم الأقسام الثلاثة للقضاء : العدلي والإداري والمالي، ومعرفة المحكمة المختصة في كل نزاع.",
    durationFr: "12 min",
    durationAr: "12 دقيقة",
    difficultyFr: "Débutant",
    difficultyAr: "مبتدئ",
    tagsFr: ["Justice judiciaire", "Justice administrative", "Justice financière"],
    tagsAr: ["القضاء العدلي", "القضاء الإداري", "القضاء المالي"],
    color: "bg-blue-600",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
    sections: [
      {
        headingFr: "Les trois ordres de juridiction",
        headingAr: "الأقسام الثلاثة للقضاء",
        bodyFr:
          "Le système juridictionnel tunisien repose sur trois grands ordres, chacun spécialisé dans un type de contentieux. Avant tout recours, il faut identifier l'ordre compétent.",
        bodyAr:
          "يعتمد النظام القضائي التونسي على ثلاثة أقسام كبرى، كل قسم مختص بنوع من النزاعات. قبل أي طعن، يجب تحديد القسم المختص.",
        bulletsFr: [
          "Justice judiciaire : litiges entre particuliers (civil, commercial, pénal, social, foncier).",
          "Justice administrative : litiges entre un citoyen et l'État ou une administration publique.",
          "Justice financière : contrôle de la gestion des deniers publics (Cour des comptes).",
        ],
        bulletsAr: [
          "القضاء العدلي : النزاعات بين الأفراد (المدني، التجاري، الجزائي، الشغل، العقاري).",
          "القضاء الإداري : النزاعات بين المواطن والدولة أو الإدارة العمومية.",
          "القضاء المالي : مراقبة التصرف في المال العام (محكمة المحاسبات).",
        ],
      },
      {
        headingFr: "Les juridictions militaires",
        headingAr: "المحاكم العسكرية",
        bodyFr:
          "À côté des trois ordres, il existe des juridictions militaires compétentes pour les infractions commises par les militaires ou en lien avec la sécurité de l'État.",
        bodyAr:
          "إلى جانب الأقسام الثلاثة، توجد محاكم عسكرية مختصة في الجرائم التي يرتكبها العسكريون أو المتعلقة بأمن الدولة.",
      },
      {
        headingFr: "Comment savoir quel tribunal saisir ?",
        headingAr: "كيف نعرف المحكمة المختصة ؟",
        bodyFr:
          "La question de compétence se pose en deux temps : d'abord la matière (quel ordre ?), puis le ressort géographique (quel tribunal dans cet ordre ?). Le Guide du citoyen insiste : une affaire portée devant un tribunal non compétent est rejetée. Avant de déposer, faites-vous confirmer la juridiction compétente par un professionnel. Lorsque les juridictions judiciaires et administratives se disputent ou déclinent une même affaire, c'est le Conseil des conflits de compétence qui tranche.",
        bodyAr:
          "تُطرح مسألة الاختصاص على مرحلتين : أولا الموضوع (أيّ قسم ؟)، ثم المرجع الترابي (أيّة محكمة في هذا القسم ؟). ويؤكّد دليل المواطن أنّ القضية المرفوعة أمام محكمة غير مختصة يكون مآلها الرفض، لذا يُستحسن استشارة أهل الاختصاص قبل إيداع العريضة. وعند تنازع الاختصاص بين محاكم القضاء العدلي ومحاكم القضاء الإداري، يبتّ مجلس تنازع الاختصاص في المسألة.",
      },
    ],
  },
  {
    id: "tribunal-admin",
    icon: Building2,
    categoryFr: "Tribunal administratif",
    categoryAr: "المحكمة الإدارية",
    titleFr: "Le Tribunal Administratif et ses 12 chambres régionales",
    titleAr: "المحكمة الإدارية ودوائرها الابتدائية الجهوية الاثنتا عشرة",
    descFr:
      "Le Tribunal Administratif siège à Tunis, mais 12 chambres régionales le représentent dans tout le pays. Savoir où déposer votre requête selon l'autorité qui a pris la décision.",
    descAr:
      "مقرّ المحكمة الإدارية بتونس، غير أنّ اثنتي عشرة دائرة جهوية تمثّلها في كامل البلاد. اعرف أين تودع عريضتك حسب السلطة التي أصدرت القرار.",
    durationFr: "10 min",
    durationAr: "10 دقائق",
    difficultyFr: "Débutant",
    difficultyAr: "مبتدئ",
    tagsFr: ["12 chambres", "Compétence territoriale", "Tunis"],
    tagsAr: ["12 دائرة", "الاختصاص الترابي", "تونس"],
    color: "bg-rose-600",
    bgColor: "bg-rose-50",
    textColor: "text-rose-700",
    borderColor: "border-rose-200",
    sections: [
      {
        headingFr: "Siège principal et chambres régionales",
        headingAr: "المقر الرئيسي والدوائر الجهوية",
        bodyFr:
          "Le Tribunal Administratif a son siège à Tunis : rue Eddabbaghine, où se trouve le bureau d'ordre qui reçoit les requêtes, ainsi que rue de Rome et à Montplaisir, près du ministère du Transport. Tél. 70 028 700 — www.jat.tn. Pour rapprocher la justice du citoyen, il dispose de 12 chambres de première instance réparties dans les régions.",
        bodyAr:
          "يوجد مقرّ المحكمة الإدارية بتونس العاصمة في نهج الدبّاغين، حيث يوجد مكتب الضبط الذي تُودَع فيه العرائض، وكذلك في نهج روما وفي مونبليزير بجانب وزارة النقل. الهاتف : ⁦70 028 700⁩ — www.jat.tn. وتقريبا للقضاء من المواطن، تتوزّع اثنتا عشرة دائرة ابتدائية على مختلف الجهات.",
      },
      {
        headingFr: "Les 12 chambres régionales",
        headingAr: "الدوائر الإبتدائية الجهوية الـ12",
        bodyFr:
          "Chaque chambre régionale couvre un ou plusieurs gouvernorats (liste du Guide du citoyen). Les gouvernorats du Grand Tunis relèvent du siège, à Tunis. Adresses et téléphones : rubrique « Adresses utiles ».",
        bodyAr:
          "تغطّي كلّ دائرة جهوية ولاية واحدة أو أكثر (حسب دليل المواطن)، فيما ترجع ولايات تونس الكبرى بالنظر إلى المقرّ بتونس. العناوين وأرقام الهاتف في ركن « عناوين مفيدة ».",
        bulletsFr: [
          "Tunis (siège) : Tunis, Ariana, Ben Arous, Manouba",
          "Nabeul : Nabeul, Zaghouan",
          "Bizerte : Bizerte, Béja",
          "Le Kef : Le Kef, Jendouba, Siliana",
          "Sousse : Sousse",
          "Monastir : Monastir, Mahdia",
          "Kairouan : Kairouan",
          "Sfax : Sfax",
          "Sidi Bouzid : Sidi Bouzid",
          "Kasserine : Kasserine",
          "Gafsa : Gafsa, Tozeur",
          "Gabès : Gabès, Kébili",
          "Médenine : Médenine, Tataouine",
        ],
        bulletsAr: [
          "تونس (المقرّ) : تونس، أريانة، بن عروس، منوبة",
          "نابل : نابل، زغوان",
          "بنزرت : بنزرت، باجة",
          "الكاف : الكاف، جندوبة، سليانة",
          "سوسة : سوسة",
          "المنستير : المنستير، المهدية",
          "القيروان : القيروان",
          "صفاقس : صفاقس",
          "سيدي بوزيد : سيدي بوزيد",
          "القصرين : القصرين",
          "قفصة : قفصة، توزر",
          "قابس : قابس، قبلي",
          "مدنين : مدنين، تطاوين",
        ],
      },
      {
        headingFr: "Où déposer la requête ?",
        headingAr: "أين نودع العريضة ؟",
        bodyFr:
          "En règle générale, la requête est déposée au Tribunal administratif à Tunis lorsque l'administration visée est une administration centrale (un ministre, le chef du gouvernement…). Lorsque la décision émane d'une autorité régionale ou locale (gouverneur, président de municipalité, direction régionale, doyen ou directeur d'un établissement d'enseignement supérieur…), elle est déposée auprès de la chambre régionale dont relève le gouvernorat où siège cette autorité. Attention : une requête déposée devant une juridiction non compétente est rejetée.",
        bodyAr:
          "كقاعدة عامة، تُودَع العريضة بالمحكمة الإدارية بتونس العاصمة إذا كانت الإدارة المعنية إدارة مركزية (وزير، رئيس الحكومة...). أمّا إذا صدر القرار عن سلطة جهوية أو محلية (والٍ، رئيس بلدية، إدارة جهوية، عميد أو مدير مؤسسة تعليم عالٍ...) فتُودَع العريضة بالدائرة الابتدائية التي تتبعها الولاية التي يوجد بها مقرّ تلك السلطة. تنبيه : القضية المرفوعة أمام محكمة غير مختصة يكون مآلها الرفض.",
      },
    ],
  },
  {
    id: "quand-saisir",
    icon: Briefcase,
    categoryFr: "Recours",
    categoryAr: "الطعون",
    titleFr: "Quand saisir le juge administratif ?",
    titleAr: "متى نلجأ للقضاء الإداري ؟",
    descFr:
      "Annuler une décision illégale, demander une indemnisation, obtenir une autorisation ou un constat en urgence — les quatre grandes voies de recours.",
    descAr:
      "إلغاء قرار غير شرعي، طلب تعويض، الحصول على إذن أو معاينة استعجالية — الطرق الأربعة للطعن.",
    durationFr: "15 min",
    durationAr: "15 دقيقة",
    difficultyFr: "Intermédiaire",
    difficultyAr: "متوسط",
    tagsFr: ["Annulation", "Indemnisation", "Référé"],
    tagsAr: ["الإلغاء", "التعويض", "الاستعجالي"],
    color: "bg-amber-600",
    bgColor: "bg-amber-50",
    textColor: "text-amber-700",
    borderColor: "border-amber-200",
    sections: [
      {
        headingFr: "Recours pour excès de pouvoir (annulation)",
        headingAr: "دعوى تجاوز السلطة (الإلغاء)",
        bodyFr:
          "C'est la voie la plus courante. Vous demandez au juge d'annuler une décision administrative que vous jugez illégale : refus de permis, décision disciplinaire, mutation, etc.",
        bodyAr:
          "هي الطريق الأكثر استعمالا. تطلب من القاضي إلغاء قرار إداري تعتبره غير شرعي : رفض رخصة، عقوبة تأديبية، نقلة، إلخ.",
      },
      {
        headingFr: "Recours en indemnisation",
        headingAr: "دعوى التعويض",
        bodyFr:
          "Si l'administration vous a causé un préjudice (faute, retard, mauvaise application d'un texte), vous pouvez demander réparation financière.",
        bodyAr:
          "إذا تسببت لك الإدارة في ضرر (خطأ، تأخير، تطبيق سيء لنص قانوني)، يمكن طلب تعويض مالي.",
      },
      {
        headingFr: "Référés administratifs (urgence)",
        headingAr: "الطعون الاستعجالية الإدارية",
        bodyFr:
          "Quand il y a urgence, deux procédures rapides existent : le sursis à exécution (suspendre une décision le temps du procès) et le référé-constat (faire constater une situation par huissier).",
        bodyAr:
          "في حالة الاستعجال، توجد إجراءات سريعة : توقيف التنفيذ (تعليق القرار طيلة المحاكمة) ودعوى المعاينة (إثبات وضعية عن طريق عدل التنفيذ).",
        bulletsFr: [
          "Sursis à exécution : suspendre temporairement la décision attaquée.",
          "Référé-constat : faire constater rapidement une situation matérielle.",
          "Référé-injonction : obtenir une autorisation refusée illégalement.",
        ],
        bulletsAr: [
          "توقيف التنفيذ : تعليق القرار المطعون فيه مؤقتا.",
          "دعوى المعاينة : إثبات وضعية مادية بصفة سريعة.",
          "دعوى الإذن : الحصول على إذن رفض بصفة غير شرعية.",
        ],
      },
      {
        headingFr: "Recours en interprétation",
        headingAr: "دعوى التفسير",
        bodyFr:
          "Quand une décision administrative est ambiguë, le juge peut être saisi pour en clarifier le sens.",
        bodyAr:
          "عندما يكون قرار إداري غامض، يمكن اللجوء للقاضي لتوضيح معناه.",
      },
    ],
  },
  {
    id: "delais",
    icon: Clock,
    categoryFr: "Délais",
    categoryAr: "الآجال",
    titleFr: "Les délais à respecter — 60 jours, 2 mois, 15 ans",
    titleAr: "الآجال التي يجب احترامها — 60 يوما، شهران، 15 سنة",
    descFr:
      "Saisir le juge trop tard, c'est perdre votre droit. Les trois délais essentiels à connaître pour ne pas se retrouver hors-jeu.",
    descAr:
      "اللجوء إلى القاضي بعد فوات الأجل يعني فقدان حقّك. الآجال الثلاثة الأساسية التي يجب معرفتها حتى لا تخرج عن نطاق الإجراء.",
    durationFr: "8 min",
    durationAr: "8 دقائق",
    difficultyFr: "Débutant",
    difficultyAr: "مبتدئ",
    tagsFr: ["60 jours", "2 mois", "15 ans"],
    tagsAr: ["60 يوما", "شهران", "15 سنة"],
    color: "bg-emerald-600",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-700",
    borderColor: "border-emerald-200",
    sections: [
      {
        headingFr: "60 jours pour annuler une décision",
        headingAr: "60 يوما لإلغاء قرار إداري",
        bodyFr:
          "Pour un recours en annulation, vous avez 60 jours à compter de la notification ou de la publication de la décision. Passé ce délai, la décision devient définitive.",
        bodyAr:
          "بالنسبة لدعوى الإلغاء، لديك ستّون يوما بداية من تاريخ تبليغ القرار أو نشره. بعد انقضاء هذا الأجل، يصبح القرار نهائيا.",
      },
      {
        headingFr: "2 mois pour le recours préalable (facultatif)",
        headingAr: "شهران للمطلب المسبق (اختياري)",
        bodyFr:
          "Avant d'aller au tribunal, vous pouvez — ce n'est pas obligatoire — demander à l'administration de revenir sur sa décision (recours préalable). Il doit lui être adressé dans les 2 mois suivant la notification de la décision. L'administration a ensuite 2 mois pour répondre : son silence vaut rejet implicite. À partir du rejet, écrit ou implicite, vous disposez de 2 nouveaux mois pour saisir le Tribunal administratif.",
        bodyAr:
          "قبل اللجوء إلى المحكمة، يمكنك — وهذا اختياري — أن تطلب من الإدارة التراجع في قرارها (مطلب مسبق أو تظلّم). ويجب تقديمه في أجل لا يتجاوز شهرين من تاريخ الإعلام بالقرار. وللإدارة بعد ذلك شهران للإجابة، ويُعدّ سكوتها رفضا ضمنيا. وابتداء من تاريخ الرفض، الصريح أو الضمني، يكون لك أجل جديد بشهرين للطعن أمام المحكمة الإدارية.",
      },
      {
        headingFr: "15 ans pour demander réparation",
        headingAr: "15 سنة لطلب التعويض",
        bodyFr:
          "Pour demander réparation d'un dommage causé par l'administration, le délai est de 15 ans à compter du jour où le dommage s'est produit ou est apparu.",
        bodyAr:
          "لطلب التعويض على ضرر سببته الإدارة، الأجل هو 15 سنة بداية من يوم حدوث الضرر أو ظهوره.",
      },
      {
        headingFr: "À retenir",
        headingAr: "للتذكر",
        bodyFr:
          "Les délais sont d'ordre public : le juge les vérifie d'office. Conservez précieusement les preuves de notification (lettre recommandée, accusé de réception, publication au JORT).",
        bodyAr:
          "الآجال من النظام العام : يتثبّت فيها القاضي تلقائيا. احتفظ بعناية بإثباتات التبليغ (الرسالة المضمونة الوصول، الإشعار، النشر بالرائد الرسمي).",
      },
    ],
  },
  {
    id: "avocat",
    icon: UserCheck,
    categoryFr: "Avocat",
    categoryAr: "المحامي",
    titleFr: "Avocat obligatoire ou pas ?",
    titleAr: "هل المحامي إجباري أم لا ؟",
    descFr:
      "Devant le juge administratif, le ministère d'avocat est obligatoire dans certains cas et facultatif dans d'autres. Le point pour savoir si vous pouvez vous défendre seul.",
    descAr:
      "أمام القاضي الإداري، يكون تعيين المحامي إجباريا في بعض الحالات واختياريا في حالات أخرى. توضيح يُمكّنك من معرفة ما إذا كنت تستطيع الدفاع عن نفسك بنفسك.",
    durationFr: "9 min",
    durationAr: "9 دقائق",
    difficultyFr: "Intermédiaire",
    difficultyAr: "متوسط",
    tagsFr: ["Représentation", "Première instance", "Appel"],
    tagsAr: ["التمثيل", "الدرجة الأولى", "الاستئناف"],
    color: "bg-indigo-600",
    bgColor: "bg-indigo-50",
    textColor: "text-indigo-700",
    borderColor: "border-indigo-200",
    sections: [
      {
        headingFr: "En première instance",
        headingAr: "في الدرجة الأولى",
        bodyFr:
          "Devant les chambres de première instance, le Guide du citoyen distingue trois situations :",
        bodyAr:
          "أمام الدوائر الابتدائية، يميّز دليل المواطن بين ثلاث وضعيات :",
        bulletsFr: [
          "Avocat facultatif : recours en annulation d'une décision, demande de sursis à exécution, demande d'autorisation ou de constat en urgence — vous pouvez déposer la requête seul.",
          "Avocat obligatoire : demande d'indemnisation d'un préjudice causé par l'administration.",
          "Avocat obligatoire : requête qui demande à la fois l'annulation d'une décision et une indemnisation.",
        ],
        bulletsAr: [
          "المحامي غير وجوبي : دعوى إلغاء قرار إداري، مطلب تأجيل وتوقيف التنفيذ، مطلب إذن أو معاينة استعجالية — يمكنك تقديم القضية بمفردك.",
          "المحامي وجوبي : دعوى التعويض عن الأضرار التي تسبّبت فيها الإدارة.",
          "المحامي وجوبي : القضية التي تجمع بين طلب إلغاء قرار وطلب التعويض.",
        ],
      },
      {
        headingFr: "En appel et en cassation",
        headingAr: "في الاستئناف والتعقيب",
        bodyFr:
          "Devant les chambres d'appel et la chambre de cassation, le ministère d'avocat est obligatoire. Vous devez impérativement constituer avocat près du Tribunal Administratif.",
        bodyAr:
          "أمام دوائر الاستئناف ودائرة التعقيب، يكون تعيين المحامي إجباريا. يجب عليك حتما توكيل محامٍ لدى المحكمة الإدارية.",
      },
      {
        headingFr: "Pourquoi un avocat reste recommandé",
        headingAr: "لماذا تبقى الاستعانة بمحامٍ مستحسنة",
        bodyFr:
          "Même quand il n'est pas obligatoire, l'avocat connaît les délais, les formes et la jurisprudence. Une requête mal rédigée peut être rejetée pour des raisons de forme avant même d'être examinée sur le fond.",
        bodyAr:
          "حتى عندما لا يكون إجباريا، فإنّ المحامي يعرف الآجال والأشكال وفقه القضاء. والعريضة المحرَّرة بشكل غير سليم قد تُرفض لأسباب شكلية قبل أن يُنظر في الأصل.",
        bulletsFr: [
          "Maîtrise des délais et de la procédure écrite.",
          "Rédaction des conclusions et constitution du dossier.",
          "Plaidoirie à l'audience.",
        ],
        bulletsAr: [
          "إتقان الآجال والإجراءات الكتابية.",
          "تحرير الملحوظات وتكوين الملف.",
          "المرافعة في الجلسة.",
        ],
      },
    ],
  },
  {
    id: "aide-judiciaire",
    icon: HeartHandshake,
    categoryFr: "Aide judiciaire",
    categoryAr: "الإعانة القضائية",
    titleFr: "Aide judiciaire gratuite",
    titleAr: "الإعانة القضائية المجانية",
    descFr:
      "Si vos revenus ne vous permettent pas de payer un avocat, l'aide judiciaire prend en charge l'avocat et tous les frais de l'affaire : enregistrement, expertise, huissier, traduction, exécution.",
    descAr:
      "إذا كان دخلك لا يسمح لك بتكليف محامٍ، تتكفّل الإعانة القضائية بأتعاب المحامي وبجميع مصاريف القضية : التسجيل والخبرة وعدل التنفيذ والترجمة والتنفيذ.",
    durationFr: "10 min",
    durationAr: "10 دقائق",
    difficultyFr: "Débutant",
    difficultyAr: "مبتدئ",
    tagsFr: ["Revenus modestes", "Avocat désigné", "Frais pris en charge"],
    tagsAr: ["دخل ضعيف", "محامٍ معيَّن", "التكفّل بالمصاريف"],
    color: "bg-purple-600",
    bgColor: "bg-purple-50",
    textColor: "text-purple-700",
    borderColor: "border-purple-200",
    sections: [
      {
        headingFr: "Qui peut en bénéficier ?",
        headingAr: "من يستفيد منها ؟",
        bodyFr:
          "Toute personne résidant en Tunisie, quelle que soit sa nationalité, qui n'a pas de revenus ou dont les revenus ne suffisent pas pour faire valoir ses droits — à condition que la demande en justice soit sérieuse. L'aide peut être demandée avant d'introduire l'affaire, en cours de procédure, pour faire exécuter un jugement ou pour faire appel et se pourvoir en cassation.",
        bodyAr:
          "كل شخص مقيم بالجمهورية التونسية مهما كانت جنسيته، ليس له دخل أو دخله لا يكفي للدفاع عن حقوقه، شرط أن يكون الحق الذي يطالب به جدّيا. ويمكن طلب الإعانة قبل رفع القضية، أو أثناء نشرها، أو لتنفيذ حكم، أو بمناسبة الاستئناف أو التعقيب.",
      },
      {
        headingFr: "Ce qui est pris en charge",
        headingAr: "ما الذي تتكفّل به الإعانة",
        bodyFr:
          "L'aide judiciaire couvre l'ensemble des frais liés à l'affaire :",
        bodyAr:
          "تغطّي الإعانة القضائية جميع المصاريف المتعلّقة بالقضية :",
        bulletsFr: [
          "Droits d'enregistrement.",
          "Honoraires de l'avocat désigné.",
          "Frais de l'expert désigné par le tribunal.",
          "Frais de constats et d'interpellations par huissier de justice.",
          "Frais de convocations et de notifications.",
          "Frais de traduction de documents.",
          "Frais d'exécution des jugements rendus en votre faveur.",
        ],
        bulletsAr: [
          "معاليم التسجيل.",
          "أتعاب المحامي المعيَّن.",
          "مصاريف الخبير الذي تعيّنه المحكمة.",
          "مصاريف المعاينات والاستجوابات التي يقوم بها عدل التنفيذ.",
          "مصاريف الاستدعاءات والإعلامات.",
          "مصاريف ترجمة الوثائق.",
          "مصاريف تنفيذ الأحكام الصادرة لفائدتك.",
        ],
      },
      {
        headingFr: "Comment la demander ?",
        headingAr: "كيف تطلبها ؟",
        bodyFr:
          "La demande se dépose au bureau d'aide judiciaire du Tribunal administratif à Tunis, ou à la chambre régionale dont dépend votre adresse, qui la transmet au bureau de Tunis. Elle indique vos nom et prénom, adresse, profession, situation familiale et un bref exposé de l'affaire. Vous pouvez choisir votre avocat : indiquez son nom et son adresse, avec la preuve qu'il accepte de vous représenter. Pièces à joindre :",
        bodyAr:
          "يُقدَّم المطلب إلى مكتب الإعانة القضائية بمقرّ المحكمة الإدارية بتونس، أو بالدائرة الابتدائية التي يتبعها عنوانك وهي تحيله على مكتب تونس. ويتضمّن الاسم واللقب والعنوان والمهنة والحالة المدنية وتوضيحا مختصرا للقضية. ويمكنك اختيار محاميك : اذكر اسمه وعنوانه مع ما يثبت موافقته على النيابة. الوثائق المرافقة :",
        bulletsFr: [
          "Une pièce d'identité.",
          "Un justificatif d'absence ou d'insuffisance de revenus (certificat d'indigence, déclaration de revenus…).",
          "Les documents sur votre situation sociale (enfants, personnes à charge…).",
          "Les pièces de l'affaire : copie de la décision attaquée, dossier médical en cas d'erreur médicale…",
        ],
        bulletsAr: [
          "وثيقة تثبت الهوية.",
          "ما يثبت انعدام الدخل أو ضعفه (شهادة في الاحتياج، تصريح بالدخل...).",
          "وثائق تثبت الحالة الاجتماعية (أبناء، عائلة في الكفالة...).",
          "مؤيدات الدعوى : نسخة من القرار المطعون فيه، الملف الطبي في صورة خطأ طبي...",
        ],
      },
    ],
  },
  {
    id: "mediateur",
    icon: Users,
    categoryFr: "Médiation",
    categoryAr: "الوساطة",
    titleFr: "Le Médiateur Administratif — résoudre à l'amiable",
    titleAr: "الموفّق الإداري — حلٌّ ودّي قبل المحكمة",
    descFr:
      "Le Médiateur administratif peut intervenir auprès de l'administration pour régler votre problème à l'amiable, ou vous aider à faire exécuter un jugement définitif. Attention : le saisir ne suspend pas les délais de recours.",
    descAr:
      "يمكن للموفّق الإداري أن يتدخّل لدى الإدارة لحلّ مشكلتك بطريقة ودّية، أو لمساعدتك على تنفيذ حكم بات. تنبيه : اللجوء إليه لا يوقف آجال الطعن.",
    durationFr: "8 min",
    durationAr: "8 دقائق",
    difficultyFr: "Débutant",
    difficultyAr: "مبتدئ",
    tagsFr: ["Mode amiable", "Exécution des jugements", "Délais"],
    tagsAr: ["الطريقة الودية", "تنفيذ الأحكام", "الآجال"],
    color: "bg-cyan-600",
    bgColor: "bg-cyan-50",
    textColor: "text-cyan-700",
    borderColor: "border-cyan-200",
    sections: [
      {
        headingFr: "Le rôle du Médiateur",
        headingAr: "دور الموفّق",
        bodyFr:
          "Les « Services du Médiateur administratif » sont un établissement public de l'État. Le citoyen en difficulté avec une administration peut y déposer une plainte pour que le Médiateur intervienne et cherche une solution. Celui qui a obtenu un jugement définitif contre l'administration sans parvenir à le faire exécuter peut aussi le saisir : le Médiateur ne rejuge pas l'affaire, il aide à l'exécution. Ses limites :",
        bodyAr:
          "« مصالح الموفّق الإداري » مؤسسة عمومية تابعة للدولة. يمكن للمواطن الذي له مشكل مع الإدارة أن يقدّم شكاية للموفّق الإداري ليتدخّل لدى الجهة الإدارية بحثا عن حلّ. كما يمكن لمن تحصّل على حكم بات ضدّ الإدارة ولم يتمكّن من تنفيذه أن يلجأ إليه : فالموفّق لا يعيد النظر في النزاع، بل يساعد على تنفيذ الحكم. حدود تدخّله :",
        bulletsFr: [
          "Il n'intervient pas dans les litiges de carrière entre l'administration et ses agents.",
          "Il n'intervient pas dans une affaire encore pendante devant le tribunal.",
          "Il ne réexamine pas un litige déjà jugé.",
        ],
        bulletsAr: [
          "لا يتدخّل في نزاعات الحياة المهنية بين الإدارة وأعوانها.",
          "لا يتدخّل في القضايا التي ما زالت منشورة أمام المحكمة.",
          "لا ينظر في نزاع صدر فيه حكم.",
        ],
      },
      {
        headingFr: "Quand le saisir ?",
        headingAr: "متى نلجأ إليه ؟",
        bodyFr:
          "Quelques exemples tirés du Guide du citoyen :",
        bodyAr:
          "بعض الأمثلة من دليل المواطن :",
        bulletsFr: [
          "Un extrait de casier judiciaire (bulletin n°3) demandé et jamais délivré.",
          "Vérifier le résultat d'un concours et les notes obtenues.",
          "Un jugement définitif contre la CNRPS ou contre une municipalité qui n'est pas exécuté.",
          "Obtenir l'exécution d'un ordre de démolition d'une construction qui vous porte préjudice.",
          "Corriger l'orthographe de votre nom dans l'extrait de naissance en français.",
        ],
        bulletsAr: [
          "مطلب بطاقة عدد 3 لم يقع تسليمها رغم طول الانتظار.",
          "التثبّت في نتيجة مناظرة وفي الأعداد المتحصّل عليها.",
          "حكم بات ضدّ الصندوق الوطني للتقاعد والحيطة الاجتماعية أو ضدّ بلدية لم يقع تنفيذه.",
          "طلب تدخّل الموفّق لدى البلدية لتنفيذ قرار هدم بناية تسبّبت في مضرّة.",
          "إصلاح خطأ في كتابة اللقب بالفرنسية في مضمون الولادة.",
        ],
      },
      {
        headingFr: "Où le trouver ?",
        headingAr: "أين نجده ؟",
        bodyFr:
          "Siège : 85, avenue de la Liberté, 1002 Tunis — tél. +216 71 792 655 — fax +216 71 780 292 — mediateur.administratif@email.ati.tn. Les services centraux reçoivent les plaintes des gouvernorats de Tunis, Ariana, Ben Arous, Manouba, Bizerte, Zaghouan, Béja et Nabeul ; des représentants régionaux couvrent le reste du pays. Attention : une plainte au Médiateur ne vous dispense pas de saisir le tribunal et ne suspend pas les délais — sinon votre recours risque d'être rejeté.",
        bodyAr:
          "المقرّ : 85 شارع الحرية، 1002 تونس — الهاتف : ⁦+216 71 792 655⁩ — الفاكس : ⁦+216 71 780 292⁩ — mediateur.administratif@email.ati.tn. وتقبل المصالح المركزية شكايات مواطني ولايات تونس وأريانة وبن عروس ومنوبة وبنزرت وزغوان وباجة ونابل، فيما يغطّي ممثّلون جهويون بقية الولايات. تنبيه : تقديم شكاية للموفّق الإداري لا يعفيك من رفع القضية أمام المحكمة الإدارية ولا يوقف الآجال، وإلّا فقد تُرفض قضيتك.",
        bulletsFr: [
          "Représentant régional de Sousse : Sousse, Monastir, Mahdia, Kairouan.",
          "Représentant régional de Sfax : Sfax, Gabès, Médenine, Tataouine.",
          "Représentant régional du Kef : Le Kef, Siliana, Jendouba.",
          "Représentant régional de Gafsa : Gafsa, Tozeur, Kébili, Sidi Bouzid, Kasserine.",
        ],
        bulletsAr: [
          "الممثّل الجهوي بسوسة : سوسة، المنستير، المهدية، القيروان.",
          "الممثّل الجهوي بصفاقس : صفاقس، قابس، مدنين، تطاوين.",
          "الممثّل الجهوي بالكاف : الكاف، سليانة، جندوبة.",
          "الممثّل الجهوي بقفصة : قفصة، توزر، قبلي، سيدي بوزيد، القصرين.",
        ],
      },
    ],
  },
];

const CATEGORIES = [
  { id: "all", color: "bg-slate-600", bgColor: "bg-slate-50", labelFr: "Tous", labelAr: "الكل" },
  { id: "organisation", color: "bg-blue-600", bgColor: "bg-blue-50", labelFr: "Organisation", labelAr: "التنظيم" },
  { id: "tribunal-admin", color: "bg-rose-600", bgColor: "bg-rose-50", labelFr: "Tribunal", labelAr: "المحكمة" },
  { id: "quand-saisir", color: "bg-amber-600", bgColor: "bg-amber-50", labelFr: "Recours", labelAr: "الطعون" },
  { id: "delais", color: "bg-emerald-600", bgColor: "bg-emerald-50", labelFr: "Délais", labelAr: "الآجال" },
  { id: "avocat", color: "bg-indigo-600", bgColor: "bg-indigo-50", labelFr: "Avocat", labelAr: "المحامي" },
  { id: "aide-judiciaire", color: "bg-purple-600", bgColor: "bg-purple-50", labelFr: "Aide", labelAr: "الإعانة" },
  { id: "mediateur", color: "bg-cyan-600", bgColor: "bg-cyan-50", labelFr: "Médiateur", labelAr: "الموفق" },
];

const GuidesPratiquesContent = () => {
  const { isRTL } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  // Refs per card so we can scroll the header into view when the user
  // opens a guide — otherwise the accordion pushes the header out of the
  // viewport and the reader starts mid-content.
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  useEffect(() => {
    if (!expandedId) return;
    // Two-frame wait so the layout has committed the newly-expanded card
    // before we ask the browser to scroll — otherwise we scroll to where
    // the collapsed card USED to be.
    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(() => {
        const el = cardRefs.current[expandedId];
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      // Nested rAF cleanup — we only need to clear the outer id, the
      // inner one is queued behind it.
      void raf2;
    });
    return () => cancelAnimationFrame(raf1);
  }, [expandedId]);

  const filteredGuides = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return GUIDES.filter((g) => {
      if (selectedCategory !== "all" && g.id !== selectedCategory) return false;
      if (!q) return true;
      const haystack = [
        g.titleFr,
        g.titleAr,
        g.descFr,
        g.descAr,
        g.categoryFr,
        g.categoryAr,
        ...g.tagsFr,
        ...g.tagsAr,
        ...g.sections.flatMap((s) => [s.headingFr, s.headingAr, s.bodyFr, s.bodyAr]),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [searchTerm, selectedCategory]);

  return (
    <main className={`flex-1 ${isRTL ? "font-almarai" : ""}`}>
      {/* Breadcrumb */}
      <div className="bg-muted/30 py-2">
        <div className="container mx-auto px-4">
          <div className={`flex items-center gap-2 text-sm text-muted-foreground ${isRTL ? "flex-row-reverse justify-end" : ""}`}>
            <span>{isRTL ? "الرئيسية" : "Accueil"}</span>
            <ChevronRight className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} />
            <span>{isRTL ? "النفاذ إلى الحقوق" : "Accès aux Droits"}</span>
            <ChevronRight className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} />
            <span className="text-foreground">{isRTL ? "أدلة عملية" : "Guides Pratiques"}</span>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-b from-background to-muted/40 py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-3xl text-center" dir={isRTL ? "rtl" : "ltr"}>
          <h1 className={`text-2xl md:text-3xl font-bold mb-3 ${isRTL ? "font-almarai" : ""}`}>
            {isRTL ? "دليل المواطن" : "Guide du Citoyen"}
          </h1>
          <p className={`text-base text-muted-foreground ${isRTL ? "font-almarai" : ""}`}>
            {isRTL
              ? "كلّ ما تحتاج إلى معرفته عند نشوب نزاع مع إدارة عمومية : كيف تطعن في قرار، وكيف تطلب التعويض، وكيف تحترم الآجال، وأين تجد من يساعدك. سبعة فصول، شرحٌ مبسَّط، وأمثلة عمليّة."
              : "Tout ce qu'il faut savoir face à un litige avec une administration publique : comment contester une décision, demander une indemnisation, respecter les délais et trouver de l'aide. Sept chapitres, expliqués simplement, avec des exemples concrets."}
          </p>
          <Button asChild size="lg" className="mt-5">
            <a href={GUIDE_PDF_URL} target="_blank" rel="noreferrer">
              <Download className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
              {isRTL ? "تحميل دليل المواطن كاملا (PDF)" : "Télécharger le Guide du citoyen complet (PDF)"}
            </a>
          </Button>
        </div>
      </section>

      <div className="container mx-auto px-4 py-6">
        {/* Admin-managed extras (auto-hidden if 0) */}
        <AdminManagedSection
          kind="practical_guides"
          title={{ fr: "Guides récents", ar: "أدلة حديثة" }}
        />

        {/* Search */}
        <div className="mb-5">
          <div className="relative max-w-md mx-auto">
            <Search className={`absolute ${isRTL ? "right-3" : "left-3"} top-3 h-4 w-4 text-muted-foreground`} />
            <Input
              placeholder={isRTL ? "ابحث في الأدلة…" : "Rechercher dans les guides…"}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={isRTL ? "pr-10 text-right" : "pl-10"}
              dir={isRTL ? "rtl" : "ltr"}
            />
          </div>
        </div>

        {/* Category chips */}
        <div className="mb-8 flex flex-wrap justify-center gap-2" dir={isRTL ? "rtl" : "ltr"}>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const count = cat.id === "all" ? GUIDES.length : GUIDES.filter((g) => g.id === cat.id).length;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  isSelected
                    ? `${cat.color} text-white border-transparent shadow-sm`
                    : `${cat.bgColor} text-foreground border-border hover:shadow-sm`
                } ${isRTL ? "font-almarai" : ""}`}
              >
                {isRTL ? cat.labelAr : cat.labelFr}{" "}
                <span className={`${isSelected ? "opacity-80" : "opacity-60"}`}>({count})</span>
              </button>
            );
          })}
        </div>

        {/* Guides accordion — horizontal cards, click to expand in place */}
        {filteredGuides.length === 0 ? (
          <Card className="p-10 text-center text-muted-foreground">
            {isRTL ? "لم نعثر على أدلّة تطابق بحثك." : "Aucun guide ne correspond à votre recherche."}
          </Card>
        ) : (
          <div className="space-y-3 mb-10 max-w-4xl mx-auto">
            {filteredGuides.map((guide) => {
              const Icon = guide.icon;
              const isOpen = expandedId === guide.id;
              const title = isRTL ? guide.titleAr : guide.titleFr;
              const desc = isRTL ? guide.descAr : guide.descFr;
              const category = isRTL ? guide.categoryAr : guide.categoryFr;
              const duration = isRTL ? guide.durationAr : guide.durationFr;
              const difficulty = isRTL ? guide.difficultyAr : guide.difficultyFr;
              const tags = isRTL ? guide.tagsAr : guide.tagsFr;
              const Visual = GUIDE_VISUALS[guide.id];
              return (
                <Card
                  key={guide.id}
                  ref={(el) => {
                    cardRefs.current[guide.id] = el as HTMLDivElement | null;
                  }}
                  className={`overflow-hidden border transition-all duration-300 scroll-mt-24 ${
                    isOpen ? `${guide.borderColor} shadow-md` : "border-border hover:shadow-sm"
                  } ${guide.bgColor}`}
                >
                  {/* Clickable header (horizontal layout) */}
                  <button
                    type="button"
                    onClick={() => setExpandedId(isOpen ? null : guide.id)}
                    className="w-full text-left p-4 md:p-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    aria-expanded={isOpen}
                    dir={isRTL ? "rtl" : "ltr"}
                  >
                    <div className={`flex items-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
                      {/* Icon */}
                      <div className={`w-12 h-12 ${guide.color} rounded-lg flex items-center justify-center shadow-sm flex-shrink-0`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>

                      {/* Title + description + tags */}
                      <div className="flex-1 min-w-0">
                        <div className={`flex items-center gap-2 mb-1 flex-wrap ${isRTL ? "flex-row-reverse" : ""}`}>
                          <Badge variant="outline" className={`text-[10px] ${guide.textColor} ${guide.borderColor}`}>
                            {category}
                          </Badge>
                          <span className={`text-[10px] text-muted-foreground flex items-center gap-1 ${isRTL ? "flex-row-reverse" : ""}`}>
                            <Clock className="h-3 w-3" />
                            {duration}
                          </span>
                          <span className="text-border text-[10px]">•</span>
                          <span className={`text-[10px] text-muted-foreground flex items-center gap-1 ${isRTL ? "flex-row-reverse" : ""}`}>
                            <CheckCircle2 className="h-3 w-3" />
                            {difficulty}
                          </span>
                        </div>
                        <h3 className={`text-base md:text-lg font-semibold leading-snug mb-1 ${isRTL ? "font-almarai" : ""}`}>
                          {title}
                        </h3>
                        <p className={`text-sm text-muted-foreground line-clamp-1 ${isRTL ? "font-almarai" : ""}`}>
                          {desc}
                        </p>
                        {!isOpen && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className={`text-[10px] ${isRTL ? "font-almarai" : ""}`}>
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Chevron */}
                      <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                        isOpen ? `${guide.color} text-white` : "bg-white/80 text-muted-foreground"
                      }`}>
                        <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                      </div>
                    </div>
                  </button>

                  {/* Expanded content */}
                  {isOpen && (
                    <div
                      className={`px-4 md:px-5 pb-5 border-t ${guide.borderColor} bg-white/50`}
                      dir={isRTL ? "rtl" : "ltr"}
                    >
                      <div className={`space-y-4 pt-4 ${isRTL ? "font-almarai" : ""}`}>
                        {/* Description */}
                        <p className="text-sm text-foreground/90">{desc}</p>

                        {/* SVG data-graphic visualisation */}
                        {Visual && <Visual isRTL={isRTL} />}

                        {/* Sections */}
                        {guide.sections.map((sec, idx) => (
                          <div
                            key={idx}
                            className={`border-l-2 ${guide.borderColor} ${isRTL ? "pr-4 border-l-0 border-r-2" : "pl-4"}`}
                          >
                            <h4 className={`font-semibold mb-2 ${guide.textColor}`}>
                              {isRTL ? sec.headingAr : sec.headingFr}
                            </h4>
                            <p className="text-sm text-foreground/90 leading-relaxed mb-2">
                              {isRTL ? sec.bodyAr : sec.bodyFr}
                            </p>
                            {(isRTL ? sec.bulletsAr : sec.bulletsFr) && (
                              <ul className={`text-sm space-y-1.5 ${isRTL ? "pr-4" : "pl-4"}`}>
                                {(isRTL ? sec.bulletsAr! : sec.bulletsFr!).map((b, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <CheckCircle2 className={`h-3.5 w-3.5 ${guide.textColor} flex-shrink-0 mt-0.5`} />
                                    <span>{b}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}

                        {/* Action row at bottom of expanded card */}
                        <div className={`flex flex-wrap items-center justify-between gap-2 pt-2 border-t ${guide.borderColor}`}>
                          <div className="flex flex-wrap gap-1">
                            {tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className={`text-[10px] ${isRTL ? "font-almarai" : ""}`}>
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className={`flex gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setExpandedId(null)}
                              className={isRTL ? "font-almarai" : ""}
                            >
                              {isRTL ? "طيّ" : "Réduire"}
                            </Button>
                            <Button asChild size="sm" className={isRTL ? "font-almarai" : ""}>
                              <Link to="/acces-aux-droits/assistant-virtuel">
                                {isRTL ? "اسأل المساعد" : "Demander à l'assistant"}
                                <ArrowRight className={`h-3.5 w-3.5 ${isRTL ? "mr-1.5 rotate-180" : "ml-1.5"}`} />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="max-w-2xl mx-auto" dir={isRTL ? "rtl" : "ltr"}>
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-5 md:p-6 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <HeartHandshake className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="flex-1 text-center sm:text-start">
                <h4 className={`font-semibold mb-1 ${isRTL ? "font-almarai" : ""}`}>
                  {isRTL ? "هل ما زلت متردّدا ؟" : "Vous hésitez encore ?"}
                </h4>
                <p className={`text-sm text-muted-foreground ${isRTL ? "font-almarai" : ""}`}>
                  {isRTL
                    ? "اسأل المساعد الافتراضي مباشرة بالعربية أو بالفرنسية"
                    : "Posez votre question à l'assistant virtuel en français ou en arabe"}
                </p>
              </div>
              <Button asChild className={`flex-shrink-0 ${isRTL ? "font-almarai" : ""}`}>
                <Link to="/acces-aux-droits/assistant-virtuel">
                  {isRTL ? "افتح المساعد" : "Ouvrir l'assistant"}
                  <ArrowRight className={`h-4 w-4 ${isRTL ? "mr-1.5 rotate-180" : "ml-1.5"}`} />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

    </main>
  );
};

export default GuidesPratiquesContent;
