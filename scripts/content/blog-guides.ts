export const blogGuideExcerpts: Record<string, { en: string; tr: string }> = {
  "how-much-can-solar-save": {
    en: "A quick guide to estimating savings and payback time for a home PV system.",
    tr: "Evler için PV sistemlerinde tasarruf ve geri ödeme süresini hesaplamaya kısa rehber.",
  },
  "choosing-the-right-air-conditioner": {
    en: "BTU, inverter technology and energy class explained in plain language.",
    tr: "BTU, inverter teknolojisi ve enerji sınıfı sade bir dille anlatıldı.",
  },
};

export const blogGuides: Record<string, { en: string; tr: string }> = {
  "how-much-can-solar-save": {
    en: `<h2>Start with energy use, not the number of panels</h2>
<p>A solar photovoltaic system turns sunlight into electricity. Its financial value depends on how much of that electricity you can use, what you currently pay for power and the full cost of the installation. There is no single savings figure that applies to every home.</p>
<p>Before comparing quotations, gather several recent electricity bills, ideally covering a full year. Look at consumption in kilowatt-hours, not only the amount paid. Seasonal heating and cooling can make one month's bill very different from the next.</p>
<h2>Why daytime consumption matters</h2>
<p>Solar production varies through the day and year. A household that uses air conditioning, pumps or other equipment during sunny hours may use more solar electricity directly than a property that is empty until the evening.</p>
<p>Self-consumption means using generated electricity on site. Exported electricity is a separate matter: connection rules, permissions, metering and any export compensation must be checked locally. Do not assume that exported energy has the same value as electricity bought from the grid.</p>
<h2>What changes the output of a system?</h2>
<ul><li>Available roof or ground area, orientation and tilt.</li><li>Shading from buildings, trees and other roof features.</li><li>Panel and inverter selection, system configuration and temperature.</li><li>Seasonal weather, soiling and the maintenance plan.</li></ul>
<p>A site assessment should also consider the building, safe access and the existing electrical installation. These details influence what can be installed and the work included in a quotation.</p>
<h2>Understand the savings calculation</h2>
<p>A useful starting point is: annual value of self-consumed solar electricity, plus any confirmed export value, minus recurring operating costs. The value of self-consumed electricity depends on the applicable tariff and when you would otherwise buy that energy.</p>
<p>Simple payback divides the full installed cost by estimated annual net savings. This is only an initial comparison. It does not automatically account for changing tariffs, financing, degradation or future equipment replacement. Ask for the assumptions behind a forecast rather than treating it as a guarantee.</p>
<h2>Is battery storage necessary?</h2>
<p>A battery can move some daytime production to later use, but it adds cost and has its own capacity, efficiency and lifetime considerations. Backup during an outage is not automatic: it depends on compatible equipment and an appropriately designed installation. Ask what loads, if any, the proposed system can support when grid power is unavailable.</p>
<h2>What to ask before accepting a quotation</h2>
<ol><li>Which panel, inverter and optional battery models are included?</li><li>How was expected production calculated, and what shading assumptions were used?</li><li>What site, electrical and connection work is included or excluded?</li><li>What permissions or utility arrangements need confirmation?</li><li>What are the equipment warranty terms and future service requirements?</li></ol>
<p>Matek Energy can discuss your property, energy use and installation needs. Share recent bills and available site information so the next conversation starts with your requirements, not a generic package.</p>`,
    tr: `<h2>Panel sayısından önce enerji kullanımınıza bakın</h2>
<p>Fotovoltaik güneş enerjisi sistemi güneş ışığını elektriğe dönüştürür. Ekonomik değeri; üretilen elektriğin ne kadarını kullanabildiğinize, mevcut elektrik maliyetinize ve kurulumun toplam bedeline bağlıdır. Her ev için geçerli tek bir tasarruf rakamı yoktur.</p>
<p>Teklifleri karşılaştırmadan önce mümkünse bir yıllık elektrik faturalarınızı hazırlayın. Yalnızca ödenen tutara değil, kilovatsaat cinsinden tüketime bakın. Mevsimsel ısıtma ve soğutma nedeniyle aylık faturalar önemli ölçüde değişebilir.</p>
<h2>Gündüz tüketimi neden önemlidir?</h2>
<p>Güneş enerjisi üretimi gün ve yıl boyunca değişir. Güneşli saatlerde klima, pompa veya başka ekipman kullanan bir ev, akşama kadar boş kalan bir mülke göre üretimin daha fazlasını doğrudan kullanabilir.</p>
<p>Öz tüketim, üretilen elektriğin yerinde kullanılmasıdır. Şebekeye verilen elektrik ayrı değerlendirilmelidir: bağlantı kuralları, izinler, sayaç düzeni ve varsa mahsuplaşma veya ödeme koşulları yerel olarak teyit edilmelidir. Şebekeye verilen enerjinin, satın alınan elektrikle aynı değerde olduğunu varsaymayın.</p>
<h2>Sistemin üretimini neler etkiler?</h2>
<ul><li>Kullanılabilir çatı veya arazi alanı, yön ve eğim.</li><li>Binaların, ağaçların ve çatı elemanlarının oluşturduğu gölgeler.</li><li>Panel ve invertör seçimi, sistem düzeni ve sıcaklık.</li><li>Mevsimsel hava koşulları, kirlenme ve bakım planı.</li></ul>
<p>Saha değerlendirmesinde yapı, güvenli erişim ve mevcut elektrik tesisatı da incelenmelidir. Bu ayrıntılar kurulabilecek sistemi ve teklifin içerdiği işleri etkiler.</p>
<h2>Tasarruf hesabını anlayın</h2>
<p>Başlangıç için kullanılabilecek yaklaşım şudur: yerinde tüketilen güneş elektriğinin yıllık değeri, artı teyit edilmiş şebeke satış veya mahsuplaşma değeri, eksi düzenli işletme maliyetleri. Öz tüketimin değeri geçerli tarifeye ve elektriği normalde hangi saatlerde satın alacağınıza bağlıdır.</p>
<p>Basit geri ödeme süresi, toplam kurulum bedelinin tahmini yıllık net tasarrufa bölünmesiyle bulunur. Bu yalnızca ilk karşılaştırmadır. Değişen tarifeleri, finansmanı, verim kaybını veya gelecekteki ekipman değişimini kendiliğinden kapsamaz. Tahmini garanti olarak görmek yerine arkasındaki varsayımları sorun.</p>
<h2>Batarya gerekli mi?</h2>
<p>Batarya gündüz üretiminin bir bölümünü daha sonraki saatlere taşıyabilir; ancak maliyeti artırır ve kapasite, verim, kullanım ömrü açısından ayrıca değerlendirilmelidir. Kesintide yedekleme otomatik değildir: uyumlu ekipmana ve uygun tasarlanmış kuruluma bağlıdır. Önerilen sistemin şebeke kesildiğinde hangi yükleri destekleyebildiğini sorun.</p>
<h2>Teklifi kabul etmeden önce ne sormalısınız?</h2>
<ol><li>Hangi panel, invertör ve isteğe bağlı batarya modelleri dahildir?</li><li>Beklenen üretim nasıl hesaplandı ve hangi gölgelenme varsayımları kullanıldı?</li><li>Hangi saha, elektrik ve bağlantı işleri dahil veya hariçtir?</li><li>Hangi izinlerin veya şebeke düzenlemelerinin teyidi gerekir?</li><li>Ekipman garantileri ve gelecekteki servis gereksinimleri nelerdir?</li></ol>
<p>Matek Energy ile mülkünüzü, enerji kullanımınızı ve kurulum ihtiyaçlarınızı görüşebilirsiniz. Son faturalarınızı ve mevcut saha bilgilerini paylaşarak görüşmenin standart bir paket yerine kendi gereksinimlerinizle başlamasını sağlayın.</p>`,
  },
  "choosing-the-right-air-conditioner": {
    en: `<h2>Choose for the room, not only the price</h2>
<p>An air conditioner needs to match the space it serves. A low purchase price is not a saving if the equipment struggles to maintain comfort, uses unnecessary energy or cannot be installed properly. Start by describing the room and how you use it.</p>
<p>Floor area is useful, but it is not a complete cooling-load calculation. Ceiling height, insulation, glazing, sunlight, occupancy and heat-producing equipment can all affect the required capacity.</p>
<h2>What does BTU capacity tell you?</h2>
<p>Cooling capacity is often advertised in BTU per hour. This indicates the rate at which a unit can remove heat, not its electricity consumption. A larger number is not automatically better.</p>
<p>An undersized system may run for long periods without meeting demand. An oversized system may cycle poorly and give less consistent comfort. Ask for sizing based on the room's characteristics rather than relying on a universal square-metre rule.</p>
<h2>Inverter operation and seasonal efficiency</h2>
<p>Inverter technology allows the compressor to vary its output instead of operating only at a fixed speed. This can help the system respond to changing demand, but actual performance still depends on sizing, installation, controls and operating conditions.</p>
<p>When comparing models, look at seasonal efficiency information such as SEER for cooling and SCOP for heating where provided, as well as the stated test conditions. Compare equivalent products and ask how the unit performs in the conditions expected at your property.</p>
<h2>Installation details that deserve attention</h2>
<ul><li>Indoor unit placement for comfortable airflow and service access.</li><li>Outdoor unit location, ventilation, noise and maintenance access.</li><li>The permitted pipe route, condensate drainage and electrical requirements.</li><li>Any building-management or property permissions that must be confirmed.</li></ul>
<p>These are design and installation questions for a qualified professional, not a do-it-yourself checklist. Ask the installer to explain the proposed arrangement and confirm what is included in the price.</p>
<h2>Think about heating, noise and everyday use</h2>
<p>If you plan to heat with the same unit, review heating capacity and efficiency as carefully as cooling performance. Noise matters in bedrooms and neighbouring spaces. Check which sound measurement is quoted and compare like with like.</p>
<p>Controls, timers, filter access and availability of service also affect the ownership experience. Features should solve a real need rather than distract from correct sizing and installation.</p>
<h2>Keep performance in mind after installation</h2>
<p>Follow the manufacturer's operating and cleaning guidance. Keep airflow paths clear and arrange professional servicing at intervals appropriate to the equipment and usage. Unusual noises, water leakage or changes in performance should be assessed rather than ignored.</p>
<h2>Prepare for a useful quotation</h2>
<p>Share room dimensions, photographs, window orientation, existing equipment details and your preferred operating hours. Ask for the exact model, installation inclusions, warranty terms and any additional site work. Matek Energy can help discuss equipment selection and installation requirements for your property.</p>`,
    tr: `<h2>Yalnızca fiyata değil, mekâna göre seçin</h2>
<p>Klima hizmet vereceği alanla uyumlu olmalıdır. Ekipman konforu sağlayamıyor, gereksiz enerji tüketiyor veya doğru kurulamıyorsa düşük satın alma fiyatı tasarruf anlamına gelmez. Önce odayı ve kullanım biçiminizi tanımlayın.</p>
<p>Taban alanı yararlı bir bilgidir ancak tek başına tam bir soğutma yükü hesabı değildir. Tavan yüksekliği, yalıtım, cam alanları, güneş alma durumu, kişi sayısı ve ısı üreten ekipman gerekli kapasiteyi etkileyebilir.</p>
<h2>BTU kapasitesi neyi anlatır?</h2>
<p>Soğutma kapasitesi çoğunlukla saat başına BTU cinsinden belirtilir. Bu değer cihazın elektrik tüketimini değil, ısıyı uzaklaştırma hızını gösterir. Daha büyük bir sayı her zaman daha iyi değildir.</p>
<p>Kapasitesi yetersiz bir sistem ihtiyacı karşılamadan uzun süre çalışabilir. Gereğinden büyük bir sistem ise uygun olmayan açma-kapama döngüleri ve daha dengesiz konfor oluşturabilir. Evrensel bir metrekare kuralına güvenmek yerine odanın özelliklerine göre boyutlandırma isteyin.</p>
<h2>İnvertör çalışma ve mevsimsel verim</h2>
<p>İnvertör teknolojisi kompresörün yalnızca sabit hızda çalışması yerine çıkışını değiştirmesine olanak tanır. Bu, değişen talebe uyumu destekleyebilir; ancak gerçek performans boyutlandırma, kurulum, kontroller ve çalışma koşullarına bağlıdır.</p>
<p>Modelleri karşılaştırırken varsa soğutma için SEER, ısıtma için SCOP gibi mevsimsel verim bilgilerine ve belirtilen test koşullarına bakın. Eşdeğer ürünleri karşılaştırın ve cihazın mülkünüzde beklenen koşullarda nasıl çalışacağını sorun.</p>
<h2>Kurulumda dikkat edilmesi gerekenler</h2>
<ul><li>Konforlu hava dağılımı ve servis erişimi için iç ünite konumu.</li><li>Dış ünitenin konumu, havalandırması, gürültüsü ve bakım erişimi.</li><li>İzin verilen boru güzergâhı, yoğuşma suyu tahliyesi ve elektrik gereksinimleri.</li><li>Teyit edilmesi gereken bina yönetimi veya mülk izinleri.</li></ul>
<p>Bunlar kendin yap listesi değil, yetkin bir uzmanın değerlendireceği tasarım ve kurulum konularıdır. Kurulum ekibinden önerilen düzeni açıklamasını ve fiyata nelerin dahil olduğunu teyit etmesini isteyin.</p>
<h2>Isıtma, gürültü ve günlük kullanımı düşünün</h2>
<p>Aynı cihazla ısıtma yapacaksanız ısıtma kapasitesini ve verimini de soğutma kadar dikkatle değerlendirin. Gürültü yatak odalarında ve komşu alanlarda önemlidir. Hangi ses ölçümünün verildiğini kontrol edin ve aynı tür değerleri karşılaştırın.</p>
<p>Kontroller, zamanlayıcılar, filtreye erişim ve servis olanakları da kullanım deneyimini etkiler. Özellikler gerçek bir ihtiyacı çözmeli; doğru boyutlandırma ve kurulumun önüne geçmemelidir.</p>
<h2>Kurulumdan sonra da performansı önemseyin</h2>
<p>Üreticinin kullanım ve temizlik talimatlarını izleyin. Hava yollarını açık tutun ve ekipmana ve kullanıma uygun aralıklarla profesyonel servis planlayın. Olağandışı sesler, su sızıntısı veya performans değişiklikleri göz ardı edilmemeli, değerlendirilmelidir.</p>
<h2>Yararlı bir teklif görüşmesine hazırlanın</h2>
<p>Oda ölçülerini, fotoğrafları, pencerelerin yönünü, mevcut ekipman bilgilerini ve tercih ettiğiniz çalışma saatlerini paylaşın. Tam modeli, kurulum kapsamını, garanti koşullarını ve ek saha işlerini sorun. Matek Energy ile mülkünüze uygun ekipman seçimini ve kurulum gereksinimlerini görüşebilirsiniz.</p>`,
  },
};
