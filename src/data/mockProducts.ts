import { Product } from '@/types';
import { getSupabaseServer, isSupabaseConfigured } from '@/lib/supabaseServer';

export const mockProducts: Product[] = [
  {
    id: 'ath-hd-01',
    nameEn: 'The Heavyweight 500 GSM Boxy Hoodie',
    nameAr: 'هودي أثير بوكسي الثقيل 500 GSM',
    category: 'hoodies',
    categoryLabelEn: 'Core Heavyweight Hoodie',
    categoryLabelAr: 'هودي أساسي فائق الثقل',
    price: 1450,
    originalPrice: 1700,
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1000&auto=format&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?q=80&w=1000&auto=format&fit=crop',
    badgeEn: 'Flagship Drop',
    badgeAr: 'القطعة الأساسية',
    descriptionEn: 'The defining silhouette of ATHEER. Engineered with dense 500 GSM specification French terry cotton blend, drop-shoulder architecture, and a double-layered structured hood with zero drawstrings for pure minimalist presence.',
    descriptionAr: 'القطعة الأيقونية لدار أثير. صُممت بمواصفات نسيج فرنش تيري ثقيل 500 GSM، بأكتاف ساقطة وقصّة بوكسي واسعة، وغطاء رأس مزدوج بدون حبال للحفاظ على الطابع المينيمالي الفاخر.',
    gsm: 500,
    fitEn: 'Signature Boxy Oversized',
    fitAr: 'قصّة بوكسي أوفرسايز معتمدة',
    fabricEn: 'Heavyweight Cotton Fleece Blend (500 GSM Spec)',
    fabricAr: 'مزيج قطن صوف ثقيل فاخر (مواصفات 500 GSM)',
    colors: ['Onyx Black', 'Washed Charcoal'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    isNewArrival: true,
    isBestseller: true,
    inventory: 145,
  },
  {
    id: 'ath-hd-02',
    nameEn: 'The Bone Ivory Oversized Hoodie',
    nameAr: 'هودي العاجي أوفرسايز المطرز',
    category: 'hoodies',
    categoryLabelEn: 'Core Heavyweight Hoodie',
    categoryLabelAr: 'هودي أساسي فائق الثقل',
    price: 1450,
    image: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?q=80&w=1000&auto=format&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop',
    badgeEn: 'Best Seller',
    badgeAr: 'الأكثر طلباً',
    descriptionEn: 'Crafted in warm natural bone ivory fleece, featuring subtle tonal matte gold Arabic typography embroidery on the chest nape. Heavyweight 480 GSM specification with ribbed 2x2 cuffs that maintain structural volume.',
    descriptionAr: 'منسوج بلون العاج الطبيعي الدافئ بمواصفات 480 GSM، مع تطريز دقيق لشعار أثير بالخط العربي المينيمالي بدرجة ذهبية مطفأة خلف الرقبة، وأساور عريضة مضلعة تضمن ثبات القصّة الأنيقة.',
    gsm: 480,
    fitEn: 'Relaxed Drop-Shoulder Fit',
    fitAr: 'أكتاف منسدلة وقصّة مريحة',
    fabricEn: 'Combed Heavy Cotton Fleece (480 GSM Spec)',
    fabricAr: 'قطن صوف ممشط ثقيل (مواصفات 480 GSM)',
    colors: ['Bone Ivory', 'Desert Dune'],
    sizes: ['S', 'M', 'L', 'XL'],
    isBestseller: true,
    inventory: 90,
  },
  {
    id: 'ath-hd-03',
    nameEn: 'Vintage Washed Charcoal Hoodie',
    nameAr: 'هودي الفحم المغسول فينتاج 500 GSM',
    category: 'hoodies',
    categoryLabelEn: 'Acid Washed Hoodie',
    categoryLabelAr: 'هودي مغسول بالإنزيم',
    price: 1550,
    image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=1000&auto=format&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1578768079052-aa76e520036c?q=80&w=1000&auto=format&fit=crop',
    badgeEn: 'Limited Wash',
    badgeAr: 'غسيل حصري',
    descriptionEn: 'Each garment undergoes a custom mineral wash process to achieve a bespoke faded charcoal patina. Heavyweight loopback interior for all-day comfort across Cairo streets.',
    descriptionAr: 'تخضع كل قطعة لعملية غسيل معدني مخصص تمنح كل هودي طابعاً متفرداً بلون الفحم العتيق، مع بطانة داخلية مريحة تحافظ على الدفء والأناقة في شوارع القاهرة والإسكندرية.',
    gsm: 500,
    fitEn: 'Wide Streetwear Silhouette',
    fitAr: 'قصّة ستريتوير عريضة متناسقة',
    fabricEn: 'Mineral-Washed Cotton (500 GSM Spec)',
    fabricAr: 'قطن مغسول بالمعادن (مواصفات 500 GSM)',
    colors: ['Washed Charcoal', 'Mineral Smoke'],
    sizes: ['M', 'L', 'XL', 'XXL'],
    isNewArrival: true,
    inventory: 70,
  },
  {
    id: 'ath-hd-04',
    nameEn: 'Dune Sand Minimalist Street Hoodie',
    nameAr: 'هودي رمال الصحراء المينيمالي',
    category: 'hoodies',
    categoryLabelEn: 'Core Heavyweight Hoodie',
    categoryLabelAr: 'هودي أساسي فائق الثقل',
    price: 1350,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1000&auto=format&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=1000&auto=format&fit=crop',
    badgeEn: 'Earth Tone Drop',
    badgeAr: 'ألوان الأرض',
    descriptionEn: 'A warm earth-tone staple influenced by desert landscapes. Cut in custom 460 GSM specification French terry with double-needle flatlock stitching for durability.',
    descriptionAr: 'تصميم ترابي مستوحى من درجات الصحراء الذهبية. قُص بقماش الفرنش تيري بمواصفات 460 GSM مع خياطة فلاتلوك المزدوجة المقواة لتحمّل الاستخدام اليومي.',
    gsm: 460,
    fitEn: 'Boxy Drop-Shoulder',
    fitAr: 'بوكسي بأكتاف ساقطة',
    fabricEn: 'Cotton French Terry (460 GSM Spec)',
    fabricAr: 'قطن فرنش تيري مريح (مواصفات 460 GSM)',
    colors: ['Dune Sand', 'Raw Ochre'],
    sizes: ['S', 'M', 'L', 'XL'],
    inventory: 85,
  },
  {
    id: 'ath-sw-01',
    nameEn: 'Atelier Crewneck Sweatshirt in Slate',
    nameAr: 'سويت شيرت كرو نيك الفاخر بالرمادي الداكن',
    category: 'sweatshirts',
    categoryLabelEn: 'Premium Sweatshirt',
    categoryLabelAr: 'سويت شيرت راقي',
    price: 1150,
    originalPrice: 1350,
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1000&auto=format&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=1000&auto=format&fit=crop',
    badgeEn: 'Streetwear Essential',
    badgeAr: 'أساسي يومي',
    descriptionEn: 'The modern youth essential. Thick ribbed crew collar that retains its shape, reinforced raglan seams, and blind matte gold logo debossing at the left forearm.',
    descriptionAr: 'القطعة الأساسية للشباب. ياقة دائرية مضلعة عريضة تحتفظ بقوامها دون تمدد، وخياطة راجلان مريحة، مع شعار أثير المطبوع بختم حراري ذهبي مطفأ على الساعد.',
    gsm: 450,
    fitEn: 'Modern Boxy Fit',
    fitAr: 'قصّة بوكسي حديثة',
    fabricEn: 'Heavy French Terry (450 GSM Spec)',
    fabricAr: 'فرنش تيري ثقيل (مواصفات 450 GSM)',
    colors: ['Slate Grey', 'Onyx Black'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    isBestseller: true,
    inventory: 110,
  },
  {
    id: 'ath-sw-02',
    nameEn: 'Forest Pine Heavy Fleece Sweatshirt',
    nameAr: 'سويت شيرت الصنوبر الأخضر الثقيل',
    category: 'sweatshirts',
    categoryLabelEn: 'Premium Sweatshirt',
    categoryLabelAr: 'سويت شيرت راقي',
    price: 1200,
    image: 'https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?q=80&w=1000&auto=format&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1000&auto=format&fit=crop',
    badgeEn: 'New Drop',
    badgeAr: 'إصدار جديد',
    descriptionEn: 'Deep evergreen tone with brushed interior fleece for supreme comfort. Clean, uncluttered silhouette with oversized chest volume and tailored cuffs.',
    descriptionAr: 'درجة خضراء غنية وعميقة مع صوف داخلي ناعم ومريح. قصة نظيفة خالية من الحشو الزائد تمنح مظهراً واثقاً وأنيقاً.',
    gsm: 460,
    fitEn: 'Relaxed Street Fit',
    fitAr: 'قصّة ستريت مريحة',
    fabricEn: 'Heavy Brushed Cotton Blend (460 GSM Spec)',
    fabricAr: 'مزيج قطن صوف مريح (مواصفات 460 GSM)',
    colors: ['Forest Pine', 'Deep Spruce'],
    sizes: ['M', 'L', 'XL'],
    isNewArrival: true,
    inventory: 65,
  },
  {
    id: 'ath-sw-03',
    nameEn: 'The Quarter-Zip Minimalist Pullover',
    nameAr: 'سويت شيرت هاف زيب العاجي المينيمالي',
    category: 'sweatshirts',
    categoryLabelEn: 'Quarter-Zip Sweatshirt',
    categoryLabelAr: 'سويت شيرت بسحاب نصفي',
    price: 1250,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1000&auto=format&fit=crop',
    badgeEn: 'Atelier Cut',
    badgeAr: 'قصّة متقنة',
    descriptionEn: 'Refined quarter-zip silhouette featuring custom matte black metal hardware with ATHEER engraving. Drop-shoulder cut with clean hem finishes for high-end styling.',
    descriptionAr: 'تصميم هاف زيب راقٍ بسحاب معدني أسود مطفأ محفور باسم دار أثير. أكتاف ساقطة وتشطيب ناعم للحواف يجمع بين راحة الستريتوير وفخامة المظهر.',
    gsm: 450,
    fitEn: 'Drop-Shoulder Boxy',
    fitAr: 'أكتاف منسدلة بوكسي',
    fabricEn: 'Heavy Combed Cotton Blend (450 GSM Spec)',
    fabricAr: 'مزيج قطن ممشط ثقيل (مواصفات 450 GSM)',
    colors: ['Bone Ivory', 'Charcoal Noir'],
    sizes: ['S', 'M', 'L', 'XL'],
    inventory: 50,
  },
  {
    id: 'ath-ts-01',
    nameEn: 'The 320 GSM Heavy Boxy Tee',
    nameAr: 'تي شيرت أثير البوكسي الثقيل 320 GSM',
    category: 'tshirts',
    categoryLabelEn: 'Future Drop / تي شيرت قادم',
    categoryLabelAr: 'الإصدار القادم / تي شيرت',
    price: 650,
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1000&auto=format&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop',
    badgeEn: 'Coming Soon',
    badgeAr: 'قريباً',
    descriptionEn: 'The upcoming essential youth tee. Engineered to 320 GSM density specifications, fitted high-neck ribbed collar, and extended elbow-length boxy sleeves. Available in the next seasonal drop.',
    descriptionAr: 'الإصدار الشبابي القادم. صُمم بمواصفات كثافة 320 GSM، بياقة عالية ضيقة وأكمام واسعة تصل للكوع. ترقبوا الإطلاق الرسمي قريباً.',
    gsm: 320,
    fitEn: 'Oversized Boxy Tee Fit',
    fitAr: 'قصّة تي شيرت أوفرسايز بوكسي',
    fabricEn: 'Heavyweight Cotton Jersey (320 GSM Spec)',
    fabricAr: 'قطن جيرسي ثقيل (مواصفات 320 GSM)',
    colors: ['Onyx Black', 'Ivory Bone', 'Desert Dune'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    isComingSoon: true,
    inventory: 0,
  },
];

// Editable product repository in memory & Supabase for admin dashboard & public store
const globalForProducts = global as unknown as { currentProducts?: Product[] };
export const currentProducts: Product[] = globalForProducts.currentProducts || [...mockProducts];
if (process.env.NODE_ENV !== 'production') {
  globalForProducts.currentProducts = currentProducts;
}

export const getAllProducts = async (): Promise<Product[]> => {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseServer();
    if (supabase) {
      try {
        const { data: dbProducts, error } = await supabase
          .from('products')
          .select('*, product_variants(*)')
          .eq('is_active', true)
          .order('created_at', { ascending: true });

        if (!error && dbProducts && dbProducts.length > 0) {
          const mapped: Product[] = dbProducts.map((p) => {
            const variants = p.product_variants || [];
            const sizes = Array.from(new Set(variants.map((v: any) => v.size).filter(Boolean))) as string[];
            const colors = Array.from(new Set(variants.map((v: any) => v.color).filter(Boolean))) as string[];
            const totalInventory = variants.reduce((acc: number, v: any) => acc + (v.inventory_quantity || 0), 0);

            return {
              id: p.id,
              nameEn: p.name_en,
              nameAr: p.name_ar,
              category: p.category as any,
              categoryLabelEn: p.category_label_en,
              categoryLabelAr: p.category_label_ar,
              price: Number(p.price),
              originalPrice: p.original_price ? Number(p.original_price) : undefined,
              image: p.image,
              hoverImage: p.hover_image || p.image,
              badgeEn: p.badge_en,
              badgeAr: p.badge_ar,
              descriptionEn: p.description_en || '',
              descriptionAr: p.description_ar || '',
              gsm: p.gsm || 500,
              fitEn: p.fit_en || 'Signature Boxy Oversized',
              fitAr: p.fit_ar || 'قصّة بوكسي أوفرسايز معتمدة',
              fabricEn: p.fabric_en || 'Heavyweight Cotton Fleece Blend (500 GSM Spec)',
              fabricAr: p.fabric_ar || 'مزيج قطن صوف ثقيل فاخر (مواصفات 500 GSM)',
              colors: colors.length > 0 ? colors : ['Onyx Black'],
              sizes: sizes.length > 0 ? sizes : ['S', 'M', 'L', 'XL'],
              isComingSoon: Boolean(p.is_coming_soon),
              inventory: totalInventory > 0 ? totalInventory : 50,
            };
          });

          // Sync currentProducts in memory
          currentProducts.length = 0;
          currentProducts.push(...mapped);
          return mapped;
        }
      } catch (err) {
        console.warn('[ProductsStore] Supabase product fetch error:', err);
      }
    }
  }

  return currentProducts;
};

export const getProductById = async (id: string): Promise<Product | undefined> => {
  const inMem = currentProducts.find((p) => p.id === id);
  if (inMem) return inMem;

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseServer();
    if (supabase) {
      try {
        const { data: p, error } = await supabase
          .from('products')
          .select('*, product_variants(*)')
          .eq('id', id)
          .single();

        if (!error && p) {
          const variants = p.product_variants || [];
          const sizes = Array.from(new Set(variants.map((v: any) => v.size).filter(Boolean))) as string[];
          const colors = Array.from(new Set(variants.map((v: any) => v.color).filter(Boolean))) as string[];
          const totalInventory = variants.reduce((acc: number, v: any) => acc + (v.inventory_quantity || 0), 0);

          const prod: Product = {
            id: p.id,
            nameEn: p.name_en,
            nameAr: p.name_ar,
            category: p.category as any,
            categoryLabelEn: p.category_label_en,
            categoryLabelAr: p.category_label_ar,
            price: Number(p.price),
            originalPrice: p.original_price ? Number(p.original_price) : undefined,
            image: p.image,
            hoverImage: p.hover_image || p.image,
            badgeEn: p.badge_en,
            badgeAr: p.badge_ar,
            descriptionEn: p.description_en || '',
            descriptionAr: p.description_ar || '',
            gsm: p.gsm || 500,
            fitEn: p.fit_en || 'Signature Boxy Oversized',
            fitAr: p.fit_ar || 'قصّة بوكسي أوفرسايز معتمدة',
            fabricEn: p.fabric_en || 'Heavyweight Cotton Fleece Blend (500 GSM Spec)',
            fabricAr: p.fabric_ar || 'مزيج قطن صوف ثقيل فاخر (مواصفات 500 GSM)',
            colors: colors.length > 0 ? colors : ['Onyx Black'],
            sizes: sizes.length > 0 ? sizes : ['S', 'M', 'L', 'XL'],
            isComingSoon: Boolean(p.is_coming_soon),
            inventory: totalInventory > 0 ? totalInventory : 50,
          };
          currentProducts.unshift(prod);
          return prod;
        }
      } catch (err) {
        console.warn('[ProductsStore] ProductById fetch error:', err);
      }
    }
  }

  return mockProducts.find((p) => p.id === id);
};

export const addProduct = async (product: Product): Promise<Product> => {
  currentProducts.unshift(product);

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseServer();
    if (supabase) {
      try {
        await supabase.from('products').upsert({
          id: product.id,
          name_en: product.nameEn,
          name_ar: product.nameAr,
          category: product.category,
          category_label_en: product.categoryLabelEn || product.category,
          category_label_ar: product.categoryLabelAr || product.category,
          price: product.price,
          original_price: product.originalPrice || null,
          gsm: product.gsm || 500,
          fit_en: product.fitEn || 'Signature Boxy Oversized',
          fit_ar: product.fitAr || 'قصّة بوكسي أوفرسايز معتمدة',
          fabric_en: product.fabricEn || 'Heavyweight Cotton Fleece Blend (500 GSM Spec)',
          fabric_ar: product.fabricAr || 'مزيج قطن صوف ثقيل فاخر (مواصفات 500 GSM)',
          description_en: product.descriptionEn || '',
          description_ar: product.descriptionAr || '',
          image: product.image,
          hover_image: product.hoverImage || product.image,
          badge_en: product.badgeEn || null,
          badge_ar: product.badgeAr || null,
          is_active: true,
          is_coming_soon: Boolean(product.isComingSoon),
          created_at: new Date().toISOString(),
        });

        // Seed variants if sizes & colors provided
        if (product.sizes?.length && product.colors?.length) {
          const variants = [];
          for (const s of product.sizes) {
            for (const c of product.colors) {
              variants.push({
                product_id: product.id,
                size: s,
                color: c,
                sku: `${product.id}-${s}-${c}`.replace(/[^a-zA-Z0-9_-]/g, '_').toUpperCase(),
                inventory_quantity: Math.max(1, Math.floor((product.inventory || 50) / (product.sizes.length * product.colors.length))),
                is_active: true,
              });
            }
          }
          await supabase.from('product_variants').upsert(variants, { onConflict: 'product_id,size,color' });
        }
      } catch (err) {
        console.warn('[ProductsStore] Supabase product insert error:', err);
      }
    }
  }

  return product;
};

export const updateProduct = async (id: string, updates: Partial<Product>): Promise<Product | null> => {
  const index = currentProducts.findIndex((p) => p.id === id);
  if (index !== -1) {
    currentProducts[index] = { ...currentProducts[index], ...updates };
  }
  const product = index !== -1 ? currentProducts[index] : (updates as Product);

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseServer();
    if (supabase) {
      try {
        const dbUpdates: any = {};
        if (updates.nameEn !== undefined) dbUpdates.name_en = updates.nameEn;
        if (updates.nameAr !== undefined) dbUpdates.name_ar = updates.nameAr;
        if (updates.category !== undefined) dbUpdates.category = updates.category;
        if (updates.categoryLabelEn !== undefined) dbUpdates.category_label_en = updates.categoryLabelEn;
        if (updates.categoryLabelAr !== undefined) dbUpdates.category_label_ar = updates.categoryLabelAr;
        if (updates.price !== undefined) dbUpdates.price = updates.price;
        if (updates.originalPrice !== undefined) dbUpdates.original_price = updates.originalPrice;
        if (updates.gsm !== undefined) dbUpdates.gsm = updates.gsm;
        if (updates.fitEn !== undefined) dbUpdates.fit_en = updates.fitEn;
        if (updates.fitAr !== undefined) dbUpdates.fit_ar = updates.fitAr;
        if (updates.fabricEn !== undefined) dbUpdates.fabric_en = updates.fabricEn;
        if (updates.fabricAr !== undefined) dbUpdates.fabric_ar = updates.fabricAr;
        if (updates.descriptionEn !== undefined) dbUpdates.description_en = updates.descriptionEn;
        if (updates.descriptionAr !== undefined) dbUpdates.description_ar = updates.descriptionAr;
        if (updates.image !== undefined) dbUpdates.image = updates.image;
        if (updates.hoverImage !== undefined) dbUpdates.hover_image = updates.hoverImage;
        if (updates.badgeEn !== undefined) dbUpdates.badge_en = updates.badgeEn;
        if (updates.badgeAr !== undefined) dbUpdates.badge_ar = updates.badgeAr;
        if (updates.isComingSoon !== undefined) dbUpdates.is_coming_soon = updates.isComingSoon;

        if (Object.keys(dbUpdates).length > 0) {
          await supabase.from('products').update(dbUpdates).eq('id', id);
        }
      } catch (err) {
        console.warn('[ProductsStore] Supabase product update error:', err);
      }
    }
  }

  return product;
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  const index = currentProducts.findIndex((p) => p.id === id);
  if (index !== -1) {
    currentProducts.splice(index, 1);
  }

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseServer();
    if (supabase) {
      try {
        await supabase.from('products').delete().eq('id', id);
      } catch (err) {
        console.warn('[ProductsStore] Supabase product delete error:', err);
      }
    }
  }

  return true;
};
