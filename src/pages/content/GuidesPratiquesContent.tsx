import { useMemo, useState } from "react";
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
  Shield,
  ArrowRight,
  CheckCircle2,
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
        headingAr: "كيفاش نعرف المحكمة المختصة ؟",
        bodyFr:
          "La question de compétence se pose en deux temps : d'abord la matière (quel ordre ?), puis le ressort géographique (quel tribunal dans cet ordre ?). En cas de doute, le tribunal saisi à tort renvoie le dossier au tribunal compétent.",
        bodyAr:
          "مسألة الاختصاص تطرح على مرحلتين : أولا الموضوع (أي قسم ؟)، ثم المرجع الترابي (أي محكمة في هذا القسم ؟). في صورة الشك، المحكمة المتعهدة خطأ تحيل الملف للمحكمة المختصة.",
      },
    ],
  },
  {
    id: "tribunal-admin",
    icon: Building2,
    categoryFr: "Tribunal administratif",
    categoryAr: "المحكمة الإدارية",
    titleFr: "Le Tribunal Administratif et ses 12 chambres régionales",
    titleAr: "المحكمة الإدارية ودوائرها الإبتدائية الجهوية الـ12",
    descFr:
      "Le Tribunal Administratif siège à Tunis, mais 12 chambres régionales le représentent dans tout le pays. Savoir où aller selon votre lieu de résidence.",
    descAr:
      "المحكمة الإدارية مقرها تونس، لكن 12 دائرة جهوية تمثلها في كامل البلاد. اعرف وين تتوجه حسب مقر سكناك.",
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
          "Le Tribunal Administratif a son siège à Tunis. Pour rapprocher la justice du citoyen, il dispose de 12 chambres de première instance réparties dans les régions.",
        bodyAr:
          "المحكمة الإدارية مقرها تونس. ولتقريب القضاء من المواطن، توجد 12 دائرة ابتدائية موزعة على الجهات.",
      },
      {
        headingFr: "Les 12 chambres régionales",
        headingAr: "الدوائر الإبتدائية الجهوية الـ12",
        bodyFr:
          "Chaque chambre régionale couvre un ou plusieurs gouvernorats. Le rattachement géographique est défini par décret.",
        bodyAr:
          "كل دائرة جهوية تغطي ولاية أو أكثر. الانتماء الجغرافي محدد بأمر.",
        bulletsFr: [
          "Tunis, Ariana, Ben Arous, Manouba",
          "Nabeul, Zaghouan",
          "Bizerte, Béja, Jendouba",
          "Sousse, Monastir, Mahdia",
          "Sfax, Kairouan, Sidi Bouzid",
          "Gabès, Médenine, Tataouine",
          "Gafsa, Tozeur, Kébili",
          "Le Kef, Siliana, Kasserine",
        ],
        bulletsAr: [
          "تونس، أريانة، بن عروس، منوبة",
          "نابل، زغوان",
          "بنزرت، باجة، جندوبة",
          "سوسة، المنستير، المهدية",
          "صفاقس، القيروان، سيدي بوزيد",
          "قابس، مدنين، تطاوين",
          "قفصة، توزر، قبلي",
          "الكاف، سليانة، القصرين",
        ],
      },
      {
        headingFr: "Comment savoir quelle chambre est compétente ?",
        headingAr: "كيفاش نعرف الدائرة المختصة ؟",
        bodyFr:
          "La compétence territoriale dépend du lieu où la décision administrative contestée a été prise, ou du lieu de résidence du requérant pour certains recours. En cas de doute, déposer la requête à la chambre la plus proche : elle la transmettra à la chambre compétente.",
        bodyAr:
          "الاختصاص الترابي يتحدد حسب مكان اتخاذ القرار الإداري المطعون فيه، أو حسب مقر سكنى الطاعن في بعض الطعون. في صورة الشك، يمكن إيداع العريضة لدى أقرب دائرة : هي ترسلها للدائرة المختصة.",
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
    titleAr: "الآجال إلي يلزم نحترموها — 60 يوم، شهرين، 15 سنة",
    descFr:
      "Saisir le juge trop tard, c'est perdre votre droit. Les trois délais essentiels à connaître pour ne pas se retrouver hors-jeu.",
    descAr:
      "اللجوء للقاضي بعد فوات الأجل يعني فقدان حقك. الآجال الثلاثة الأساسية إلي يلزم نعرفوهم باش ما نطلعش خارج الميدان.",
    durationFr: "8 min",
    durationAr: "8 دقائق",
    difficultyFr: "Débutant",
    difficultyAr: "مبتدئ",
    tagsFr: ["60 jours", "2 mois", "15 ans"],
    tagsAr: ["60 يوم", "شهرين", "15 سنة"],
    color: "bg-emerald-600",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-700",
    borderColor: "border-emerald-200",
    sections: [
      {
        headingFr: "60 jours pour annuler une décision",
        headingAr: "60 يوم لإلغاء قرار إداري",
        bodyFr:
          "Pour un recours en annulation, vous avez 60 jours à compter de la notification ou de la publication de la décision. Passé ce délai, la décision devient définitive.",
        bodyAr:
          "بالنسبة لدعوى الإلغاء، عندك 60 يوم بداية من تبليغ القرار أو نشره. بعد هذا الأجل، القرار يصبح نهائي.",
      },
      {
        headingFr: "2 mois pour le recours préalable",
        headingAr: "شهرين للمطلب المسبق",
        bodyFr:
          "Avant la plupart des recours en indemnisation, il faut d'abord adresser une réclamation à l'administration (recours administratif préalable). Celle-ci a 2 mois pour répondre. Son silence vaut rejet.",
        bodyAr:
          "قبل أغلب دعاوى التعويض، يلزم أولا توجيه مطلب للإدارة (الطعن الإداري المسبق). عندها شهرين باش تجاوب. سكوتها يعتبر رفض.",
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
          "الآجال من النظام العام : القاضي يتثبت فيها تلقائيا. احتفظ بدقة بإثباتات التبليغ (الرسالة المضمونة الوصول، الإشعار، النشر بالرائد الرسمي).",
      },
    ],
  },
  {
    id: "avocat",
    icon: UserCheck,
    categoryFr: "Avocat",
    categoryAr: "المحامي",
    titleFr: "Avocat obligatoire ou pas ?",
    titleAr: "المحامي إجباري ولا لا ؟",
    descFr:
      "Devant le juge administratif, le ministère d'avocat est obligatoire dans certains cas et facultatif dans d'autres. Le point pour savoir si vous pouvez vous défendre seul.",
    descAr:
      "أمام القاضي الإداري، تعيين محامي إجباري في حالات وغير إجباري في حالات أخرى. وضوح للمعرفة هل تستطيع الدفاع عن نفسك بنفسك.",
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
          "Devant les chambres de première instance, le ministère d'avocat n'est pas systématiquement obligatoire pour certains recours simples (notamment référés et requêtes administratives de routine). Le citoyen peut se présenter seul.",
        bodyAr:
          "أمام الدوائر الإبتدائية، تعيين محامي ليس إجباري بصفة آلية في بعض الطعون البسيطة (خاصة الاستعجالي والعرائض الإدارية العادية). المواطن يمكن يحضر بمفرده.",
      },
      {
        headingFr: "En appel et en cassation",
        headingAr: "في الاستئناف والتعقيب",
        bodyFr:
          "Devant les chambres d'appel et la chambre de cassation, le ministère d'avocat est obligatoire. Vous devez impérativement constituer avocat près du Tribunal Administratif.",
        bodyAr:
          "أمام دوائر الاستئناف ودائرة التعقيب، تعيين محامي إجباري. يلزمك حتما تنيب محامي لدى المحكمة الإدارية.",
      },
      {
        headingFr: "Pourquoi un avocat reste recommandé",
        headingAr: "لماذا يبقى المحامي مستحسن",
        bodyFr:
          "Même quand il n'est pas obligatoire, l'avocat connaît les délais, les formes et la jurisprudence. Une requête mal rédigée peut être rejetée pour des raisons de forme avant même d'être examinée sur le fond.",
        bodyAr:
          "حتى لما ما يكونش إجباري، المحامي يعرف الآجال والأشكال وفقه القضاء. عريضة محررة بشكل غير سليم يمكن ترفض لأسباب شكلية قبل ما تنظر في الأصل.",
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
    categoryFr: "Aide juridictionnelle",
    categoryAr: "الإعانة العدلية",
    titleFr: "Aide juridictionnelle gratuite",
    titleAr: "الإعانة العدلية المجانية",
    descFr:
      "Si vos revenus sont insuffisants pour payer un avocat, l'État prend en charge votre défense, les frais d'huissier, d'expertise et de traduction.",
    descAr:
      "إذا كان دخلك ما يكفيش باش تخلص محامي، الدولة تتكفل بالدفاع عنك وأتعاب عدل التنفيذ والخبراء والترجمة.",
    durationFr: "10 min",
    durationAr: "10 دقائق",
    difficultyFr: "Débutant",
    difficultyAr: "مبتدئ",
    tagsFr: ["Revenus modestes", "État", "Prise en charge"],
    tagsAr: ["دخل ضعيف", "الدولة", "التكفل"],
    color: "bg-purple-600",
    bgColor: "bg-purple-50",
    textColor: "text-purple-700",
    borderColor: "border-purple-200",
    sections: [
      {
        headingFr: "Qui peut en bénéficier ?",
        headingAr: "شكون يستفيد منها ؟",
        bodyFr:
          "Toute personne dont les revenus sont insuffisants pour faire valoir ses droits en justice. Les seuils sont fixés par décret et révisés régulièrement.",
        bodyAr:
          "كل شخص دخله ما يكفيش باش يتمتع بحقوقه أمام القضاء. الحدود تحدد بأمر وتراجع بصفة دورية.",
      },
      {
        headingFr: "Ce que l'État prend en charge",
        headingAr: "آش تتكفل به الدولة",
        bodyFr:
          "L'aide juridictionnelle couvre l'ensemble des frais nécessaires à la procédure :",
        bodyAr:
          "الإعانة العدلية تغطي كل المصاريف الضرورية للإجراءات :",
        bulletsFr: [
          "Honoraires de l'avocat désigné.",
          "Frais d'huissier de justice.",
          "Frais d'expertise et de constat.",
          "Frais de traduction (français / arabe / langue étrangère).",
          "Frais d'exécution des jugements.",
        ],
        bulletsAr: [
          "أتعاب المحامي المعين.",
          "أتعاب عدل التنفيذ.",
          "مصاريف الخبرة والمعاينة.",
          "مصاريف الترجمة (الفرنسية / العربية / لغة أجنبية).",
          "مصاريف تنفيذ الأحكام.",
        ],
      },
      {
        headingFr: "Comment la demander ?",
        headingAr: "كيفاش تطلبها ؟",
        bodyFr:
          "Le dossier de demande se dépose au bureau d'aide juridictionnelle du tribunal compétent. Il comprend une demande écrite, un justificatif de revenus, et une copie de la décision contestée le cas échéant.",
        bodyAr:
          "ملف الطلب يودع بمكتب الإعانة العدلية بالمحكمة المختصة. يحتوي مطلب كتابي، إثبات الدخل، ونسخة من القرار المطعون فيه عند الاقتضاء.",
      },
    ],
  },
  {
    id: "mediateur",
    icon: Users,
    categoryFr: "Médiation",
    categoryAr: "الوساطة",
    titleFr: "Le Médiateur Administratif — résoudre à l'amiable",
    titleAr: "الموفق الإداري — حل ودي قبل المحكمة",
    descFr:
      "Avant d'aller au tribunal, le Médiateur Administratif peut intervenir auprès de l'administration pour résoudre votre problème à l'amiable. Gratuit et plus rapide.",
    descAr:
      "قبل التوجه للمحكمة، الموفق الإداري يتدخل لدى الإدارة لحل المشكل بطريقة ودية. مجاني وأسرع.",
    durationFr: "8 min",
    durationAr: "8 دقائق",
    difficultyFr: "Débutant",
    difficultyAr: "مبتدئ",
    tagsFr: ["Mode amiable", "Gratuit", "Recours préalable"],
    tagsAr: ["الطريقة الودية", "مجاني", "الطعن المسبق"],
    color: "bg-cyan-600",
    bgColor: "bg-cyan-50",
    textColor: "text-cyan-700",
    borderColor: "border-cyan-200",
    sections: [
      {
        headingFr: "Le rôle du Médiateur",
        headingAr: "دور الموفق",
        bodyFr:
          "Le Médiateur Administratif est une institution indépendante chargée de faciliter le dialogue entre le citoyen et l'administration. Il ne juge pas — il propose une solution équitable.",
        bodyAr:
          "الموفق الإداري مؤسسة مستقلة مكلفة بتسهيل الحوار بين المواطن والإدارة. هو ما يحكمش — يقترح حل عادل.",
      },
      {
        headingFr: "Quand le saisir ?",
        headingAr: "متى نلجأ ليه ؟",
        bodyFr:
          "Vous pouvez saisir le Médiateur quand vous estimez que l'administration a mal traité votre demande, mais avant ou parallèlement à un recours juridictionnel.",
        bodyAr:
          "يمكنك اللجوء للموفق عندما تعتبر أن الإدارة عاملتك بطريقة سيئة، قبل أو بالتوازي مع طعن قضائي.",
        bulletsFr: [
          "Refus injustifié de l'administration.",
          "Silence prolongé sur votre demande.",
          "Application abusive d'un texte.",
          "Délais excessifs de traitement.",
        ],
        bulletsAr: [
          "رفض غير مبرر من الإدارة.",
          "صمت مطول على طلبك.",
          "تطبيق تعسفي لنص قانوني.",
          "آجال مفرطة للمعالجة.",
        ],
      },
      {
        headingFr: "Comment le saisir ?",
        headingAr: "كيفاش نلجأ ليه ؟",
        bodyFr:
          "La saisine est gratuite. Une lettre simple exposant les faits, les démarches déjà entreprises, et accompagnée des pièces justificatives, suffit. Aucun avocat n'est nécessaire.",
        bodyAr:
          "اللجوء مجاني. رسالة بسيطة تشرح الوقائع والإجراءات إلي قمت بها، ومرفقة بالوثائق المؤيدة، تكفي. ما يلزمش محامي.",
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
          <Badge variant="outline" className="mb-3 gap-1.5">
            <Shield className="h-3 w-3" />
            {isRTL ? "دليل المواطن" : "Guide du citoyen"}
          </Badge>
          <h1 className={`text-2xl md:text-3xl font-bold mb-3 ${isRTL ? "font-almarai" : ""}`}>
            {isRTL ? "النفاذ إلى القضاء الإداري" : "Accès au juge administratif"}
          </h1>
          <p className={`text-base text-muted-foreground ${isRTL ? "font-almarai" : ""}`}>
            {isRTL
              ? "كل ما يلزمك تعرفو كي يبدى عندك مشكل مع إدارة عمومية : كيفاش تطعن في قرار، تطلب تعويض، تحترم الآجال، وتلقى من يعاونك. سبعة فصول، تفسير بسيط، أمثلة عملية."
              : "Tout ce qu'il faut savoir face à un litige avec une administration publique : comment contester une décision, demander une indemnisation, respecter les délais et trouver de l'aide. Sept chapitres, expliqués simplement, avec des exemples concrets."}
          </p>
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
            {isRTL ? "ما لقيناش أدلة توافق بحثك." : "Aucun guide ne correspond à votre recherche."}
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
                  className={`overflow-hidden border transition-all duration-300 ${
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
                              {isRTL ? "إغلاق" : "Réduire"}
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
                  {isRTL ? "ما زلت في حيرة ؟" : "Vous hésitez encore ?"}
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
