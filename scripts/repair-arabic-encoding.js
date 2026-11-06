const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local dynamically
function getEnv(key) {
  if (process.env[key]) return process.env[key];
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith(key + '=')) {
        return trimmed.slice(key.length + 1).trim();
      }
    }
  }
  return '';
}

const url = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const key = getEnv('SUPABASE_SECRET_KEY') || getEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
const sb = createClient(url, key);

async function repair() {
  console.log('[1/3] Repairing products in Supabase with clean Arabic UTF-8 text...');

  // Fetch current products in Supabase so we preserve images
  const { data: currentDbProds, error: fetchErr } = await sb.from('products').select('*');
  if (fetchErr) {
    console.error('Failed to fetch existing products:', fetchErr);
    return;
  }

  const existingMap = new Map();
  for (const p of currentDbProds || []) {
    existingMap.set(p.id, p);
  }

  const cleanProducts = [
    {
      id: 'ath-hd-01',
      name_en: 'The Heavyweight 500 GSM Boxy Hoodie',
      name_ar: 'هودي أثير بوكسي الثقيل 500 GSM',
      category: 'hoodies',
      category_label_en: 'Core Heavyweight Hoodie',
      category_label_ar: 'هودي أساسي فائق الثقل',
      price: 1450,
      original_price: 1700,
      gsm: 500,
      fit_en: 'Signature Boxy Oversized',
      fit_ar: 'قصّة بوكسي أوفرسايز معتمدة',
      fabric_en: 'Heavyweight Cotton Fleece Blend (500 GSM Spec)',
      fabric_ar: 'مزيج قطن صوف ثقيل فاخر (مواصفات 500 GSM)',
      description_en: 'The defining silhouette of ATHEER. Engineered with dense 500 GSM specification French terry cotton blend, drop-shoulder architecture, and a double-layered structured hood with zero drawstrings for pure minimalist presence.',
      description_ar: 'القطعة الأيقونية لدار أثير. صُممت بمواصفات نسيج فرنش تيري ثقيل 500 GSM، بأكتاف ساقطة وقصّة بوكسي واسعة، وغطاء رأس مزدوج بدون حبال للحفاظ على الطابع المينيمالي الفاخر.',
      // Preserve uploaded images if available
      image: existingMap.get('ath-hd-01')?.image || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1000&auto=format&fit=crop',
      hover_image: existingMap.get('ath-hd-01')?.hover_image || 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?q=80&w=1000&auto=format&fit=crop',
      badge_en: 'Flagship Drop',
      badge_ar: 'القطعة الأساسية',
      is_active: true,
      is_coming_soon: false,
    },
    {
      id: 'ath-hd-02',
      name_en: 'The Bone Ivory Oversized Hoodie',
      name_ar: 'هودي العاجي أوفرسايز المطرز',
      category: 'hoodies',
      category_label_en: 'Core Heavyweight Hoodie',
      category_label_ar: 'هودي أساسي فائق الثقل',
      price: 1450,
      original_price: 1700,
      gsm: 480,
      fit_en: 'Relaxed Drop-Shoulder Fit',
      fit_ar: 'أكتاف منسدلة وقصّة مريحة',
      fabric_en: 'Combed Heavy Cotton Fleece (480 GSM Spec)',
      fabric_ar: 'قطن صوف ممشط ثقيل (مواصفات 480 GSM)',
      description_en: 'Crafted in warm natural bone ivory fleece, featuring subtle tonal matte gold Arabic typography embroidery on the chest nape. Heavyweight 480 GSM specification with ribbed 2x2 cuffs.',
      description_ar: 'منسوج بلون العاج الطبيعي الدافئ بمواصفات 480 GSM، مع تطريز دقيق لشعار أثير بالخط العربي المينيمالي بدرجة ذهبية مطفأة خلف الرقبة، وأساور عريضة مضلعة تضمن ثبات القصّة الأنيقة.',
      image: existingMap.get('ath-hd-02')?.image || 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?q=80&w=1000&auto=format&fit=crop',
      hover_image: existingMap.get('ath-hd-02')?.hover_image || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop',
      badge_en: 'Best Seller',
      badge_ar: 'الأكثر طلباً',
      is_active: true,
      is_coming_soon: false,
    },
    {
      id: 'ath-hd-03',
      name_en: 'Vintage Washed Charcoal Hoodie',
      name_ar: 'هودي الفحم المغسول فينتاج 500 GSM',
      category: 'hoodies',
      category_label_en: 'Acid Washed Hoodie',
      category_label_ar: 'هودي مغسول بالإنزيم',
      price: 1550,
      original_price: 1800,
      gsm: 500,
      fit_en: 'Wide Streetwear Silhouette',
      fit_ar: 'قصّة ستريتوير عريضة متناسقة',
      fabric_en: 'Mineral-Washed Cotton (500 GSM Spec)',
      fabric_ar: 'قطن مغسول بالمعادن (مواصفات 500 GSM)',
      description_en: 'Each garment undergoes a custom mineral wash process to achieve a bespoke faded charcoal patina. Heavyweight loopback interior for all-day comfort across Cairo streets.',
      description_ar: 'تخضع كل قطعة لعملية غسيل معدني مخصص تمنح كل هودي طابعاً متفرداً بلون الفحم العتيق، مع بطانة داخلية مريحة تحافظ على الدفء والأناقة في شوارع القاهرة والإسكندرية.',
      image: existingMap.get('ath-hd-03')?.image || 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=1000&auto=format&fit=crop',
      hover_image: existingMap.get('ath-hd-03')?.hover_image || 'https://images.unsplash.com/photo-1578768079052-aa76e520036c?q=80&w=1000&auto=format&fit=crop',
      badge_en: 'Limited Wash',
      badge_ar: 'غسيل حصري',
      is_active: true,
      is_coming_soon: false,
    },
    {
      id: 'ath-hd-04',
      name_en: 'Subtle Gold Emblem Hoodie',
      name_ar: 'هودي الشعار المذهب 460 GSM',
      category: 'hoodies',
      category_label_en: 'Embroidered Flagship',
      category_label_ar: 'هودي أساسي مطرز',
      price: 1550,
      original_price: null,
      gsm: 460,
      fit_en: 'Structured Architectural Fit',
      fit_ar: 'قصّة معمارية متناسقة',
      fabric_en: 'Luxe Compact Cotton Blend (460 GSM Spec)',
      fabric_ar: 'مزيج قطن مدمج فاخر (مواصفات 460 GSM)',
      description_en: 'Features the iconic ATHEER monogram intricately embroidered with metallic matte gold threads across the chest. Seamless kangaroo pocket and premium brass eyelets.',
      description_ar: 'يتميز بشعار أثير الأيقوني المطرز بدقة عالية بخيوط ذهبية مطفأة غير لامعة على الصدر، مع جيب كنغر وتشطيبات متقنة.',
      image: existingMap.get('ath-hd-04')?.image || 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1000&auto=format&fit=crop',
      hover_image: existingMap.get('ath-hd-04')?.hover_image || 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=1000&auto=format&fit=crop',
      badge_en: 'Iconic',
      badge_ar: 'أيقوني',
      is_active: true,
      is_coming_soon: false,
    },
    {
      id: 'ath-sw-01',
      name_en: 'Atelier Crewneck Sweatshirt in Slate',
      name_ar: 'سويت شيرت كرو نيك الفاخر بالرمادي الداكن',
      category: 'sweatshirts',
      category_label_en: 'Premium Sweatshirt',
      category_label_ar: 'سويت شيرت راقي',
      price: 1150,
      original_price: 1350,
      gsm: 450,
      fit_en: 'Modern Boxy Fit',
      fit_ar: 'قصّة بوكسي حديثة',
      fabric_en: 'Heavy French Terry (450 GSM Spec)',
      fabric_ar: 'فرنش تيري ثقيل (مواصفات 450 GSM)',
      description_en: 'The modern youth essential. Thick ribbed crew collar that retains its shape, reinforced raglan seams, and blind matte gold logo debossing at the left forearm.',
      description_ar: 'القطعة الأساسية للشباب. ياقة دائرية مضلعة عريضة تحتفظ بقوامها دون تمدد، وخياطة راجلان مريحة، مع شعار أثير المطبوع بختم حراري ذهبي مطفأ على الساعد.',
      image: existingMap.get('ath-sw-01')?.image || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1000&auto=format&fit=crop',
      hover_image: existingMap.get('ath-sw-01')?.hover_image || 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=1000&auto=format&fit=crop',
      badge_en: 'Streetwear Essential',
      badge_ar: 'أساسي يومي',
      is_active: true,
      is_coming_soon: false,
    },
    {
      id: 'ath-sw-02',
      name_en: 'Forest Pine Heavy Fleece Sweatshirt',
      name_ar: 'سويت شيرت الصنوبر الأخضر الثقيل',
      category: 'sweatshirts',
      category_label_en: 'Premium Sweatshirt',
      category_label_ar: 'سويت شيرت راقي',
      price: 1200,
      original_price: null,
      gsm: 460,
      fit_en: 'Relaxed Street Fit',
      fit_ar: 'قصّة ستريت مريحة',
      fabric_en: 'Heavy Brushed Cotton Blend (460 GSM Spec)',
      fabric_ar: 'مزيج قطن صوف مريح (مواصفات 460 GSM)',
      description_en: 'Deep evergreen tone with brushed interior fleece for supreme comfort. Clean, uncluttered silhouette with oversized chest volume and tailored cuffs.',
      description_ar: 'درجة خضراء غنية وعميقة مع صوف داخلي ناعم ومريح. قصة نظيفة تمنح مظهراً واثقاً وأنيقاً.',
      image: existingMap.get('ath-sw-02')?.image || 'https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?q=80&w=1000&auto=format&fit=crop',
      hover_image: existingMap.get('ath-sw-02')?.hover_image || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1000&auto=format&fit=crop',
      badge_en: 'New Drop',
      badge_ar: 'إصدار جديد',
      is_active: true,
      is_coming_soon: false,
    },
    {
      id: 'ath-ts-01',
      name_en: 'Upcoming: Heavyweight Drop-Shoulder Tee 320 GSM',
      name_ar: 'تي شيرت أثير البوكسي الثقيل 320 GSM',
      category: 'tshirts',
      category_label_en: 'Next Drop · Summer 2026',
      category_label_ar: 'الإصدار القادم / تي شيرت',
      price: 750,
      original_price: null,
      gsm: 320,
      fit_en: 'Boxy Oversized Tee',
      fit_ar: 'قصّة تي شيرت بوكسي أوفرسايز',
      fabric_en: 'Single Jersey Combed Cotton (320 GSM Spec)',
      fabric_ar: 'قطن جيرسي ثقيل (مواصفات 320 GSM)',
      description_en: 'The foundation of our upcoming summer delivery. Unrivaled 320 GSM jersey density, thick 1.25" rib collar that will not sag, and signature boxy proportions.',
      description_ar: 'الإصدار الشبابي القادم. صُمم بمواصفات كثافة 320 GSM، بياقة عالية ضيقة وأكمام واسعة تصل للكوع. ترقبوا الإطلاق الرسمي قريباً.',
      image: existingMap.get('ath-ts-01')?.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop',
      hover_image: existingMap.get('ath-ts-01')?.hover_image || 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1000&auto=format&fit=crop',
      badge_en: 'Coming Soon',
      badge_ar: 'قريباً',
      is_active: true,
      is_coming_soon: true,
    },
  ];

  for (const prod of cleanProducts) {
    const { error: upsertErr } = await sb.from('products').upsert(prod);
    if (upsertErr) {
      console.error(`Error updating product ${prod.id}:`, upsertErr);
    } else {
      console.log(`✓ Product ${prod.id} updated with clean Arabic: ${prod.name_ar}`);
    }
  }

  console.log('[2/3] Repairing main_settings in Supabase...');
  const { error: setErr } = await sb.from('store_settings').upsert({
    id: 'main_settings',
    store_name_en: 'ATHEER',
    store_name_ar: 'أثير',
    tagline_en: 'PREMIUM YOUTH STREETWEAR',
    tagline_ar: 'أزياء شبابية بطابع فاخر',
    whatsapp_number: '201015993802',
    support_email: 'atheerxo140@gmail.com',
    default_currency: 'EGP',
    cairo_showrooms_en: 'New Cairo · Sheikh Zayed',
    cairo_showrooms_ar: 'القاهرة الجديدة · الشيخ زايد',
    updated_at: new Date().toISOString(),
  });
  if (setErr) console.error('Error updating main_settings:', setErr);
  else console.log('✓ main_settings repaired with clean Arabic');

  console.log('[3/3] Repairing homepage_content_row in Supabase...');
  const jsonPath = path.join(__dirname, '..', 'src', 'data', 'homepage_content.json');
  const cleanJsonContent = fs.readFileSync(jsonPath, 'utf8');

  const { error: cmsErr } = await sb.from('store_settings').upsert({
    id: 'homepage_content_row',
    store_name_en: 'HOMEPAGE_CONTENT',
    store_name_ar: 'محتوى الواجهة',
    tagline_en: '',
    tagline_ar: '',
    whatsapp_number: '',
    support_email: '',
    default_currency: 'EGP',
    cairo_showrooms_en: 'ATH_CMS_STORAGE',
    cairo_showrooms_ar: cleanJsonContent,
    updated_at: new Date().toISOString(),
  });
  if (cmsErr) console.error('Error updating homepage_content_row:', cmsErr);
  else console.log('✓ homepage_content_row repaired with clean Arabic JSON');

  console.log('ALL ARABIC ENCODING REPAIRED SUCCESSFULLY!');
}

repair();
