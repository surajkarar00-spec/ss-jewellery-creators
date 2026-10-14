// SS JEWELLERY CREATORS — 3D Asset Marketplace
// Product Catalog: Architecture & Game Design Assets

const CATALOG_PRODUCTS = [
  // ── ARCHITECTURE ──────────────────────────────────────────────
  {
    id: 1,
    name: "Neo-Brutalist Tower Complex",
    creator: "ArchiCore Studio",
    creatorId: "archicore",
    category: "architecture",
    subcategory: "urban",
    price: 149,
    originalPrice: 199,
    rating: 4.9,
    reviews: 84,
    downloads: 1203,
    fileSize: "2.4 GB",
    formats: [".fbx", ".obj", ".blend", ".max"],
    polygons: "2.1M",
    textures: "8K PBR",
    licensed: "Standard + Extended",
    tags: ["brutalist", "tower", "urban", "exterior", "highrise", "concrete"],
    description: "Photorealistic neo-brutalist tower complex featuring exposed concrete facades, modular floor systems, and full interior lobbies. Fully textured with 8K PBR materials and ready for Unreal Engine 5 Lumen.",
    featured: true,
    new: false,
    accentColor: "#0ea5ff",
    svgType: "building"
  },
  {
    id: 2,
    name: "Japanese Zen Garden Interior",
    creator: "Wabi Design",
    creatorId: "wabi-design",
    category: "architecture",
    subcategory: "interior",
    price: 89,
    originalPrice: null,
    rating: 4.8,
    reviews: 56,
    downloads: 876,
    fileSize: "1.1 GB",
    formats: [".fbx", ".obj", ".blend"],
    polygons: "890K",
    textures: "4K PBR",
    licensed: "Standard",
    tags: ["interior", "japanese", "zen", "garden", "minimalist", "natural"],
    description: "Serene Japanese interior with raked sand garden, shoji screens, timber details, and curated stone arrangements. Optimised geometry with modular room pieces.",
    featured: false,
    new: true,
    accentColor: "#38bdf8",
    svgType: "interior"
  },
  {
    id: 3,
    name: "Smart City Urban Block",
    creator: "UrbanMesh",
    creatorId: "urbanmesh",
    category: "architecture",
    subcategory: "urban",
    price: 229,
    originalPrice: 299,
    rating: 4.7,
    reviews: 132,
    downloads: 2145,
    fileSize: "4.8 GB",
    formats: [".fbx", ".obj", ".blend", ".max"],
    polygons: "5.6M",
    textures: "8K PBR",
    licensed: "Standard + Extended",
    tags: ["city", "urban", "smart", "streets", "infrastructure", "bim"],
    description: "Complete city block with mixed-use towers, street furniture, traffic systems, LED signage, and underground parking. BIM-ready with proper layer organisation.",
    featured: true,
    new: false,
    accentColor: "#0ea5ff",
    svgType: "city"
  },
  {
    id: 4,
    name: "Gothic Cathedral — Full Interior",
    creator: "StoneCraft3D",
    creatorId: "stonecraft3d",
    category: "architecture",
    subcategory: "historical",
    price: 179,
    originalPrice: null,
    rating: 4.9,
    reviews: 203,
    downloads: 3410,
    fileSize: "3.2 GB",
    formats: [".fbx", ".obj", ".blend", ".max"],
    polygons: "3.8M",
    textures: "8K PBR",
    licensed: "Standard + Extended",
    tags: ["gothic", "cathedral", "medieval", "interior", "stained-glass", "historical"],
    description: "Breathtaking Gothic cathedral with ribbed vaulting, flying buttresses, complete stained-glass windows, and fully detailed nave interior. Includes day/night lighting setups.",
    featured: true,
    new: false,
    accentColor: "#7c3aed",
    svgType: "cathedral"
  },
  {
    id: 5,
    name: "Scandinavian Cabin — Modular Kit",
    creator: "NordForm",
    creatorId: "nordform",
    category: "architecture",
    subcategory: "residential",
    price: 69,
    originalPrice: null,
    rating: 4.6,
    reviews: 47,
    downloads: 654,
    fileSize: "820 MB",
    formats: [".fbx", ".obj", ".blend"],
    polygons: "640K",
    textures: "4K PBR",
    licensed: "Standard",
    tags: ["cabin", "scandinavian", "nordic", "modular", "residential", "timber"],
    description: "Modular Scandinavian cabin kit with 60+ interchangeable pieces: wall panels, windows, roof sections, and interior furniture. Perfect for animation and arch-viz renders.",
    featured: false,
    new: true,
    accentColor: "#38bdf8",
    svgType: "building"
  },

  // ── GAME DESIGN ───────────────────────────────────────────────
  {
    id: 6,
    name: "Mecha Warrior — Rigged & Animated",
    creator: "IronPoly Studio",
    creatorId: "ironpoly",
    category: "game-design",
    subcategory: "characters",
    price: 119,
    originalPrice: 159,
    rating: 4.9,
    reviews: 178,
    downloads: 4320,
    fileSize: "680 MB",
    formats: [".fbx", ".blend", ".unitypackage", ".uasset"],
    polygons: "42K (game-ready)",
    textures: "4K PBR",
    licensed: "Standard + Extended",
    tags: ["mecha", "robot", "rigged", "animated", "sci-fi", "character"],
    description: "AAA-quality mecha warrior with 85 bones rig, 120+ animations (combat, idle, locomotion), LOD levels 0–3, and complete PBR texture sets for Unity and Unreal.",
    featured: true,
    new: false,
    accentColor: "#0ea5ff",
    svgType: "character"
  },
  {
    id: 7,
    name: "Dark Fantasy Environment Pack",
    creator: "ShadowForge",
    creatorId: "shadowforge",
    category: "game-design",
    subcategory: "environments",
    price: 199,
    originalPrice: 249,
    rating: 4.8,
    reviews: 96,
    downloads: 1876,
    fileSize: "5.1 GB",
    formats: [".fbx", ".obj", ".unitypackage", ".uasset"],
    polygons: "Mixed LOD",
    textures: "2K–4K PBR",
    licensed: "Standard + Extended",
    tags: ["fantasy", "dark", "environment", "dungeon", "castle", "modular"],
    description: "450-piece modular dark fantasy environment kit: dungeon corridors, castle battlements, caverns, and atmospheric props. Tested in Unity 6 and Unreal 5.3.",
    featured: true,
    new: false,
    accentColor: "#7c3aed",
    svgType: "environment"
  },
  {
    id: 8,
    name: "Low-Poly City Builder Tileset",
    creator: "PixelVert",
    creatorId: "pixelvert",
    category: "game-design",
    subcategory: "environments",
    price: 49,
    originalPrice: null,
    rating: 4.7,
    reviews: 311,
    downloads: 8900,
    fileSize: "290 MB",
    formats: [".fbx", ".obj", ".unitypackage"],
    polygons: "200–2K per tile",
    textures: "Atlas + gradients",
    licensed: "Standard",
    tags: ["low-poly", "city", "tileset", "mobile", "indie", "stylised"],
    description: "260-tile low-poly city tileset optimised for mobile games (iOS/Android). Includes road networks, buildings, parks, and procedural generation support.",
    featured: false,
    new: false,
    accentColor: "#38bdf8",
    svgType: "city"
  },
  {
    id: 9,
    name: "Photorealistic Texture Pack — Stone & Brick",
    creator: "Substance Lab",
    creatorId: "substance-lab",
    category: "game-design",
    subcategory: "textures",
    price: 39,
    originalPrice: null,
    rating: 4.8,
    reviews: 425,
    downloads: 12450,
    fileSize: "6.8 GB",
    formats: [".blend", ".obj"],
    polygons: "N/A",
    textures: "8K Tileable",
    licensed: "Standard + Extended",
    tags: ["texture", "pbr", "stone", "brick", "tileable", "photorealistic"],
    description: "180 photoscan-derived tileable PBR textures: aged brick, stone, marble, concrete, and plaster at 8K resolution. Albedo, Normal, Roughness, AO, Height maps included.",
    featured: false,
    new: true,
    accentColor: "#0ea5ff",
    svgType: "texture"
  },
  {
    id: 10,
    name: "Space Station — Sci-Fi Interior",
    creator: "OrbitCraft",
    creatorId: "orbitcraft",
    category: "game-design",
    subcategory: "environments",
    price: 169,
    originalPrice: 219,
    rating: 4.9,
    reviews: 143,
    downloads: 2780,
    fileSize: "3.6 GB",
    formats: [".fbx", ".obj", ".unitypackage", ".uasset"],
    polygons: "Mixed LOD",
    textures: "4K PBR + Emissive",
    licensed: "Standard + Extended",
    tags: ["space", "sci-fi", "interior", "station", "futuristic", "corridor"],
    description: "Modular space station interior with 320 pieces: command bridge, cryo-bays, engine rooms, and EVA airlocks. Full emissive maps and ready-made lighting presets.",
    featured: true,
    new: false,
    accentColor: "#0ea5ff",
    svgType: "environment"
  },
  {
    id: 11,
    name: "Fantasy Forest — Nature Asset Bundle",
    creator: "GreenVoxel",
    creatorId: "greenvoxel",
    category: "game-design",
    subcategory: "environments",
    price: 89,
    originalPrice: null,
    rating: 4.6,
    reviews: 67,
    downloads: 1340,
    fileSize: "2.2 GB",
    formats: [".fbx", ".obj", ".unitypackage", ".uasset"],
    polygons: "Mixed LOD",
    textures: "2K–4K PBR",
    licensed: "Standard",
    tags: ["forest", "nature", "trees", "plants", "fantasy", "foliage"],
    description: "280-asset fantasy forest pack: oak, birch, and willow trees with seasonal variants, dense undergrowth, rocks, streams, and magical flora with emissive materials.",
    featured: false,
    new: false,
    accentColor: "#38bdf8",
    svgType: "environment"
  },
  {
    id: 12,
    name: "Cyberpunk Street Scene",
    creator: "NeonDrift",
    creatorId: "neondrift",
    category: "game-design",
    subcategory: "environments",
    price: 139,
    originalPrice: 189,
    rating: 4.8,
    reviews: 89,
    downloads: 1987,
    fileSize: "2.9 GB",
    formats: [".fbx", ".obj", ".unitypackage", ".uasset"],
    polygons: "Mixed LOD",
    textures: "4K PBR + Neon Emissive",
    licensed: "Standard + Extended",
    tags: ["cyberpunk", "neon", "street", "urban", "night", "futuristic"],
    description: "Rain-slicked cyberpunk street with animated neon signs, holographic billboards, street vendors, rain VFX support, and a full set of dystopian props.",
    featured: true,
    new: true,
    accentColor: "#7c3aed",
    svgType: "city"
  },
  {
    id: 13,
    name: "18K Gold Halo Engagement Ring",
    creator: "SS Jewellery Creators",
    creatorId: "ssjc",
    category: "jewellery",
    subcategory: "rings",
    price: 79,
    originalPrice: 99,
    rating: 4.9,
    reviews: 38,
    downloads: 482,
    fileSize: "184 MB",
    formats: [".blend", ".fbx", ".obj", ".stl"],
    polygons: "96K",
    textures: "4K PBR",
    licensed: "Standard + Extended",
    tags: ["jewellery", "jewelry", "ring", "engagement", "gold", "diamond", "halo"],
    description: "A polished 18K gold engagement ring model with a halo setting and brilliant-cut center stone. Includes clean topology, PBR materials, and export-ready formats.",
    featured: true,
    new: true,
    accentColor: "#f4c76a",
    svgType: "ring"
  },
  {
    id: 14,
    name: "Kundan Bridal Necklace Set",
    creator: "SS Jewellery Creators",
    creatorId: "ssjc",
    category: "jewellery",
    subcategory: "necklaces",
    price: 129,
    originalPrice: 159,
    rating: 4.8,
    reviews: 24,
    downloads: 316,
    fileSize: "328 MB",
    formats: [".blend", ".fbx", ".obj", ".stl"],
    polygons: "214K",
    textures: "4K PBR",
    licensed: "Standard + Extended",
    tags: ["jewellery", "jewelry", "kundan", "bridal", "necklace", "gold", "traditional"],
    description: "Detailed bridal necklace set inspired by traditional Kundan jewellery, with layered stones, gold settings, matching earrings, and material variants.",
    featured: true,
    new: true,
    accentColor: "#f0bd5e",
    svgType: "necklace"
  },
  {
    id: 15,
    name: "Sculpted Gold Hoop Earrings",
    creator: "SS Jewellery Creators",
    creatorId: "ssjc",
    category: "jewellery",
    subcategory: "earrings",
    price: 39,
    originalPrice: null,
    rating: 4.7,
    reviews: 19,
    downloads: 205,
    fileSize: "112 MB",
    formats: [".blend", ".fbx", ".obj", ".stl"],
    polygons: "58K",
    textures: "2K PBR",
    licensed: "Standard",
    tags: ["jewellery", "jewelry", "earrings", "hoops", "gold", "sculpted"],
    description: "Pair of contemporary sculpted gold hoops with a smooth polished finish, modeled as separate left and right pieces for easy product visualization.",
    featured: false,
    new: true,
    accentColor: "#e8b75b",
    svgType: "earrings"
  },
  {
    id: 16,
    name: "Floral Temple Pendant",
    creator: "SS Jewellery Creators",
    creatorId: "ssjc",
    category: "jewellery",
    subcategory: "pendants",
    price: 49,
    originalPrice: null,
    rating: 4.8,
    reviews: 17,
    downloads: 174,
    fileSize: "146 MB",
    formats: [".blend", ".fbx", ".obj", ".stl"],
    polygons: "82K",
    textures: "4K PBR",
    licensed: "Standard",
    tags: ["jewellery", "jewelry", "pendant", "temple", "floral", "gold", "traditional"],
    description: "Floral temple-style pendant with engraved petal details and a raised center motif. Includes gold and antique-finish material presets.",
    featured: false,
    new: true,
    accentColor: "#efc66e",
    svgType: "pendant"
  },
  {
    id: 17,
    name: "Classic Diamond Tennis Bracelet",
    creator: "SS Jewellery Creators",
    creatorId: "ssjc",
    category: "jewellery",
    subcategory: "bracelets",
    price: 69,
    originalPrice: 89,
    rating: 4.9,
    reviews: 31,
    downloads: 268,
    fileSize: "202 MB",
    formats: [".blend", ".fbx", ".obj", ".stl"],
    polygons: "128K",
    textures: "4K PBR",
    licensed: "Standard + Extended",
    tags: ["jewellery", "jewelry", "bracelet", "tennis", "diamond", "silver"],
    description: "Elegant tennis bracelet model with individually set stones, polished metal links, and a detailed clasp, suitable for close-up rendering.",
    featured: true,
    new: false,
    accentColor: "#d9e6f5",
    svgType: "bracelet"
  },
  {
    id: 18,
    name: "Blue Sapphire Signet Ring",
    creator: "SS Jewellery Creators",
    creatorId: "ssjc",
    category: "jewellery",
    subcategory: "rings",
    price: 59,
    originalPrice: null,
    rating: 4.8,
    reviews: 22,
    downloads: 193,
    fileSize: "168 MB",
    formats: [".blend", ".fbx", ".obj", ".stl"],
    polygons: "104K",
    textures: "4K PBR",
    licensed: "Standard",
    tags: ["jewellery", "jewelry", "ring", "sapphire", "signet", "silver", "gemstone"],
    description: "Contemporary signet ring with a deep-blue sapphire centerpiece, beveled shoulders, and silver and gold material options.",
    featured: false,
    new: true,
    accentColor: "#5ba8ff",
    svgType: "ring"
  }
];

const PRODUCTS = CATALOG_PRODUCTS.filter(product => product.category === "jewellery");

const PRODUCT_IMAGES = {
  1: 'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=900&q=80',
  2: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
  3: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=900&q=80',
  4: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=900&q=80',
  5: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80',
  6: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80',
  7: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
  8: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=900&q=80',
  9: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=900&q=80',
  10: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=900&q=80',
  11: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80',
  12: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=80',
  13: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=80',
  14: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=80',
  15: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=80',
  16: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=900&q=80',
  17: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=80',
  18: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=80'
};

// ── Creator Profiles ──────────────────────────────────────────────────────────
const CREATORS = {  "archicore": { name: "ArchiCore Studio", avatar: "AC", sales: 8420, rating: 4.9, products: 34, joined: "2021" },
  "wabi-design": { name: "Wabi Design", avatar: "WD", sales: 3210, rating: 4.8, products: 18, joined: "2022" },
  "urbanmesh": { name: "UrbanMesh", avatar: "UM", sales: 12340, rating: 4.7, products: 27, joined: "2020" },
  "stonecraft3d": { name: "StoneCraft3D", avatar: "SC", sales: 18900, rating: 4.9, products: 41, joined: "2019" },
  "nordform": { name: "NordForm", avatar: "NF", sales: 2100, rating: 4.6, products: 12, joined: "2023" },
  "ironpoly": { name: "IronPoly Studio", avatar: "IP", sales: 22400, rating: 4.9, products: 58, joined: "2019" },
  "shadowforge": { name: "ShadowForge", avatar: "SF", sales: 9870, rating: 4.8, products: 23, joined: "2021" },
  "pixelvert": { name: "PixelVert", avatar: "PV", sales: 34200, rating: 4.7, products: 76, joined: "2018" },
  "substance-lab": { name: "Substance Lab", avatar: "SL", sales: 45600, rating: 4.8, products: 112, joined: "2017" },
  "orbitcraft": { name: "OrbitCraft", avatar: "OC", sales: 11200, rating: 4.9, products: 19, joined: "2021" },
  "greenvoxel": { name: "GreenVoxel", avatar: "GV", sales: 5430, rating: 4.6, products: 31, joined: "2022" },
  "neondrift": { name: "NeonDrift", avatar: "ND", sales: 7890, rating: 4.8, products: 22, joined: "2021" },
  "ssjc": { name: "SS Jewellery Creators", avatar: "SS", sales: 1640, rating: 4.9, products: 6, joined: "2024" }
};

// ── SVG Generator — Procedural 3D Asset Previews ─────────────────────────────
function generateProductSVG(type, accentColor = "#0ea5ff", size = 200) {
  const id = Math.random().toString(36).substr(2,6);
  const c = accentColor;
  const dark = "#0b0f1a";
  const mid = "#131929";

  const svgMap = {
    building: () => `
      <svg width="${size}" height="${size}" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg${id}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${mid}"/>
            <stop offset="100%" stop-color="${dark}"/>
          </linearGradient>
          <linearGradient id="bld${id}" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="${c}" stop-opacity="0.7"/>
            <stop offset="100%" stop-color="${c}" stop-opacity="0.15"/>
          </linearGradient>
          <filter id="glow${id}"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        <rect width="200" height="200" fill="url(#bg${id})"/>
        <!-- Ground -->
        <rect x="0" y="170" width="200" height="30" fill="${dark}" opacity="0.6"/>
        <!-- Main tower -->
        <rect x="70" y="40" width="60" height="130" fill="url(#bld${id})" stroke="${c}" stroke-width="0.5"/>
        <!-- Windows grid -->
        ${Array.from({length:6}, (_,r) => Array.from({length:3}, (_,cc) =>
          `<rect x="${80+cc*16}" y="${55+r*17}" width="8" height="10" fill="${c}" opacity="${Math.random()*0.5+0.2}"/>`
        ).join('')).join('')}
        <!-- Side building -->
        <rect x="30" y="90" width="36" height="80" fill="${c}" opacity="0.12" stroke="${c}" stroke-width="0.5"/>
        ${Array.from({length:4}, (_,r) => Array.from({length:2}, (_,cc) =>
          `<rect x="${37+cc*14}" y="${100+r*15}" width="7" height="8" fill="${c}" opacity="${Math.random()*0.4+0.1}"/>`
        ).join('')).join('')}
        <!-- Right building -->
        <rect x="134" y="110" width="36" height="60" fill="${c}" opacity="0.12" stroke="${c}" stroke-width="0.5"/>
        <!-- Ground glow -->
        <ellipse cx="100" cy="175" rx="60" ry="6" fill="${c}" opacity="0.12" filter="url(#glow${id})"/>
        <!-- Accent spire -->
        <line x1="100" y1="40" x2="100" y2="15" stroke="${c}" stroke-width="1.5" filter="url(#glow${id})"/>
        <circle cx="100" cy="13" r="3" fill="${c}" filter="url(#glow${id})"/>
      </svg>`,

    interior: () => `
      <svg width="${size}" height="${size}" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg${id}" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="${mid}"/>
            <stop offset="100%" stop-color="${dark}"/>
          </linearGradient>
          <filter id="glow${id}"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        <rect width="200" height="200" fill="url(#bg${id})"/>
        <!-- Floor perspective -->
        <polygon points="20,180 100,120 180,180" fill="${c}" opacity="0.07" stroke="${c}" stroke-width="0.5"/>
        <!-- Back wall -->
        <polygon points="40,40 160,40 180,120 20,120" fill="${c}" opacity="0.06" stroke="${c}" stroke-width="0.5"/>
        <!-- Window light shaft -->
        <polygon points="80,40 120,40 140,120 60,120" fill="${c}" opacity="0.12" filter="url(#glow${id})"/>
        <!-- Furniture silhouettes -->
        <rect x="60" y="135" width="30" height="20" rx="2" fill="${c}" opacity="0.2"/>
        <rect x="100" y="140" width="40" height="15" rx="1" fill="${c}" opacity="0.15"/>
        <!-- Grid lines on floor -->
        ${Array.from({length:5}, (_,i) =>
          `<line x1="${20+i*32}" y1="180" x2="${60+i*20}" y2="120" stroke="${c}" stroke-width="0.4" opacity="0.3"/>`
        ).join('')}
        <!-- Horizon glow -->
        <line x1="20" y1="120" x2="180" y2="120" stroke="${c}" stroke-width="0.8" opacity="0.4" filter="url(#glow${id})"/>
      </svg>`,

    city: () => `
      <svg width="${size}" height="${size}" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="sky${id}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${dark}"/>
            <stop offset="60%" stop-color="${mid}"/>
            <stop offset="100%" stop-color="${dark}"/>
          </linearGradient>
          <filter id="glow${id}"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        <rect width="200" height="200" fill="url(#sky${id})"/>
        <!-- City skyline silhouette -->
        <polygon points="0,160 15,160 15,110 30,110 30,90 45,90 45,130 60,130 60,70 75,70 75,140 90,140 90,60 105,60 105,80 120,80 120,50 135,50 135,100 150,100 150,85 165,85 165,120 180,120 180,160 200,160 200,200 0,200" fill="${c}" opacity="0.12"/>
        <!-- Building windows rows -->
        ${[{x:62,y:72,w:10,h:60},{x:92,y:62,w:10,h:75},{x:122,y:52,w:10,h:88}].map(b =>
          Array.from({length:Math.floor(b.h/12)}, (_,r) =>
            `<rect x="${b.x+1}" y="${b.y+2+r*12}" width="8" height="6" fill="${c}" opacity="${Math.random()*0.5+0.2}"/>`
          ).join('')
        ).join('')}
        <!-- Road glow -->
        <rect x="0" y="162" width="200" height="4" fill="${c}" opacity="0.15" filter="url(#glow${id})"/>
        <!-- Horizon haze -->
        <rect x="0" y="155" width="200" height="8" fill="${c}" opacity="0.05" filter="url(#glow${id})"/>
        <!-- Moon / accent dot -->
        <circle cx="165" cy="30" r="10" fill="none" stroke="${c}" stroke-width="1" opacity="0.4"/>
        <circle cx="165" cy="30" r="6" fill="${c}" opacity="0.15"/>
      </svg>`,

    character: () => `
      <svg width="${size}" height="${size}" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg${id}" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="${mid}"/>
            <stop offset="100%" stop-color="${dark}"/>
          </linearGradient>
          <linearGradient id="char${id}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${c}" stop-opacity="0.9"/>
            <stop offset="100%" stop-color="${c}" stop-opacity="0.3"/>
          </linearGradient>
          <filter id="glow${id}"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        <rect width="200" height="200" fill="url(#bg${id})"/>
        <!-- Body -->
        <rect x="72" y="80" width="56" height="70" rx="6" fill="url(#char${id})" stroke="${c}" stroke-width="1"/>
        <!-- Head -->
        <rect x="78" y="45" width="44" height="38" rx="8" fill="${c}" opacity="0.6" stroke="${c}" stroke-width="1" filter="url(#glow${id})"/>
        <!-- Eyes -->
        <rect x="87" y="56" width="8" height="5" fill="${dark}"/>
        <rect x="105" y="56" width="8" height="5" fill="${dark}"/>
        <rect x="89" y="57" width="4" height="3" fill="${c}" filter="url(#glow${id})"/>
        <rect x="107" y="57" width="4" height="3" fill="${c}" filter="url(#glow${id})"/>
        <!-- Arms -->
        <rect x="45" y="85" width="24" height="12" rx="4" fill="${c}" opacity="0.4" transform="rotate(-20 57 91)"/>
        <rect x="131" y="85" width="24" height="12" rx="4" fill="${c}" opacity="0.4" transform="rotate(20 143 91)"/>
        <!-- Legs -->
        <rect x="76" y="148" width="18" height="32" rx="4" fill="${c}" opacity="0.5"/>
        <rect x="106" y="148" width="18" height="32" rx="4" fill="${c}" opacity="0.5"/>
        <!-- Ground glow -->
        <ellipse cx="100" cy="185" rx="40" ry="5" fill="${c}" opacity="0.2" filter="url(#glow${id})"/>
        <!-- Rig points -->
        ${[[100,83],[72,91],[128,91],[85,150],[115,150]].map(([px,py]) =>
          `<circle cx="${px}" cy="${py}" r="2.5" fill="${c}" opacity="0.7"/>`
        ).join('')}
      </svg>`,

    environment: () => `
      <svg width="${size}" height="${size}" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="bg${id}" cx="50%" cy="60%" r="70%">
            <stop offset="0%" stop-color="${mid}"/>
            <stop offset="100%" stop-color="${dark}"/>
          </radialGradient>
          <filter id="glow${id}"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        <rect width="200" height="200" fill="url(#bg${id})"/>
        <!-- Landscape layers -->
        <polygon points="0,140 40,100 80,120 120,90 160,110 200,95 200,200 0,200" fill="${c}" opacity="0.08"/>
        <polygon points="0,155 30,130 70,145 110,115 150,130 200,110 200,200 0,200" fill="${c}" opacity="0.12"/>
        <!-- Trees -->
        ${[30,60,90,140,165].map((tx, i) => `
          <polygon points="${tx},${105+i%2*10} ${tx-12},${130+i%2*10} ${tx+12},${130+i%2*10}" fill="${c}" opacity="0.3"/>
          <rect x="${tx-3}" y="${130+i%2*10}" width="6" height="12" fill="${c}" opacity="0.2"/>
        `).join('')}
        <!-- Light source -->
        <circle cx="160" cy="40" r="18" fill="${c}" opacity="0.08" filter="url(#glow${id})"/>
        <circle cx="160" cy="40" r="8" fill="${c}" opacity="0.25" filter="url(#glow${id})"/>
        <!-- Light rays -->
        ${Array.from({length:6}, (_,i) => {
          const ang = (i/6)*Math.PI + Math.PI/8;
          const x2 = 160 + Math.cos(ang)*60;
          const y2 = 40 + Math.sin(ang)*60;
          return `<line x1="160" y1="40" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="0.5" opacity="0.15"/>`;
        }).join('')}
        <!-- Ground line glow -->
        <line x1="0" y1="155" x2="200" y2="155" stroke="${c}" stroke-width="0.6" opacity="0.2" filter="url(#glow${id})"/>
      </svg>`,

    cathedral: () => `
      <svg width="${size}" height="${size}" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg${id}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${dark}"/>
            <stop offset="100%" stop-color="${mid}"/>
          </linearGradient>
          <filter id="glow${id}"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        <rect width="200" height="200" fill="url(#bg${id})"/>
        <!-- Main nave -->
        <rect x="65" y="80" width="70" height="100" fill="${c}" opacity="0.1" stroke="${c}" stroke-width="0.5"/>
        <!-- Central spire -->
        <polygon points="100,10 112,80 88,80" fill="${c}" opacity="0.4" stroke="${c}" stroke-width="0.5" filter="url(#glow${id})"/>
        <!-- Side towers -->
        <polygon points="65,35 72,80 58,80" fill="${c}" opacity="0.3" stroke="${c}" stroke-width="0.5"/>
        <polygon points="135,35 142,80 128,80" fill="${c}" opacity="0.3" stroke="${c}" stroke-width="0.5"/>
        <!-- Rose window -->
        <circle cx="100" cy="100" r="18" fill="none" stroke="${c}" stroke-width="1.5" opacity="0.6" filter="url(#glow${id})"/>
        ${Array.from({length:8}, (_,i) => {
          const ang = i/8*Math.PI*2;
          return `<line x1="100" y1="100" x2="${100+Math.cos(ang)*18}" y2="${100+Math.sin(ang)*18}" stroke="${c}" stroke-width="0.8" opacity="0.5"/>`;
        }).join('')}
        <circle cx="100" cy="100" r="6" fill="${c}" opacity="0.3"/>
        <!-- Arch windows -->
        ${[-20,0,20].map(ox =>
          `<path d="M${90+ox},115 Q${90+ox},105 ${100+ox},105 Q${110+ox},105 ${110+ox},115 L${110+ox},145 L${90+ox},145 Z" fill="${c}" opacity="0.18"/>`
        ).join('')}
        <!-- Ground -->
        <rect x="40" y="178" width="120" height="8" fill="${c}" opacity="0.1"/>
        <!-- Cross top -->
        <line x1="100" y1="3" x2="100" y2="15" stroke="${c}" stroke-width="1.5" filter="url(#glow${id})"/>
        <line x1="96" y1="7" x2="104" y2="7" stroke="${c}" stroke-width="1.5" filter="url(#glow${id})"/>
      </svg>`,

    texture: () => `
      <svg width="${size}" height="${size}" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg${id}" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="${mid}"/>
            <stop offset="100%" stop-color="${dark}"/>
          </linearGradient>
          <filter id="glow${id}"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        <rect width="200" height="200" fill="url(#bg${id})"/>
        <!-- Tiling grid to represent a texture -->
        ${Array.from({length:8}, (_,r) => Array.from({length:8}, (_,cc) => {
          const op = (0.05 + (r+cc)%3 * 0.06).toFixed(2);
          return `<rect x="${cc*25}" y="${r*25}" width="24" height="24" fill="${c}" opacity="${op}" rx="1"/>`;
        }).join('')).join('')}
        <!-- PBR Channel indicators -->
        ${[["ALB","#0ea5ff",30],["NRM","#a78bfa",80],["RGH","#34d399",130],["AO","#f59e0b",180]].map(([lbl,col,x]) =>
          `<rect x="${x-18}" y="88" width="36" height="24" rx="4" fill="${col}" opacity="0.15" stroke="${col}" stroke-width="0.8"/>
           <text x="${x}" y="104" text-anchor="middle" fill="${col}" font-size="9" font-family="monospace" opacity="0.9">${lbl}</text>`
        ).join('')}
        <!-- Diagonal light sweep -->
        <line x1="0" y1="200" x2="200" y2="0" stroke="${c}" stroke-width="0.5" opacity="0.15" filter="url(#glow${id})"/>
        <line x1="40" y1="200" x2="200" y2="40" stroke="${c}" stroke-width="0.3" opacity="0.1"/>
      </svg>`
  };

  return (svgMap[type] || svgMap.building)();
}
