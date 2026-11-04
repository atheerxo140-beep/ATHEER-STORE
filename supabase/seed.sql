-- =====================================================================
-- ATHEER STORE | أثير — Seed Data
-- =====================================================================

-- SEED SHIPPING ZONES
INSERT INTO public.shipping_zones (id, name_en, name_ar, countries, base_fee, free_shipping_threshold, estimated_days_en, estimated_days_ar, cod_available, is_active)
VALUES
('ksa-main', 'Saudi Arabia — Major Hubs (Riyadh, Jeddah, Dammam)', 'المملكة العربية السعودية — المدن الرئيسية (الرياض، جدة، الدمام)', ARRAY['SA'], 25.00, 500.00, '1-3 Business Days (Express)', '١-٣ أيام عمل (توصيل سريع)', true, true),
('ksa-regional', 'Saudi Arabia — Regional Cities & Provinces', 'المملكة العربية السعودية — باقي المناطق والمحافظات', ARRAY['SA'], 35.00, 600.00, '2-4 Business Days', '٢-٤ أيام عمل', true, true),
('uae-all', 'United Arab Emirates (Dubai, Abu Dhabi, Sharjah)', 'دولة الإمارات العربية المتحدة (دبي، أبوظبي، الشارقة)', ARRAY['AE'], 40.00, 650.00, '2-4 Business Days', '٢-٤ أيام عمل', true, true),
('gcc-gulf', 'Kuwait, Qatar, Bahrain & Oman', 'الكويت، قطر، البحرين، وعُمان', ARRAY['KW', 'QA', 'BH', 'OM'], 55.00, 800.00, '3-5 Business Days', '٣-٥ أيام عمل', false, true)
ON CONFLICT (id) DO UPDATE SET
    base_fee = EXCLUDED.base_fee,
    free_shipping_threshold = EXCLUDED.free_shipping_threshold;

-- SEED PRODUCTS
INSERT INTO public.products (id, name_en, name_ar, category, category_label_en, category_label_ar, price, original_price, gsm, fit_en, fit_ar, fabric_en, fabric_ar, description_en, description_ar, image, hover_image, badge_en, badge_ar, is_active, is_coming_soon)
VALUES
('ath-hd-01', 'The Heavyweight 500 GSM Boxy Hoodie', 'هودي أثير بوكسي الثقيل 500 GSM', 'hoodies', 'Core Heavyweight Hoodie', 'هودي أساسي فائق الثقل', 490.00, 560.00, 500, 'Signature Boxy Oversized', 'قصّة بوكسي أوفرسايز معتمدة', '100% Organic Heavyweight French Terry (500 GSM)', '١٠٠٪ قطن فرنش تيري عضوي فائق الثقل (500 GSM)', 'The defining silhouette of ATHEER. Engineered with ultra-dense 500 GSM pre-shrunk French terry cotton, seamless drop-shoulder architecture, and a double-layered structured hood with zero drawstrings for pure minimalist presence.', 'القطعة الأيقونية لدار أثير. صُممت من قطن الفرنش تيري العضوي فائق الكثافة بوزن 500 GSM، بأكتاف ساقطة وقصّة بوكسي واسعة، وغطاء رأس مزدوج بدون حبال للحفاظ على الطابع المينيمالي الفاخر.', 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1000&auto=format&fit=crop', 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?q=80&w=1000&auto=format&fit=crop', 'Flagship Piece', 'القطعة الأساسية', true, false),

('ath-hd-02', 'The Bone Ivory Oversized Hoodie', 'هودي العاجي أوفرسايز المطرز', 'hoodies', 'Core Heavyweight Hoodie', 'هودي أساسي فائق الثقل', 490.00, NULL, 480, 'Relaxed Drop-Shoulder Fit', 'أكتاف منسدلة وقصّة مريحة', '480 GSM Combed Cotton Fleece', 'قطن صوف ممشط 480 GSM فاخر', 'Crafted in warm natural bone ivory fleece, featuring subtle tonal matte gold Arabic typography embroidery on the chest nape. Heavyweight 480 GSM cotton with ribbed 2x2 cuffs that maintain structural volume.', 'منسوج بلون العاج الطبيعي الدافئ بوزن 480 GSM، مع تطريز دقيق لشعار أثير بالخط العربي المينيمالي بدرجة ذهبية مطفأة خلف الرقبة، وأساور عريضة مضلعة تضمن ثبات القصّة الأنيقة.', 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?q=80&w=1000&auto=format&fit=crop', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop', 'Best Seller', 'الأكثر طلباً', true, false),

('ath-hd-03', 'Vintage Washed Charcoal Hoodie', 'هودي الفحم المغسول فينتاج 500 GSM', 'hoodies', 'Acid Washed Hoodie', 'هودي مغسول بالإنزيم', 520.00, NULL, 500, 'Wide Streetwear Silhouette', 'قصّة ستريتوير عريضة متناسقة', '500 GSM Mineral-Washed Cotton', 'قطن مغسول بالمعادن 500 GSM', 'Each garment undergoes a custom mineral wash process to achieve a bespoke faded charcoal patina. Heavyweight loopback interior for all-day comfort across desert nights and urban streets.', 'تخضع كل قطعة لعملية غسيل معدني مخصص تمنح كل هودي طابعاً متفرداً بلون الفحم العتيق، مع بطانة داخلية مريحة تحافظ على الدفء في ليالي الشتاء والطلعات الشبابية.', 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=1000&auto=format&fit=crop', 'https://images.unsplash.com/photo-1578768079052-aa76e520036c?q=80&w=1000&auto=format&fit=crop', 'Limited Wash', 'غسيل حصري', true, false),

('ath-hd-04', 'Dune Sand Minimalist Street Hoodie', 'هودي رمال الصحراء المينيمالي', 'hoodies', 'Core Heavyweight Hoodie', 'هودي أساسي فائق الثقل', 470.00, NULL, 460, 'Boxy Drop-Shoulder', 'بوكسي بأكتاف ساقطة', '100% Organic Cotton French Terry (460 GSM)', '١٠٠٪ قطن فرنش تيري عضوي (460 GSM)', 'A warm earth-tone staple influenced by the Arabian dunes. Cut in custom 460 GSM organic French terry with double-needle flatlock stitching for lifetime durability.', 'تصميم ترابي مستوحى من درجات كثبان الصحراء الذهبية. قُص بقماش الفرنش تيري 460 GSM مع خياطة فلاتلوك المزدوجة المقواة لتحمّل الاستخدام اليومي المكثف.', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1000&auto=format&fit=crop', 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=1000&auto=format&fit=crop', 'Earth Tone Drop', 'ألوان الأرض', true, false),

('ath-sw-01', 'Atelier Crewneck Sweatshirt in Slate', 'سويت شيرت كرو نيك الفاخر بالرمادي الداكن', 'sweatshirts', 'Premium Sweatshirt', 'سويت شيرت راقي', 420.00, 480.00, 450, 'Modern Boxy Fit', 'قصّة بوكسي حديثة', '450 GSM Heavy French Terry', 'فرنش تيري ثقيل 450 GSM', 'The modern youth essential. Thick ribbed crew collar that never sags, reinforced raglan seams, and blind matte gold logo debossing at the left forearm.', 'القطعة الأساسية للشباب. ياقة دائرية مضلعة عريضة تحتفظ بقوامها دون تمدد، وخياطة راجلان مريحة، مع شعار أثير المطبوع بختم حراري ذهبي مطفأ على الساعد.', 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1000&auto=format&fit=crop', 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=1000&auto=format&fit=crop', 'Streetwear Essential', 'أساسي يومي', true, false),

('ath-sw-02', 'Forest Pine Heavy Fleece Sweatshirt', 'سويت شيرت الصنوبر الأخضر الثقيل', 'sweatshirts', 'Premium Sweatshirt', 'سويت شيرت راقي', 440.00, NULL, 460, 'Relaxed Street Fit', 'قصّة ستريت مريحة', '460 GSM Heavy Brushed Cotton', 'قطن صوف ناعم 460 GSM', 'Deep evergreen tone with brushed interior fleece for supreme softness against skin. Clean, uncluttered silhouette with oversized chest volume and tailored cuffs.', 'درجة خضراء غنية وعميقة مع صوف داخلي ناعم للغاية على البشرة. قصة نظيفة خالية من الحشو الزائد تمنح مظهراً واثقاً وأنيقاً.', 'https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?q=80&w=1000&auto=format&fit=crop', 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1000&auto=format&fit=crop', 'New Drop', 'إصدار جديد', true, false),

('ath-sw-03', 'The Quarter-Zip Minimalist Pullover', 'سويت شيرت هاف زيب العاجي المينيمالي', 'sweatshirts', 'Quarter-Zip Sweatshirt', 'سويت شيرت بسحاب نصفي', 460.00, NULL, 450, 'Drop-Shoulder Boxy', 'أكتاف منسدلة بوكسي', '450 GSM Heavy Combed Cotton', 'قطن ممشط ثقيل 450 GSM', 'Refined quarter-zip silhouette featuring custom matte black metal hardware with ATHEER engraving. Drop-shoulder cut with clean hem finishes for high-end styling.', 'تصميم هاف زيب راقٍ بسحاب معدني أسود مطفأ محفور باسم دار أثير. أكتاف ساقطة وتشطيب ناعم للحواف يجمع بين راحة الستريتوير وفخامة المظهر.', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop', 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1000&auto=format&fit=crop', 'Atelier Cut', 'قصّة متقنة', true, false),

('ath-ts-01', 'The 320 GSM Heavy Boxy Tee', 'تي شيرت أثير البوكسي الثقيل 320 GSM', 'tshirts', 'Future Drop / تي شيرت قادم', 'الإصدار القادم / تي شيرت', 240.00, NULL, 320, 'Oversized Boxy Tee Fit', 'قصّة تي شيرت أوفرسايز بوكسي', '100% Heavyweight Cotton Jersey (320 GSM)', '١٠٠٪ قطن جيرسي ثقيل (320 GSM)', 'The upcoming essential youth tee. Engineered in ultra-dense 320 GSM organic jersey, fitted high-neck ribbed collar, and extended elbow-length boxy sleeves. Available in the next seasonal drop.', 'الإصدار الشبابي القادم. مصنوع من جيرسي قطني عضوي ثقيل 320 GSM، بياقة عالية ضيقة وأكمام واسعة تصل للكوع. ترقبوا الإطلاق الرسمي قريباً.', 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1000&auto=format&fit=crop', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop', 'Coming Soon', 'قريباً', true, true)
ON CONFLICT (id) DO UPDATE SET
    price = EXCLUDED.price,
    description_en = EXCLUDED.description_en,
    description_ar = EXCLUDED.description_ar;

-- SEED PRODUCT VARIANTS (Sizes S, M, L, XL, XXL)
INSERT INTO public.product_variants (product_id, size, color, sku, inventory_quantity)
VALUES
('ath-hd-01', 'S', 'Onyx Black', 'ATH-HD01-BLK-S', 40),
('ath-hd-01', 'M', 'Onyx Black', 'ATH-HD01-BLK-M', 60),
('ath-hd-01', 'L', 'Onyx Black', 'ATH-HD01-BLK-L', 75),
('ath-hd-01', 'XL', 'Onyx Black', 'ATH-HD01-BLK-XL', 50),
('ath-hd-01', 'XXL', 'Onyx Black', 'ATH-HD01-BLK-XXL', 30),

('ath-hd-02', 'S', 'Bone Ivory', 'ATH-HD02-IVR-S', 35),
('ath-hd-02', 'M', 'Bone Ivory', 'ATH-HD02-IVR-M', 50),
('ath-hd-02', 'L', 'Bone Ivory', 'ATH-HD02-IVR-L', 65),
('ath-hd-02', 'XL', 'Bone Ivory', 'ATH-HD02-IVR-XL', 40),

('ath-hd-03', 'M', 'Washed Charcoal', 'ATH-HD03-WCH-M', 45),
('ath-hd-03', 'L', 'Washed Charcoal', 'ATH-HD03-WCH-L', 60),
('ath-hd-03', 'XL', 'Washed Charcoal', 'ATH-HD03-WCH-XL', 50),
('ath-hd-03', 'XXL', 'Washed Charcoal', 'ATH-HD03-WCH-XXL', 25),

('ath-hd-04', 'S', 'Dune Sand', 'ATH-HD04-SND-S', 30),
('ath-hd-04', 'M', 'Dune Sand', 'ATH-HD04-SND-M', 45),
('ath-hd-04', 'L', 'Dune Sand', 'ATH-HD04-SND-L', 55),
('ath-hd-04', 'XL', 'Dune Sand', 'ATH-HD04-SND-XL', 35),

('ath-sw-01', 'S', 'Slate Grey', 'ATH-SW01-SLT-S', 30),
('ath-sw-01', 'M', 'Slate Grey', 'ATH-SW01-SLT-M', 50),
('ath-sw-01', 'L', 'Slate Grey', 'ATH-SW01-SLT-L', 60),
('ath-sw-01', 'XL', 'Slate Grey', 'ATH-SW01-SLT-XL', 40),
('ath-sw-01', 'XXL', 'Slate Grey', 'ATH-SW01-SLT-XXL', 20),

('ath-sw-02', 'M', 'Forest Pine', 'ATH-SW02-FOR-M', 35),
('ath-sw-02', 'L', 'Forest Pine', 'ATH-SW02-FOR-L', 50),
('ath-sw-02', 'XL', 'Forest Pine', 'ATH-SW02-FOR-XL', 35),

('ath-sw-03', 'S', 'Bone Ivory', 'ATH-SW03-IVR-S', 25),
('ath-sw-03', 'M', 'Bone Ivory', 'ATH-SW03-IVR-M', 40),
('ath-sw-03', 'L', 'Bone Ivory', 'ATH-SW03-IVR-L', 45),
('ath-sw-03', 'XL', 'Bone Ivory', 'ATH-SW03-IVR-XL', 30)
ON CONFLICT (sku) DO NOTHING;
