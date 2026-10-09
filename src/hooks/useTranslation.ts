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
  | 'awarenessCampaign'
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
  | 'accessObservatory'
  // Observatoire Pages
  | 'observatoireHeroText'
  | 'observatoireSearchPlaceholder'
  | 'popularSearches'
  | 'exploreByThematic'
  | 'dataProtection'
  | 'dataProtectionDesc'
  | 'freedomOfExpression'
  | 'freedomOfExpressionDesc'
  | 'laborRight'
  | 'laborRightDesc'
  | 'equalityNonDiscrimination'
  | 'equalityDesc'
  | 'decisions'
  | 'featuredContent'
  | 'recentDecisions'
  | 'subscribeToUpdates'
  | 'see'
  | 'allCourts'
  | 'allTypes'
  | 'allPeriods'
  // Search Results
  | 'searchResults'
  | 'intelligentSearchAI'
  | 'aiModeActivated'
  | 'aiModeDescription'
  | 'advancedFilters'
  | 'reset'
  | 'courtType'
  | 'period'
  | 'from'
  | 'to'
  | 'jurisdictionLevel'
  | 'documentType'
  | 'sortBy'
  | 'recent'
  | 'relevance'
  | 'resultsFound'
  | 'decisionsFound'
  | 'decisionSingular'
  | 'decisionPlural'
  | 'foundSingular'
  | 'foundPlural'
  | 'for'
  | 'noResultsFound'
  | 'tryDifferentFilters'
  | 'matchScore'
  | 'excellentMatch'
  | 'published'
  | 'pages'
  | 'keywords'
  | 'consult'
  | 'searchDocumentsPlaceholder'
  | 'aiSearchPlaceholder'
  | 'allLevels'
  | 'searchInProgress'
  | 'aiSearchInProgress'
  | 'seeMore'
  | 'seeLess'
  | 'previous'
  | 'next'
  | 'tribunalNotSpecified'
  // Textes Fondamentaux
  | 'fundamentalRightsTexts'
  | 'fundamentalRightsDesc'
  | 'rightsByCategory'
  | 'searchCategory'
  | 'fundamentalRight'
  | 'referenceTexts'
  | 'noDocumentAvailable'
  | 'noDocumentText'
  | 'publishedOn'
  | 'page'
  | 'noCategoryFound'
  // Analyses & Opinions
  | 'fundamentalRights'
  | 'analysesOpinions'
  | 'analysesOpinionsDesc'
  | 'contentTypes'
  | 'deepAnalyses'
  | 'deepAnalysesDesc'
  | 'opinionArticles'
  | 'opinionArticlesDesc'
  | 'policyBriefs'
  | 'policyBriefsDesc'
  | 'caseSheets'
  | 'caseSheetsDesc'
  | 'recentPublications'
  | 'seeAllPublications'
  | 'readTime'
  | 'min'
  | 'contributeToReflection'
  | 'contributeText'
  | 'proposeArticle'
  // Actualites
  | 'actualitesTitle'
  | 'actualitesDesc'
  | 'stayInformedText'
  | 'subscribeNewsletter'
  | 'allNews'
  | 'jurisprudence'
  | 'odf'
  | 'event'
  | 'publication'
  // Observatoire Navigation
  | 'observatoireNavHome'
  | 'observatoireNavHomeDesc'
  | 'observatoireNavSearch'
  | 'observatoireNavSearchDesc'
  | 'observatoireNavFundamentalRights'
  | 'observatoireNavFundamentalRightsDesc'
  | 'observatoireNavAnalyses'
  | 'observatoireNavAnalysesDesc'
  | 'observatoireNavNews'
  | 'observatoireNavNewsDesc'
  | 'observatoireNavPublications'
  | 'observatoireNavPublicationsDesc'
  | 'observatoireNavSociology'
  | 'observatoireNavSociologyDesc'
  | 'observatoireNavEconomy'
  | 'observatoireNavEconomyDesc'
  | 'ourSections'
  // Workflow IA Timeline
  | 'workflowGuide'
  | 'aiAnalysisStep'
  | 'aiAnalysisStepDesc'
  | 'translatePagesStep'
  | 'translatePagesStepDesc'
  | 'consolidateStep'
  | 'consolidateStepDesc'
  | 'filters'
  | 'applyFilters';

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
    yourEmail: 'Votre adresse e-mail',
    newsletter: 'LETTRE D\'INFORMATION',
    allRightsReserved: 'Tous droits réservés',
    developedBy: 'Développé par Feelinx',
    contact: 'Contact',
    legal: 'Mentions légales',
    sitemap: 'Plan du site',
    social: 'Réseaux sociaux',
    terms: 'Conditions',
    observatory: 'Observatoire',
    awarenessCampaign: 'Campagne de sensibilisation',
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
    stepByStepGuides: 'Guides pas à pas',
    realTimeChat: 'Discussion en temps réel',
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
    guidesStepByStep: 'Guides pas à pas pour exercer vos droits',
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
    email: 'Adresse e-mail',
    openingHours: 'Horaires d\'ouverture',
    // Guides Pratiques
    practicalGuidesTitle: 'Guides Pratiques',
    practicalGuidesDesc: 'Des guides pas à pas pour comprendre et exercer vos droits',
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
    publicationsDesc: 'Rapports et analyses',
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
    receiveNewsByEmail: 'Recevez nos actualités par courriel',
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
    // Observatoire Pages
    observatoireHeroText: 'Accédez facilement aux décisions de justice, analyses juridiques et guides pratiques pour comprendre et défendre vos droits fondamentaux.',
    observatoireSearchPlaceholder: 'Recherchez des décisions, analyses...',
    popularSearches: 'Recherches populaires',
    exploreByThematic: 'Explorez par Thématiques',
    dataProtection: 'Protection des données',
    dataProtectionDesc: 'RGPD, Vie privée, Données personnelles',
    freedomOfExpression: 'Liberté d\'expression',
    freedomOfExpressionDesc: 'Médias, Presse, Expression publique',
    laborRight: 'Droit du travail',
    laborRightDesc: 'Emploi, Conditions de travail, Syndicats',
    equalityNonDiscrimination: 'Égalité & Non-discrimination',
    equalityDesc: 'Égalité, Inclusion, Diversité',
    decisions: 'décisions',
    featuredContent: 'Contenus à la Une',
    recentDecisions: 'Décisions Récentes',
    subscribeToUpdates: 'S\'abonner aux mises à jour',
    see: 'Voir',
    allCourts: 'Tous les tribunaux',
    allTypes: 'Tous types',
    allPeriods: 'Toute période',
    // Search Results
    searchResults: 'Résultats de recherche',
    intelligentSearchAI: 'Recherche intelligente IA',
    aiModeActivated: 'Mode IA activé',
    aiModeDescription: 'Posez vos questions en langage naturel. L\'IA comprendra le contexte et trouvera les documents pertinents même sans mots-clés exacts.',
    advancedFilters: 'Filtres Avancés',
    reset: 'Réinitialiser',
    courtType: 'Type de Tribunal',
    period: 'Période',
    from: 'De',
    to: 'À',
    jurisdictionLevel: 'Niveau de juridiction',
    documentType: 'Type de document',
    sortBy: 'Trier par',
    recent: 'Récent',
    relevance: 'Pertinence',
    resultsFound: 'résultats trouvés',
    decisionsFound: 'décisions trouvées',
    decisionSingular: 'décision',
    decisionPlural: 'décisions',
    foundSingular: 'trouvée',
    foundPlural: 'trouvées',
    for: 'pour',
    noResultsFound: 'Aucun résultat trouvé',
    tryDifferentFilters: 'Essayez différents filtres',
    matchScore: 'Score de correspondance',
    excellentMatch: 'Excellente correspondance',
    published: 'Publié',
    publishedOn: 'Publié le',
    page: 'page',
    pages: 'pages',
    keywords: 'Mots-clés',
    consult: 'Consulter',
    searchDocumentsPlaceholder: 'Rechercher des documents...',
    aiSearchPlaceholder: 'Recherche intelligente avec IA... Posez votre question en langage naturel',
    allLevels: 'Tous les niveaux',
    searchInProgress: 'Recherche en cours...',
    aiSearchInProgress: 'Analyse IA en cours...',
    seeMore: 'Voir plus',
    seeLess: 'Voir moins',
    previous: 'Précédent',
    next: 'Suivant',
    tribunalNotSpecified: 'Tribunal non spécifié',
    // Textes Fondamentaux
    fundamentalRightsTexts: 'Textes de jurisprudence des droits fondamentaux en Tunisie',
    fundamentalRightsDesc: 'Explorez la jurisprudence tunisienne en matière de droits fondamentaux à travers une collection complète de décisions judiciaires, d\'analyses et de textes de référence en Tunisie.',
    rightsByCategory: 'Droits par Catégorie',
    searchCategory: 'Rechercher une catégorie de droit...',
    fundamentalRight: 'Droit fondamental',
    referenceTexts: 'Textes de Référence',
    noDocumentAvailable: 'Aucun document disponible',
    noDocumentText: 'Il n\'y a actuellement aucun document publié.',
    noCategoryFound: 'Aucune catégorie trouvée pour',
    // Analyses & Opinions
    fundamentalRights: 'Droits fondamentaux',
    analysesOpinions: 'Analyses & Opinions',
    analysesOpinionsDesc: 'Analyses approfondies, articles d\'opinion et recommandations d\'experts sur les questions juridiques actuelles en Tunisie.',
    contentTypes: 'Types de contenus',
    deepAnalyses: 'Analyses juridiques',
    deepAnalysesDesc: 'Études détaillées sur les évolutions jurisprudentielles',
    opinionArticles: 'Commentaires',
    opinionArticlesDesc: 'Points de vue d\'experts sur les questions juridiques actuelles',
    policyBriefs: 'Blogs',
    policyBriefsDesc: 'Recommandations pour les décideurs politiques',
    caseSheets: 'Fiches de jurisprudence',
    caseSheetsDesc: 'Résumés et analyses des décisions de justice',
    recentPublications: 'Publications Récentes',
    seeAllPublications: 'Voir toutes les publications',
    readTime: 'de lecture',
    min: 'min',
    contributeToReflection: 'Contribuer à la réflexion',
    contributeText: 'Vous êtes expert en droit ou chercheur ? Partagez vos analyses et contribuez à l\'enrichissement du débat juridique.',
    proposeArticle: 'Proposer un article',
    // Actualites
    actualitesTitle: 'Actualités',
    actualitesDesc: 'Suivez les dernières évolutions en matière de droits fondamentaux, jurisprudence et activités de l\'Observatoire des Droits Fondamentaux.',
    stayInformedText: 'Recevez les dernières actualités directement dans votre boîte de réception',
    subscribeNewsletter: 'S\'abonner à la lettre d\'information',
    allNews: 'Toutes',
    jurisprudence: 'Jurisprudence',
    odf: 'ODF',
    event: 'Événement',
    publication: 'Publication',
    // Guide content
    guideJobSeeker: 'Guide du demandeur d\'emploi',
    guideJobSeekerDesc: 'Tout savoir sur vos droits en tant que demandeur d\'emploi : inscription, allocation, accompagnement.',
    guideHousingRights: 'Comprendre ses droits au logement',
    guideHousingRightsDesc: 'Les différentes aides au logement, les recours en cas de problème avec le propriétaire.',
    guideHealthAccess: 'Accès aux soins de santé',
    guideHealthAccessDesc: 'Navigation dans le système de santé tunisien, CNAM, AMG et accès aux spécialistes.',
    guideFamilyRights: 'Droits de la famille et enfance',
    guideFamilyRightsDesc: 'Allocations familiales, garde d\'enfants, scolarité et protection de l\'enfance.',
    guideLegalAid: 'Aide juridictionnelle',
    guideLegalAidDesc: 'Comment bénéficier de l\'aide juridictionnelle, les conditions et la procédure.',
    guideForeigners: 'Étrangers en Tunisie',
    guideForeignersDesc: 'Titre de séjour, naturalisation, regroupement familial et droits sociaux.',
    // Resource content
    resourceOverdebtFile: 'Dossier de surendettement',
    resourceOverdebtFileDesc: 'Kit complet pour constituer un dossier de surendettement',
    resourceLegalAidForm: 'Formulaire de demande d\'aide juridictionnelle',
    resourceLegalAidFormDesc: 'Modèle pré-rempli pour faire une demande d\'aide juridictionnelle',
    resourceEvictionLetter: 'Lettre type de contestation d\'expulsion',
    resourceEvictionLetterDesc: 'Modèle de courrier pour contester une procédure d\'expulsion locative',
    resourceJobCenterClaim: 'Réclamation ANETI',
    resourceJobCenterClaimDesc: 'Modèle de réclamation en cas de problème avec l\'ANETI',
    resourceSocialHousingRequest: 'Demande de logement social',
    resourceSocialHousingRequestDesc: 'Formulaire et pièces justificatives pour une demande de logement social',
    resourceFineContestation: 'Contestation d\'amende',
    resourceFineContestationDesc: 'Modèle de courrier pour contester une amende forfaitaire',
    letterType: 'Lettre type',
    formType: 'Formulaire',
    dossierType: 'Dossier',
    // Tags
    tagPoleEmploi: 'ANETI',
    tagAllocation: 'Allocation',
    tagFormation: 'Formation',
    tagAPL: 'Aide au logement',
    tagBailleur: 'Bailleur',
    tagExpulsion: 'Expulsion',
    tagCMU: 'CNAM',
    tagSecuriteSociale: 'Sécurité sociale',
    tagMedecin: 'Médecin',
    tagCAF: 'CNSS',
    tagEcole: 'École',
    tagGarde: 'Garde',
    tagAvocat: 'Avocat',
    tagTribunal: 'Tribunal',
    tagGratuit: 'Gratuit',
    tagPrefecture: 'Gouvernorat',
    tagVisa: 'Visa',
    tagNaturalisation: 'Naturalisation',
    // Observatoire Navigation
    observatoireNavHome: 'Accueil',
    observatoireNavHomeDesc: 'Page d\'accueil',
    observatoireNavSearch: 'Recherche',
    observatoireNavSearchDesc: 'Recherche avancée',
    observatoireNavFundamentalRights: 'Droits fondamentaux',
    observatoireNavFundamentalRightsDesc: 'Textes de référence',
    observatoireNavAnalyses: 'Analyses & Opinions',
    observatoireNavAnalysesDesc: 'Analyses juridiques',
    observatoireNavNews: 'Actualités',
    observatoireNavNewsDesc: 'Dernières nouvelles',
    observatoireNavPublications: 'Publications',
    observatoireNavPublicationsDesc: 'Recueils, notes, policy briefs',
    observatoireNavSociology: 'Approche sociologique',
    observatoireNavSociologyDesc: 'Les droits vus par la sociologie',
    observatoireNavEconomy: 'Approche économique',
    observatoireNavEconomyDesc: 'Les droits vus par l’économie',
    ourSections: 'Nos Rubriques',
    // Workflow IA Timeline
    workflowGuide: 'Processus de traitement IA',
    aiAnalysisStep: 'Analyse IA',
    aiAnalysisStepDesc: 'Extrait et traduit les métadonnées (titre, résumé, mots-clés...) + extrait court du contenu (~300 mots)',
    translatePagesStep: 'Traduire page par page',
    translatePagesStepDesc: 'Traduit le contenu complet de chaque page individuellement',
    consolidateStep: 'Consolider',
    consolidateStepDesc: 'Fusionne toutes les pages traduites en un seul contenu',
    // Mobile filters
    filters: 'Filtres',
    applyFilters: 'Appliquer les filtres',
  },
  ar: {
    // Homepage
    tagline: 'منصّة مواطنية لفقه القضاء الإداري والدستوري',
    whoWeAre: 'من نحن',
    news: 'الأخبار',
    faqChatbot: 'الأسئلة الشائعة/روبوت المحادثة',
    observatoryTitle: 'مرصد الحقوق الأساسية',
    observatoryDescription: 'اطّلع على فقه القضاء التونسي المتعلّق بالحقوق الأساسية، حلّله وافهمه',
    searchPlaceholder: 'ابحث عن قرار، كلمة مفتاحية...',
    accessToAdminLaw: 'النفاذ إلى القانون الإداري',
    accessDescription: 'افهم حقوقك واعرف كيف تتصرّف: أدوات عملية لكل المواطنين',
    interactiveMap: 'خريطة تفاعلية',
    newsSection: 'الأخبار',
    readMore: 'اقرأ المزيد...',
    stayInformed: 'ابق على اطلاع',
    yourEmail: 'بريدك الإلكتروني',
    newsletter: 'النشرة الإخبارية',
    allRightsReserved: 'جميع الحقوق محفوظة',
    developedBy: 'تم التطوير بواسطة Feelinx',
    contact: 'اتصل بنا',
    legal: 'البيانات القانونية',
    sitemap: 'خريطة الموقع',
    social: 'وسائل التواصل الاجتماعي',
    terms: 'الشروط',
    observatory: 'المرصد',
    awarenessCampaign: 'حملة توعية',
    practicalGuide: 'دليل عملي',
    // Layout & Navigation
    accessToRights: 'النفاذ إلى الحقوق',
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
    organizationsContacts: 'الهياكل وجهات الاتصال',
    videosTestimonies: 'فيديوهات وشهادات',
    eventsGallery: 'معرض الفعاليات',
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
    accessRights: 'النفاذ إلى الحقوق',
    publications: 'المنشورات',
    about: 'حول المنصّة',
    legalNotice: 'البيانات القانونية',
    privacy: 'سياسة الخصوصية',
    siteMap: 'خريطة الموقع',
    yourPlatform: 'منصّتك المواطنية للمعلومة في تونس: تعرّف بسهولة على حقوقك وعلى الخدمات الإدارية.',
    // AccesAuxDroits page
    quickAccess: 'نفاذ سريع',
    guidesStepByStep: 'أدلة خطوة بخطوة لممارسة حقوقك',
    formsModelsDocuments: 'نماذج واستمارات ووثائق مفيدة',
    findServicesNearYou: 'اعثر على الخدمات القريبة منك',
    explanatoryVideos: 'فيديوهات توضيحية وشهادات',
    yourRightsByCategory: 'حقوقك حسب الفئة',
    housingRight: 'الحق في السكن',
    housingDesc: 'الكراء، الإخلاء، منح السكن',
    workRight: 'الحق في العمل',
    workDesc: 'التشغيل، التمييز، ظروف العمل',
    healthRight: 'الحق في الصحة',
    healthDesc: 'النفاذ إلى العلاج، الحماية الاجتماعية',
    educationRight: 'الحق في التعليم',
    educationDesc: 'التمدرس، التكوين المهني',
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
    featured: 'في الواجهة',
    // Carte Interactive
    mapInteractiveTitle: 'خريطة تفاعلية',
    mapDescription: 'اكتشف أنشطة وفعاليات النفاذ إلى الحقوق في كامل أنحاء تونس',
    events: 'الفعاليات',
    actionCompleted: 'نشاط منجز',
    upcomingEvent: 'فعالية قادمة',
    completedActions: 'الأنشطة المنجزة',
    upcomingEvents: 'الفعاليات القادمة',
    allEvents: 'الكل',
    location: 'المكان',
    date: 'التاريخ',
    impact: 'التأثير',
    legend: 'دليل الرموز',
    // Adresses Utiles
    usefulAddressesTitle: 'عناوين مفيدة',
    usefulAddressesDesc: 'اعثر على بيانات الاتصال بالهياكل والمصالح التي يمكنها مساعدتك',
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
    downloads: 'تحميلات',
    featuredResources: 'موارد مميزة',
    allResources: 'جميع الموارد',
    // Liens Utiles
    usefulLinksTitle: 'روابط مفيدة',
    usefulLinksDesc: 'اعثر على جميع المواقع والموارد الخارجية المفيدة',
    verified: 'تم التحقق',
    suggestLink: 'اقترح رابطًا',
    suggestLinkDesc: 'هل تعرف موقعا أو موردا مفيدا؟ ساعدنا على إثراء قائمتنا',
    // Publications
    publicationsTitle: 'المنشورات',
    publicationsDesc: 'تقارير وتحليلات',
    // Albums Photos
    photoAlbumsTitle: 'ألبومات الصور',
    photoAlbumsDesc: 'اكتشف أنشطتنا بالصور',
    photos: 'صور',
    albums: 'ألبومات',
    totalPhotos: 'إجمالي الصور',
    totalAlbums: 'إجمالي الألبومات',
    // Mediatheque
    mediaLibraryTitle: 'مكتبة الوسائط',
    mediaLibraryDesc: 'فيديوهات وبودكاست وشهادات حول النفاذ إلى الحقوق',
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
    whoWeAreSubtitle: 'JustClic.tn منصّة مواطنية تهدف إلى تيسير النفاذ إلى المعلومة القانونية وإلى الحقوق الأساسية في تونس.',
    ourMission: 'مهمتنا',
    ourMissionText: 'دمقرطة النفاذ إلى المعلومة القانونية وتيسير ممارسة الحقوق الأساسية لكل المواطنين التونسيين، من خلال تبسيط الإجراءات المعقّدة وتوفير موارد عملية في متناول الجميع.',
    ourVision: 'رؤيتنا',
    ourVisionText: 'بناء مجتمع تونسي يعرف فيه كل مواطن حقوقه، ويمارسها كاملة، وينفذ إلى عدالة منصفة، بفضل معلومة واضحة وموثوقة وميسّرة.',
    ourValues: 'قيمنا',
    accessibility: 'سهولة النفاذ',
    accessibilityText: 'معلومات بسيطة ومفهومة للجميع',
    transparency: 'الشفافية',
    transparencyText: 'مصادر موثوقة ومتحقق منها',
    engagement: 'الالتزام',
    engagementText: 'دعم مستمر للمواطنين',
    ourTeam: 'فريقنا',
    legalExperts: 'خبراء قانونيون',
    legalExpertsText: 'محامون وحقوقيون مختصّون في القانون التونسي',
    developers: 'مطورون',
    developersText: 'فريق تقني يعمل على التحسين المستمر للمنصّة',
    community: 'المجتمع',
    communityText: 'مواطنون نشطون يساهمون في إثراء المحتوى',
    joinMission: 'انضم إلى مهمتنا',
    joinMissionText: 'معًا، لنبني تونس حيث المعلومات القانونية متاحة للجميع. استكشف مواردنا واكتشف كيفية ممارسة حقوقك.',
    discoverObservatory: 'اكتشف المرصد',
    accessResources: 'تصفّح الموارد',
    // News Page
    legalNews: 'الأخبار القانونية',
    legalNewsSubtitle: 'ابق على اطلاع بآخر التطورات القانونية والإجراءات الجديدة والإصلاحات التي تؤثر على حقوقك في تونس.',
    receiveNewsByEmail: 'تلقَّ أخبارنا عبر البريد الإلكتروني',
    categories: 'الفئات',
    featuredArticle: 'المقال المميز',
    readArticle: 'اقرأ المقال',
    loadMoreArticles: 'تحميل المزيد من المقالات',
    laborLaw: 'قانون الشغل',
    civilStatus: 'الحالة المدنية',
    housingRights: 'الحق في السكن',
    familyLaw: 'قانون الأسرة',
    // FAQ & Chatbot Page
    faqChatbotSubtitle: 'ابحث بسرعة عن إجابات لأسئلتك القانونية أو تحدث مع مساعدنا الافتراضي.',
    searchInFAQ: 'البحث في الأسئلة الشائعة...',
    popularQuestions: 'الأسئلة الأكثر طرحا',
    chatWithAssistant: 'تحدث مع مساعدنا',
    askLegalQuestions: 'اطرح أسئلتك القانونية واحصل على إجابة مباشرة',
    typeYourQuestion: 'اكتب سؤالك...',
    assistantAvailable: 'مساعدنا متاح على مدار الساعة طوال أيام الأسبوع للإجابة على أسئلتك',
    needMoreHelp: 'تحتاج إلى مزيد من المساعدة؟',
    needMoreHelpText: 'إذا لم تجد إجابة على سؤالك، لا تتردد في استكشاف مواردنا الأخرى.',
    consultGuides: 'راجع الأدلة',
    accessObservatory: 'الدخول إلى المرصد',
    // Observatoire Pages
    observatoireHeroText: 'اطّلع بسهولة على القرارات القضائية والتحاليل القانونية والأدلة العملية لفهم حقوقك الأساسية والدفاع عنها.',
    observatoireSearchPlaceholder: 'ابحث عن القرارات والتحليلات...',
    popularSearches: 'عمليات البحث الشائعة',
    exploreByThematic: 'استكشف حسب المواضيع',
    dataProtection: 'حماية المعطيات الشخصية',
    dataProtectionDesc: 'الحياة الخاصة، المعطيات الشخصية، الهيئة الوطنية لحماية المعطيات',
    freedomOfExpression: 'حرية التعبير',
    freedomOfExpressionDesc: 'وسائل الإعلام، الصحافة، التعبير العام',
    laborRight: 'قانون الشغل',
    laborRightDesc: 'التشغيل، ظروف العمل، النقابات',
    equalityNonDiscrimination: 'المساواة وعدم التمييز',
    equalityDesc: 'المساواة، الشمول، التنوع',
    decisions: 'قرارات',
    featuredContent: 'محتوى مميز',
    recentDecisions: 'القرارات الأخيرة',
    subscribeToUpdates: 'اشترك في التحديثات',
    see: 'عرض',
    allCourts: 'جميع المحاكم',
    allTypes: 'جميع الأنواع',
    allPeriods: 'جميع الفترات',
    // Search Results
    searchResults: 'نتائج البحث',
    intelligentSearchAI: 'بحث ذكي بالذكاء الاصطناعي',
    aiModeActivated: 'تم تفعيل وضع الذكاء الاصطناعي',
    aiModeDescription: 'اطرح أسئلتك بلغة طبيعية. سيفهم الذكاء الاصطناعي السياق ويجد الوثائق ذات الصلة حتى بدون كلمات مفتاحية دقيقة.',
    advancedFilters: 'تصفية متقدّمة',
    reset: 'إعادة تعيين',
    courtType: 'نوع المحكمة',
    period: 'الفترة',
    from: 'من',
    to: 'إلى',
    jurisdictionLevel: 'درجة التقاضي',
    documentType: 'نوع الوثيقة',
    sortBy: 'ترتيب حسب',
    recent: 'الأحدث',
    relevance: 'الأكثر صلة',
    resultsFound: 'نتيجة',
    decisionsFound: 'قرار',
    decisionSingular: 'قرار',
    decisionPlural: 'قرارات',
    foundSingular: 'موجود',
    foundPlural: 'موجودة',
    for: 'لـ',
    noResultsFound: 'لم يتم العثور على نتائج',
    tryDifferentFilters: 'جرّب معايير تصفية مختلفة',
    matchScore: 'درجة التطابق',
    excellentMatch: 'تطابق ممتاز',
    published: 'منشور',
    publishedOn: 'نُشر في',
    page: 'صفحة',
    pages: 'صفحات',
    keywords: 'الكلمات المفاتيح',
    consult: 'اطّلع',
    searchDocumentsPlaceholder: 'ابحث في الوثائق...',
    aiSearchPlaceholder: 'بحث ذكي بالذكاء الاصطناعي... اطرح سؤالك بلغة طبيعية',
    allLevels: 'جميع المستويات',
    searchInProgress: 'جاري البحث...',
    aiSearchInProgress: 'جاري تحليل الذكاء الاصطناعي...',
    seeMore: 'عرض المزيد',
    seeLess: 'عرض أقل',
    previous: 'السابق',
    next: 'التالي',
    tribunalNotSpecified: 'محكمة غير محددة',
    // Textes Fondamentaux
    fundamentalRightsTexts: 'نصوص فقه القضاء المتعلّقة بالحقوق الأساسية في تونس',
    fundamentalRightsDesc: 'استكشف فقه القضاء التونسي في مجال الحقوق الأساسية من خلال مجموعة كاملة من القرارات القضائية والتحليلات والنصوص المرجعية.',
    rightsByCategory: 'الحقوق حسب الفئة',
    searchCategory: 'ابحث عن صنف من الحقوق...',
    fundamentalRight: 'حق أساسي',
    referenceTexts: 'النصوص المرجعية',
    noDocumentAvailable: 'لا توجد وثيقة متاحة',
    noDocumentText: 'لا توجد حالياً أي وثيقة منشورة.',
    noCategoryFound: 'لا توجد فئة مطابقة لـ',
    // Analyses & Opinions
    fundamentalRights: 'الحقوق الأساسية',
    analysesOpinions: 'التحليلات والآراء',
    analysesOpinionsDesc: 'تحليلات معمقة، مقالات رأي وتوصيات خبراء حول القضايا القانونية الحالية في تونس.',
    contentTypes: 'أنواع المحتوى',
    deepAnalyses: 'التحاليل القانونية',
    deepAnalysesDesc: 'دراسات مفصّلة حول تطوّر فقه القضاء',
    opinionArticles: 'التعاليق',
    opinionArticlesDesc: 'وجهات نظر الخبراء حول القضايا القانونية الحالية',
    policyBriefs: 'المدونات',
    policyBriefsDesc: 'توصيات لصناع القرار',
    caseSheets: 'جذاذات فقه القضاء',
    caseSheetsDesc: 'ملخصات وتحليلات للأحكام القضائية',
    recentPublications: 'المنشورات الأخيرة',
    seeAllPublications: 'عرض جميع المنشورات',
    readTime: 'للقراءة',
    min: 'دقيقة',
    contributeToReflection: 'ساهم في النقاش',
    contributeText: 'هل أنت خبير قانوني أو باحث؟ شارك تحليلاتك وساهم في إثراء النقاش القانوني.',
    proposeArticle: 'اقترح مقالاً',
    // Actualites
    actualitesTitle: 'الأخبار',
    actualitesDesc: 'تابع آخر المستجدّات في مجال الحقوق الأساسية وفقه القضاء وأنشطة مرصد الحقوق الأساسية',
    stayInformedText: 'تلقَّ آخر الأخبار مباشرة في بريدك الإلكتروني',
    subscribeNewsletter: 'اشترك في النشرة الإخبارية',
    allNews: 'جميع الأخبار',
    jurisprudence: 'فقه القضاء',
    odf: 'المرصد',
    event: 'فعالية',
    publication: 'منشور',

    // Guide content
    guideJobSeeker: 'دليل الباحث عن عمل',
    guideJobSeekerDesc: 'كل ما تحتاج معرفته عن حقوقك كباحث عن عمل: التسجيل، الإعانة، المرافقة.',
    guideHousingRights: 'فهم حقوق السكن',
    guideHousingRightsDesc: 'مختلف منح السكن، وسبل التظلّم في حال وجود نزاع مع المسوّغ.',
    guideHealthAccess: 'النفاذ إلى الخدمات الصحية',
    guideHealthAccessDesc: 'فهم المنظومة الصحية التونسية: الكنام، العلاج المجاني، والنفاذ إلى الأطباء المختصّين.',
    guideFamilyRights: 'حقوق الأسرة والطفولة',
    guideFamilyRightsDesc: 'الإعانات العائلية، رعاية الأطفال، التعليم وحماية الطفل.',
    guideLegalAid: 'الإعانة القضائية',
    guideLegalAidDesc: 'كيف تنتفع بالإعانة القضائية: الشروط والإجراءات.',
    guideForeigners: 'الأجانب في تونس',
    guideForeignersDesc: 'بطاقة الإقامة، التجنيس، لمّ الشمل العائلي والحقوق الاجتماعية.',

    // Resource content
    resourceOverdebtFile: 'ملف التداين المفرط',
    resourceOverdebtFileDesc: 'مجموعة كاملة لإعداد ملف التداين المفرط',
    resourceLegalAidForm: 'استمارة طلب الإعانة القضائية',
    resourceLegalAidFormDesc: 'نموذج معدّ مسبقا لطلب الإعانة القضائية',
    resourceEvictionLetter: 'نموذج مراسلة للاعتراض على الإخلاء',
    resourceEvictionLetterDesc: 'نموذج مراسلة للاعتراض على إجراءات إخلاء محلّ السكنى',
    resourceJobCenterClaim: 'تظلّم لدى مكتب التشغيل',
    resourceJobCenterClaimDesc: 'نموذج تظلّم في حال وجود إشكال مع الوكالة الوطنية للتشغيل والعمل المستقل',
    resourceSocialHousingRequest: 'طلب سكن اجتماعي',
    resourceSocialHousingRequestDesc: 'استمارة ووثائق طلب سكن اجتماعي',
    resourceFineContestation: 'الاعتراض على خطية',
    resourceFineContestationDesc: 'نموذج مراسلة للاعتراض على خطية جزافية',
    letterType: 'نموذج مراسلة',
    formType: 'استمارة',
    dossierType: 'ملف',

    // Tags
    tagPoleEmploi: 'ANETI',
    tagAllocation: 'إعانة',
    tagFormation: 'تكوين',
    tagAPL: 'منحة السكن',
    tagBailleur: 'المسوّغ',
    tagExpulsion: 'إخلاء',
    tagCMU: 'CNAM',
    tagSecuriteSociale: 'الضمان الاجتماعي',
    tagMedecin: 'طبيب',
    tagCAF: 'CNSS',
    tagEcole: 'مدرسة',
    tagGarde: 'حضانة',
    tagAvocat: 'محامٍ',
    tagTribunal: 'محكمة',
    tagGratuit: 'مجاني',
    tagPrefecture: 'الولاية',
    tagVisa: 'تأشيرة',
    tagNaturalisation: 'التجنيس',
    // Observatoire Navigation
    observatoireNavHome: 'الرئيسية',
    observatoireNavHomeDesc: 'الصفحة الرئيسية',
    observatoireNavSearch: 'بحث',
    observatoireNavSearchDesc: 'بحث متقدم',
    observatoireNavFundamentalRights: 'الحقوق الأساسية',
    observatoireNavFundamentalRightsDesc: 'النصوص المرجعية',
    observatoireNavAnalyses: 'تحليلات وآراء',
    observatoireNavAnalysesDesc: 'تحليلات قانونية',
    observatoireNavNews: 'أخبار',
    observatoireNavNewsDesc: 'آخر الأخبار',
    observatoireNavPublications: 'المنشورات',
    observatoireNavPublicationsDesc: 'المجموعات والأوراق',
    observatoireNavSociology: 'المقاربة السوسيولوجية',
    observatoireNavSociologyDesc: 'الحقوق من منظور علم الاجتماع',
    observatoireNavEconomy: 'المقاربة الاقتصادية',
    observatoireNavEconomyDesc: 'الحقوق من منظور الاقتصاد',
    ourSections: 'أقسامنا',
    // Workflow IA Timeline
    workflowGuide: 'سير عمل المعالجة بالذكاء الاصطناعي',
    aiAnalysisStep: 'التحليل بالذكاء الاصطناعي',
    aiAnalysisStepDesc: 'استخراج وترجمة البيانات الوصفية (العنوان، الملخص، الكلمات المفاتيح...) + مقتطف قصير من المحتوى (~300 كلمة)',
    translatePagesStep: 'ترجمة صفحة بصفحة',
    translatePagesStepDesc: 'ترجمة المحتوى الكامل لكل صفحة بشكل فردي',
    consolidateStep: 'دمج',
    consolidateStepDesc: 'دمج جميع الصفحات المترجمة في محتوى واحد',
    // Mobile filters
    filters: 'التصفية',
    applyFilters: 'تطبيق التصفية',
  },
};

export const useTranslation = () => {
  const { language } = useLanguage();

  const t = (key: TranslationKey): string => {
    return translations[language][key] || key;
  };

  return { t, language };
};
