import { Governorate } from "@/types/events";

// Placeholder GeoJSON data - À remplacer avec les vraies coordonnées
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
        coordinates: [[[10.0, 36.8], [10.2, 36.8], [10.2, 36.7], [10.0, 36.7], [10.0, 36.8]]]
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
        coordinates: [[[10.1, 36.9], [10.3, 36.9], [10.3, 36.8], [10.1, 36.8], [10.1, 36.9]]]
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
        coordinates: [[[10.1, 36.7], [10.3, 36.7], [10.3, 36.6], [10.1, 36.6], [10.1, 36.7]]]
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
        coordinates: [[[9.9, 36.9], [10.1, 36.9], [10.1, 36.7], [9.9, 36.7], [9.9, 36.9]]]
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
        coordinates: [[[10.5, 36.5], [11.0, 36.5], [11.0, 36.2], [10.5, 36.2], [10.5, 36.5]]]
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
        coordinates: [[[10.0, 36.5], [10.5, 36.5], [10.5, 36.2], [10.0, 36.2], [10.0, 36.5]]]
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
        coordinates: [[[9.5, 37.3], [10.0, 37.3], [10.0, 36.9], [9.5, 36.9], [9.5, 37.3]]]
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
        coordinates: [[[9.0, 36.8], [9.5, 36.8], [9.5, 36.5], [9.0, 36.5], [9.0, 36.8]]]
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
        coordinates: [[[8.5, 37.0], [9.0, 37.0], [9.0, 36.5], [8.5, 36.5], [8.5, 37.0]]]
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
        coordinates: [[[8.5, 36.5], [9.0, 36.5], [9.0, 36.0], [8.5, 36.0], [8.5, 36.5]]]
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
        coordinates: [[[9.0, 36.5], [9.5, 36.5], [9.5, 36.0], [9.0, 36.0], [9.0, 36.5]]]
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
        coordinates: [[[10.3, 36.0], [10.8, 36.0], [10.8, 35.7], [10.3, 35.7], [10.3, 36.0]]]
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
        coordinates: [[[10.6, 35.8], [11.0, 35.8], [11.0, 35.5], [10.6, 35.5], [10.6, 35.8]]]
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
        coordinates: [[[10.8, 35.7], [11.2, 35.7], [11.2, 35.3], [10.8, 35.3], [10.8, 35.7]]]
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
        coordinates: [[[10.5, 35.0], [11.0, 35.0], [11.0, 34.5], [10.5, 34.5], [10.5, 35.0]]]
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
        coordinates: [[[9.5, 35.8], [10.3, 35.8], [10.3, 35.3], [9.5, 35.3], [9.5, 35.8]]]
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
        coordinates: [[[8.5, 35.5], [9.5, 35.5], [9.5, 34.8], [8.5, 34.8], [8.5, 35.5]]]
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
        coordinates: [[[9.0, 35.3], [10.0, 35.3], [10.0, 34.8], [9.0, 34.8], [9.0, 35.3]]]
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
        coordinates: [[[9.8, 34.0], [10.5, 34.0], [10.5, 33.5], [9.8, 33.5], [9.8, 34.0]]]
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
        coordinates: [[[10.3, 33.5], [11.0, 33.5], [11.0, 33.0], [10.3, 33.0], [10.3, 33.5]]]
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
        coordinates: [[[9.5, 33.0], [11.0, 33.0], [11.0, 32.0], [9.5, 32.0], [9.5, 33.0]]]
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
        coordinates: [[[8.0, 34.5], [9.5, 34.5], [9.5, 33.8], [8.0, 33.8], [8.0, 34.5]]]
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
        coordinates: [[[7.5, 34.5], [8.5, 34.5], [8.5, 33.8], [7.5, 33.8], [7.5, 34.5]]]
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
        coordinates: [[[8.0, 33.8], [9.5, 33.8], [9.5, 33.0], [8.0, 33.0], [8.0, 33.8]]]
      }
    }
  }
];
