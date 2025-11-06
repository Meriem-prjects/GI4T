import { useLanguage } from '@/contexts/LanguageContext';

type TranslationKey = 
  // Homepage
  | 'tagline'
  | 'whoWeAre'
  | 'news'
  | 'faqChatbot'
  | 'observatoryTitle'
  | 'observatoryDescription'
  | 'searchPlaceholder'
  | 'accessToAdminLaw'
  | 'accessDescription'
  | 'interactiveMap'
  | 'newsSection'
  | 'readMore'
  | 'stayInformed'
  | 'yourEmail'
  | 'newsletter'
  | 'allRightsReserved'
  | 'developedBy'
  | 'contact'
  | 'legal'
  | 'sitemap'
  | 'social'
  | 'terms'
  | 'observatory'
  | 'awarenessСampaign'
  | 'practicalGuide'
  // Layout & Navigation
  | 'accessToRights'
  | 'citizenSpace'
  | 'mediaLibrary'
  | 'actualites'
  | 'home'
  | 'usefulAddresses'
  | 'photoAlbums'
  | 'faq'
  | 'virtualAssistant'
  | 'practicalResources'
  | 'usefulLinks'
  | 'practicalGuides'
  | 'homepage'
  // Sub-navigation
  | 'locateServices'
  | 'organizationsContacts'
  | 'videosTestimonies'
  | 'eventsGallery'
  | 'latestNews'
  | 'formsModels'
  | 'externalSites'
  | 'stepByStepGuides'
  | 'realTimeChat'
  | 'frequentQuestions'
  // Footer
  | 'followUs'
  | 'subscribe'
  | 'navigation'
  | 'observatoryOfRights'
  | 'accessRights'
  | 'publications'
  | 'about'
  | 'legalNotice'
  | 'privacy'
  | 'terms'
  | 'siteMap'
  | 'yourPlatform'
  // AccesAuxDroits page
  | 'quickAccess'
  | 'guidesStepByStep'
  | 'formsModelsDocuments'
  | 'findServicesNearYou'
  | 'explanatoryVideos'
  | 'yourRightsByCategory'
  | 'housingRight'
  | 'housingDesc'
  | 'workRight'
  | 'workDesc'
  | 'healthRight'
  | 'healthDesc'
  | 'educationRight'
  | 'educationDesc'
  | 'socialRights'
  | 'socialDesc'
  | 'freedomExpression'
  | 'freedomDesc'
  | 'cases'
  | 'explore'
  // Content pages - Common
  | 'search'
  | 'searchDot'
  | 'all'
  | 'category'
  | 'noResults'
  | 'loading'
  | 'featured'
  // Carte Interactive
  | 'mapInteractiveTitle'
  | 'mapDescription'
  | 'events'
  | 'actionCompleted'
  | 'upcomingEvent'
  | 'completedActions'
  | 'upcomingEvents'
  | 'allEvents'
  | 'location'
  | 'date'
  | 'impact'
  | 'legend'
  // Adresses Utiles
  | 'usefulAddressesTitle'
  | 'usefulAddressesDesc'
  | 'selectGovernorate'
  | 'governorate'
  | 'address'
  | 'phone'
  | 'email'
  | 'openingHours'
  // Guides Pratiques
  | 'practicalGuidesTitle'
  | 'practicalGuidesDesc'
  | 'read'
  | 'download'
  | 'minutes'
  | 'needHelp'
  | 'needHelpDesc'
  | 'contactUs'
  // Resources Pratiques
  | 'practicalResourcesTitle'
  | 'practicalResourcesDesc'
  | 'format'
  | 'downloads'
  | 'featuredResources'
  | 'allResources'
  // Liens Utiles
  | 'usefulLinksTitle'
  | 'usefulLinksDesc'
  | 'verified'
  | 'suggestLink'
  | 'suggestLinkDesc'
  // Publications
  | 'publicationsTitle'
  | 'publicationsDesc'
  // Albums Photos
  | 'photoAlbumsTitle'
  | 'photoAlbumsDesc'
  | 'photos'
  | 'albums'
  | 'totalPhotos'
  | 'totalAlbums'
  // Mediatheque
  | 'mediaLibraryTitle'
  | 'mediaLibraryDesc'
  | 'type'
  | 'video'
  | 'podcast'
  | 'testimony'
  | 'views'
  | 'duration'
  | 'watch'
  | 'listen'
  | 'shareStory'
  | 'shareStoryDesc'
  // Categories and filters
  | 'allCategories'
  | 'family'
  | 'health'
  | 'employment'
  | 'finances'
  | 'housing'
  | 'justice'
  | 'immigration'
  | 'interviews'
  | 'documentaries'
  | 'trainings'
  | 'podcasts'
  | 'tutorials'
  | 'testimonials'
  | 'webinar'
  | 'audio'
  | 'ceremonies'
  | 'workshops'
  | 'conferences'
  | 'campaigns'
  | 'eventsCategory'
  // News categories
  | 'services'
  | 'training'
  // Difficulty levels
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  // Miscellaneous
  | 'finances'
  // Guide content
  | 'guideJobSeeker'
  | 'guideJobSeekerDesc'
  | 'guideHousingRights'
  | 'guideHousingRightsDesc'
  | 'guideHealthAccess'
  | 'guideHealthAccessDesc'
  | 'guideFamilyRights'
  | 'guideFamilyRightsDesc'
  | 'guideLegalAid'
  | 'guideLegalAidDesc'
  | 'guideForeigners'
  | 'guideForeignersDesc'
  // Resource content
  | 'resourceOverdebtFile'
  | 'resourceOverdebtFileDesc'
  | 'resourceLegalAidForm'
  | 'resourceLegalAidFormDesc'
  | 'resourceEvictionLetter'
  | 'resourceEvictionLetterDesc'
  | 'resourceJobCenterClaim'
  | 'resourceJobCenterClaimDesc'
  | 'resourceSocialHousingRequest'
  | 'resourceSocialHousingRequestDesc'
  | 'resourceFineContestation'
  | 'resourceFineContestationDesc'
  | 'letterType'
  | 'formType'
  | 'dossierType'
  // Tags
  | 'tagPoleEmploi'
  | 'tagAllocation'
  | 'tagFormation'
  | 'tagAPL'
  | 'tagBailleur'
  | 'tagExpulsion'
  | 'tagCMU'
  | 'tagSecuriteSociale'
  | 'tagMedecin'
  | 'tagCAF'
  | 'tagEcole'
  | 'tagGarde'
  | 'tagAvocat'
  | 'tagTribunal'
  | 'tagGratuit'
  | 'tagPrefecture'
  | 'tagVisa'
  | 'tagNaturalisation'
  // Information Pages
  | 'information'
  | 'whoWeAreSubtitle'
  | 'ourMission'
  | 'ourMissionText'
  | 'ourVision'
  | 'ourVisionText'
  | 'ourValues'
  | 'accessibility'
  | 'accessibilityText'
  | 'transparency'
  | 'transparencyText'
  | 'engagement'
  | 'engagementText'
  | 'ourTeam'
  | 'legalExperts'
  | 'legalExpertsText'
  | 'developers'
  | 'developersText'
  | 'community'
  | 'communityText'
  | 'joinMission'
  | 'joinMissionText'
  | 'discoverObservatory'
  | 'accessResources'
  // News Page
  | 'legalNews'
  | 'legalNewsSubtitle'
  | 'receiveNewsByEmail'
  | 'subscribe'
  | 'categories'
  | 'featuredArticle'
  | 'readArticle'
  | 'loadMoreArticles'
  | 'laborLaw'
  | 'civilStatus'
  | 'housingRights'
  | 'familyLaw'
  // FAQ & Chatbot Page
  | 'faqChatbotSubtitle'
  | 'searchInFAQ'
  | 'popularQuestions'
  | 'chatWithAssistant'
  | 'askLegalQuestions'
  | 'typeYourQuestion'
  | 'assistantAvailable'
  | 'needMoreHelp'
  | 'needMoreHelpText'
  | 'consultGuides'
  | 'accessObservatory';

const translations: Record<'fr' | 'ar', Record<TranslationKey, string>> = {
  fr: {
    // Homepage
    tagline: 'Plateforme citoyenne de la jurisprudence administrative et constitutionnelle',
    whoWeAre: 'Qui sommes-nous',
    news: 'Actualités',
    faqChatbot: 'FAQ/Chatbot',
    observatoryTitle: 'Observatoire des Droits Fondamentaux',
    observatoryDescription: 'Consultez, analysez et comprenez la jurisprudence tunisienne sur les droits fondamentaux',
    searchPlaceholder: 'Rechercher une décision, un mot-clé...',
    accessToAdminLaw: 'Accès au droit administratif',
    accessDescription: 'Comprendre ses droits, savoir comment agir : des outils concrets pour tous les citoyens',
    interactiveMap: 'Carte interactive',
    newsSection: 'Actualités',
    readMore: 'Lire la suite...',
    stayInformed: 'Restez informés',
    yourEmail: 'Votre email',
    newsletter: 'NEWSLETTER',
    allRightsReserved: 'Tous droits réservés',
    developedBy: 'Developed by Feelinx',
    contact: 'Contact',
    legal: 'Mentions légales',
    sitemap: 'Plan du site',
    social: 'Réseaux sociaux',
    terms: 'Conditions',
    observatory: 'Mرصد',
    awarenessСampaign: 'Campagne de sensibilisation',
    practicalGuide: 'Guide pratique',
    // Layout & Navigation
    accessToRights: 'Accès aux Droits',
    citizenSpace: 'Espace citoyen',
    mediaLibrary: 'Médiathèque',
    actualites: 'Actualités',
    home: 'Accueil',
    usefulAddresses: 'Adresses utiles',
    photoAlbums: 'Albums photos',
    faq: 'FAQ',
    virtualAssistant: 'Assistant Virtuel',
    practicalResources: 'Ressources pratiques',
    usefulLinks: 'Liens utiles',
    practicalGuides: 'Guides pratiques',
    homepage: 'Page d\'accueil',
    // Sub-navigation
    locateServices: 'Localiser les services',
    organizationsContacts: 'Organismes et contacts',
    videosTestimonies: 'Vidéos et témoignages',
    eventsGallery: 'Galerie événements',
    latestNews: 'Dernières nouvelles',
    formsModels: 'Modèles et formulaires',
    externalSites: 'Sites externes',
    stepByStepGuides: 'Guides step-by-step',
    realTimeChat: 'Chat en temps réel',
    frequentQuestions: 'Questions fréquentes',
    // Footer
    followUs: 'Suivez-nous',
    subscribe: 'S\'ABONNER',
    navigation: 'Navigation',
    observatoryOfRights: 'Observatoire des droits',
    accessRights: 'Accès aux droits',
    publications: 'Publications',
    about: 'À propos',
    legalNotice: 'Mentions légales',
    privacy: 'Politique de confidentialité',
    siteMap: 'Plan du site',
    yourPlatform: 'Votre plateforme d\'information citoyenne en Tunisie. Accédez facilement à vos droits et aux services administratifs.',
    // AccesAuxDroits page
    quickAccess: 'Accès rapide',
    guidesStepByStep: 'Guides step-by-step pour exercer vos droits',
    formsModelsDocuments: 'Modèles, formulaires et documents utiles',
    findServicesNearYou: 'Trouvez les services près de chez vous',
    explanatoryVideos: 'Vidéos explicatives et témoignages',
    yourRightsByCategory: 'Vos droits par catégorie',
    housingRight: 'Droit au logement',
    housingDesc: 'Location, expulsion, aides au logement',
    workRight: 'Droit au travail',
    workDesc: 'Emploi, discrimination, conditions de travail',
    healthRight: 'Droit à la santé',
    healthDesc: 'Accès aux soins, protection sociale',
    educationRight: 'Droit à l\'éducation',
    educationDesc: 'Scolarité, formation professionnelle',
    socialRights: 'Droits sociaux',
    socialDesc: 'Prestations, handicap, famille',
    freedomExpression: 'Liberté d\'expression',
    freedomDesc: 'Presse, manifestation, association',
    cases: 'cas',
    explore: 'Explorer',
    // Content pages - Common
    search: 'Rechercher',
    searchDot: 'Rechercher...',
    all: 'Tous',
    category: 'Catégorie',
    noResults: 'Aucun résultat trouvé',
    loading: 'Chargement...',
    featured: 'À la une',
    // Carte Interactive
    mapInteractiveTitle: 'Carte Interactive',
    mapDescription: 'Découvrez les actions et événements d\'accès aux droits sur l\'ensemble du territoire tunisien',
    events: 'Événements',
    actionCompleted: 'Action réalisée',
    upcomingEvent: 'Événement à venir',
    completedActions: 'Actions réalisées',
    upcomingEvents: 'Événements à venir',
    allEvents: 'Tous',
    location: 'Lieu',
    date: 'Date',
    impact: 'Impact',
    legend: 'Légende',
    // Adresses Utiles
    usefulAddressesTitle: 'Adresses Utiles',
    usefulAddressesDesc: 'Trouvez les coordonnées des organismes et services qui peuvent vous aider',
    selectGovernorate: 'Sélectionner un gouvernorat',
    governorate: 'Gouvernorat',
    address: 'Adresse',
    phone: 'Téléphone',
    email: 'Email',
    openingHours: 'Horaires d\'ouverture',
    // Guides Pratiques
    practicalGuidesTitle: 'Guides Pratiques',
    practicalGuidesDesc: 'Des guides step-by-step pour comprendre et exercer vos droits',
    read: 'Lire',
    download: 'Télécharger',
    minutes: 'min',
    needHelp: 'Besoin d\'aide ?',
    needHelpDesc: 'Notre équipe est là pour vous accompagner',
    contactUs: 'Contactez-nous',
    // Resources Pratiques
    practicalResourcesTitle: 'Ressources Pratiques',
    practicalResourcesDesc: 'Modèles, formulaires et documents pour vous accompagner',
    format: 'Format',
    downloads: 'téléchargements',
    featuredResources: 'Ressources à la une',
    allResources: 'Toutes les ressources',
    // Liens Utiles
    usefulLinksTitle: 'Liens Utiles',
    usefulLinksDesc: 'Retrouvez tous les sites et ressources externes utiles',
    verified: 'Vérifié',
    suggestLink: 'Suggérer un lien',
    suggestLinkDesc: 'Vous connaissez un site ou une ressource utile ? Aidez-nous à enrichir notre liste',
    // Publications
    publicationsTitle: 'Publications',
    publicationsDesc: 'Rapports, guides et analyses sur l\'accès aux droits',
    // Albums Photos
    photoAlbumsTitle: 'Albums Photos',
    photoAlbumsDesc: 'Découvrez nos actions en images',
    photos: 'photos',
    albums: 'albums',
    totalPhotos: 'Total photos',
    totalAlbums: 'Total albums',
    // Mediatheque
    mediaLibraryTitle: 'Médiathèque',
    mediaLibraryDesc: 'Vidéos, podcasts et témoignages sur l\'accès aux droits',
    type: 'Type',
    video: 'Vidéo',
    podcast: 'Podcast',
    testimony: 'Témoignage',
    views: 'vues',
    duration: 'Durée',
    watch: 'Regarder',
    listen: 'Écouter',
    shareStory: 'Partagez votre histoire',
    shareStoryDesc: 'Vous avez un témoignage à partager ?',
    // Categories and filters
    allCategories: 'Tous',
    family: 'Famille',
    health: 'Santé',
    employment: 'Emploi',
    finances: 'Finances',
    housing: 'Logement',
    justice: 'Justice',
    immigration: 'Immigration',
    interviews: 'Interviews',
    documentaries: 'Documentaires',
    trainings: 'Formations',
    podcasts: 'Podcasts',
    tutorials: 'Tutoriels',
    testimonials: 'Témoignages',
    webinar: 'Webinaire',
    audio: 'Audio',
    ceremonies: 'Cérémonies',
    workshops: 'Ateliers',
    conferences: 'Conférences',
    campaigns: 'Campagnes',
    eventsCategory: 'Événements',
    // News categories
    services: 'Services',
    training: 'Formation',
    // Difficulty levels
    beginner: 'Débutant',
    intermediate: 'Intermédiaire',
    advanced: 'Avancé',
    // Information Pages
    information: 'Information',
    whoWeAreSubtitle: 'JustClic.tn est une plateforme citoyenne dédiée à simplifier l\'accès à l\'information juridique et aux droits fondamentaux en Tunisie.',
    ourMission: 'Notre Mission',
    ourMissionText: 'Démocratiser l\'accès à l\'information juridique et faciliter l\'exercice des droits fondamentaux pour tous les citoyens tunisiens, en simplifiant des procédures complexes et en fournissant des ressources pratiques et accessibles.',
    ourVision: 'Notre Vision',
    ourVisionText: 'Créer une société tunisienne où chaque citoyen connaît ses droits, peut les exercer pleinement et a accès à une justice équitable, grâce à une information claire, fiable et facilement accessible.',
    ourValues: 'Nos Valeurs',
    accessibility: 'Accessibilité',
    accessibilityText: 'Information simple et compréhensible pour tous',
    transparency: 'Transparence',
    transparencyText: 'Sources fiables et vérifiées',
    engagement: 'Engagement',
    engagementText: 'Soutien constant aux citoyens',
    ourTeam: 'Notre Équipe',
    legalExperts: 'Experts Juridiques',
    legalExpertsText: 'Avocats et juristes spécialisés dans le droit tunisien',
    developers: 'Développeurs',
    developersText: 'Équipe technique dédiée à l\'amélioration continue de la plateforme',
    community: 'Communauté',
    communityText: 'Citoyens actifs contribuant à l\'enrichissement du contenu',
    joinMission: 'Rejoignez notre mission',
    joinMissionText: 'Ensemble, construisons une Tunisie où l\'information juridique est accessible à tous. Explorez nos ressources et découvrez comment exercer vos droits.',
    discoverObservatory: 'Découvrir l\'Observatoire',
    accessResources: 'Accéder aux Ressources',
    // News Page
    legalNews: 'Actualités Juridiques',
    legalNewsSubtitle: 'Restez informé des dernières évolutions juridiques, nouvelles procédures et réformes qui impactent vos droits en Tunisie.',
    receiveNewsByEmail: 'Recevez nos actualités par email',
    categories: 'Catégories',
    featuredArticle: 'Article à la Une',
    readArticle: 'Lire l\'article',
    loadMoreArticles: 'Charger plus d\'articles',
    laborLaw: 'Droit du travail',
    civilStatus: 'État civil',
    housingRights: 'Droit au logement',
    familyLaw: 'Droit de la famille',
    // FAQ & Chatbot Page
    faqChatbotSubtitle: 'Trouvez rapidement des réponses à vos questions juridiques ou discutez avec notre assistant virtuel.',
    searchInFAQ: 'Rechercher dans la FAQ...',
    popularQuestions: 'Questions populaires',
    chatWithAssistant: 'Discutez avec notre assistant',
    askLegalQuestions: 'Posez vos questions juridiques en temps réel',
    typeYourQuestion: 'Tapez votre question...',
    assistantAvailable: 'Notre assistant est disponible 24h/24 pour répondre à vos questions',
    needMoreHelp: 'Besoin d\'aide supplémentaire ?',
    needMoreHelpText: 'Si vous ne trouvez pas la réponse à votre question, n\'hésitez pas à explorer nos autres ressources.',
    consultGuides: 'Consulter les Guides',
    accessObservatory: 'Accéder à l\'Observatoire',
    // Guide content
    guideJobSeeker: 'Guide du demandeur d\'emploi',
    guideJobSeekerDesc: 'Tout savoir sur vos droits en tant que demandeur d\'emploi : inscription, allocation, accompagnement.',
    guideHousingRights: 'Comprendre ses droits au logement',
    guideHousingRightsDesc: 'Les différentes aides au logement, les recours en cas de problème avec le propriétaire.',
    guideHealthAccess: 'Accès aux soins de santé',
    guideHealthAccessDesc: 'Navigation dans le système de santé français, CMU, ACS et accès aux spécialistes.',
    guideFamilyRights: 'Droits de la famille et enfance',
    guideFamilyRightsDesc: 'Allocations familiales, garde d\'enfants, scolarité et protection de l\'enfance.',
    guideLegalAid: 'Aide juridictionnelle',
    guideLegalAidDesc: 'Comment bénéficier de l\'aide juridictionnelle, les conditions et la procédure.',
    guideForeigners: 'Étrangers en France',
    guideForeignersDesc: 'Titre de séjour, naturalisation, regroupement familial et droits sociaux.',
    // Resource content
    resourceOverdebtFile: 'Dossier de surendettement',
    resourceOverdebtFileDesc: 'Kit complet pour constituer un dossier de surendettement',
    resourceLegalAidForm: 'Formulaire de demande d\'aide juridictionnelle',
    resourceLegalAidFormDesc: 'Modèle pré-rempli pour faire une demande d\'aide juridictionnelle',
    resourceEvictionLetter: 'Lettre type de contestation d\'expulsion',
    resourceEvictionLetterDesc: 'Modèle de courrier pour contester une procédure d\'expulsion locative',
    resourceJobCenterClaim: 'Réclamation Pôle emploi',
    resourceJobCenterClaimDesc: 'Modèle de réclamation en cas de problème avec Pôle emploi',
    resourceSocialHousingRequest: 'Demande de logement social',
    resourceSocialHousingRequestDesc: 'Formulaire et pièces justificatives pour une demande de logement social',
    resourceFineContestation: 'Contestation d\'amende',
    resourceFineContestationDesc: 'Modèle de courrier pour contester une amende forfaitaire',
    letterType: 'Lettre type',
    formType: 'Formulaire',
    dossierType: 'Dossier',
    // Tags
    tagPoleEmploi: 'Pôle emploi',
    tagAllocation: 'Allocation',
    tagFormation: 'Formation',
    tagAPL: 'APL',
    tagBailleur: 'Bailleur',
    tagExpulsion: 'Expulsion',
    tagCMU: 'CMU',
    tagSecuriteSociale: 'Sécurité sociale',
    tagMedecin: 'Médecin',
    tagCAF: 'CAF',
    tagEcole: 'École',
    tagGarde: 'Garde',
    tagAvocat: 'Avocat',
    tagTribunal: 'Tribunal',
    tagGratuit: 'Gratuit',
    tagPrefecture: 'Préfecture',
    tagVisa: 'Visa',
    tagNaturalisation: 'Naturalisation',
  },
  ar: {
    // Homepage
    tagline: 'منصة المواطن للفقه القضائي الإداري والدستوري',
    whoWeAre: 'من نحن',
    news: 'الأخبار',
    faqChatbot: 'الأسئلة الشائعة/روبوت المحادثة',
    observatoryTitle: 'مرصد الحقوق الأساسية',
    observatoryDescription: 'استشر، حلل وافهم الفقه القضائي التونسي بشأن الحقوق الأساسية',
    searchPlaceholder: 'ابحث عن قرار، كلمة مفتاحية...',
    accessToAdminLaw: 'الوصول إلى القانون الإداري',
    accessDescription: 'فهم حقوقك، ومعرفة كيفية التصرف: أدوات ملموسة لجميع المواطنين',
    interactiveMap: 'خريطة تفاعلية',
    newsSection: 'الأخبار',
    readMore: 'اقرأ المزيد...',
    stayInformed: 'ابق على اطلاع',
    yourEmail: 'بريدك الإلكتروني',
    newsletter: 'النشرة الإخبارية',
    allRightsReserved: 'جميع الحقوق محفوظة',
    developedBy: 'تم التطوير بواسطة Feelinx',
    contact: 'اتصل بنا',
    legal: 'الإشعارات القانونية',
    sitemap: 'خريطة الموقع',
    social: 'وسائل التواصل الاجتماعي',
    terms: 'الشروط',
    observatory: 'مرصد',
    awarenessСampaign: 'حملة توعية',
    practicalGuide: 'دليل عملي',
    // Layout & Navigation
    accessToRights: 'الوصول إلى الحقوق',
    citizenSpace: 'فضاء المواطن',
    mediaLibrary: 'مكتبة الوسائط',
    actualites: 'الأخبار',
    home: 'الرئيسية',
    usefulAddresses: 'عناوين مفيدة',
    photoAlbums: 'ألبومات الصور',
    faq: 'الأسئلة الشائعة',
    virtualAssistant: 'المساعد الافتراضي',
    practicalResources: 'موارد عملية',
    usefulLinks: 'روابط مفيدة',
    practicalGuides: 'أدلة عملية',
    homepage: 'الصفحة الرئيسية',
    // Sub-navigation
    locateServices: 'تحديد موقع الخدمات',
    organizationsContacts: 'المنظمات وجهات الاتصال',
    videosTestimonies: 'فيديوهات وشهادات',
    eventsGallery: 'معرض الأحداث',
    latestNews: 'آخر الأخبار',
    formsModels: 'نماذج واستمارات',
    externalSites: 'مواقع خارجية',
    stepByStepGuides: 'أدلة خطوة بخطوة',
    realTimeChat: 'دردشة فورية',
    frequentQuestions: 'أسئلة متكررة',
    // Footer
    followUs: 'تابعنا',
    subscribe: 'اشترك',
    navigation: 'التنقل',
    observatoryOfRights: 'مرصد الحقوق',
    accessRights: 'الوصول إلى الحقوق',
    publications: 'المنشورات',
    about: 'معلومات عنا',
    legalNotice: 'الإشعارات القانونية',
    privacy: 'سياسة الخصوصية',
    siteMap: 'خريطة الموقع',
    yourPlatform: 'منصتك للمعلومات المدنية في تونس. الوصول بسهولة إلى حقوقك والخدمات الإدارية.',
    // AccesAuxDroits page
    quickAccess: 'وصول سريع',
    guidesStepByStep: 'أدلة خطوة بخطوة لممارسة حقوقك',
    formsModelsDocuments: 'نماذج واستمارات ووثائق مفيدة',
    findServicesNearYou: 'اعثر على الخدمات القريبة منك',
    explanatoryVideos: 'فيديوهات توضيحية وشهادات',
    yourRightsByCategory: 'حقوقك حسب الفئة',
    housingRight: 'الحق في السكن',
    housingDesc: 'الإيجار، الطرد، مساعدات السكن',
    workRight: 'الحق في العمل',
    workDesc: 'التوظيف، التمييز، ظروف العمل',
    healthRight: 'الحق في الصحة',
    healthDesc: 'الوصول إلى الرعاية، الحماية الاجتماعية',
    educationRight: 'الحق في التعليم',
    educationDesc: 'التعليم، التدريب المهني',
    socialRights: 'الحقوق الاجتماعية',
    socialDesc: 'الإعانات، الإعاقة، الأسرة',
    freedomExpression: 'حرية التعبير',
    freedomDesc: 'الصحافة، التظاهر، الجمعيات',
    cases: 'حالة',
    explore: 'استكشف',
    // Content pages - Common
    search: 'بحث',
    searchDot: 'بحث...',
    all: 'الكل',
    category: 'الفئة',
    noResults: 'لم يتم العثور على نتائج',
    loading: 'جاري التحميل...',
    featured: 'مميز',
    // Carte Interactive
    mapInteractiveTitle: 'خريطة تفاعلية',
    mapDescription: 'اكتشف إجراءات وفعاليات الوصول إلى الحقوق في جميع أنحاء تونس',
    events: 'الأحداث',
    actionCompleted: 'إجراء منجز',
    upcomingEvent: 'حدث قادم',
    completedActions: 'الإجراءات المنجزة',
    upcomingEvents: 'الأحداث القادمة',
    allEvents: 'الكل',
    location: 'المكان',
    date: 'التاريخ',
    impact: 'التأثير',
    legend: 'الرمز',
    // Adresses Utiles
    usefulAddressesTitle: 'عناوين مفيدة',
    usefulAddressesDesc: 'اعثر على تفاصيل اتصال المنظمات والخدمات التي يمكن أن تساعدك',
    selectGovernorate: 'اختر ولاية',
    governorate: 'الولاية',
    address: 'العنوان',
    phone: 'الهاتف',
    email: 'البريد الإلكتروني',
    openingHours: 'ساعات العمل',
    // Guides Pratiques
    practicalGuidesTitle: 'أدلة عملية',
    practicalGuidesDesc: 'أدلة خطوة بخطوة لفهم وممارسة حقوقك',
    read: 'قراءة',
    download: 'تحميل',
    minutes: 'دقيقة',
    needHelp: 'هل تحتاج مساعدة؟',
    needHelpDesc: 'فريقنا هنا لمساعدتك',
    contactUs: 'اتصل بنا',
    // Resources Pratiques
    practicalResourcesTitle: 'موارد عملية',
    practicalResourcesDesc: 'نماذج واستمارات ووثائق لمساعدتك',
    format: 'الصيغة',
    downloads: 'تنزيلات',
    featuredResources: 'موارد مميزة',
    allResources: 'جميع الموارد',
    // Liens Utiles
    usefulLinksTitle: 'روابط مفيدة',
    usefulLinksDesc: 'اعثر على جميع المواقع والموارد الخارجية المفيدة',
    verified: 'تم التحقق',
    suggestLink: 'اقترح رابطًا',
    suggestLinkDesc: 'هل تعرف موردًا مفيدًا؟',
    // Publications
    publicationsTitle: 'المنشورات',
    publicationsDesc: 'تقارير وأدلة وتحليلات حول الوصول إلى الحقوق',
    // Albums Photos
    photoAlbumsTitle: 'ألبومات الصور',
    photoAlbumsDesc: 'اكتشف أعمالنا من خلال الصور',
    photos: 'صور',
    albums: 'ألبومات',
    totalPhotos: 'إجمالي الصور',
    totalAlbums: 'إجمالي الألبومات',
    // Mediatheque
    mediaLibraryTitle: 'مكتبة الوسائط',
    mediaLibraryDesc: 'فيديوهات وبودكاست وشهادات حول الوصول إلى الحقوق',
    type: 'النوع',
    video: 'فيديو',
    podcast: 'بودكاست',
    testimony: 'شهادة',
    views: 'مشاهدة',
    duration: 'المدة',
    watch: 'شاهد',
    listen: 'استمع',
    shareStory: 'شارك قصتك',
    shareStoryDesc: 'هل لديك شهادة لمشاركتها؟',
    // Categories and filters
    allCategories: 'الكل',
    family: 'الأسرة',
    health: 'الصحة',
    employment: 'التشغيل',
    finances: 'المالية',
    housing: 'السكن',
    justice: 'العدالة',
    immigration: 'الهجرة',
    interviews: 'مقابلات',
    documentaries: 'وثائقيات',
    trainings: 'تكوينات',
    podcasts: 'بودكاست',
    tutorials: 'دروس',
    testimonials: 'شهادات',
    webinar: 'ندوة عبر الإنترنت',
    audio: 'صوتي',
    ceremonies: 'احتفالات',
    workshops: 'ورش عمل',
    conferences: 'مؤتمرات',
    campaigns: 'حملات',
    eventsCategory: 'فعاليات',
    // News categories
    services: 'خدمات',
    training: 'تكوين',
    // Difficulty levels
    beginner: 'مبتدئ',
    intermediate: 'متوسط',
    advanced: 'متقدم',
    // Information Pages
    information: 'معلومات',
    whoWeAreSubtitle: 'JustClic.tn هي منصة مواطنية مخصصة لتبسيط الوصول إلى المعلومات القانونية والحقوق الأساسية في تونس.',
    ourMission: 'مهمتنا',
    ourMissionText: 'دمقرطة الوصول إلى المعلومات القانونية وتسهيل ممارسة الحقوق الأساسية لجميع المواطنين التونسيين، من خلال تبسيط الإجراءات المعقدة وتوفير موارد عملية وسهلة المنال.',
    ourVision: 'رؤيتنا',
    ourVisionText: 'بناء مجتمع تونسي يعرف فيه كل مواطن حقوقه، ويستطيع ممارستها بالكامل ويتمتع بالوصول إلى عدالة منصفة، بفضل معلومات واضحة وموثوقة وسهلة الوصول.',
    ourValues: 'قيمنا',
    accessibility: 'سهولة الوصول',
    accessibilityText: 'معلومات بسيطة ومفهومة للجميع',
    transparency: 'الشفافية',
    transparencyText: 'مصادر موثوقة ومتحقق منها',
    engagement: 'الالتزام',
    engagementText: 'دعم مستمر للمواطنين',
    ourTeam: 'فريقنا',
    legalExperts: 'خبراء قانونيون',
    legalExpertsText: 'محامون وفقهاء متخصصون في القانون التونسي',
    developers: 'مطورون',
    developersText: 'فريق تقني مكرس للتحسين المستمر للمنصة',
    community: 'المجتمع',
    communityText: 'مواطنون نشطون يساهمون في إثراء المحتوى',
    joinMission: 'انضم إلى مهمتنا',
    joinMissionText: 'معًا، لنبني تونس حيث المعلومات القانونية متاحة للجميع. استكشف مواردنا واكتشف كيفية ممارسة حقوقك.',
    discoverObservatory: 'اكتشف المرصد',
    accessResources: 'الوصول إلى الموارد',
    // News Page
    legalNews: 'الأخبار القانونية',
    legalNewsSubtitle: 'ابق على اطلاع بآخر التطورات القانونية والإجراءات الجديدة والإصلاحات التي تؤثر على حقوقك في تونس.',
    receiveNewsByEmail: 'تلقى أخبارنا عبر البريد الإلكتروني',
    categories: 'الفئات',
    featuredArticle: 'المقال المميز',
    readArticle: 'اقرأ المقال',
    loadMoreArticles: 'تحميل المزيد من المقالات',
    laborLaw: 'قانون العمل',
    civilStatus: 'الحالة المدنية',
    housingRights: 'الحق في السكن',
    familyLaw: 'قانون الأسرة',
    // FAQ & Chatbot Page
    faqChatbotSubtitle: 'ابحث بسرعة عن إجابات لأسئلتك القانونية أو تحدث مع مساعدنا الافتراضي.',
    searchInFAQ: 'البحث في الأسئلة الشائعة...',
    popularQuestions: 'الأسئلة الشائعة',
    chatWithAssistant: 'تحدث مع مساعدنا',
    askLegalQuestions: 'اطرح أسئلتك القانونية في الوقت الفعلي',
    typeYourQuestion: 'اكتب سؤالك...',
    assistantAvailable: 'مساعدنا متاح على مدار الساعة طوال أيام الأسبوع للإجابة على أسئلتك',
    needMoreHelp: 'تحتاج إلى مزيد من المساعدة؟',
    needMoreHelpText: 'إذا لم تجد إجابة على سؤالك، لا تتردد في استكشاف مواردنا الأخرى.',
    consultGuides: 'راجع الأدلة',
    accessObservatory: 'الوصول إلى المرصد',
    
    // Guide content
    guideJobSeeker: 'دليل الباحث عن عمل',
    guideJobSeekerDesc: 'كل ما تحتاج معرفته عن حقوقك كباحث عن عمل: التسجيل، الإعانة، المرافقة.',
    guideHousingRights: 'فهم حقوق السكن',
    guideHousingRightsDesc: 'مساعدات السكن المختلفة، الطعون في حالة وجود مشكلة مع المالك.',
    guideHealthAccess: 'الوصول إلى الرعاية الصحية',
    guideHealthAccessDesc: 'التنقل في نظام الرعاية الصحية الفرنسي، CMU، ACS والوصول إلى المتخصصين.',
    guideFamilyRights: 'حقوق الأسرة والطفولة',
    guideFamilyRightsDesc: 'الإعانات العائلية، رعاية الأطفال، التعليم وحماية الطفل.',
    guideLegalAid: 'المساعدة القضائية',
    guideLegalAidDesc: 'كيفية الاستفادة من المساعدة القضائية، الشروط والإجراءات.',
    guideForeigners: 'الأجانب في فرنسا',
    guideForeignersDesc: 'تصريح الإقامة، التجنيس، لم شمل الأسرة والحقوق الاجتماعية.',
    
    // Resource content
    resourceOverdebtFile: 'ملف فرط المديونية',
    resourceOverdebtFileDesc: 'مجموعة كاملة لتكوين ملف فرط المديونية',
    resourceLegalAidForm: 'استمارة طلب المساعدة القضائية',
    resourceLegalAidFormDesc: 'نموذج مملوء مسبقاً لطلب المساعدة القضائية',
    resourceEvictionLetter: 'نموذج خطاب الطعن في الطرد',
    resourceEvictionLetterDesc: 'نموذج رسالة للطعن في إجراءات الطرد من السكن',
    resourceJobCenterClaim: 'شكوى مركز التوظيف',
    resourceJobCenterClaimDesc: 'نموذج شكوى في حالة وجود مشكلة مع مركز التوظيف',
    resourceSocialHousingRequest: 'طلب سكن اجتماعي',
    resourceSocialHousingRequestDesc: 'استمارة ووثائق طلب سكن اجتماعي',
    resourceFineContestation: 'الطعن في غرامة',
    resourceFineContestationDesc: 'نموذج رسالة للطعن في غرامة محددة',
    letterType: 'نموذج خطاب',
    formType: 'استمارة',
    dossierType: 'ملف',
    
    // Tags
    tagPoleEmploi: 'مركز التوظيف',
    tagAllocation: 'إعانة',
    tagFormation: 'تدريب',
    tagAPL: 'APL',
    tagBailleur: 'المالك',
    tagExpulsion: 'طرد',
    tagCMU: 'CMU',
    tagSecuriteSociale: 'الضمان الاجتماعي',
    tagMedecin: 'طبيب',
    tagCAF: 'صندوق الإعانات العائلية',
    tagEcole: 'مدرسة',
    tagGarde: 'حضانة',
    tagAvocat: 'محامٍ',
    tagTribunal: 'محكمة',
    tagGratuit: 'مجاني',
    tagPrefecture: 'المحافظة',
    tagVisa: 'تأشيرة',
    tagNaturalisation: 'التجنيس',
  },
};

export const useTranslation = () => {
  const { language } = useLanguage();

  const t = (key: TranslationKey): string => {
    return translations[language][key] || key;
  };

  return { t, language };
};
