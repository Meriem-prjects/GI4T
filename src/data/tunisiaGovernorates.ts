import { Governorate } from "@/types/events";

// Coordonnées GeoJSON simplifiées des 24 gouvernorats tunisiens
export const tunisiaGovernorates: Governorate[] = [
  {
    id: "tunis",
    name: "Tunis",
    name_ar: "تونس",
    code: "TN-11",
    population: 1056247,
    area_km2: 346,
    geojson: {
      type: "Feature",
      properties: { name: "Tunis", code: "TN-11" },
      geometry: {
        type: "Polygon",
        coordinates: [[[10.05, 36.85], [10.25, 36.85], [10.30, 36.80], [10.25, 36.75], [10.15, 36.70], [10.05, 36.72], [10.00, 36.78], [10.05, 36.85]]]
      }
    }
  },
  {
    id: "ariana",
    name: "Ariana",
    name_ar: "أريانة",
    code: "TN-12",
    population: 576088,
    area_km2: 482,
    geojson: {
      type: "Feature",
      properties: { name: "Ariana", code: "TN-12" },
      geometry: {
        type: "Polygon",
        coordinates: [[[10.05, 36.85], [10.00, 36.92], [10.10, 37.00], [10.22, 36.98], [10.30, 36.90], [10.25, 36.85], [10.05, 36.85]]]
      }
    }
  },
  {
    id: "ben-arous",
    name: "Ben Arous",
    name_ar: "بن عروس",
    code: "TN-13",
    population: 631842,
    area_km2: 761,
    geojson: {
      type: "Feature",
      properties: { name: "Ben Arous", code: "TN-13" },
      geometry: {
        type: "Polygon",
        coordinates: [[[10.05, 36.72], [10.15, 36.70], [10.30, 36.65], [10.35, 36.58], [10.28, 36.50], [10.15, 36.52], [10.05, 36.60], [10.05, 36.72]]]
      }
    }
  },
  {
    id: "manouba",
    name: "Manouba",
    name_ar: "منوبة",
    code: "TN-14",
    population: 379518,
    area_km2: 1137,
    geojson: {
      type: "Feature",
      properties: { name: "Manouba", code: "TN-14" },
      geometry: {
        type: "Polygon",
        coordinates: [[[9.80, 36.95], [10.00, 36.92], [10.05, 36.85], [10.00, 36.78], [9.85, 36.75], [9.75, 36.80], [9.75, 36.88], [9.80, 36.95]]]
      }
    }
  },
  {
    id: "nabeul",
    name: "Nabeul",
    name_ar: "نابل",
    code: "TN-21",
    population: 787920,
    area_km2: 2788,
    geojson: {
      type: "Feature",
      properties: { name: "Nabeul", code: "TN-21" },
      geometry: {
        type: "Polygon",
        coordinates: [[[10.35, 36.58], [10.95, 36.62], [11.10, 36.50], [11.05, 36.30], [10.85, 36.15], [10.60, 36.20], [10.45, 36.35], [10.35, 36.58]]]
      }
    }
  },
  {
    id: "zaghouan",
    name: "Zaghouan",
    name_ar: "زغوان",
    code: "TN-22",
    population: 176945,
    area_km2: 2768,
    geojson: {
      type: "Feature",
      properties: { name: "Zaghouan", code: "TN-22" },
      geometry: {
        type: "Polygon",
        coordinates: [[[10.05, 36.60], [10.15, 36.52], [10.28, 36.50], [10.45, 36.35], [10.35, 36.15], [10.15, 36.10], [9.95, 36.25], [9.90, 36.45], [10.05, 36.60]]]
      }
    }
  },
  {
    id: "bizerte",
    name: "Bizerte",
    name_ar: "بنزرت",
    code: "TN-23",
    population: 568219,
    area_km2: 3750,
    geojson: {
      type: "Feature",
      properties: { name: "Bizerte", code: "TN-23" },
      geometry: {
        type: "Polygon",
        coordinates: [[[9.45, 37.35], [9.85, 37.28], [10.10, 37.00], [10.00, 36.92], [9.80, 36.95], [9.55, 37.05], [9.40, 37.18], [9.45, 37.35]]]
      }
    }
  },
  {
    id: "beja",
    name: "Béja",
    name_ar: "باجة",
    code: "TN-31",
    population: 303032,
    area_km2: 3740,
    geojson: {
      type: "Feature",
      properties: { name: "Béja", code: "TN-31" },
      geometry: {
        type: "Polygon",
        coordinates: [[[9.15, 36.85], [9.55, 36.88], [9.75, 36.80], [9.75, 36.60], [9.50, 36.48], [9.20, 36.52], [9.05, 36.68], [9.15, 36.85]]]
      }
    }
  },
  {
    id: "jendouba",
    name: "Jendouba",
    name_ar: "جندوبة",
    code: "TN-32",
    population: 401477,
    area_km2: 3102,
    geojson: {
      type: "Feature",
      properties: { name: "Jendouba", code: "TN-32" },
      geometry: {
        type: "Polygon",
        coordinates: [[[8.40, 37.05], [8.85, 37.00], [9.15, 36.85], [9.05, 36.68], [8.75, 36.65], [8.45, 36.75], [8.35, 36.92], [8.40, 37.05]]]
      }
    }
  },
  {
    id: "kef",
    name: "Le Kef",
    name_ar: "الكاف",
    code: "TN-33",
    population: 243156,
    area_km2: 5081,
    geojson: {
      type: "Feature",
      properties: { name: "Le Kef", code: "TN-33" },
      geometry: {
        type: "Polygon",
        coordinates: [[[8.35, 36.28], [8.75, 36.25], [9.05, 36.18], [9.20, 36.00], [8.95, 35.88], [8.55, 35.92], [8.35, 36.05], [8.35, 36.28]]]
      }
    }
  },
  {
    id: "siliana",
    name: "Siliana",
    name_ar: "سليانة",
    code: "TN-34",
    population: 223087,
    area_km2: 4631,
    geojson: {
      type: "Feature",
      properties: { name: "Siliana", code: "TN-34" },
      geometry: {
        type: "Polygon",
        coordinates: [[[9.05, 36.68], [9.20, 36.52], [9.50, 36.48], [9.65, 36.30], [9.55, 36.10], [9.20, 36.00], [9.05, 36.18], [8.95, 36.45], [9.05, 36.68]]]
      }
    }
  },
  {
    id: "sousse",
    name: "Sousse",
    name_ar: "سوسة",
    code: "TN-51",
    population: 674971,
    area_km2: 2669,
    geojson: {
      type: "Feature",
      properties: { name: "Sousse", code: "TN-51" },
      geometry: {
        type: "Polygon",
        coordinates: [[[10.35, 36.15], [10.60, 36.20], [10.75, 36.05], [10.78, 35.85], [10.65, 35.70], [10.45, 35.75], [10.30, 35.95], [10.35, 36.15]]]
      }
    }
  },
  {
    id: "monastir",
    name: "Monastir",
    name_ar: "المنستير",
    code: "TN-52",
    population: 548828,
    area_km2: 1019,
    geojson: {
      type: "Feature",
      properties: { name: "Monastir", code: "TN-52" },
      geometry: {
        type: "Polygon",
        coordinates: [[[10.65, 35.70], [10.95, 35.75], [11.10, 35.62], [11.08, 35.45], [10.88, 35.42], [10.70, 35.52], [10.65, 35.70]]]
      }
    }
  },
  {
    id: "mahdia",
    name: "Mahdia",
    name_ar: "المهدية",
    code: "TN-53",
    population: 410812,
    area_km2: 2966,
    geojson: {
      type: "Feature",
      properties: { name: "Mahdia", code: "TN-53" },
      geometry: {
        type: "Polygon",
        coordinates: [[[10.88, 35.42], [11.08, 35.45], [11.15, 35.30], [11.10, 35.10], [10.95, 35.05], [10.75, 35.18], [10.70, 35.35], [10.88, 35.42]]]
      }
    }
  },
  {
    id: "sfax",
    name: "Sfax",
    name_ar: "صفاقس",
    code: "TN-61",
    population: 955421,
    area_km2: 7545,
    geojson: {
      type: "Feature",
      properties: { name: "Sfax", code: "TN-61" },
      geometry: {
        type: "Polygon",
        coordinates: [[[10.45, 35.05], [10.95, 35.05], [11.10, 34.85], [11.05, 34.55], [10.75, 34.40], [10.45, 34.52], [10.35, 34.80], [10.45, 35.05]]]
      }
    }
  },
  {
    id: "kairouan",
    name: "Kairouan",
    name_ar: "القيروان",
    code: "TN-41",
    population: 570559,
    area_km2: 6712,
    geojson: {
      type: "Feature",
      properties: { name: "Kairouan", code: "TN-41" },
      geometry: {
        type: "Polygon",
        coordinates: [[[9.55, 36.10], [9.95, 36.25], [10.15, 36.10], [10.35, 36.15], [10.30, 35.95], [10.45, 35.75], [10.25, 35.55], [9.85, 35.60], [9.60, 35.78], [9.55, 36.10]]]
      }
    }
  },
  {
    id: "kasserine",
    name: "Kasserine",
    name_ar: "القصرين",
    code: "TN-42",
    population: 439243,
    area_km2: 8260,
    geojson: {
      type: "Feature",
      properties: { name: "Kasserine", code: "TN-42" },
      geometry: {
        type: "Polygon",
        coordinates: [[[8.55, 35.92], [8.95, 35.88], [9.20, 35.75], [9.45, 35.50], [9.35, 35.15], [9.05, 34.95], [8.65, 35.05], [8.45, 35.35], [8.55, 35.92]]]
      }
    }
  },
  {
    id: "sidi-bouzid",
    name: "Sidi Bouzid",
    name_ar: "سيدي بوزيد",
    code: "TN-43",
    population: 429912,
    area_km2: 7405,
    geojson: {
      type: "Feature",
      properties: { name: "Sidi Bouzid", code: "TN-43" },
      geometry: {
        type: "Polygon",
        coordinates: [[[9.20, 35.75], [9.60, 35.78], [9.85, 35.60], [10.10, 35.40], [10.05, 35.10], [9.75, 34.95], [9.35, 35.15], [9.20, 35.75]]]
      }
    }
  },
  {
    id: "gabes",
    name: "Gabès",
    name_ar: "قابس",
    code: "TN-71",
    population: 374300,
    area_km2: 7175,
    geojson: {
      type: "Feature",
      properties: { name: "Gabès", code: "TN-71" },
      geometry: {
        type: "Polygon",
        coordinates: [[[9.85, 34.35], [10.35, 34.28], [10.45, 34.05], [10.35, 33.75], [10.05, 33.68], [9.75, 33.85], [9.70, 34.15], [9.85, 34.35]]]
      }
    }
  },
  {
    id: "medenine",
    name: "Médenine",
    name_ar: "مدنين",
    code: "TN-82",
    population: 479520,
    area_km2: 8588,
    geojson: {
      type: "Feature",
      properties: { name: "Médenine", code: "TN-82" },
      geometry: {
        type: "Polygon",
        coordinates: [[[10.35, 33.75], [10.85, 33.68], [11.05, 33.45], [11.00, 33.15], [10.65, 33.00], [10.30, 33.05], [10.20, 33.35], [10.35, 33.75]]]
      }
    }
  },
  {
    id: "tataouine",
    name: "Tataouine",
    name_ar: "تطاوين",
    code: "TN-83",
    population: 149453,
    area_km2: 38889,
    geojson: {
      type: "Feature",
      properties: { name: "Tataouine", code: "TN-83" },
      geometry: {
        type: "Polygon",
        coordinates: [[[9.45, 32.85], [10.30, 33.05], [10.65, 33.00], [11.00, 32.80], [11.05, 32.45], [10.75, 32.15], [10.25, 32.05], [9.75, 32.25], [9.45, 32.55], [9.45, 32.85]]]
      }
    }
  },
  {
    id: "gafsa",
    name: "Gafsa",
    name_ar: "قفصة",
    code: "TN-72",
    population: 337331,
    area_km2: 8990,
    geojson: {
      type: "Feature",
      properties: { name: "Gafsa", code: "TN-72" },
      geometry: {
        type: "Polygon",
        coordinates: [[[8.15, 34.55], [8.65, 34.60], [9.05, 34.50], [9.35, 34.25], [9.25, 33.95], [8.85, 33.85], [8.35, 34.05], [8.15, 34.35], [8.15, 34.55]]]
      }
    }
  },
  {
    id: "tozeur",
    name: "Tozeur",
    name_ar: "توزر",
    code: "TN-73",
    population: 107912,
    area_km2: 5593,
    geojson: {
      type: "Feature",
      properties: { name: "Tozeur", code: "TN-73" },
      geometry: {
        type: "Polygon",
        coordinates: [[[7.65, 34.55], [8.15, 34.55], [8.35, 34.05], [8.25, 33.75], [7.95, 33.70], [7.60, 33.85], [7.55, 34.20], [7.65, 34.55]]]
      }
    }
  },
  {
    id: "kebili",
    name: "Kébili",
    name_ar: "قبلي",
    code: "TN-74",
    population: 156961,
    area_km2: 22454,
    geojson: {
      type: "Feature",
      properties: { name: "Kébili", code: "TN-74" },
      geometry: {
        type: "Polygon",
        coordinates: [[[8.25, 33.75], [8.85, 33.85], [9.25, 33.65], [9.45, 33.35], [9.45, 32.85], [9.45, 32.55], [9.15, 32.40], [8.65, 32.55], [8.25, 32.85], [7.95, 33.15], [7.95, 33.70], [8.25, 33.75]]]
      }
    }
  }
];
