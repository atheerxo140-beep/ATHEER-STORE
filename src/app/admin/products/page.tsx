'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { Product } from '@/types';
import { adminFetch } from '@/lib/adminAuthClient';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Check,
  X,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Layers,
  ArrowUpDown,
  Upload,
  Image as ImageIcon,
  Camera,
  Link as LinkIcon,
} from 'lucide-react';

const PRESET_GARMENT_IMAGES = [
  {
    name: 'Onyx Black Hoodie',
    url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1000&auto=format&fit=crop',
  },
  {
    name: 'Bone Ivory Hoodie',
    url: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?q=80&w=1000&auto=format&fit=crop',
  },
  {
    name: 'Washed Charcoal',
    url: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=1000&auto=format&fit=crop',
  },
  {
    name: 'Dune Sand Minimal',
    url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1000&auto=format&fit=crop',
  },
  {
    name: 'Crewneck Sweatshirt',
    url: 'https://images.unsplash.com/photo-1578768079052-aa76e520036c?q=80&w=1000&auto=format&fit=crop',
  },
  {
    name: 'Heavyweight T-Shirt',
    url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop',
  },
];

const PRESET_MODEL_IMAGES = [
  {
    name: 'Model Studio Pose',
    url: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?q=80&w=1000&auto=format&fit=crop',
  },
  {
    name: 'Editorial Streetwear',
    url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop',
  },
  {
    name: 'Urban Mood',
    url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=1000&auto=format&fit=crop',
  },
  {
    name: 'Studio Flat Lay',
    url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1000&auto=format&fit=crop',
  },
];

export default function AdminProductsPage() {
  const { language, isRtl } = useLanguage();
  const isAr = language === 'ar';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'hoodies' | 'sweatshirts' | 'tshirts'>('all');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);

  // File Upload State & Refs
  const primaryFileInputRef = useRef<HTMLInputElement>(null);
  const hoverFileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingPrimary, setUploadingPrimary] = useState(false);
  const [uploadingHover, setUploadingHover] = useState(false);
  const [showManualUrl, setShowManualUrl] = useState(false);

  // Form State
  const initialFormState: Partial<Product> = {
    nameEn: '',
    nameAr: '',
    category: 'hoodies',
    categoryLabelEn: 'Core Heavyweight Hoodie',
    categoryLabelAr: 'هودي أساسي فائق الثقل',
    price: 1450,
    originalPrice: 1700,
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1000&auto=format&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?q=80&w=1000&auto=format&fit=crop',
    badgeEn: 'Flagship Drop',
    badgeAr: 'القطعة الأساسية',
    descriptionEn: '',
    descriptionAr: '',
    gsm: 500,
    fitEn: 'Signature Boxy Oversized',
    fitAr: 'قصّة بوكسي أوفرسايز معتمدة',
    fabricEn: 'Heavyweight Cotton Fleece Blend (500 GSM Spec)',
    fabricAr: 'مزيج قطن صوف ثقيل فاخر (مواصفات 500 GSM)',
    colors: ['Onyx Black', 'Bone Ivory'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    isNewArrival: false,
    isBestseller: false,
    isComingSoon: false,
    inventory: 50,
  };

  const [formData, setFormData] = useState<Partial<Product>>(initialFormState);
  const [newColorInput, setNewColorInput] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await adminFetch('/api/admin/products', {
        cache: 'no-store',
      });
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
      } else {
        setFeedbackMsg({ type: 'error', text: data.error || (isAr ? 'تعذر جلب المنتجات' : 'Failed to fetch products') });
      }
    } catch (err: any) {
      console.error('Failed to load products:', err);
      setFeedbackMsg({ type: 'error', text: err.message || (isAr ? 'خطأ في الاتصال بالخادم' : 'Connection error') });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenCreate = () => {
    setFormData({
      ...initialFormState,
      id: `ath-${Date.now().toString().slice(-6)}`,
    });
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setActiveProduct(p);
    setFormData({ ...p });
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (p: Product) => {
    setActiveProduct(p);
    setIsDeleteModalOpen(true);
  };

  // Upload file from mobile studio / computer gallery directly to Supabase Storage
  const handleFileUpload = async (file: File, field: 'image' | 'hoverImage') => {
    if (!file) return;

    if (field === 'image') setUploadingPrimary(true);
    else setUploadingHover(true);

    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('folder', 'products');

      const res = await adminFetch('/api/admin/upload', {
        method: 'POST',
        body: uploadData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        setFormData((prev) => ({ ...prev, [field]: data.url }));
        setFeedbackMsg({
          type: 'success',
          text: isAr
            ? `تم رفع ${field === 'image' ? 'صورة المنتج الأساسية' : 'صورة الموديل'} بنجاح من جهازك!`
            : 'Image successfully uploaded from your device!',
        });
        setTimeout(() => setFeedbackMsg(null), 4000);
      } else {
        setFeedbackMsg({
          type: 'error',
          text: data.error || (isAr ? 'فشل رفع الصورة' : 'Failed to upload image'),
        });
      }
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: err.message || (isAr ? 'حدث خطأ أثناء رفع الصورة' : 'Upload error'),
      });
    } finally {
      if (field === 'image') setUploadingPrimary(false);
      else setUploadingHover(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = isEditModalOpen ? 'PUT' : 'POST';
      const payload = isEditModalOpen
        ? { id: activeProduct?.id, ...formData }
        : formData;

      const res = await adminFetch('/api/admin/products', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({
          type: 'success',
          text: isEditModalOpen
            ? isAr ? 'تم تحديث بيانات القطعة بنجاح' : 'Product updated successfully'
            : isAr ? 'تمت إضافة القطعة الجديدة وحفظها في المتجر بنجاح' : 'Product created successfully',
        });
        setIsCreateModalOpen(false);
        setIsEditModalOpen(false);
        fetchProducts();
        setTimeout(() => setFeedbackMsg(null), 4000);
      } else {
        setFeedbackMsg({ type: 'error', text: data.error || (isAr ? 'فشلت العملية' : 'Operation failed') });
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Error occurred' });
    }
  };

  const handleDeleteProduct = async () => {
    if (!activeProduct) return;
    try {
      const res = await adminFetch(`/api/admin/products?id=${activeProduct.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({
          type: 'success',
          text: isAr ? 'تم حذف القطعة من الكتالوج بنجاح' : 'Product deleted successfully',
        });
        setIsDeleteModalOpen(false);
        setActiveProduct(null);
        fetchProducts();
        setTimeout(() => setFeedbackMsg(null), 4000);
      } else {
        setFeedbackMsg({ type: 'error', text: data.error || (isAr ? 'فشل الحذف' : 'Failed to delete') });
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message });
    }
  };

  const toggleSize = (size: string) => {
    const currentSizes = formData.sizes || [];
    if (currentSizes.includes(size)) {
      setFormData({ ...formData, sizes: currentSizes.filter((s) => s !== size) });
    } else {
      setFormData({ ...formData, sizes: [...currentSizes, size] });
    }
  };

  const addColor = () => {
    if (!newColorInput.trim()) return;
    const currentColors = formData.colors || [];
    if (!currentColors.includes(newColorInput.trim())) {
      setFormData({ ...formData, colors: [...currentColors, newColorInput.trim()] });
    }
    setNewColorInput('');
  };

  const removeColor = (color: string) => {
    setFormData({
      ...formData,
      colors: (formData.colors || []).filter((c) => c !== color),
    });
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch =
      p.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.nameAr.includes(searchTerm) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-brand-border">
        <div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs font-mono text-brand-gold uppercase tracking-widest mb-1">
            <Package className="w-4 h-4 text-brand-gold" />
            <span>{isAr ? 'كتالوج أزياء الشارع' : 'Streetwear Catalog'}</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-brand-ivory font-serif">
            {isAr ? 'إدارة المنتجات والقطع' : 'Product Management'}
          </h1>
          <p className="text-xs text-brand-cream/60 mt-1">
            {isAr
              ? 'إدارة الهوديز، السويت شيرتات، رفع الصور من الاستوديو، وتعديل الأسعار والمخزون'
              : 'Manage flagship hoodies, sweatshirts, direct studio image uploads, specs, and pricing'}
          </p>
        </div>

        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <button
            onClick={fetchProducts}
            className="p-2.5 bg-brand-charcoal border border-brand-border text-brand-cream/80 hover:text-brand-gold hover:border-brand-gold/40 transition-colors rounded-sm"
            title={isAr ? 'تحديث الكتالوج' : 'Refresh Catalog'}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleOpenCreate}
            className="flex items-center space-x-2 rtl:space-x-reverse bg-brand-gold text-brand-black px-4 py-2.5 text-xs font-mono font-bold tracking-widest uppercase hover:bg-brand-gold-light transition-colors shadow-gold rounded-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'إضافة قطعة جديدة' : 'Add New Garment'}</span>
          </button>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-sm border flex items-center justify-between text-xs font-mono transition-all ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
          }`}
        >
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            {feedbackMsg.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="text-brand-cream/50 hover:text-brand-ivory">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Controls: Category Filter & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex items-center space-x-1 rtl:space-x-reverse bg-brand-charcoal p-1 border border-brand-border/60 rounded-sm overflow-x-auto">
          {[
            { id: 'all', labelEn: 'All Garments', labelAr: 'الكل' },
            { id: 'hoodies', labelEn: 'Hoodies (Flagship)', labelAr: 'هوديز (الأساسي)' },
            { id: 'sweatshirts', labelEn: 'Sweatshirts', labelAr: 'سويت شيرتات' },
            { id: 'tshirts', labelEn: 'T-Shirts (Upcoming)', labelAr: 'تي شيرتات (قريباً)' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors rounded-xs whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-brand-gold text-brand-black font-bold'
                  : 'text-brand-cream/70 hover:text-brand-ivory'
              }`}
            >
              {isAr ? cat.labelAr : cat.labelEn}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 left-3 rtl:left-auto rtl:right-3 text-brand-cream/40" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isAr ? 'بحث بالاسم أو الكود...' : 'Search garment or ID...'}
            className="w-full bg-brand-charcoal border border-brand-border/60 text-brand-ivory text-xs px-9 py-2 rounded-sm focus:outline-none focus:border-brand-gold font-mono"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute top-1/2 -translate-y-1/2 right-3 rtl:right-auto rtl:left-3 text-brand-cream/40 hover:text-brand-ivory"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-brand-charcoal border border-brand-border/80 rounded-sm overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right border-collapse">
            <thead>
              <tr className="border-b border-brand-border/80 bg-brand-stone/30 text-[10px] uppercase font-mono tracking-widest text-brand-cream/60">
                <th className="py-3 px-4">{isAr ? 'القطعة / الكتالوج' : 'Garment'}</th>
                <th className="py-3 px-4">{isAr ? 'التصنيف' : 'Category'}</th>
                <th className="py-3 px-4">{isAr ? 'مواصفة GSM' : 'GSM Spec'}</th>
                <th className="py-3 px-4">{isAr ? 'السعر (EGP)' : 'Price (EGP)'}</th>
                <th className="py-3 px-4">{isAr ? 'المخزون' : 'Inventory'}</th>
                <th className="py-3 px-4">{isAr ? 'الحالة' : 'Status'}</th>
                <th className="py-3 px-4 text-center">{isAr ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-brand-cream/50 font-mono">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-gold" />
                    {isAr ? 'جاري تحميل الكتالوج...' : 'Loading garments...'}
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-brand-cream/50 font-mono">
                    <div className="max-w-md mx-auto space-y-3">
                      <Package className="w-10 h-10 text-brand-gold/40 mx-auto" />
                      <p className="text-sm font-semibold text-brand-ivory">
                        {isAr ? 'لا توجد قطع مطابقة للبحث' : 'No garments found matching criteria.'}
                      </p>
                      <button
                        onClick={handleOpenCreate}
                        className="inline-flex items-center space-x-2 rtl:space-x-reverse bg-brand-gold text-brand-black px-4 py-2 text-xs font-mono font-bold tracking-wider uppercase hover:bg-brand-gold-light rounded-sm"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{isAr ? 'إضافة أول قطعة الآن' : 'Add First Garment Now'}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-brand-stone/20 transition-colors">
                    {/* Image & Title */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <div className="w-12 h-14 bg-brand-stone relative flex-shrink-0 border border-brand-border/40 overflow-hidden rounded-xs group cursor-pointer">
                          <Image
                            src={product.image || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1000'}
                            alt={product.nameEn || 'Garment'}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform"
                            sizes="48px"
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-brand-ivory font-serif text-sm">
                            {isAr ? product.nameAr : product.nameEn}
                          </p>
                          <div className="flex items-center space-x-2 rtl:space-x-reverse mt-0.5">
                            <span className="text-[10px] font-mono text-brand-gold uppercase tracking-wider">
                              {product.id}
                            </span>
                            {product.badgeEn && (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 bg-brand-gold/10 text-brand-gold border border-brand-gold/30 rounded-xs">
                                {isAr ? product.badgeAr : product.badgeEn}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 font-mono text-xs text-brand-cream/80 capitalize">
                      {product.category === 'hoodies' ? (
                        <span className="text-brand-gold font-bold">500 GSM Hoodie</span>
                      ) : product.category === 'sweatshirts' ? (
                        <span>Sweatshirt</span>
                      ) : (
                        <span className="text-brand-cream/40">T-Shirt (Upcoming)</span>
                      )}
                    </td>

                    {/* GSM Spec */}
                    <td className="py-3 px-4 font-mono text-xs">
                      <span className="px-2 py-0.5 bg-brand-stone text-brand-ivory border border-brand-border/60 rounded-xs font-bold">
                        {product.gsm || 500} GSM
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4 font-mono text-xs">
                      <div className="font-bold text-brand-ivory">
                        {product.price.toLocaleString()} <span className="text-[10px] text-brand-gold">EGP</span>
                      </div>
                      {product.originalPrice && (
                        <div className="text-[10px] text-brand-cream/40 line-through">
                          {product.originalPrice.toLocaleString()} EGP
                        </div>
                      )}
                    </td>

                    {/* Inventory */}
                    <td className="py-3 px-4 font-mono text-xs">
                      {product.isComingSoon ? (
                        <span className="text-brand-cream/40 text-[10px]">Unreleased</span>
                      ) : (product.inventory ?? 0) <= 15 ? (
                        <span className="text-amber-400 font-bold flex items-center space-x-1 rtl:space-x-reverse">
                          <AlertTriangle className="w-3 h-3" />
                          <span>{product.inventory} (Low)</span>
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-bold">{product.inventory} in stock</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 font-mono text-[10px]">
                      {product.isComingSoon ? (
                        <span className="px-2 py-0.5 bg-brand-stone/60 text-brand-cream/70 border border-brand-border/60 rounded-xs">
                          {isAr ? 'إصدار قادم' : 'Upcoming Drop'}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 rounded-xs">
                          {isAr ? 'متاح للشراء' : 'Active Catalog'}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
                        <button
                          onClick={() => handleOpenEdit(product)}
                          className="p-1.5 text-brand-cream/60 hover:text-brand-gold hover:bg-brand-stone rounded-xs transition-colors"
                          title={isAr ? 'تعديل القطعة والصور' : 'Edit Garment & Images'}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(product)}
                          className="p-1.5 text-brand-cream/60 hover:text-rose-400 hover:bg-rose-950/30 rounded-xs transition-colors"
                          title={isAr ? 'حذف القطعة' : 'Delete Garment'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {(isCreateModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-brand-charcoal border border-brand-border w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-sm shadow-2xl p-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-brand-border/80 mb-6">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-brand-gold">
                  {isEditModalOpen ? (isAr ? 'تعديل تفاصيل وصور القطعة' : 'Edit Garment & Media') : (isAr ? 'إضافة قطعة جديدة' : 'Add New Streetwear Piece')}
                </span>
                <h3 className="text-xl font-black text-brand-ivory font-serif">
                  {isEditModalOpen
                    ? isAr ? `تعديل: ${activeProduct?.nameAr || activeProduct?.nameEn}` : `Edit: ${activeProduct?.nameEn}`
                    : isAr ? 'إضافة هودي / سويت شيرت جديد للكتالوج' : 'Add New Garment to Catalog'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setIsEditModalOpen(false);
                }}
                className="p-1.5 text-brand-cream/60 hover:text-brand-ivory"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-6 text-xs font-mono">
              {/* SECTION: IMAGE UPLOADS FROM STUDIO / PHONE (PRIMARY USER FOCUS) */}
              <div className="p-4 bg-brand-stone/20 border border-brand-gold/30 rounded-sm space-y-6">
                <div className="flex items-center space-x-2 rtl:space-x-reverse text-brand-gold font-bold text-xs uppercase tracking-wider">
                  <Camera className="w-4 h-4 text-brand-gold" />
                  <span>{isAr ? 'صور المنتج (رفع مباشر من الاستوديو أو الهاتف)' : 'Garment Visuals (Direct Device & Studio Upload)'}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 1. Primary Product Image */}
                  <div className="space-y-3 p-3 bg-brand-charcoal/80 border border-brand-border rounded-sm">
                    <div className="flex items-center justify-between">
                      <label className="text-brand-ivory font-bold flex items-center space-x-1.5 rtl:space-x-reverse">
                        <span>{isAr ? 'الصورة الأساسية للمنتج *' : 'Primary Garment Photo *'}</span>
                      </label>
                      {formData.image && (
                        <span className="text-[10px] text-emerald-400 font-mono flex items-center space-x-1 rtl:space-x-reverse">
                          <Check className="w-3 h-3" />
                          <span>{isAr ? 'محددة' : 'Selected'}</span>
                        </span>
                      )}
                    </div>

                    {/* Thumbnail Preview Box */}
                    <div className="relative w-full h-48 bg-brand-stone/40 border border-brand-border/60 rounded-sm overflow-hidden flex items-center justify-center">
                      {formData.image ? (
                        <>
                          <Image
                            src={formData.image}
                            alt="Primary Garment Preview"
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end p-2">
                            <span className="text-[10px] text-brand-ivory font-mono">
                              {isAr ? 'معاينة العرض في المتجر' : 'Storefront Preview'}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-4 text-brand-cream/40 space-y-1">
                          <ImageIcon className="w-8 h-8 mx-auto text-brand-cream/30" />
                          <p className="text-[11px]">{isAr ? 'لم يتم اختيار صورة بعد' : 'No image uploaded'}</p>
                        </div>
                      )}

                      {uploadingPrimary && (
                        <div className="absolute inset-0 bg-brand-black/80 flex flex-col items-center justify-center space-y-2 z-10">
                          <RefreshCw className="w-6 h-6 text-brand-gold animate-spin" />
                          <span className="text-[11px] text-brand-gold font-bold">
                            {isAr ? 'جاري رفع الصورة من جهازك...' : 'Uploading from device...'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Direct Upload Trigger */}
                    <input
                      type="file"
                      ref={primaryFileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'image');
                      }}
                    />

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={uploadingPrimary}
                        onClick={() => primaryFileInputRef.current?.click()}
                        className="flex-1 flex items-center justify-center space-x-2 rtl:space-x-reverse py-2.5 px-3 bg-brand-gold text-brand-black font-bold text-xs uppercase tracking-wider hover:bg-brand-gold-light transition-colors shadow-gold rounded-xs"
                      >
                        <Upload className="w-4 h-4" />
                        <span>{isAr ? 'رفع من الاستوديو / جهازك' : 'Upload from Studio'}</span>
                      </button>

                      {formData.image && (
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, image: '' }))}
                          className="px-2.5 py-2.5 border border-brand-border text-brand-cream/60 hover:text-rose-400 hover:border-rose-500/50 rounded-xs"
                          title={isAr ? 'حذف الصورة' : 'Remove Image'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Streetwear Presets Selection */}
                    <div className="pt-2 border-t border-brand-border/40">
                      <p className="text-[10px] text-brand-cream/60 mb-1.5">
                        {isAr ? 'أو اختر صورة جاهزة من تصوير أثير:' : 'Or pick an ATHEER studio preset:'}
                      </p>
                      <div className="grid grid-cols-3 gap-1.5">
                        {PRESET_GARMENT_IMAGES.slice(0, 3).map((preset) => (
                          <button
                            type="button"
                            key={preset.url}
                            onClick={() => setFormData((prev) => ({ ...prev, image: preset.url }))}
                            className={`relative h-12 rounded-xs overflow-hidden border transition-all ${
                              formData.image === preset.url
                                ? 'border-brand-gold ring-1 ring-brand-gold'
                                : 'border-brand-border/60 hover:border-brand-cream/40 opacity-70 hover:opacity-100'
                            }`}
                          >
                            <Image src={preset.url} alt={preset.name} fill className="object-cover" sizes="60px" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 2. Secondary / Hover Model Image */}
                  <div className="space-y-3 p-3 bg-brand-charcoal/80 border border-brand-border rounded-sm">
                    <div className="flex items-center justify-between">
                      <label className="text-brand-ivory font-bold flex items-center space-x-1.5 rtl:space-x-reverse">
                        <span>{isAr ? 'صورة الموديل أو الخلفية (Hover) (اختياري)' : 'Model / Hover Shot (Optional)'}</span>
                      </label>
                      {formData.hoverImage && (
                        <span className="text-[10px] text-emerald-400 font-mono flex items-center space-x-1 rtl:space-x-reverse">
                          <Check className="w-3 h-3" />
                          <span>{isAr ? 'محددة' : 'Selected'}</span>
                        </span>
                      )}
                    </div>

                    {/* Thumbnail Preview Box */}
                    <div className="relative w-full h-48 bg-brand-stone/40 border border-brand-border/60 rounded-sm overflow-hidden flex items-center justify-center">
                      {formData.hoverImage ? (
                        <>
                          <Image
                            src={formData.hoverImage}
                            alt="Hover Model Preview"
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end p-2">
                            <span className="text-[10px] text-brand-ivory font-mono">
                              {isAr ? 'تظهر عند تمرير الماوس فوق القطعة' : 'Displays on mouse hover'}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-4 text-brand-cream/40 space-y-1">
                          <ImageIcon className="w-8 h-8 mx-auto text-brand-cream/30" />
                          <p className="text-[11px]">{isAr ? 'يمكنك رفع صورة ارتداء الموديل للقطعة' : 'Upload on-model shot'}</p>
                        </div>
                      )}

                      {uploadingHover && (
                        <div className="absolute inset-0 bg-brand-black/80 flex flex-col items-center justify-center space-y-2 z-10">
                          <RefreshCw className="w-6 h-6 text-brand-gold animate-spin" />
                          <span className="text-[11px] text-brand-gold font-bold">
                            {isAr ? 'جاري رفع صورة الموديل...' : 'Uploading model shot...'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Direct Upload Trigger */}
                    <input
                      type="file"
                      ref={hoverFileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'hoverImage');
                      }}
                    />

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={uploadingHover}
                        onClick={() => hoverFileInputRef.current?.click()}
                        className="flex-1 flex items-center justify-center space-x-2 rtl:space-x-reverse py-2.5 px-3 bg-brand-stone text-brand-ivory border border-brand-border/80 font-bold text-xs uppercase tracking-wider hover:border-brand-gold transition-colors rounded-xs"
                      >
                        <Upload className="w-4 h-4 text-brand-gold" />
                        <span>{isAr ? 'رفع صورة الموديل من الاستوديو' : 'Upload Model Shot'}</span>
                      </button>

                      {formData.hoverImage && (
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, hoverImage: '' }))}
                          className="px-2.5 py-2.5 border border-brand-border text-brand-cream/60 hover:text-rose-400 hover:border-rose-500/50 rounded-xs"
                          title={isAr ? 'إزالة صورة الموديل' : 'Remove Hover Image'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Model Presets Selection */}
                    <div className="pt-2 border-t border-brand-border/40">
                      <p className="text-[10px] text-brand-cream/60 mb-1.5">
                        {isAr ? 'أو اختر لقطة موديل جاهزة:' : 'Or pick an on-model preset:'}
                      </p>
                      <div className="grid grid-cols-3 gap-1.5">
                        {PRESET_MODEL_IMAGES.slice(0, 3).map((preset) => (
                          <button
                            type="button"
                            key={preset.url}
                            onClick={() => setFormData((prev) => ({ ...prev, hoverImage: preset.url }))}
                            className={`relative h-12 rounded-xs overflow-hidden border transition-all ${
                              formData.hoverImage === preset.url
                                ? 'border-brand-gold ring-1 ring-brand-gold'
                                : 'border-brand-border/60 hover:border-brand-cream/40 opacity-70 hover:opacity-100'
                            }`}
                          >
                            <Image src={preset.url} alt={preset.name} fill className="object-cover" sizes="60px" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Optional Manual URL Accordion */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowManualUrl(!showManualUrl)}
                    className="text-[11px] text-brand-cream/60 hover:text-brand-gold flex items-center space-x-1.5 rtl:space-x-reverse"
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>
                      {showManualUrl
                        ? isAr ? 'إخفاء الروابط اليدوية' : 'Hide manual URL inputs'
                        : isAr ? 'أو أدخل روابط الصور يدوياً (اختياري)' : 'Or enter image URLs manually'}
                    </span>
                  </button>

                  {showManualUrl && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 pt-3 border-t border-brand-border/30">
                      <div>
                        <label className="block text-brand-cream/70 mb-1 text-[10px]">
                          {isAr ? 'رابط الصورة الأساسية المباشر' : 'Primary Direct Image URL'}
                        </label>
                        <input
                          type="url"
                          value={formData.image || ''}
                          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                          className="w-full bg-brand-stone/40 border border-brand-border px-3 py-1.5 text-brand-ivory rounded-xs text-[11px] focus:border-brand-gold focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-brand-cream/70 mb-1 text-[10px]">
                          {isAr ? 'رابط صورة الموديل (Hover)' : 'Hover Direct Image URL'}
                        </label>
                        <input
                          type="url"
                          value={formData.hoverImage || ''}
                          onChange={(e) => setFormData({ ...formData, hoverImage: e.target.value })}
                          className="w-full bg-brand-stone/40 border border-brand-border px-3 py-1.5 text-brand-ivory rounded-xs text-[11px] focus:border-brand-gold focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Names */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-brand-cream/80 mb-1">
                    {isAr ? 'اسم القطعة (إنجليزي) *' : 'Garment Name (English) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nameEn || ''}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    className="w-full bg-brand-stone/40 border border-brand-border px-3 py-2 text-brand-ivory rounded-sm focus:border-brand-gold focus:outline-none"
                    placeholder="e.g. The Heavyweight 500 GSM Boxy Hoodie"
                  />
                </div>
                <div>
                  <label className="block text-brand-cream/80 mb-1">
                    {isAr ? 'اسم القطعة (عربي) *' : 'Garment Name (Arabic) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nameAr || ''}
                    onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                    className="w-full bg-brand-stone/40 border border-brand-border px-3 py-2 text-brand-ivory rounded-sm focus:border-brand-gold focus:outline-none text-right"
                    placeholder="مثال: هودي أثير بوكسي الثقيل 500 GSM"
                  />
                </div>
              </div>

              {/* Category, GSM, Price */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-brand-cream/80 mb-1">
                    {isAr ? 'التصنيف *' : 'Category *'}
                  </label>
                  <select
                    value={formData.category || 'hoodies'}
                    onChange={(e) => {
                      const cat = e.target.value as any;
                      setFormData({
                        ...formData,
                        category: cat,
                        categoryLabelEn:
                          cat === 'hoodies'
                            ? 'Core Heavyweight Hoodie'
                            : cat === 'sweatshirts'
                            ? 'Signature Crewneck Sweatshirt'
                            : 'Heavyweight Drop T-Shirt',
                        categoryLabelAr:
                          cat === 'hoodies'
                            ? 'هودي أساسي فائق الثقل'
                            : cat === 'sweatshirts'
                            ? 'سويت شيرت كرو نيك فاخر'
                            : 'تي شيرت أثير الثقيل',
                      });
                    }}
                    className="w-full bg-brand-stone/40 border border-brand-border px-3 py-2 text-brand-ivory rounded-sm focus:border-brand-gold focus:outline-none"
                  >
                    <option value="hoodies">Hoodies (Flagship 500 GSM)</option>
                    <option value="sweatshirts">Sweatshirts</option>
                    <option value="tshirts">T-Shirts (Upcoming Drop)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-brand-cream/80 mb-1">
                    {isAr ? 'مواصفة GSM الثقل *' : 'GSM Density Spec *'}
                  </label>
                  <input
                    type="number"
                    required
                    min={200}
                    max={700}
                    value={formData.gsm || 500}
                    onChange={(e) => setFormData({ ...formData, gsm: Number(e.target.value) })}
                    className="w-full bg-brand-stone/40 border border-brand-border px-3 py-2 text-brand-ivory rounded-sm focus:border-brand-gold focus:outline-none"
                  />
                  <p className="text-[10px] text-brand-cream/50 mt-1">ATHEER flagship standard: 500 GSM</p>
                </div>

                <div>
                  <label className="block text-brand-cream/80 mb-1">
                    {isAr ? 'السعر بالجنيه المصري (EGP) *' : 'Price in EGP *'}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.price || 1450}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full bg-brand-stone/40 border border-brand-border px-3 py-2 text-brand-ivory rounded-sm focus:border-brand-gold focus:outline-none"
                  />
                </div>
              </div>

              {/* Compare Price, Inventory, Badge */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-brand-cream/80 mb-1">
                    {isAr ? 'السعر الأصلي / قبل الخصم (اختياري)' : 'Compare Price (Original EGP)'}
                  </label>
                  <input
                    type="number"
                    value={formData.originalPrice || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        originalPrice: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    className="w-full bg-brand-stone/40 border border-brand-border px-3 py-2 text-brand-ivory rounded-sm focus:border-brand-gold focus:outline-none"
                    placeholder="e.g. 1700"
                  />
                </div>

                <div>
                  <label className="block text-brand-cream/80 mb-1">
                    {isAr ? 'المخزون المتوفر *' : 'Stock Quantity *'}
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.inventory ?? 50}
                    onChange={(e) => setFormData({ ...formData, inventory: Number(e.target.value) })}
                    className="w-full bg-brand-stone/40 border border-brand-border px-3 py-2 text-brand-ivory rounded-sm focus:border-brand-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-brand-cream/80 mb-1">
                    {isAr ? 'شارة القطعة (إنجليزي)' : 'Badge Label (En)'}
                  </label>
                  <input
                    type="text"
                    value={formData.badgeEn || ''}
                    onChange={(e) => setFormData({ ...formData, badgeEn: e.target.value })}
                    className="w-full bg-brand-stone/40 border border-brand-border px-3 py-2 text-brand-ivory rounded-sm focus:border-brand-gold focus:outline-none"
                    placeholder="e.g. Flagship Drop / Best Seller"
                  />
                </div>
              </div>

              {/* Available Sizes Selection */}
              <div>
                <label className="block text-brand-cream/80 mb-2">
                  {isAr ? 'المقاسات المتوفرة (اختر المقاسات النشطة للقطعة) *' : 'Available Sizes *'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {['S', 'M', 'L', 'XL', 'XXL'].map((size) => {
                    const isSelected = (formData.sizes || []).includes(size);
                    return (
                      <button
                        type="button"
                        key={size}
                        onClick={() => toggleSize(size)}
                        className={`w-12 h-10 flex items-center justify-center font-bold text-xs border rounded-xs transition-colors ${
                          isSelected
                            ? 'bg-brand-gold text-brand-black border-brand-gold font-black shadow-gold'
                            : 'bg-brand-stone/40 text-brand-cream/70 border-brand-border hover:border-brand-gold/40'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Colors Management */}
              <div>
                <label className="block text-brand-cream/80 mb-1">
                  {isAr ? 'الألوان المتوفرة *' : 'Color Variants *'}
                </label>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {(formData.colors || []).map((color) => (
                    <span
                      key={color}
                      className="px-2.5 py-1 bg-brand-stone text-brand-ivory border border-brand-border rounded-xs text-[11px] flex items-center space-x-1.5 rtl:space-x-reverse"
                    >
                      <span>{color}</span>
                      <button
                        type="button"
                        onClick={() => removeColor(color)}
                        className="text-brand-cream/50 hover:text-rose-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex items-center space-x-2 rtl:space-x-reverse max-w-sm">
                  <input
                    type="text"
                    value={newColorInput}
                    onChange={(e) => setNewColorInput(e.target.value)}
                    placeholder="e.g. Onyx Black, Bone Ivory"
                    className="flex-1 bg-brand-stone/40 border border-brand-border px-3 py-1.5 text-brand-ivory rounded-sm focus:border-brand-gold focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={addColor}
                    className="px-3 py-1.5 bg-brand-stone border border-brand-border text-brand-ivory hover:border-brand-gold"
                  >
                    {isAr ? 'إضافة' : 'Add'}
                  </button>
                </div>
              </div>

              {/* Descriptions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-brand-cream/80 mb-1">
                    {isAr ? 'وصف القطعة (إنجليزي)' : 'Description (English)'}
                  </label>
                  <textarea
                    rows={3}
                    value={formData.descriptionEn || ''}
                    onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                    className="w-full bg-brand-stone/40 border border-brand-border px-3 py-2 text-brand-ivory rounded-sm focus:border-brand-gold focus:outline-none"
                    placeholder="Minimalist streetwear silhouette, GSM 500 French terry cotton..."
                  />
                </div>
                <div>
                  <label className="block text-brand-cream/80 mb-1">
                    {isAr ? 'وصف القطعة (عربي)' : 'Description (Arabic)'}
                  </label>
                  <textarea
                    rows={3}
                    value={formData.descriptionAr || ''}
                    onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                    className="w-full bg-brand-stone/40 border border-brand-border px-3 py-2 text-brand-ivory rounded-sm focus:border-brand-gold focus:outline-none text-right"
                    placeholder="قطن فرنش تيري كثيف بمواصفات GSM 500، قصّة بوكسي عريضة وأكتاف ساقطة..."
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-6 pt-2 border-t border-brand-border/60">
                <label className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isNewArrival || false}
                    onChange={(e) => setFormData({ ...formData, isNewArrival: e.target.checked })}
                    className="accent-brand-gold"
                  />
                  <span className="text-brand-ivory">{isAr ? 'وصل حديثاً (New Arrival)' : 'New Arrival'}</span>
                </label>

                <label className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isBestseller || false}
                    onChange={(e) => setFormData({ ...formData, isBestseller: e.target.checked })}
                    className="accent-brand-gold"
                  />
                  <span className="text-brand-ivory">{isAr ? 'الأكثر طلباً (Bestseller)' : 'Bestseller'}</span>
                </label>

                <label className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isComingSoon || false}
                    onChange={(e) => setFormData({ ...formData, isComingSoon: e.target.checked })}
                    className="accent-brand-gold"
                  />
                  <span className="text-brand-ivory">{isAr ? 'إصدار قادم (Coming Soon / Drop)' : 'Coming Soon'}</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-3 rtl:space-x-reverse pt-4 border-t border-brand-border/80">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setIsEditModalOpen(false);
                  }}
                  className="px-4 py-2 border border-brand-border text-brand-cream/80 hover:text-brand-ivory hover:border-brand-cream/40 rounded-sm"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-brand-gold text-brand-black font-bold tracking-wider uppercase hover:bg-brand-gold-light rounded-sm shadow-gold"
                >
                  {isEditModalOpen
                    ? isAr ? 'حفظ التعديلات' : 'Save Changes'
                    : isAr ? 'إنشاء القطعة ونشرها' : 'Create & Publish Garment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && activeProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-brand-charcoal border border-rose-500/50 w-full max-w-md rounded-sm p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 rtl:space-x-reverse text-rose-400">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <h3 className="font-serif font-black text-lg text-brand-ivory">
                {isAr ? 'تأكيد حذف القطعة' : 'Confirm Garment Deletion'}
              </h3>
            </div>
            <p className="text-xs text-brand-cream/80 font-mono leading-relaxed">
              {isAr
                ? `هل أنت متأكد من رغبتك في حذف "${activeProduct.nameAr}" (${activeProduct.id}) من الكتالوج؟ لا يمكن التراجع عن هذا الإجراء.`
                : `Are you sure you want to permanently delete "${activeProduct.nameEn}" (${activeProduct.id}) from the active catalog? This action cannot be undone.`}
            </p>
            <div className="flex items-center justify-end space-x-3 rtl:space-x-reverse pt-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-brand-border text-brand-cream/80 hover:text-brand-ivory text-xs font-mono"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleDeleteProduct}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold uppercase rounded-sm"
              >
                {isAr ? 'تأكيد الحذف' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
