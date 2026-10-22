/**
 * Seeds demo content: categories, products, banners, services, projects, blog, settings.
 * Usage: npm run seed   (wipes existing catalogue content first)
 */
import { config } from "dotenv";
import { blogGuideExcerpts, blogGuides } from "./content/blog-guides";
config({ path: ".env.local" });

type Tr = { en: string; tr: string };

async function main() {
  const { db } = await import("../src/lib/db");
  const s = await import("../src/lib/db/schema");

  for (const t of [
    s.orders, s.productTranslations, s.products, s.categoryTranslations, s.categories,
    s.bannerTranslations, s.banners, s.serviceTranslations, s.services,
    s.projectTranslations, s.projects, s.blogTranslations, s.blogPosts,
  ]) {
    await db.delete(t);
  }

  /* Categories */
  const catDefs: { slug: string; image: string; icon: string; name: Tr; desc: Tr }[] = [
    { slug: "renewables-energy-systems", image: "/seed/pexels/18306342.jpg", icon: "sun",
      name: { en: "Renewables Energy Systems", tr: "Yenilenebilir Enerji Sistemleri" },
      desc: { en: "Solar panels, inverters, batteries and portable power.", tr: "Güneş panelleri, inverterler, bataryalar ve taşınabilir güç çözümleri." } },
    { slug: "heating-cooling-ventilation-systems", image: "/seed/pexels/32497161.jpg", icon: "snowflake",
      name: { en: "Heating, Cooling and Ventilations Systems", tr: "Isıtma, Soğutma ve Havalandırma Sistemleri" },
      desc: { en: "Air conditioners, heat pumps and ventilation equipment.", tr: "Klimalar, ısı pompaları ve havalandırma ekipmanları." } },
    { slug: "hydronics-domestic-hot-water-systems", image: "/seed/pexels/20046689.jpg", icon: "droplets",
      name: { en: "Hydronics and Domestic Hot Water Systems", tr: "Hidronik ve Kullanım Sıcak Suyu Sistemleri" },
      desc: { en: "Boilers, radiators, pumps and hot water systems.", tr: "Kombiler, radyatörler, pompalar ve sıcak su sistemleri." } },
    { slug: "electrical-appliances-equipment", image: "/seed/pexels/27928761.jpg", icon: "zap",
      name: { en: "Electrical Appliances And Equipement", tr: "Elektrikli Cihazlar ve Ekipmanlar" },
      desc: { en: "Drives, lighting and electrical equipment for homes and industry.", tr: "Sürücüler, aydınlatma ve elektrik ekipmanları." } },
  ];
  const catId: Record<string, string> = {};
  for (const [i, c] of catDefs.entries()) {
    const [row] = await db.insert(s.categories).values({ slug: c.slug, image: c.image, icon: c.icon, sortOrder: i }).returning({ id: s.categories.id });
    catId[c.slug] = row.id;
    await db.insert(s.categoryTranslations).values(
      (["en", "tr"] as const).map((l) => ({ categoryId: row.id, locale: l, name: c.name[l], description: c.desc[l] })),
    );
  }
  const R = "renewables-energy-systems", H = "heating-cooling-ventilation-systems",
    W = "hydronics-domestic-hot-water-systems", E = "electrical-appliances-equipment";

  /* Products */
  const prods: {
    slug: string; cat: string; sku: string; brand: string; image: string; price: number; sale?: number;
    currency: "TRY" | "EUR"; featured?: boolean; isNew?: boolean; quoteOnly?: boolean;
    name: Tr; short: Tr; specs: [string, string][];
  }[] = [
    { slug: "solar-panel-550w-monocrystalline", cat: R, sku: "SP-550M", brand: "Jinko", image: "/seed/shop/01.png", price: 120, sale: 99, currency: "EUR", featured: true,
      name: { en: "Monocrystalline Solar Panel 550W", tr: "Monokristal Güneş Paneli 550W" },
      short: { en: "High-efficiency half-cut cell panel for residential and commercial roofs.", tr: "Konut ve ticari çatılar için yüksek verimli yarım hücreli panel." },
      specs: [["Power", "550 W"], ["Efficiency", "21.3 %"], ["Warranty", "25 years"]] },
    { slug: "solar-panel-450w-mono-perc", cat: R, sku: "SP-450P", brand: "Longi", image: "/seed/shop/05.jpg", price: 4200, currency: "TRY", isNew: true,
      name: { en: "Mono PERC Solar Panel 450W", tr: "Mono PERC Güneş Paneli 450W" },
      short: { en: "Reliable 450W panel with excellent low-light performance.", tr: "Düşük ışıkta da yüksek performanslı 450W panel." },
      specs: [["Power", "450 W"], ["Cells", "144 half-cut"]] },
    { slug: "on-grid-inverter-8kw", cat: R, sku: "INV-8K", brand: "SMA", image: "/seed/shop/10.jpg", price: 1450, currency: "EUR", featured: true,
      name: { en: "On-Grid Solar Inverter 8kW", tr: "Şebeke Bağlantılı Solar İnverter 8kW" },
      short: { en: "Three-phase string inverter with Wi-Fi monitoring.", tr: "Wi-Fi izlemeli üç fazlı string inverter." },
      specs: [["Rated power", "8 kW"], ["Phases", "3"], ["Monitoring", "Wi-Fi"]] },
    { slug: "portable-power-station-1800w", cat: R, sku: "PPS-1800", brand: "EcoFlow", image: "/seed/shop/04.png", price: 1290, sale: 1099, currency: "EUR", featured: true, isNew: true,
      name: { en: "Portable Power Station 1800W", tr: "Taşınabilir Enerji İstasyonu 1800W" },
      short: { en: "1800W output, fast charging and solar input for backup power anywhere.", tr: "1800W çıkış, hızlı şarj ve güneş girişi ile her yerde yedek güç." },
      specs: [["Output", "1800 W"], ["Capacity", "1260 Wh"]] },
    { slug: "portable-power-station-300w", cat: R, sku: "PPS-300", brand: "Jackery", image: "/seed/shop/02.png", price: 8900, currency: "TRY",
      name: { en: "Portable Power Station 300W", tr: "Taşınabilir Enerji İstasyonu 300W" },
      short: { en: "Compact power for camping, travel and emergencies.", tr: "Kamp, seyahat ve acil durumlar için kompakt güç." },
      specs: [["Output", "300 W"], ["Ports", "AC / USB / DC"]] },
    { slug: "foldable-solar-charger-28w", cat: R, sku: "FSC-28", brand: "Matek", image: "/seed/shop/03.png", price: 59, currency: "EUR", isNew: true,
      name: { en: "Foldable Solar Charger 28W", tr: "Katlanabilir Güneş Şarj Cihazı 28W" },
      short: { en: "Lightweight foldable panel to charge phones and power banks.", tr: "Telefon ve powerbank şarjı için hafif katlanabilir panel." },
      specs: [["Power", "28 W"], ["Output", "USB-A / USB-C"]] },
    { slug: "split-air-conditioner-inverter-12000", cat: H, sku: "AC-12K", brand: "Gree", image: "/matek/service/03.jpg", price: 520, sale: 479, currency: "EUR", featured: true,
      name: { en: "Inverter Split Air Conditioner 12000 BTU", tr: "İnverter Split Klima 12000 BTU" },
      short: { en: "Energy-saving inverter AC for heating and cooling.", tr: "Isıtma ve soğutma için enerji tasarruflu inverter klima." },
      specs: [["Capacity", "12000 BTU"], ["Energy class", "A++"]] },
    { slug: "multi-split-outdoor-unit", cat: H, sku: "AC-MS2", brand: "Gree", image: "/matek/service/04.jpg", price: 0, quoteOnly: true, currency: "EUR",
      name: { en: "Multi-Split Outdoor Unit (2 rooms)", tr: "Multi Split Dış Ünite (2 oda)" },
      short: { en: "One outdoor unit serving two indoor units. Price on request.", tr: "İki iç üniteye hizmet veren tek dış ünite. Fiyat için teklif isteyin." },
      specs: [["Rooms", "2"], ["Mode", "Heat / Cool"]] },
    { slug: "wall-hung-condensing-boiler", cat: W, sku: "BO-24", brand: "Matek", image: "/matek/service/07.jpg", price: 38500, currency: "TRY", featured: true,
      name: { en: "Wall-Hung Condensing Boiler 24kW", tr: "Duvar Tipi Yoğuşmalı Kombi 24kW" },
      short: { en: "Compact high-efficiency boiler for heating and domestic hot water.", tr: "Isıtma ve sıcak su için kompakt yüksek verimli kombi." },
      specs: [["Power", "24 kW"], ["Type", "Condensing"]] },
    { slug: "towel-radiator-white", cat: W, sku: "RAD-W", brand: "Matek", image: "/matek/service/08.jpg", price: 95, currency: "EUR",
      name: { en: "Towel Radiator (White)", tr: "Havlupan Radyatör (Beyaz)" },
      short: { en: "Space-saving bathroom towel radiator.", tr: "Yer tasarrufu sağlayan banyo havlupanı." },
      specs: [["Colour", "White"], ["Height", "120 cm"]] },
    { slug: "pressure-booster-pump-set", cat: W, sku: "PUMP-3", brand: "Grundfos", image: "/matek/service/10.jpg", price: 2400, currency: "EUR",
      name: { en: "Pressure Booster Pump Set", tr: "Hidrofor Pompa Seti" },
      short: { en: "Multi-pump booster set with control panel.", tr: "Kontrol panolu çoklu pompa hidrofor seti." },
      specs: [["Pumps", "3"], ["Control", "Variable speed"]] },
    { slug: "frequency-drive-vfd", cat: E, sku: "VFD-22", brand: "Mitsubishi", image: "/seed/shop/07.jpg", price: 14500, currency: "TRY", isNew: true,
      name: { en: "Variable Frequency Drive 2.2kW", tr: "Frekans Konvertörü 2.2kW" },
      short: { en: "Compact drive for motor speed control.", tr: "Motor hız kontrolü için kompakt sürücü." },
      specs: [["Power", "2.2 kW"], ["Input", "230 V"]] },
    { slug: "solar-led-floodlight", cat: E, sku: "SLF-1", brand: "Matek", image: "/seed/shop/11.jpg", price: 39, sale: 29, currency: "EUR",
      name: { en: "Solar LED Floodlight with Remote", tr: "Uzaktan Kumandalı Solar LED Projektör" },
      short: { en: "Wireless outdoor floodlight powered by the sun.", tr: "Güneşle çalışan kablosuz dış mekan projektörü." },
      specs: [["Type", "LED"], ["Control", "Remote"]] },
  ];
  const px = (id: string) => `/seed/pexels/${id}.jpg`;
  const media: Record<string, { main?: string; extra: string[]; dropOriginal?: boolean }> = {
    "solar-panel-550w-monocrystalline": { main: px("18306342"), extra: [px("8853504"), px("13963757")], dropOriginal: true },
    "solar-panel-450w-mono-perc": { main: px("25751713"), extra: [px("18523430"), px("38194140")], dropOriginal: true },
    "on-grid-inverter-8kw": { main: px("37929911"), extra: [px("33751639"), px("4320475")], dropOriginal: true },
    "portable-power-station-1800w": { main: px("39057090"), extra: [px("38171185"), px("13963757")], dropOriginal: true },
    "portable-power-station-300w": { main: px("38354917"), extra: [px("9799713")], dropOriginal: true },
    "foldable-solar-charger-28w": { main: px("9799713"), extra: [px("25751713")], dropOriginal: true },
    "split-air-conditioner-inverter-12000": { main: px("38788452"), extra: [px("32588555"), px("38353473")], dropOriginal: true },
    "multi-split-outdoor-unit": { main: px("38353473"), extra: [px("32497161")], dropOriginal: true },
    "wall-hung-condensing-boiler": { main: px("20046689"), extra: ["/matek/service/07.jpg", px("8751240")], dropOriginal: true },
    "towel-radiator-white": { main: px("12644994"), extra: [px("29226620")], dropOriginal: true },
    "pressure-booster-pump-set": { main: px("6929715"), extra: [px("17232659"), px("11899171")], dropOriginal: true },
    "frequency-drive-vfd": { main: px("28950842"), extra: [px("27928761"), px("3306057")], dropOriginal: true },
    "solar-led-floodlight": { main: px("11529118"), extra: [px("14351460"), px("7285965")], dropOriginal: true },
  };
  const extraDesc: Record<string, Tr> = {
    [R]: { en: "Cut your electricity bill and gain energy independence. Our team can survey your site, size the system and install it end-to-end, with warranty and after-sales support.", tr: "Elektrik faturanızı düşürün, enerjide bağımsız olun. Ekibimiz keşif yapar, sistemi boyutlandırır ve garantili şekilde kurar." },
    [H]: { en: "Year-round comfort with lower running costs. Supplied and professionally installed by Matek engineers, with maintenance plans available.", tr: "Düşük işletme maliyetiyle tüm yıl konfor. Matek mühendisleri tarafından temin ve kurulum, bakım paketleri mevcuttur." },
    [W]: { en: "Reliable hot water and heating performance for homes and buildings. Installation, commissioning and servicing by our certified technicians.", tr: "Ev ve binalar için güvenilir sıcak su ve ısıtma performansı. Sertifikalı teknisyenlerimizce kurulum, devreye alma ve servis." },
    [E]: { en: "Industrial-grade electrical equipment from trusted brands, ready to ship. Technical advice is available before and after your purchase.", tr: "Güvenilir markalardan, hazır stoktan endüstriyel kalite elektrik ekipmanları. Satış öncesi ve sonrası teknik destek." },
  };
  for (const [i, p] of prods.entries()) {
    const m = media[p.slug] ?? { extra: [] };
    const mainImg = m.main ?? p.image;
    const [row] = await db.insert(s.products).values({
      slug: p.slug, categoryId: catId[p.cat], sku: p.sku, brand: p.brand, image: mainImg, gallery: [mainImg, ...(m.main && !m.dropOriginal ? [p.image] : []), ...m.extra],
      price: p.price, salePrice: p.sale ?? null, currency: p.currency, inStock: true,
      quoteOnly: !!p.quoteOnly, featured: !!p.featured, isNew: !!p.isNew, sortOrder: i,
    }).returning({ id: s.products.id });
    await db.insert(s.productTranslations).values((["en", "tr"] as const).map((l) => ({
      productId: row.id, locale: l, name: p.name[l], shortDescription: p.short[l], description: `${p.short[l]}\n\n${extraDesc[p.cat][l]}`,
      specs: p.specs.map(([label, value]) => ({ label, value })),
    })));
  }

  /* Banners */
  const banners: { placement: "hero" | "promo"; image: string; link: string; eyebrow: Tr; title: Tr; sub: Tr; cta: Tr }[] = [
    { placement: "hero", image: "/seed/pexels/18306342.jpg", link: "/categories/renewables-energy-systems",
      eyebrow: { en: "Renewable energy", tr: "Yenilenebilir enerji" },
      title: { en: "Power your home with the sun", tr: "Evinizi güneşle aydınlatın" },
      sub: { en: "Solar panels, inverters and storage with professional installation.", tr: "Profesyonel kurulumla güneş panelleri, inverterler ve depolama." },
      cta: { en: "Shop solar", tr: "Güneş ürünleri" } },
    { placement: "hero", image: "/seed/pexels/32497161.jpg", link: "/services",
      eyebrow: { en: "Engineering services", tr: "Mühendislik hizmetleri" },
      title: { en: "Heating, cooling & hot water experts", tr: "Isıtma, soğutma ve sıcak su uzmanları" },
      sub: { en: "Design, supply, installation and maintenance for homes and businesses.", tr: "Ev ve işyerleri için tasarım, tedarik, kurulum ve bakım." },
      cta: { en: "Our services", tr: "Hizmetlerimiz" } },
    { placement: "hero", image: "/seed/pexels/27928761.jpg", link: "/shop",
      eyebrow: { en: "Online shop", tr: "Online mağaza" },
      title: { en: "Quality energy equipment, delivered", tr: "Kaliteli enerji ekipmanları, kapınızda" },
      sub: { en: "Order online or via WhatsApp. Pay on delivery or by bank transfer.", tr: "Online veya WhatsApp ile sipariş verin. Kapıda veya havale ile ödeyin." },
      cta: { en: "Start shopping", tr: "Alışverişe başla" } },
    { placement: "promo", image: "/seed/pexels/30285845.jpg", link: "/services/solar-panel-installation#book",
      eyebrow: { en: "Our service", tr: "Hizmetimiz" }, title: { en: "Free site survey & solar installation", tr: "Ücretsiz keşif ve güneş enerjisi kurulumu" },
      sub: { en: "Our engineers design, supply and install your system end to end.", tr: "Mühendislerimiz sisteminizi baştan sona tasarlar, tedarik eder ve kurar." }, cta: { en: "Book a survey", tr: "Keşif randevusu" } },
    { placement: "promo", image: "/seed/pexels/32497161.jpg", link: "/services/air-conditioning-installation",
      eyebrow: { en: "Service", tr: "Hizmet" }, title: { en: "Professional AC installation", tr: "Profesyonel klima kurulumu" },
      sub: { en: "Survey, delivery and installation.", tr: "Keşif, teslimat ve kurulum." }, cta: { en: "Learn more", tr: "Detaylar" } },
  ];
  for (const [i, b] of banners.entries()) {
    const [row] = await db.insert(s.banners).values({ placement: b.placement, image: b.image, linkUrl: b.link, sortOrder: i }).returning({ id: s.banners.id });
    await db.insert(s.bannerTranslations).values((["en", "tr"] as const).map((l) => ({
      bannerId: row.id, locale: l, eyebrow: b.eyebrow[l] || null, title: b.title[l], subtitle: b.sub[l], ctaLabel: b.cta[l],
    })));
  }

  /* Services */
  const services: { slug: string; icon: string; image: string; title: Tr; desc: Tr }[] = [
    { slug: "solar-panel-installation", icon: "sun", image: "/seed/pexels/30285845.jpg",
      title: { en: "Solar Panel Installation", tr: "Güneş Paneli Kurulumu" },
      desc: { en: "Complete PV design, supply and installation for homes, villas and businesses, with monitoring and maintenance.", tr: "Ev, villa ve işyerleri için izleme ve bakım dahil komple PV tasarım, tedarik ve kurulum." } },
    { slug: "air-conditioning-installation", icon: "snowflake", image: "/seed/pexels/32588555.jpg",
      title: { en: "Air Conditioning Installation", tr: "Klima Kurulumu" },
      desc: { en: "Split, multi-split and VRF air conditioning installation and servicing.", tr: "Split, multi split ve VRF klima kurulumu ve servisi." } },
    { slug: "water-heater-installation", icon: "droplets", image: "/seed/pexels/20046689.jpg",
      title: { en: "Water Heater Installation", tr: "Su Isıtıcı Kurulumu" },
      desc: { en: "Solar water heaters, boilers and heat-pump hot water systems installed and commissioned.", tr: "Güneş enerjili su ısıtıcılar, kombiler ve ısı pompalı sıcak su sistemleri kurulumu." } },
    { slug: "heating-system-installation", icon: "flame", image: "/seed/pexels/29226620.jpg",
      title: { en: "Heating System Installation", tr: "Isıtma Sistemi Kurulumu" },
      desc: { en: "Radiator, underfloor and boiler heating systems designed for efficiency.", tr: "Verimlilik odaklı radyatör, yerden ısıtma ve kombi sistemleri." } },
    { slug: "electrical-installation", icon: "zap", image: "/seed/pexels/27928761.jpg",
      title: { en: "Electrical Installation & Maintenance", tr: "Elektrik Tesisatı ve Bakım" },
      desc: { en: "Electrical panels, wiring, drives and ongoing maintenance for homes and industry.", tr: "Elektrik panoları, kablolama, sürücüler ve konut ile sanayi için düzenli bakım." } },
    { slug: "pumps-and-hydronics", icon: "wrench", image: "/seed/pexels/17232659.jpg",
      title: { en: "Pumps & Hydronic Systems", tr: "Pompa ve Hidronik Sistemler" },
      desc: { en: "Booster sets, fire pumps and hydronic systems supplied and serviced.", tr: "Hidrofor setleri, yangın pompaları ve hidronik sistemlerin tedariki ve servisi." } },
  ];
  type Rich = { price: number | null; cat: string; gallery: string[]; dur: Tr; hl: { en: string[]; tr: string[] } };
  const rich: Record<string, Rich> = {
    "solar-panel-installation": { price: 1800, cat: R, gallery: ["/matek/project/17.jpg", "/matek/project/38.jpg", "/matek/project/39.jpg"], dur: { en: "1–3 days on site", tr: "Sahada 1–3 gün" },
      hl: { en: ["Free site survey & yield estimate", "Tier-1 panels and hybrid inverters", "Mounting, cabling and grid connection", "Monitoring app setup", "Up to 25-year panel warranty"], tr: ["Ücretsiz keşif ve verim hesabı", "Tier-1 paneller ve hibrit inverterler", "Montaj, kablolama ve şebeke bağlantısı", "İzleme uygulaması kurulumu", "25 yıla varan panel garantisi"] } },
    "air-conditioning-installation": { price: 120, cat: H, gallery: ["/matek/project/04.jpg", "/matek/project/05.jpg", "/seed/pexels/32497161.jpg"], dur: { en: "Half a day", tr: "Yarım gün" },
      hl: { en: ["Correct sizing for your room", "Copper piping and drain", "Vacuum, leak test and commissioning", "Clean finish, no mess", "Installation warranty"], tr: ["Odanıza uygun doğru seçim", "Bakır boru ve tahliye", "Vakum, kaçak testi ve devreye alma", "Temiz ve düzenli işçilik", "Montaj garantisi"] } },
    "water-heater-installation": { price: 90, cat: "hydronics-domestic-hot-water-systems", gallery: ["/seed/pexels/20046689.jpg", "/matek/project/48.jpg"], dur: { en: "2–4 hours", tr: "2–4 saat" },
      hl: { en: ["Solar, electric or heat-pump units", "Safety valves and expansion vessel", "Pipework and insulation", "Commissioning and user training"], tr: ["Güneş, elektrikli veya ısı pompalı üniteler", "Emniyet vanaları ve genleşme tankı", "Tesisat ve yalıtım", "Devreye alma ve kullanıcı eğitimi"] } },
    "heating-system-installation": { price: 250, cat: H, gallery: ["/seed/pexels/29226620.jpg", "/matek/project/48.jpg"], dur: { en: "1–5 days", tr: "1–5 gün" },
      hl: { en: ["Heat-loss calculation", "Radiators or underfloor heating", "Boiler / heat pump connection", "Pressure test and balancing"], tr: ["Isı kaybı hesabı", "Radyatör veya yerden ısıtma", "Kombi / ısı pompası bağlantısı", "Basınç testi ve balans"] } },
    "electrical-installation": { price: null, cat: "electrical-appliances-equipment", gallery: ["/seed/pexels/27928761.jpg", "/seed/pexels/30285845.jpg"], dur: { en: "Depends on scope", tr: "Kapsama göre" },
      hl: { en: ["Distribution panels and wiring", "Motor drives and controls", "Safety inspection and reports", "Scheduled maintenance plans"], tr: ["Dağıtım panoları ve kablolama", "Motor sürücüleri ve kontrol", "Güvenlik kontrolü ve raporlama", "Planlı bakım programları"] } },
    "pumps-and-hydronics": { price: null, cat: "hydronics-domestic-hot-water-systems", gallery: ["/seed/pexels/17232659.jpg", "/seed/pexels/20046689.jpg"], dur: { en: "Depends on scope", tr: "Kapsama göre" },
      hl: { en: ["Booster and fire pump sets", "Hydronic piping and balancing", "Service and spare parts", "Emergency call-outs"], tr: ["Hidrofor ve yangın pompası setleri", "Hidronik tesisat ve balans", "Servis ve yedek parça", "Acil müdahale"] } },
  };
  const steps: { en: { title: string; text: string }[]; tr: { title: string; text: string }[] } = {
    en: [{ title: "Request", text: "Send the form, call or WhatsApp us." }, { title: "Free survey", text: "An engineer visits and prepares a clear quote." }, { title: "Installation", text: "Certified team installs and tests everything." }, { title: "Handover & support", text: "Training, warranty and ongoing maintenance." }],
    tr: [{ title: "Talep", text: "Formu doldurun, arayın veya WhatsApp'tan yazın." }, { title: "Ücretsiz keşif", text: "Mühendisimiz gelir ve net bir teklif hazırlar." }, { title: "Kurulum", text: "Sertifikalı ekip her şeyi kurar ve test eder." }, { title: "Teslim ve destek", text: "Eğitim, garanti ve düzenli bakım." }],
  };
  const faqs: { en: { q: string; a: string }[]; tr: { q: string; a: string }[] } = {
    en: [{ q: "Is the site survey really free?", a: "Yes. We assess your site at no cost and give a written quote with no obligation." }, { q: "How fast can you start?", a: "Usually within a few days of accepting the quote, depending on equipment availability." }, { q: "Do you offer warranty?", a: "Yes, both on equipment and on our workmanship." }, { q: "Can I buy the equipment from you?", a: "Yes, see the related products in our shop below." }],
    tr: [{ q: "Keşif gerçekten ücretsiz mi?", a: "Evet. Alanınızı ücretsiz inceler, yükümlülüksüz yazılı teklif veririz." }, { q: "Ne kadar sürede başlarsınız?", a: "Teklif onayından sonra genellikle birkaç gün içinde, ekipman stoğuna bağlı olarak." }, { q: "Garanti veriyor musunuz?", a: "Evet, hem ekipman hem de işçilik için." }, { q: "Ekipmanı sizden alabilir miyim?", a: "Evet, aşağıdaki ilgili ürünlere göz atın." }],
  };
  for (const [i, sv] of services.entries()) {
    const r = rich[sv.slug];
    const [row] = await db.insert(s.services).values({ slug: sv.slug, icon: sv.icon, image: sv.image, sortOrder: i, gallery: r.gallery, priceFrom: r.price, currency: "EUR", categoryId: catId[r.cat] }).returning({ id: s.services.id });
    await db.insert(s.serviceTranslations).values((["en", "tr"] as const).map((l) => ({
      serviceId: row.id, locale: l, title: sv.title[l], description: sv.desc[l],
      content: `${sv.desc[l]}\n\n${l === "en" ? "Contact us for a free site assessment and a tailored quotation." : "Ücretsiz keşif ve size özel teklif için bizimle iletişime geçin."}`,
      duration: r.dur[l], highlights: r.hl[l], steps: steps[l], faqs: faqs[l],
    })));
  }

  /* Projects */
  const projects: { slug: string; kind: Tr; image: string; title: Tr }[] = [
    { slug: "rooftop-solar-kyrenia", kind: { en: "Solar", tr: "Güneş" }, image: "/matek/project/17.jpg", title: { en: "Rooftop Solar System – Kyrenia", tr: "Çatı GES – Girne" } },
    { slug: "villa-solar-installation", kind: { en: "Solar", tr: "Güneş" }, image: "/matek/project/38.jpg", title: { en: "Villa Solar Installation", tr: "Villa Güneş Enerjisi Kurulumu" } },
    { slug: "ground-mounted-solar", kind: { en: "Solar", tr: "Güneş" }, image: "/matek/project/39.jpg", title: { en: "Ground-Mounted Solar Array", tr: "Arazi Tipi Güneş Santrali" } },
    { slug: "commercial-hvac-ventilation", kind: { en: "HVAC", tr: "HVAC" }, image: "/matek/project/05.jpg", title: { en: "Commercial Ventilation System", tr: "Ticari Havalandırma Sistemi" } },
    { slug: "residential-ac-installation", kind: { en: "Cooling", tr: "Soğutma" }, image: "/matek/project/04.jpg", title: { en: "Residential AC Installation", tr: "Konut Klima Kurulumu" } },
    { slug: "heat-pump-installation", kind: { en: "Heating", tr: "Isıtma" }, image: "/matek/project/48.jpg", title: { en: "Heat Pump Installation", tr: "Isı Pompası Kurulumu" } },
  ];
  for (const [i, p] of projects.entries()) {
    const [row] = await db.insert(s.projects).values({ slug: p.slug, kind: p.kind.en, image: p.image, gallery: [p.image], sortOrder: i }).returning({ id: s.projects.id });
    await db.insert(s.projectTranslations).values((["en", "tr"] as const).map((l) => ({
      projectId: row.id, locale: l, title: p.title[l], subtitle: p.kind[l],
      description: l === "en" ? "Designed, supplied and installed by the Matek Energy team in Northern Cyprus." : "Kuzey Kıbrıs'ta Matek Energy ekibi tarafından tasarlandı, tedarik edildi ve kuruldu.",
    })));
  }

  /* Blog */
  const posts: { slug: string; image: string; title: Tr; excerpt: Tr }[] = [
    { slug: "how-much-can-solar-save", image: "/seed/pexels/18306342.jpg",
      title: { en: "How much can a solar system save on your bills?", tr: "Güneş enerjisi sistemi faturalarınızda ne kadar tasarruf sağlar?" },
      excerpt: blogGuideExcerpts["how-much-can-solar-save"] },
    { slug: "choosing-the-right-air-conditioner", image: "/seed/pexels/38788452.jpg",
      title: { en: "Choosing the right air conditioner", tr: "Doğru klimayı seçmek" },
      excerpt: blogGuideExcerpts["choosing-the-right-air-conditioner"] },
  ];
  for (const p of posts) {
    const [row] = await db.insert(s.blogPosts).values({ slug: p.slug, coverImage: p.image, category: "Guides", authorName: "Matek Energy", published: true, publishedAt: new Date() }).returning({ id: s.blogPosts.id });
    await db.insert(s.blogTranslations).values((["en", "tr"] as const).map((l) => ({
      postId: row.id, locale: l, title: p.title[l], excerpt: p.excerpt[l], content: blogGuides[p.slug]?.[l] ?? `<p>${p.excerpt[l]}</p>`,
    })));
  }

  /* Settings */
  const values = {
    id: "global", contactEmail: "matek@matek-energy.com", orderEmail: "matek.energy@gmail.com",
    contactPhone: "+90 542 887 70 70", whatsapp: "+90 533 869 79 73",
    addressText: "Semih Sencar Cad. No.65 Centro Kyrenia Apt. Dük 7, Kyrenia – TRNC",
    openingHours: "Mon–Sat 09:00–18:00",
    bankName: "Your Bank Name", bankAccountHolder: "Matek Energy", bankIban: "TR00 0000 0000 0000 0000 0000 00",
    bankNotes: "Please mention your order number in the transfer description.",
  };
  await db.insert(s.settings).values(values).onConflictDoUpdate({ target: s.settings.id, set: values });

  console.log("Seed complete.");
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
