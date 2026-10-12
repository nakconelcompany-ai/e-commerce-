export interface ProductItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  categorySlug: string;
  brand: string;
  basePriceMinor: number;
  compareAtPriceMinor?: number;
  images: string[];
  ratingAverage: number;
  reviewCount: number;
  description: string;
  specifications: Record<string, string>;
  inStock: boolean;
  stockQuantity: number;
  sku: string;
  seller: {
    storeName: string;
    storeSlug: string;
    isVerified: boolean;
    rating: number;
    location: string;
  };
  relatedSlugs: string[];
}

export const allProducts: ProductItem[] = [
  {
    id: 'prod-1',
    title: 'UltraBook Pro 15 M3 16GB RAM / 512GB SSD Space Gray',
    slug: 'ultrabook-pro-15-m3',
    category: 'Computers & Laptops',
    categorySlug: 'computers-laptops',
    brand: 'Apple',
    basePriceMinor: 145000000, // ₦1,450,000
    compareAtPriceMinor: 160000000, // ₦1,600,000
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=1000&q=80',
    ],
    ratingAverage: 4.9,
    reviewCount: 142,
    description:
      'Engineered for ultimate productivity and battery efficiency. Features the next-generation M3 chip with an 8-core CPU and 10-core GPU, stunning 15.3-inch Liquid Retina display with 500 nits brightness, 1080p FaceTime HD camera, six-speaker sound system with Spatial Audio, and up to 18 hours of continuous battery life.',
    specifications: {
      Processor: 'Apple M3 chip (8-core CPU, 10-core GPU)',
      Memory: '16GB Unified RAM',
      Storage: '512GB High-Speed NVMe SSD',
      Display: '15.3-inch Liquid Retina Display (2880 x 1864)',
      Battery: 'Up to 18 hours runtime (66.5Wh Lithium-polymer)',
      Ports: 'MagSafe 3, 2x Thunderbolt / USB 4, 3.5mm Headphone Jack',
      Warranty: '1 Year Apple Official Warranty',
    },
    inStock: true,
    stockQuantity: 18,
    sku: 'UBP-15M3-16512-SG',
    seller: {
      storeName: 'Apex Tech Hub',
      storeSlug: 'apex-tech-hub',
      isVerified: true,
      rating: 4.9,
      location: 'Computer Village, Ikeja, Lagos',
    },
    relatedSlugs: [
      'nuvora-nova-5g-smartphone',
      'noise-cancelling-wireless-headphones-anc',
      'ipad-air-m2-11-inch',
      'smart-oled-series-9-4k-hdr-55-inch-tv',
    ],
  },
  {
    id: 'prod-2',
    title: 'Nuvora Nova 5G Smartphone 256GB Dual SIM Champagne Gold',
    slug: 'nuvora-nova-5g-smartphone',
    category: 'Phones & Tablets',
    categorySlug: 'phones-tablets',
    brand: 'NovaTech',
    basePriceMinor: 48000000, // ₦480,000
    compareAtPriceMinor: 52000000,
    images: [
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=1000&q=80',
    ],
    ratingAverage: 4.8,
    reviewCount: 96,
    description:
      'Supercharged flagship performance with lightning-fast 5G connectivity. Boasts a 6.7-inch 120Hz Curved AMOLED display with HDR10+, flagship Snapdragon 8 Gen 2 processor, 50MP Sony IMX primary sensor with Optical Image Stabilization (OIS), and 67W Turbo Flash Charging with a massive 5000mAh battery.',
    specifications: {
      Display: '6.7-inch Curved AMOLED 120Hz FHD+ (2412 x 1080)',
      Processor: 'Qualcomm Snapdragon 8 Gen 2 Octa-Core',
      RAM: '12GB LPDDR5X + 8GB Virtual RAM',
      Storage: '256GB UFS 3.1 Internal Storage',
      Camera: '50MP OIS Main + 8MP Ultra-wide + 32MP Selfie',
      Battery: '5000mAh with 67W Turbo Charging',
      OS: 'Android 14 with 3 Years of OS Updates',
    },
    inStock: true,
    stockQuantity: 28,
    sku: 'NV-NOVA5G-256-GLD',
    seller: {
      storeName: 'Apex Tech Hub',
      storeSlug: 'apex-tech-hub',
      isVerified: true,
      rating: 4.9,
      location: 'Computer Village, Ikeja, Lagos',
    },
    relatedSlugs: [
      'galaxy-watch-6-titanium',
      'noise-cancelling-wireless-headphones-anc',
      'ipad-air-m2-11-inch',
      'ultrabook-pro-15-m3',
    ],
  },
  {
    id: 'prod-3',
    title: 'Studio Acoustic Pro Wireless Headphones ANC Over-Ear',
    slug: 'noise-cancelling-wireless-headphones-anc',
    category: 'Audio & Wearables',
    categorySlug: 'phones-tablets',
    brand: 'Sonus Audio',
    basePriceMinor: 12500000, // ₦125,000
    compareAtPriceMinor: 14000000,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=1000&q=80',
    ],
    ratingAverage: 4.9,
    reviewCount: 215,
    description:
      'Immerse yourself in concert-grade audio with hybrid Active Noise Cancellation (ANC) that filters out up to 98% of ambient noise. Equipped with custom-tuned 40mm titanium drivers for deep bass and crystal-clear highs, plush memory foam earcups for all-day comfort, and up to 45 hours of playtime on a single charge.',
    specifications: {
      Type: 'Over-Ear Wireless Bluetooth 5.3',
      Drivers: '40mm Custom Titanium Dynamic Drivers',
      NoiseCancellation: 'Hybrid Active Noise Cancellation (ANC)',
      BatteryLife: '45 Hours (ANC On) / 60 Hours (ANC Off)',
      FastCharging: '10 mins charge = 5 hours playback',
      Microphones: '4 Microphones with AI ClearVoice ENC',
    },
    inStock: true,
    stockQuantity: 40,
    sku: 'SON-ANC-PRO-BLK',
    seller: {
      storeName: 'SoundMaster Nigeria',
      storeSlug: 'soundmaster-ng',
      isVerified: true,
      rating: 4.8,
      location: 'Victoria Island, Lagos',
    },
    relatedSlugs: [
      'ultrabook-pro-15-m3',
      'nuvora-nova-5g-smartphone',
      'galaxy-watch-6-titanium',
      'smart-oled-series-9-4k-hdr-55-inch-tv',
    ],
  },
  {
    id: 'prod-4',
    title: 'Smart OLED Series 9 Cinema 4K HDR 55-Inch AI TV',
    slug: 'smart-oled-series-9-4k-hdr-55-inch-tv',
    category: 'Home & Kitchen',
    categorySlug: 'home-kitchen',
    brand: 'VisionTech',
    basePriceMinor: 78000000, // ₦780,000
    compareAtPriceMinor: 85000000,
    images: [
      'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1461151304267-38535e780c79?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=1000&q=80',
    ],
    ratingAverage: 4.9,
    reviewCount: 78,
    description:
      'Transform your living room into an authentic cinema. Self-lit OLED pixels deliver infinite contrast and perfect black levels with over 1 billion vibrant colors. Powered by an α9 AI Processor Gen6, 120Hz native refresh rate with VRR and ALLM for pro-grade gaming, Dolby Vision & Dolby Atmos sound.',
    specifications: {
      ScreenSize: '55-Inch Diagonal OLED Panel',
      Resolution: '4K Ultra HD (3840 x 2160)',
      RefreshRate: '120Hz Native VRR / G-Sync / FreeSync',
      HDR: 'Dolby Vision IQ, HDR10 Pro, HLG',
      Audio: '40W 2.2 Channel Dolby Atmos AI Sound Pro',
      SmartPlatform: 'webOS 24 with Netflix, Prime, YouTube & Apple TV',
      Connectivity: '4x HDMI 2.1, 3x USB, Wi-Fi 6, Bluetooth 5.2',
    },
    inStock: true,
    stockQuantity: 12,
    sku: 'VT-OLED55-S9-4K',
    seller: {
      storeName: 'Apex Tech Hub',
      storeSlug: 'apex-tech-hub',
      isVerified: true,
      rating: 4.9,
      location: 'Computer Village, Ikeja, Lagos',
    },
    relatedSlugs: [
      'sony-playstation-5-slim-disc',
      'noise-cancelling-wireless-headphones-anc',
      'anker-solix-portable-power-station',
      'delonghi-magnifica-espresso',
    ],
  },
  {
    id: 'prod-5',
    title: 'Sony PlayStation 5 Slim Console Disc Edition + 1 DualSense',
    slug: 'sony-playstation-5-slim-disc',
    category: 'Computers & Laptops',
    categorySlug: 'computers-laptops',
    brand: 'Sony PlayStation',
    basePriceMinor: 74000000, // ₦740,000
    compareAtPriceMinor: 82000000,
    images: [
      'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1000&q=80',
    ],
    ratingAverage: 5.0,
    reviewCount: 340,
    description:
      'Experience lightning-fast loading with an ultra-high speed SSD, deeper immersion with haptic feedback, adaptive triggers, and 3D Audio, and an all-new generation of incredible PlayStation games in a sleek, compact slim chassis design with 1TB of built-in storage.',
    specifications: {
      Storage: '1TB Custom Ultra-High Speed NVMe SSD',
      OpticalDrive: 'Ultra HD Blu-ray Disc Drive (removable)',
      Resolution: 'Supports 4K 120Hz TVs, 8K TVs, VRR (HDMI 2.1)',
      Audio: 'Tempest 3D AudioTech',
      IncludedController: '1x DualSense Wireless Controller with Haptics',
    },
    inStock: true,
    stockQuantity: 15,
    sku: 'SONY-PS5-SLIM-DISC',
    seller: {
      storeName: 'Apex Tech Hub',
      storeSlug: 'apex-tech-hub',
      isVerified: true,
      rating: 4.9,
      location: 'Computer Village, Ikeja, Lagos',
    },
    relatedSlugs: [
      'smart-oled-series-9-4k-hdr-55-inch-tv',
      'noise-cancelling-wireless-headphones-anc',
      'ultrabook-pro-15-m3',
      'anker-solix-portable-power-station',
    ],
  },
  {
    id: 'prod-6',
    title: 'Galaxy Titan Watch Ultra GPS 47mm Titanium Sapphire Glass',
    slug: 'galaxy-watch-6-titanium',
    category: 'Fashion & Wearables',
    categorySlug: 'fashion-wearables',
    brand: 'Chrono Luxe',
    basePriceMinor: 22000000, // ₦220,000
    compareAtPriceMinor: 25000000,
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=1000&q=80',
    ],
    ratingAverage: 4.8,
    reviewCount: 88,
    description:
      'Engineered for extreme endurance and everyday elegance. Crafted from aerospace-grade Grade 4 Titanium with scratch-proof Sapphire Crystal. Includes advanced BioActive sensor for continuous ECG, heart rate, blood oxygen, body composition analysis, dual-frequency GPS, and up to 100 hours of battery in power saving mode.',
    specifications: {
      CaseMaterial: 'Aerospace Grade 4 Titanium (47mm)',
      Glass: 'Sapphire Crystal (Hardness 9H)',
      WaterResistance: '10 ATM / IP68 / MIL-STD-810H',
      Sensors: 'BioActive Sensor (ECG, Heart Rate, BIA), Dual GPS',
      BatteryLife: 'Up to 60 hours typical use / 100 hours power saving',
      Compatibility: 'Android 10.0+ / Wear OS by Google',
    },
    inStock: true,
    stockQuantity: 22,
    sku: 'CHR-TITAN-ULTRA-47',
    seller: {
      storeName: 'Luxury Timepieces NG',
      storeSlug: 'luxury-timepieces-ng',
      isVerified: true,
      rating: 4.9,
      location: 'Lekki Phase 1, Lagos',
    },
    relatedSlugs: [
      'nuvora-nova-5g-smartphone',
      'noise-cancelling-wireless-headphones-anc',
      'nike-air-zoom-alpha-sneakers',
      'ipad-air-m2-11-inch',
    ],
  },
  {
    id: 'prod-7',
    title: 'Barista Touch Automatic Espresso & Cappuccino Machine',
    slug: 'delonghi-magnifica-espresso',
    category: 'Home & Kitchen',
    categorySlug: 'home-kitchen',
    brand: 'Caffe Royale',
    basePriceMinor: 52000000, // ₦520,000
    compareAtPriceMinor: 58000000,
    images: [
      'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&w=1000&q=80',
    ],
    ratingAverage: 4.9,
    reviewCount: 52,
    description:
      'Experience specialty third-wave coffee at home. Automates every step from bean to cup: integrated conical burr grinder with 13 grind settings, optimal 15-bar Italian pressure extraction, and automated microfoam milk steam wand for latte art with just one touch of the intuitive color screen.',
    specifications: {
      PumpPressure: '15-Bar Italian Performance Pump',
      Grinder: 'Conical Steel Burr Grinder with 13 Settings',
      WaterTank: '1.8L Removable Reservoir with Filter',
      MilkSystem: 'Auto LatteCrema Microfoam Frother',
      OneTouchDrinks: 'Espresso, Americano, Cappuccino, Flat White, Latte',
      Power: '1450 Watts Fast Thermoblock Heating',
    },
    inStock: true,
    stockQuantity: 9,
    sku: 'CR-BARISTA-TOUCH-SS',
    seller: {
      storeName: 'Modern Home Gadgets',
      storeSlug: 'modern-home-gadgets',
      isVerified: true,
      rating: 4.8,
      location: 'Victoria Island, Lagos',
    },
    relatedSlugs: [
      'dyson-v15-cordless-vacuum',
      'smart-oled-series-9-4k-hdr-55-inch-tv',
      'anker-solix-portable-power-station',
      'ultrabook-pro-15-m3',
    ],
  },
  {
    id: 'prod-8',
    title: 'TurboClean V15 Laser Cordless Cyclone Vacuum Cleaner',
    slug: 'dyson-v15-cordless-vacuum',
    category: 'Home & Kitchen',
    categorySlug: 'home-kitchen',
    brand: 'CleanLiving',
    basePriceMinor: 39500000, // ₦395,000
    compareAtPriceMinor: 43000000,
    images: [
      'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=1000&q=80',
    ],
    ratingAverage: 4.7,
    reviewCount: 64,
    description:
      'The most intelligent cordless vacuum with laser illumination that reveals invisible dust on hard floors. An acoustic piezo sensor continuously measures dust particles and automatically ramps up suction power when needed. LCD screen displays scientific proof of a deep clean in real time.',
    specifications: {
      SuctionPower: '240 Air Watts (Hyperdymium Motor 125,000rpm)',
      RunTime: 'Up to 60 Minutes Fade-Free Suction',
      Filtration: 'Whole-Machine HEPA Filtration (99.99% of 0.3 microns)',
      BinVolume: '0.77 Liters with Point-and-Shoot Emptying',
      Weight: '3.0 kg Ultra-Lightweight Ergonomic',
    },
    inStock: true,
    stockQuantity: 14,
    sku: 'CL-TC-V15-LASER',
    seller: {
      storeName: 'Modern Home Gadgets',
      storeSlug: 'modern-home-gadgets',
      isVerified: true,
      rating: 4.8,
      location: 'Victoria Island, Lagos',
    },
    relatedSlugs: [
      'delonghi-magnifica-espresso',
      'smart-oled-series-9-4k-hdr-55-inch-tv',
      'anker-solix-portable-power-station',
      'ultrabook-pro-15-m3',
    ],
  },
  {
    id: 'prod-9',
    title: 'Air Zoom Alpha Runner Elite Limited Edition Sneakers',
    slug: 'nike-air-zoom-alpha-sneakers',
    category: 'Fashion & Wearables',
    categorySlug: 'fashion-wearables',
    brand: 'Nike Sport',
    basePriceMinor: 9500000, // ₦95,000
    compareAtPriceMinor: 11500000,
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1000&q=80',
    ],
    ratingAverage: 4.8,
    reviewCount: 118,
    description:
      'Engineered for maximum energy return and race-day speed. Combines full-length ZoomX superfoam with a stiff carbon-fiber Flyplate that delivers a propulsive feel with every stride. Breathable Atomknit upper ensures ultra-lightweight containment without water retention.',
    specifications: {
      Cushioning: 'Full-Length ZoomX Foam + Dual Forefoot Zoom Air Pods',
      Plate: 'Full-Length Carbon Fiber Flyplate',
      Upper: 'Atomknit 2.0 Lightweight Breathable Mesh',
      Outsole: 'Integrated Traction Rubber for Wet & Dry Grip',
      Weight: '210 grams (Men US 9)',
    },
    inStock: true,
    stockQuantity: 30,
    sku: 'NK-AZ-ALPHA-ELITE-RED',
    seller: {
      storeName: 'Urban Sneaker Vault',
      storeSlug: 'urban-sneaker-vault',
      isVerified: true,
      rating: 4.9,
      location: 'Surulere, Lagos',
    },
    relatedSlugs: [
      'galaxy-watch-6-titanium',
      'noise-cancelling-wireless-headphones-anc',
      'nuvora-nova-5g-smartphone',
      'ultrabook-pro-15-m3',
    ],
  },
  {
    id: 'prod-10',
    title: 'PowerHub Max 1000Wh Portable Solar Power Station 1800W AC',
    slug: 'anker-solix-portable-power-station',
    category: 'Home & Kitchen',
    categorySlug: 'home-kitchen',
    brand: 'PowerGen',
    basePriceMinor: 69000000, // ₦690,000
    compareAtPriceMinor: 75000000,
    images: [
      'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1000&q=80',
    ],
    ratingAverage: 4.9,
    reviewCount: 91,
    description:
      'The ultimate clean energy backup for home and office power outages in Nigeria. Powers 99% of home appliances including refrigerators, TV setups, CPAP machines, laptops, and lighting. Features ultra-durable EV-grade LiFePO4 batteries with 3,000+ full life cycles (10 years lifespan) and fast AC recharge from 0 to 80% in just 50 minutes.',
    specifications: {
      BatteryCapacity: '1056Wh LiFePO4 (LFP) 3,000+ Cycles',
      ACOutput: '1800W Pure Sine Wave (Surge 2400W SurgePad)',
      Ports: '4x AC Outlets, 2x USB-C 100W PD, 2x USB-A 18W, 1x Car Socket',
      FastRecharge: 'HyperFlash 0 to 80% in 50 minutes via AC Wall Outlet',
      SolarInput: '600W Max Solar Input (MPPT Controller Built-in)',
      UPSMode: '<20ms Switchover for Uninterrupted PC/Router Operation',
    },
    inStock: true,
    stockQuantity: 16,
    sku: 'PG-SOLIX-1000WH-1800W',
    seller: {
      storeName: 'Apex Tech Hub',
      storeSlug: 'apex-tech-hub',
      isVerified: true,
      rating: 4.9,
      location: 'Computer Village, Ikeja, Lagos',
    },
    relatedSlugs: [
      'smart-oled-series-9-4k-hdr-55-inch-tv',
      'ultrabook-pro-15-m3',
      'delonghi-magnifica-espresso',
      'sony-playstation-5-slim-disc',
    ],
  },
  {
    id: 'prod-11',
    title: 'iPad Air 11-Inch M2 Chip Wi-Fi 128GB Space Gray with Apple Pencil Pro Support',
    slug: 'ipad-air-m2-11-inch',
    category: 'Phones & Tablets',
    categorySlug: 'phones-tablets',
    brand: 'Apple',
    basePriceMinor: 78000000, // ₦780,000
    compareAtPriceMinor: 85000000,
    images: [
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=1000&q=80',
    ],
    ratingAverage: 4.9,
    reviewCount: 104,
    description:
      'The redesigned iPad Air with the blazing-fast M2 chip. Brilliant 11-inch Liquid Retina display with anti-reflective coating, landscape 12MP Center Stage front camera, Touch ID in top button, superfast Wi-Fi 6E, and groundbreaking compatibility with Apple Pencil Pro and Magic Keyboard.',
    specifications: {
      Chip: 'Apple M2 (8-core CPU, 10-core GPU, 16-core Neural Engine)',
      Display: '11-inch Liquid Retina Display with P3 Wide Color (500 nits)',
      Camera: '12MP Wide back camera, 12MP Landscape Ultra Wide front camera',
      Storage: '128GB High-Speed Storage',
      Speakers: 'Landscape Stereo Speakers with Spatial Audio',
      Connector: 'USB-C (supports DisplayPort & USB 3 up to 10Gb/s)',
    },
    inStock: true,
    stockQuantity: 20,
    sku: 'APL-IPADAIR-M2-128-SG',
    seller: {
      storeName: 'Apex Tech Hub',
      storeSlug: 'apex-tech-hub',
      isVerified: true,
      rating: 4.9,
      location: 'Computer Village, Ikeja, Lagos',
    },
    relatedSlugs: [
      'ultrabook-pro-15-m3',
      'nuvora-nova-5g-smartphone',
      'noise-cancelling-wireless-headphones-anc',
      'galaxy-watch-6-titanium',
    ],
  },
  {
    id: 'prod-12',
    title: 'Canon EOS R50 4K Mirrorless Creator Kit with RF-S 18-45mm Lens',
    slug: 'canon-eos-r50-mirrorless-camera',
    category: 'Computers & Laptops',
    categorySlug: 'computers-laptops',
    brand: 'Canon',
    basePriceMinor: 63000000, // ₦630,000
    compareAtPriceMinor: 69000000,
    images: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?auto=format&fit=crop&w=1000&q=80',
    ],
    ratingAverage: 4.9,
    reviewCount: 57,
    description:
      'The ultimate lightweight mirrorless camera for content creators, vloggers, and photographers. Featuring a 24.2 Megapixel APS-C sensor, uncropped 4K 30p video oversampled from 6K, Dual Pixel CMOS AF II with eye/subject tracking, and a vari-angle touchscreen for effortless selfie shots and live streaming.',
    specifications: {
      Sensor: '24.2 Megapixel APS-C CMOS Sensor',
      Video: '4K UHD 30p (6K oversampled), Full HD 120p slow-motion',
      Autofocus: 'Dual Pixel CMOS AF II with People/Animal/Vehicle Detect',
      Screen: '3.0-inch 1.62M-dot Vari-Angle Touchscreen LCD',
      Wireless: 'Wi-Fi & Bluetooth for instant smartphone transfer & webcam',
      LensIncluded: 'Canon RF-S 18-45mm f/4.5-6.3 IS STM Lens',
    },
    inStock: true,
    stockQuantity: 11,
    sku: 'CAN-EOS-R50-KIT-1845',
    seller: {
      storeName: 'Apex Tech Hub',
      storeSlug: 'apex-tech-hub',
      isVerified: true,
      rating: 4.9,
      location: 'Computer Village, Ikeja, Lagos',
    },
    relatedSlugs: [
      'ultrabook-pro-15-m3',
      'nuvora-nova-5g-smartphone',
      'smart-oled-series-9-4k-hdr-55-inch-tv',
      'anker-solix-portable-power-station',
    ],
  },
];

export function getProductBySlug(slug: string): ProductItem | undefined {
  return allProducts.find((p) => p.slug === slug || p.id === slug);
}

export function getRelatedProducts(slug: string, limit = 4): ProductItem[] {
  const current = getProductBySlug(slug);
  if (!current) return allProducts.slice(0, limit);

  // Match by relatedSlugs or same category
  const related = allProducts.filter((p) => {
    if (p.slug === current.slug) return false;
    if (current.relatedSlugs && current.relatedSlugs.includes(p.slug)) return true;
    if (p.categorySlug === current.categorySlug) return true;
    return false;
  });

  return related.slice(0, limit);
}
