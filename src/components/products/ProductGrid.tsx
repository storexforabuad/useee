import { memo, useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Grid2X2, LayoutList, Info, Phone, MessageCircle, Shield, Star, Clock, X } from 'lucide-react';
import { Product } from '../../types/product';
import { motion, LayoutGroup, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { getStoreMeta } from '../../lib/db';

const ProductCard = dynamic(() => import('./ProductCard'), {
  loading: () => (
    <div className="animate-pulse bg-card-background rounded-2xl h-[280px]">
      <div className="h-48 bg-gray-200 rounded-t-2xl"></div>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  ),
  ssr: false
});

const DUMMY_BUSINESS = {
  ceo: {
  name: 'Haj. Fatimah I. Goni',
  image: '/images/ceo-profile-northern-nigeria.jpg',
},
  businessName: 'Alaniq INT.',
  phone: '+2349021067212',
  whatsapp: '+2349021067212',
  address: 'No. 2, Garki Plaza, Ahmadu Bello Way, Abuja',
  hasPhysicalStore: true,
  rating: 4.8,
  reviews: 476,
  certified: true,
  years: 4,
  delivery: 'Nationwide Delivery',
  country: 'Nigeria',
  countryFlag: '🇳🇬',
  businessHours: 'Open 24/7',
  responseTime: 'Usually responds within 1 hour',
  instagram: '@al_aniq_int',
  facebook: 'Alaniq INT. ',
  specialization: 'Premium Turanrenwuta, Khumras, Oil Perfumes & RTW'
};

function GlassAboutButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      className="ml-2 px-3 py-2 rounded-xl flex items-center gap-2 glassmorphic shadow-lg border border-white/30 dark:border-slate-700/40 backdrop-blur-md bg-white/20 dark:bg-slate-900/30"
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="About this business"
    >
      <Info className="w-5 h-5 text-slate-700 dark:text-slate-200" />
    </motion.button>
  );
}

function BusinessCardModal({ open, onClose, storeMeta }: { open: boolean; onClose: () => void; storeMeta?: { name?: string; businessName?: string; whatsapp?: string; phone?: string; specialization?: string; ceo?: { name?: string; image?: string }; rating?: number; reviews?: number; certified?: boolean; years?: number; delivery?: string; countryFlag?: string; businessHours?: string; responseTime?: string; instagram?: string; facebook?: string; } }) {
  const b = {
    ...DUMMY_BUSINESS,
    ...storeMeta,
    businessName: storeMeta?.name || storeMeta?.businessName || DUMMY_BUSINESS.businessName,
    phone: storeMeta?.phone || storeMeta?.whatsapp || DUMMY_BUSINESS.phone,
    whatsapp: storeMeta?.whatsapp || storeMeta?.phone || DUMMY_BUSINESS.whatsapp,
    ceo: {
      ...DUMMY_BUSINESS.ceo,
      ...storeMeta?.ceo
    }
  };
  
  // Handle back button press
  useEffect(() => {
    if (!open) return;
    
    const handlePopState = () => {
      onClose();
    };
    
    // Push a dummy state when modal opens
    window.history.pushState({ modalOpen: true }, '');
    
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [open, onClose]);
  
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-[calc(100vw-16px)] mx-auto rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header with close button */}
            <div className="absolute top-2 right-2 z-10">
              <motion.button
                className="bg-red-400/80 hover:bg-red-500/90 dark:bg-red-500/80 dark:hover:bg-red-600/90 rounded-full p-2 shadow-lg flex items-center justify-center"
                onClick={onClose}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.15 }}
                aria-label="Close"
              >
                <X className="w-4 h-4 text-white" />
              </motion.button>
            </div>

            {/* Content */}
            <div className="px-3 pt-6 pb-3">
              {/* Profile Section */}
              <div className="flex flex-col items-center mb-4">
                <div className="relative mb-3">
                  {/* Replace <img> with <Image /> for Next.js optimization */}
                  <Image
                    src={b.ceo?.image || DUMMY_BUSINESS.ceo.image}
                    alt={b.ceo?.name || DUMMY_BUSINESS.ceo.name}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-xl object-cover shadow-lg border-2 border-white dark:border-slate-600"
                    priority
                  />
                  {/* Certification badge */}
                  {b.certified ? (
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1 border-2 border-white dark:border-slate-600 shadow-lg">
                      <Shield className="w-2.5 h-2.5 text-white" />
                    </div>
                  ) : null}
                </div>
                
                <div className="text-center space-y-0.5">
                  <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{b.businessName}</h2>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{b.specialization}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{b.ceo.name} • CEO</p>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{b.rating}</span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">({b.reviews?.toLocaleString()} reviews)</span>
                </div>
              </div>

              {/* Business Info */}
              <div className="space-y-2 mb-4">
                {/* <div className="flex items-center gap-2 p-2.5 bg-slate-50/80 dark:bg-slate-700/50 rounded-lg">
                  <MapPin className="w-4 h-4 text-slate-600 dark:text-slate-300 flex-shrink-0 fill-current" />
                  <span className="text-xs text-slate-700 dark:text-slate-200">{b.address}</span>
                </div> */}
                
                <div className="flex items-center gap-2 p-2.5 bg-slate-50/80 dark:bg-slate-700/50 rounded-lg">
                  <Clock className="w-4 h-4 text-slate-600 dark:text-slate-300 flex-shrink-0 fill-current" />
                  <div className="flex-1">
                    <span className="text-xs text-slate-700 dark:text-slate-200 font-medium">{b.businessHours}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block">{b.responseTime}</span>
                  </div>
                </div>

                {/* Social Media */}
                <div className="flex items-center gap-2 p-2.5 bg-slate-50/80 dark:bg-slate-700/50 rounded-lg">
                  <div className="flex items-center justify-between w-full flex-wrap sm:flex-nowrap">
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <div className="w-5 h-5 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-xs font-bold">IG</span>
                      </div>
                      <span className="text-xs text-slate-700 dark:text-slate-200">{b.instagram}</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <div className="w-5 h-5 bg-blue-600 rounded-md flex items-center justify-center">
                        <span className="text-white text-xs font-bold">f</span>
                      </div>
                      <span className="text-xs text-slate-700 dark:text-slate-200">{b.facebook}</span>
                    </div>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex items-center justify-between gap-1 flex-nowrap overflow-x-auto scrollbar-hide">
                  <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-medium flex-shrink-0">
                    {b.years}+ Years <span role="img" aria-label="Years in business">🗓️</span>
                  </span>
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium flex-shrink-0">
                    {b.delivery}<span role="img" aria-label="Nigerian flag">{b.countryFlag}</span> 
                  </span>
                  {b.certified && (
                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium flex-shrink-0">
                      Verified <span role="img" aria-label="Verified">✅</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 mb-3">
                <div className="grid grid-cols-2 gap-2">
                  <motion.a
                    href={`tel:${b.phone.replace(/\s/g, '')}`}
                    className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-semibold py-3 rounded-xl shadow-lg transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Phone className="w-4 h-4 fill-current" />
                    <span className="text-sm">Call Now</span>
                  </motion.a>

                  <motion.a
                    href={`https://wa.me/${b.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl shadow-lg transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span className="text-sm">WhatsApp</span>
                  </motion.a>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center pt-2 border-t border-slate-200/50 dark:border-slate-600/50">
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
                  Powered by <span className='font-semibold text-slate-700 dark:text-slate-300'>Business + Science™</span>
                  {/* <Atom className="w-3 h-3 text-indigo-500 dark:text-indigo-400" /> */}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const EmptyCategory = () => (
  <div className="flex flex-col items-center justify-center min-h-[40vh] py-12 px-4 text-center select-none">
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, type: 'spring', stiffness: 180 }}
      className="mb-4"
    >
      {/* SVG or emoji for visual appeal, auto darkmode */}
      <span className="block text-6xl sm:text-7xl mb-2 drop-shadow-lg">
        🛒
      </span>
    </motion.div>
    <h2 className="text-xl sm:text-2xl font-bold text-slate-700 dark:text-slate-100 mb-2">
      All items sold out!
    </h2>
    <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
      Please check back soon or explore other collections for amazing products!
    </p>
  </div>
);

interface ProductGridProps {
  products: Product[];
  containerRef?: React.Ref<HTMLDivElement>;
  storeId: string;
}

const ProductGrid = memo(function ProductGrid({ products, containerRef, storeId }: ProductGridProps) {
  const [isSingleColumn, setIsSingleColumn] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [storeMeta, setStoreMeta] = useState<any>(null);

  useEffect(() => {
    async function fetchStoreMeta() {
      if (!storeId) return;
      const meta = await getStoreMeta(storeId);
      setStoreMeta(meta);
    }
    fetchStoreMeta();
  }, [storeId]);

  // Defensive: filter out products missing id or required fields
  const validProducts = products.filter(p => p && p.id && Array.isArray(p.images));

  const sortedProducts = [...validProducts].sort((a, b) => {
    const timestampA = a.createdAt?.toMillis?.() || 0;
    const timestampB = b.createdAt?.toMillis?.() || 0;
    return timestampB - timestampA;
  });

  const transition = {
    type: "spring",
    stiffness: 280,
    damping: 25,
    mass: 0.5,
    duration: 0.3
  };

  return (
    <LayoutGroup>
      <div className="sm:hidden fixed bottom-16 left-0 right-0 z-40 flex justify-center pointer-events-none">
        <motion.button
          onClick={() => setIsSingleColumn(!isSingleColumn)}
          className="flex items-center gap-2 px-4 py-3 rounded-full glassmorphic shadow-lg border border-white/30 backdrop-blur-md bg-white/20 text-[var(--text-primary)] pointer-events-auto transition-all duration-200"
          style={{
            transform: 'translateZ(0)',
            willChange: 'transform'
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={transition}
          aria-label="Toggle grid layout"
        >
          {isSingleColumn ? (
            <Grid2X2 className="w-5 h-5" />
          ) : (
            <LayoutList className="w-5 h-5" />
          )}
          <span className="text-sm font-medium">
            {isSingleColumn ? 'Double' : 'Single'}
          </span>
        </motion.button>
        <div className="pointer-events-auto">
          <GlassAboutButton onClick={() => setAboutOpen(true)} />
        </div>
      </div>
      
      <BusinessCardModal open={aboutOpen} onClose={() => setAboutOpen(false)} storeMeta={storeMeta} />
      
      <motion.div
        ref={containerRef}
        className={`mt-4 grid gap-3
          ${isSingleColumn ? 'grid-cols-1' : 'grid-cols-2'} 
          sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 
          px-3 sm:px-6 lg:px-8 bg-background`}
        layout
        transition={transition}
        style={{
          willChange: 'transform',
          transform: 'translateZ(0)'
        }}
      >
        {sortedProducts.length === 0 ? (
          <div className="col-span-full w-full">
            <EmptyCategory />
          </div>
        ) : (
          sortedProducts.map((product) => (
            <motion.div
              key={product.id}
              layout
              transition={transition}
              style={{
                willChange: 'transform',
                transform: 'translateZ(0)'
              }}
            >
              <Link
                href={`/${storeId}/products/${product.id}`}
                className="group block relative touch-manipulation"
              >
                <ProductCard product={product} storeId={storeId} />
              </Link>
            </motion.div>
          ))
        )}
      </motion.div>
    </LayoutGroup>
  );
});

export default ProductGrid;