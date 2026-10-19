import React, { useState, useEffect, useMemo } from 'react';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Building,
  Calendar,
  MapPin,
  Globe,
  User,
  Mail,
  Lock,
  Download,
  Printer,
  AlertCircle,
  Hotel,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Conference, RegistrationCategory } from '../types';
import { INITIAL_CONFERENCES, REGISTRATION_CATEGORIES } from '../data/initialData';
import { api } from '../services/api';
import { StripePaymentSection } from '../components/StripePaymentSection';
import { isConferenceCompleted } from '../utils/dateUtils';

interface RegistrationPageProps {
  initialConferenceSlug?: string;
  initialCategoryId?: number;
  lockConference?: boolean;
  conference?: Conference;
  onNavigate?: (path: string) => void;
  onSelectConference?: (slug: string) => void;
  isModal?: boolean;
  onClose?: () => void;
}

// Helpers for conference date and location formatting
export const getConferenceDates = (c?: Conference): string => {
  if (!c) return '';
  if ((c as any).dates_label) return (c as any).dates_label;
  if ((c as any).dates) return (c as any).dates;
  if (c.start_date && c.end_date) {
    try {
      const sParts = String(c.start_date).trim().split('-');
      const eParts = String(c.end_date).trim().split('-');
      if (sParts.length === 3 && eParts.length === 3) {
        const months = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const sYear = sParts[0];
        const sMonth = months[parseInt(sParts[1], 10) - 1];
        const sDay = parseInt(sParts[2], 10);

        const eYear = eParts[0];
        const eMonth = months[parseInt(eParts[1], 10) - 1];
        const eDay = parseInt(eParts[2], 10);

        if (sMonth && eMonth) {
          if (sMonth === eMonth && sYear === eYear) {
            return `${sMonth} ${sDay}–${eDay}, ${sYear}`;
          } else if (sYear === eYear) {
            return `${sMonth} ${sDay} – ${eMonth} ${eDay}, ${sYear}`;
          } else {
            return `${sMonth} ${sDay}, ${sYear} – ${eMonth} ${eDay}, ${sYear}`;
          }
        }
      }
    } catch (_) { }
    return `${c.start_date} – ${c.end_date}`;
  }
  return c.start_date || c.end_date || '';
};

export const getConferenceLocation = (c?: Conference): string => {
  if (!c) return '';
  if ((c as any).location) return (c as any).location;
  const parts = [c.city, c.country].filter(Boolean);
  if (parts.length > 0) return parts.join(', ');
  return c.venue || '';
};

// Check if registration is open and accepted for a conference
export const checkRegistrationAvailability = (conf?: Conference): { available: boolean; reason?: string } => {
  if (!conf || !conf.id) {
    return { available: false, reason: 'Please select an active scientific congress.' };
  }
  if (conf.status === 'archived') {
    return { available: false, reason: 'This conference has been archived and is no longer accepting delegate registrations.' };
  }
  if (conf.status === 'draft') {
    return { available: false, reason: 'This conference is in preparation and registrations are not yet open.' };
  }
  if (conf.settings && conf.settings.registration_enabled === false) {
    return { available: false, reason: 'Online registration is currently closed for this congress by the organizers.' };
  }
  if (isConferenceCompleted(conf)) {
    return { available: false, reason: 'This conference has already concluded. Registrations are closed.' };
  }
  return { available: true };
};

export const RegistrationPage: React.FC<RegistrationPageProps> = ({
  initialConferenceSlug,
  initialCategoryId,
  lockConference = false,
  conference,
  onNavigate = (_path: string) => { },
  onSelectConference,
  isModal = false,
  onClose
}) => {
  const [conferences, setConferences] = useState<Conference[]>(() => {
    if (conference) {
      return [conference, ...INITIAL_CONFERENCES.filter(c => c.id !== conference.id && c.slug !== conference.slug)];
    }
    return [...INITIAL_CONFERENCES];
  });
  const [isLoadingConferences, setIsLoadingConferences] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const [dynamicCategories, setDynamicCategories] = useState<RegistrationCategory[] | null>(null);
  const [isLoadingCategories, setIsLoadingCategories] = useState<boolean>(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Extract slug/ID from URL pathname if not explicitly passed as prop
  const routeSlug = useMemo(() => {
    if (conference?.slug) return conference.slug;
    if (initialConferenceSlug) return initialConferenceSlug;
    if (typeof window !== 'undefined') {
      const path = window.location.pathname || '';
      if (path.startsWith('/conferences/')) {
        const parts = path.replace('/conferences/', '').split('/');
        return parts[0]?.split('?')[0]?.split('#')[0] || undefined;
      }
      if (path.startsWith('/register/')) {
        const parts = path.replace('/register/', '').split('/');
        return parts[0]?.split('?')[0]?.split('#')[0] || undefined;
      }
    }
    return undefined;
  }, [initialConferenceSlug, conference?.slug]);

  const isLocked = Boolean(lockConference || conference || initialConferenceSlug);

  const [selectedConferenceId, setSelectedConferenceId] = useState<number>(() => {
    if (conference?.id) return conference.id;
    const targetSlug = initialConferenceSlug || (typeof window !== 'undefined' ? (
      window.location.pathname.startsWith('/conferences/')
        ? window.location.pathname.replace('/conferences/', '').split('/')[0]?.split('?')[0]?.split('#')[0]
        : window.location.pathname.startsWith('/register/')
          ? window.location.pathname.replace('/register/', '').split('/')[0]?.split('?')[0]?.split('#')[0]
          : undefined
    ) : undefined);

    if (targetSlug) {
      const found = (conference && (conference.slug === targetSlug || String(conference.id) === targetSlug))
        ? conference
        : INITIAL_CONFERENCES.find(c => c.slug === targetSlug || String(c.id) === targetSlug);
      if (found) return found.id;
    }
    return conference?.id || 1;
  });
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [isVerifyingSession, setIsVerifyingSession] = useState<boolean>(false);

  // Check for return from Stripe Checkout redirect
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const regId = urlParams.get('registration_id');
    const paymentStatusParam = urlParams.get('payment_status') || urlParams.get('status');

    if (sessionId && paymentStatusParam === 'success') {
      setIsVerifyingSession(true);
      setStep(4);
      api.verifyStripePaymentSession({ session_id: sessionId, registration_id: regId || undefined })
        .then((res: any) => {
          const verifiedData = res?.data || res;
          if (verifiedData) {
            setPaymentResult({
              transaction_id: verifiedData.transaction_id || sessionId,
              receipt_id: verifiedData.receipt_id || `REC-STRIPE-${sessionId.slice(-6).toUpperCase()}`,
              status: 'completed',
              created_at: verifiedData.created_at || new Date().toISOString()
            });
            if (verifiedData.registration) {
              const reg = verifiedData.registration;
              setRegistrationId(reg.registration_id);
              setFormData(prev => ({
                ...prev,
                first_name: reg.first_name || prev.first_name,
                last_name: reg.last_name || prev.last_name,
                email: reg.email || prev.email,
                phone: reg.phone || prev.phone,
                country: reg.country || prev.country,
                institution: reg.institution || prev.institution,
                billing_address: reg.billing_address || prev.billing_address
              }));
              if (reg.conference_id) {
                setSelectedConferenceId(reg.conference_id);
              }
            } else if (regId) {
              setRegistrationId(regId);
            }
            try {
              confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
            } catch (_) {}
          }
        })
        .catch((err: any) => {
          console.error('Payment session verification error:', err);
          setPaymentError(err?.message || 'Payment verification could not be completed with the payment gateway. Please check your card statement or contact support.');
          setStep(2);
        })
        .finally(() => {
          setIsVerifyingSession(false);
          // Clean URL parameters safely to avoid duplicate verification on reload
          window.history.replaceState({}, '', window.location.pathname);
        });
    } else if (paymentStatusParam === 'cancelled') {
      setPaymentError('Payment checkout was cancelled. Your details are saved—you can review and click "Register & Pay" below to retry.');
      setStep(2);
      if (regId) {
        setRegistrationId(regId);
      }
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Currency Selection (display + charge currency for the registration table)
  const [currency, setCurrency] = useState<'EUR' | 'USD' | 'GBP'>('EUR');
  const CURRENCY_RATES: Record<'EUR' | 'USD' | 'GBP', number> = { EUR: 1, USD: 1.08, GBP: 0.85 };
  const CURRENCY_SYMBOLS: Record<'EUR' | 'USD' | 'GBP', string> = { EUR: '€', USD: '$', GBP: '£' };
  const rate = CURRENCY_RATES[currency];
  const sym = CURRENCY_SYMBOLS[currency];
  const convert = (amount: number) => Math.round(amount * rate);

  // Payment States
  const [paymentGateway, setPaymentGateway] = useState<'stripe' | 'paypal' | 'wire'>('stripe');
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardPostal, setCardPostal] = useState('75008');
  const [paymentResult, setPaymentResult] = useState<{
    transaction_id: string;
    receipt_id: string;
    status: string;
    created_at: string;
  } | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    country: 'United States',
    institution: '',
    billing_address: '',
    department: '',
    designation: 'Professor',
    attendance_mode: 'In-Person' as 'In-Person' | 'Virtual',
    accommodation_required: false,
    meal_preference: 'Standard'
  });

  // Load live conferences dynamically from database/API
  const loadConferencesData = () => {
    setIsLoadingConferences(true);
    setLoadError(null);
    api.getConferences()
      .then(res => {
        if (res && res.length > 0) {
          setConferences(res);
          const targetSlug = routeSlug;
          if (targetSlug) {
            const found = res.find(c => c.slug === targetSlug || String(c.id) === targetSlug);
            if (found) {
              setSelectedConferenceId(found.id);
              return;
            } else {
              // Try fetching directly by slug from database
              api.getConferenceBySlug(targetSlug)
                .then(conf => {
                  if (conf && conf.id) {
                    setConferences(prev => {
                      if (prev.some(c => c.id === conf.id)) return prev;
                      return [conf, ...prev];
                    });
                    setSelectedConferenceId(conf.id);
                  }
                })
                .catch(() => { });
            }
          }
          // Preserve valid selection, or pick first open conference
          setSelectedConferenceId(prev => {
            const exists = res.some(c => c.id === prev);
            if (exists) return prev;
            const firstOpen = res.find(c => checkRegistrationAvailability(c).available);
            return firstOpen ? firstOpen.id : res[0].id;
          });
        } else {
          setConferences([...INITIAL_CONFERENCES]);
        }
      })
      .catch(err => {
        console.warn('API error loading conferences:', err);
        setLoadError('Unable to load live conferences from the database. Displaying cached records.');
        setConferences([...INITIAL_CONFERENCES]);
      })
      .finally(() => {
        setIsLoadingConferences(false);
      });
  };

  useEffect(() => {
    loadConferencesData();
  }, [routeSlug]);

  // Synchronize when routeSlug changes to ensure conference is loaded from database
  useEffect(() => {
    if (routeSlug) {
      const found = conferences.find(c => c.slug === routeSlug || String(c.id) === routeSlug);
      if (found) {
        setSelectedConferenceId(found.id);
      } else {
        api.getConferenceBySlug(routeSlug)
          .then(res => {
            if (res && res.id) {
              setConferences(prev => {
                if (prev.some(c => c.id === res.id)) return prev;
                return [res, ...prev];
              });
              setSelectedConferenceId(res.id);
            }
          })
          .catch(() => { });
      }
    }
  }, [routeSlug]);

  // Synchronize when conference prop updates
  useEffect(() => {
    if (conference) {
      setConferences(prev => {
        const idx = prev.findIndex(c => c.id === conference.id || c.slug === conference.slug);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = conference;
          return next;
        }
        return [conference, ...prev];
      });
      setSelectedConferenceId(conference.id);
    }
  }, [conference]);

  // Synchronize when initialCategoryId changes
  useEffect(() => {
    if (initialCategoryId) {
      setCategoryQuantities({ [initialCategoryId]: 1 });
    }
  }, [initialCategoryId]);

  const activeConference = useMemo(() => {
    return conferences.find(c => c.id === selectedConferenceId) || conferences[0] || INITIAL_CONFERENCES[0];
  }, [conferences, selectedConferenceId]);

  const activeAvailability = useMemo(() => {
    return checkRegistrationAvailability(activeConference);
  }, [activeConference]);

  // Dynamically load delegate passes and prices whenever active conference changes
  useEffect(() => {
    if (!activeConference?.id) return;
    setSelectionError(null);
    setCategoriesError(null);
    setIsLoadingCategories(true);

    const confId = Number(activeConference.id);

    // If conference object already includes populated categories for this conference, use them
    const embeddedCats = activeConference.categories?.filter(c => Number(c.conference_id) === confId);
    if (embeddedCats && embeddedCats.length > 0) {
      setDynamicCategories(embeddedCats);
      setIsLoadingCategories(false);
      return;
    }

    let active = true;
    api.getRegistrationCategories(confId)
      .then(cats => {
        if (!active) return;
        const validCats = Array.isArray(cats)
          ? cats.filter(c => Number(c.conference_id) === confId)
          : [];
        setDynamicCategories(validCats);
      })
      .catch((err) => {
        if (!active) return;
        console.warn('API error loading registration categories for conf', confId, err);
        // Fallback strictly to static categories belonging to THIS conference
        const staticCats = REGISTRATION_CATEGORIES.filter(c => Number(c.conference_id) === confId);
        setDynamicCategories(staticCats);
        if (staticCats.length === 0) {
          setCategoriesError('Unable to load registration categories for this conference.');
        }
      })
      .finally(() => {
        if (active) setIsLoadingCategories(false);
      });

    return () => {
      active = false;
    };
  }, [activeConference?.id]);

  const categoriesList = useMemo(() => {
    const confId = Number(activeConference?.id);
    if (!confId) return [];

    const rawCats = (dynamicCategories !== null)
      ? dynamicCategories.filter(c => Number(c.conference_id) === confId)
      : (activeConference?.categories && activeConference.categories.length > 0)
        ? activeConference.categories.filter(c => Number(c.conference_id) === confId)
        : REGISTRATION_CATEGORIES.filter(c => Number(c.conference_id) === confId);

    return rawCats.map(c => {
      const stdPrice = Number(c.price ?? c.standard_fee ?? c.industry_price ?? c.tier3_price ?? 799);
      const earlyPrice = Number(c.early_bird_price ?? c.early_bird_fee ?? c.academic_price ?? c.tier1_price ?? (stdPrice > 100 ? stdPrice - 100 : stdPrice));
      const midPrice = Number(c.tier2_price ?? Math.round((earlyPrice + stdPrice) / 2));
      return {
        ...c,
        price: stdPrice,
        standard_fee: stdPrice,
        tier3_price: stdPrice,
        early_bird_price: earlyPrice,
        early_bird_fee: earlyPrice,
        tier1_price: earlyPrice,
        tier2_price: midPrice,
        benefits: (c.benefits && c.benefits.length > 0)
          ? c.benefits
          : [
            'Full access to all 20 scientific sessions & poster halls',
            'Official delegate badge & printed abstracts handbook',
            'Complimentary organic luncheon & coffee networking breaks',
            'Certificate of Presentation / Continuing Education credits'
          ]
      };
    });
  }, [activeConference?.id, activeConference?.categories, dynamicCategories]);

  // Ticket quantities for each category (default: 0)
  const [categoryQuantities, setCategoryQuantities] = useState<Record<number, number>>(() => {
    if (initialCategoryId) {
      return { [initialCategoryId]: 1 };
    }
    return {};
  });

  const getCategoryLimit = (cat: RegistrationCategory): number => {
    if (cat.max_quantity && cat.max_quantity > 0) return cat.max_quantity;
    if (cat.available_slots && cat.available_slots > 0) return cat.available_slots;
    return 20; // Default sensible maximum purchase limit per category
  };

  const handleIncreaseQuantity = (cat: RegistrationCategory) => {
    if (!activeAvailability.available) {
      alert(activeAvailability.reason || 'Registrations are currently closed for this conference.');
      return;
    }
    const maxLimit = getCategoryLimit(cat);
    const currentQty = categoryQuantities[cat.id] || 0;
    if (currentQty >= maxLimit) {
      alert(`Maximum ticket purchase limit of ${maxLimit} reached for ${cat.name}.`);
      return;
    }
    setCategoryQuantities(prev => ({
      ...prev,
      [cat.id]: (prev[cat.id] || 0) + 1
    }));
    setSelectionError(null);
  };

  const handleDecreaseQuantity = (cat: RegistrationCategory) => {
    setCategoryQuantities(prev => {
      const currentQty = prev[cat.id] || 0;
      if (currentQty <= 1) {
        const next = { ...prev };
        delete next[cat.id];
        return next;
      }
      return {
        ...prev,
        [cat.id]: currentQty - 1
      };
    });
  };

  const handleQuantityInputChange = (cat: RegistrationCategory, valueStr: string) => {
    if (!activeAvailability.available) return;
    const parsed = parseInt(valueStr, 10);
    const maxLimit = getCategoryLimit(cat);
    if (isNaN(parsed) || parsed <= 0) {
      setCategoryQuantities(prev => {
        const next = { ...prev };
        delete next[cat.id];
        return next;
      });
    } else {
      const newQty = Math.min(parsed, maxLimit);
      setCategoryQuantities(prev => ({
        ...prev,
        [cat.id]: newQty
      }));
      setSelectionError(null);
    }
  };

  // Accommodation State (Admin-Configured Rates & Dynamic Hotel Selection)
  const [accommodationRequired, setAccommodationRequired] = useState(false);
  const [accommodationDays, setAccommodationDays] = useState(3);
  const [selectedHotel, setSelectedHotel] = useState<string>(() => activeConference?.hotel_name || 'Official Partner 4-Star Congress Hotel');
  const [checkInDate, setCheckInDate] = useState<string>(() => activeConference?.start_date || '2026-06-15');
  const [checkOutDate, setCheckOutDate] = useState<string>(() => activeConference?.end_date || '2026-06-18');

  // Synchronize configured hotel and dates dynamically whenever activeConference changes
  useEffect(() => {
    if (activeConference) {
      if (activeConference.hotel_name) {
        setSelectedHotel(activeConference.hotel_name);
      }
      if (activeConference.start_date && activeConference.end_date) {
        setCheckInDate(activeConference.start_date);
        setCheckOutDate(activeConference.end_date);
        const start = new Date(activeConference.start_date).getTime();
        const end = new Date(activeConference.end_date).getTime();
        if (!isNaN(start) && !isNaN(end) && end > start) {
          const nights = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
          setAccommodationDays(nights);
        }
      }
    }
  }, [activeConference?.id, activeConference?.hotel_name, activeConference?.start_date, activeConference?.end_date]);

  // Recalculate nights when checkInDate or checkOutDate changes
  const handleCheckInChange = (newIn: string) => {
    setCheckInDate(newIn);
    if (newIn && checkOutDate) {
      const start = new Date(newIn).getTime();
      const end = new Date(checkOutDate).getTime();
      if (!isNaN(start) && !isNaN(end) && end > start) {
        setAccommodationDays(Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24))));
      } else if (newIn) {
        // Push checkout date by accommodationDays
        const d = new Date(newIn);
        d.setDate(d.getDate() + (accommodationDays || 1));
        setCheckOutDate(d.toISOString().split('T')[0]);
      }
    }
  };

  const handleCheckOutChange = (newOut: string) => {
    setCheckOutDate(newOut);
    if (checkInDate && newOut) {
      const start = new Date(checkInDate).getTime();
      const end = new Date(newOut).getTime();
      if (!isNaN(start) && !isNaN(end) && end > start) {
        setAccommodationDays(Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24))));
      }
    }
  };

  const handleSelectNights = (nights: number) => {
    setAccommodationDays(nights);
    if (checkInDate) {
      const d = new Date(checkInDate);
      d.setDate(d.getDate() + nights);
      setCheckOutDate(d.toISOString().split('T')[0]);
    }
  };

  // Synchronize category quantities when categoriesList changes: clear invalid passes
  useEffect(() => {
    if (categoriesList.length > 0) {
      setCategoryQuantities(prev => {
        const next: Record<number, number> = {};
        let hasAny = false;
        categoriesList.forEach(c => {
          if (prev[c.id] && prev[c.id] > 0) {
            next[c.id] = prev[c.id];
            hasAny = true;
          }
        });
        if (hasAny) return next;
        if (initialCategoryId && categoriesList.some(c => c.id === initialCategoryId)) {
          return { [initialCategoryId]: 1 };
        }
        // Default quantity is 0 for all categories
        return {};
      });
    } else {
      setCategoryQuantities({});
    }
  }, [categoriesList, initialCategoryId]);

  // Selected categories list (only those with quantity > 0)
  const selectedCategories = useMemo(() => {
    return categoriesList.filter(c => (categoryQuantities[c.id] || 0) > 0);
  }, [categoriesList, categoryQuantities]);

  const totalTicketsCount = useMemo(() => {
    return Object.values(categoryQuantities).reduce((acc: number, q: number) => acc + (Number(q) || 0), 0);
  }, [categoryQuantities]);

  const primaryCat = selectedCategories[0] || categoriesList[0];

  // Admin-configured accommodation rate per night
  const adminAccommodationRate = Number(activeConference?.accommodation_price_per_day) || 120;
  const accommodationRatePerDay = convert(adminAccommodationRate);
  const accommodationTotal = accommodationRequired ? accommodationDays * accommodationRatePerDay : 0;

  // Breakdown items with admin-configured prices, selected quantities, and category subtotals
  const categoryItems = useMemo(() => {
    return selectedCategories.map(cat => {
      const baseFee = cat.price ?? cat.standard_fee ?? cat.tier3_price ?? cat.industry_price ?? cat.early_bird_fee ?? cat.early_bird_price ?? 499;
      const convertedUnitFee = convert(baseFee);
      const qty = categoryQuantities[cat.id] || 0;
      const subtotal = convertedUnitFee * qty;
      return {
        id: cat.id,
        name: cat.name,
        basePrice: baseFee,
        price: convertedUnitFee, // unit price
        quantity: qty,
        subtotal: subtotal
      };
    });
  }, [selectedCategories, categoryQuantities, rate]);

  const passesSubtotal = categoryItems.reduce((acc, item) => acc + item.subtotal, 0);
  const totalAmount = passesSubtotal + accommodationTotal;

  const toggleCategorySelection = (cat: RegistrationCategory) => {
    const currentQty = categoryQuantities[cat.id] || 0;
    if (currentQty > 0) {
      setCategoryQuantities(prev => {
        const next = { ...prev };
        delete next[cat.id];
        return next;
      });
    } else {
      handleIncreaseQuantity(cat);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!selectedConferenceId || !activeConference) {
        setSelectionError('Please select a scientific congress from the dropdown before continuing.');
        return;
      }
      if (!activeAvailability.available) {
        setSelectionError(activeAvailability.reason || 'This conference is not currently accepting registrations.');
        return;
      }
      if (totalTicketsCount === 0 || categoryItems.length === 0) {
        setSelectionError('Please select at least one ticket before continuing (minimum quantity 1).');
        return;
      }
      setSelectionError(null);
      setStep(2);
    }
  };

  const handleProceedToPayment = async () => {
    if (!selectedConferenceId || !activeConference) {
      setSelectionError('Please select a scientific congress from the dropdown before continuing.');
      setStep(1);
      return;
    }
    if (!activeAvailability.available) {
      alert(activeAvailability.reason || 'This conference is not currently accepting registrations.');
      return;
    }
    if (totalTicketsCount === 0 || categoryItems.length === 0) {
      setSelectionError('Please select at least one ticket before continuing (minimum quantity 1).');
      setStep(1);
      return;
    }
    if (
      !formData.first_name.trim() ||
      !formData.last_name.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !(formData.billing_address || formData.institution).trim() ||
      !formData.country.trim()
    ) {
      alert('Please complete all required fields (First Name, Last Name, Email, Phone, Country, Billing Address) before proceeding.');
      return;
    }

    setSubmitting(true);
    setPaymentError(null);

    try {
      const combinedCategoryName = categoryItems
        .map(c => `${c.quantity > 1 ? `${c.quantity}x ` : ''}${c.name}`)
        .join(' + ') || 'Delegate Pass';

      // 1. Create and save registration order securely on backend with status pending
      const regRes = await api.createRegistration({
        conference_id: activeConference.id,
        conference_title: activeConference.title,
        category_id: primaryCat?.id || 1,
        category_name: combinedCategoryName,
        selected_categories: categoryItems.map(c => ({
          id: c.id,
          name: c.name,
          price: c.price,
          quantity: c.quantity,
          subtotal: c.subtotal,
          currency: currency
        })),
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        country: formData.country.trim(),
        billing_address: (formData.billing_address || formData.institution).trim(),
        institution: (formData.billing_address || formData.institution).trim(),
        department: formData.department.trim(),
        designation: formData.designation,
        attendance_mode: formData.attendance_mode,
        accommodation_required: accommodationRequired,
        accommodation_days: accommodationRequired ? accommodationDays : 0,
        accommodation_rate: accommodationRatePerDay,
        accommodation_amount: accommodationTotal,
        hotel_name: accommodationRequired ? selectedHotel : undefined,
        check_in_date: accommodationRequired ? checkInDate : undefined,
        check_out_date: accommodationRequired ? checkOutDate : undefined,
        meal_preference: formData.meal_preference,
        amount: totalAmount,
        currency: currency,
        payment_status: 'pending',
        registration_status: 'pending'
      });

      const newRegId = regRes.registration_id;
      setRegistrationId(newRegId);

      // 2. Generate payment session using configured Stripe payment gateway
      const checkoutRes: any = await api.createStripeCheckoutSession({
        registration_id: newRegId,
        conference_id: activeConference.id,
        conference_title: activeConference.title,
        category_name: combinedCategoryName,
        delegate_name: `${formData.first_name} ${formData.last_name}`.trim(),
        delegate_email: formData.email.trim(),
        amount: totalAmount,
        currency: currency,
        return_url: window.location.origin + window.location.pathname
      });

      const checkoutData = checkoutRes?.data || checkoutRes;
      if (checkoutData?.url) {
        // Automatically redirect immediately to the payment gateway
        window.location.href = checkoutData.url;
      } else {
        throw new Error('No checkout URL received from payment gateway.');
      }
    } catch (err: any) {
      console.error('Registration/payment processing failed:', err);
      setPaymentError(err?.message || 'Payment gateway connection failed. Please verify configuration.');
      setSubmitting(false);
    }
  };

  return (
    <div className={isModal ? "text-slate-900 font-sans" : "min-h-screen bg-slate-50 text-slate-900 pt-8 sm:pt-12 pb-10 px-4 sm:px-6 lg:px-8 font-sans"}>
      <div className={isModal ? "space-y-6" : "max-w-4xl mx-auto space-y-6"}>
        {/* Top Header Card (Shown only on standalone registration page, omitted inside individual conference page modal) */}
        {!isModal && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold font-display text-slate-900">
                Conference Registration & Payment
              </h1>
              <p className="text-xs text-slate-500 mt-1 max-w-xl">
                Register for upcoming scientific congresses, select delegate passes, and complete verified checkout.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (onClose) {
                  onClose();
                } else if (onNavigate) {
                  onNavigate(initialConferenceSlug ? `/conferences/${initialConferenceSlug}` : '/conferences');
                }
              }}
              className="self-start sm:self-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              &larr; {initialConferenceSlug ? 'Back to Conference' : 'All Conferences'}
            </button>
          </div>
        )}

        {/* Stepper Header (Shown only on standalone registration page, omitted inside individual conference page modal) */}
        {!isModal && step < 4 && (
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className={`p-2 rounded-xl transition-colors ${step === 1 ? 'bg-teal-50 font-bold text-teal-900 border border-teal-200' : 'text-slate-500'}`}>
                1. Select Pass & Congress
              </div>
              <div className={`p-2 rounded-xl transition-colors ${step >= 2 ? 'bg-teal-50 font-bold text-teal-900 border border-teal-200' : 'text-slate-500'}`}>
                2. Billing Information
              </div>
            </div>
          </div>
        )}

        {/* Main Content Box */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          {/* STEP 1: Select Conference & Pass Category */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in">
              {/* Mandatory Select Conference Dropdown (Unchanged for general registration gateway, omitted on individual conference pages) */}
              {!isLocked && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="select-conference" className="block text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                      Select Conference <span className="text-rose-600 font-bold">*</span>
                    </label>
                    {isLoadingConferences && (
                      <span className="text-[11px] text-teal-700 font-medium flex items-center space-x-1">
                        <span className="w-2.5 h-2.5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin inline-block mr-1" />
                        Loading congresses...
                      </span>
                    )}
                  </div>

                  {loadError && (
                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-800 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>{loadError}</span>
                      </div>
                      <button
                        type="button"
                        onClick={loadConferencesData}
                        className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                      >
                        Retry
                      </button>
                    </div>
                  )}

                  <div className="relative">
                    <select
                      id="select-conference"
                      value={selectedConferenceId || ''}
                      onChange={e => {
                        const newId = Number(e.target.value);
                        setSelectedConferenceId(newId);
                        setSelectionError(null);
                        setCategoriesError(null);
                        setDynamicCategories(null);
                        setCategoryQuantities({});
                      }}
                      disabled={isLoadingConferences && conferences.length === 0}
                      className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none transition-colors cursor-pointer ${selectionError
                          ? 'border-rose-400 ring-1 ring-rose-400'
                          : 'border-slate-200 focus:border-teal-600'
                        }`}
                    >
                      <option value="" disabled>-- Select an Upcoming Scientific Congress --</option>
                      {conferences.map(c => {
                        const dates = getConferenceDates(c);
                        const loc = getConferenceLocation(c);
                        const details = [dates, loc].filter(Boolean).join(' • ');
                        const availability = checkRegistrationAvailability(c);
                        const label = details ? `${c.title} (${details})` : c.title;
                        return (
                          <option key={c.id} value={c.id}>
                            {label}{!availability.available ? ' — [Registration Closed]' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {selectionError && (
                    <p className="text-xs text-rose-600 font-semibold flex items-center space-x-1.5 mt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{selectionError}</span>
                    </p>
                  )}
                </div>
              )}

              {/* Warning Notice if Selected Conference Registration is Closed */}
              {activeConference && !activeAvailability.available && (
                <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 text-xs text-amber-900 flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-amber-950 text-xs">Registration Unavailable</h4>
                    <p className="mt-0.5 text-amber-800">{activeAvailability.reason}</p>
                    {!isLocked && (
                      <p className="mt-1 text-slate-600">Please choose another upcoming congress from the dropdown above to complete your delegate registration.</p>
                    )}
                  </div>
                </div>
              )}

              {/* Conference Banner Details */}
              <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-teal-400 font-bold">
                      {activeConference.domain || 'Scientific Congress'}
                    </span>
                    {!activeAvailability.available && (
                      <span className="text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5 rounded-full">
                        Registration Closed
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-white">{activeConference.title}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-1">
                    {getConferenceDates(activeConference) && (
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                        <span>{getConferenceDates(activeConference)}</span>
                      </span>
                    )}
                    {getConferenceLocation(activeConference) && (
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                        <span>{getConferenceLocation(activeConference)}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Currency Selector */}
              <div className="text-center space-y-3 pt-1">
                <h3 className="text-lg font-extrabold text-slate-800 tracking-tight">
                  CHOOSE YOUR CURRENCY
                </h3>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  {(['EUR', 'USD', 'GBP'] as const).map(cur => (
                    <button
                      key={cur}
                      type="button"
                      onClick={() => setCurrency(cur)}
                      className="flex items-center justify-between gap-6 pl-5 pr-2 py-2 rounded-full text-white text-sm font-semibold cursor-pointer transition-transform hover:scale-[1.02] shadow-xs"
                      style={{ background: 'linear-gradient(90deg, #0A2540 0%, #0E7490 100%)', minWidth: '150px' }}
                    >
                      <span>{cur === 'EUR' ? 'EURO' : cur}</span>
                      <span
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${currency === cur ? 'border-teal-300' : 'border-white/70'
                          }`}
                      >
                        {currency === cur && <span className="w-3 h-3 rounded-full bg-teal-300" />}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Registration Categories Multi-Selection Table */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                    Select Registration Categories (Select One or More)
                  </label>
                  <span className="text-[11px] text-teal-800 font-semibold bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 self-start sm:self-auto">
                    {totalTicketsCount} {totalTicketsCount === 1 ? 'Ticket Selected' : 'Tickets Selected'}
                    {selectedCategories.length > 0 ? ` (${selectedCategories.length} ${selectedCategories.length === 1 ? 'Category' : 'Categories'})` : ''}
                  </span>
                </div>

                {isLoadingCategories ? (
                  <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs text-slate-500 font-medium">Loading delegate passes and tier pricing for this congress...</p>
                  </div>
                ) : categoriesError ? (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-xs text-rose-800">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{categoriesError}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setDynamicCategories(null);
                        setIsLoadingCategories(true);
                        setCategoriesError(null);
                        api.getRegistrationCategories(activeConference.id)
                          .then(cats => {
                            const validCats = Array.isArray(cats)
                              ? cats.filter(c => Number(c.conference_id) === Number(activeConference.id))
                              : [];
                            setDynamicCategories(validCats);
                          })
                          .catch(() => setCategoriesError('Failed to reload categories.'))
                          .finally(() => setIsLoadingCategories(false));
                      }}
                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-bold cursor-pointer"
                    >
                      Retry
                    </button>
                  </div>
                ) : categoriesList.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <AlertCircle className="w-6 h-6 text-slate-400 mx-auto" />
                    <p className="text-xs font-semibold text-slate-700">No registration categories are currently available for this congress.</p>
                    <p className="text-[11px] text-slate-500">Please select another conference or contact the Secretariat for registration inquiries.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-xs">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-gradient-to-r from-slate-800 to-teal-900 text-white">
                          <th className="text-left font-bold uppercase tracking-wider px-4 py-3">Category / Pass Tier</th>
                          <th className="text-center font-bold uppercase tracking-wider px-3 py-3 hidden md:table-cell">
                            On/Before<br />{categoriesList[0]?.tier1_label || 'Tier 1'}
                          </th>
                          <th className="text-center font-bold uppercase tracking-wider px-3 py-3 hidden md:table-cell">
                            On/Before<br />{categoriesList[0]?.tier2_label || 'Tier 2'}
                          </th>
                          <th className="text-center font-bold uppercase tracking-wider px-3 py-3 bg-teal-950/40">
                            Ticket Price<br />(Standard)
                          </th>
                          <th className="text-center font-bold uppercase tracking-wider px-4 py-3 w-36">
                            Quantity
                          </th>
                          <th className="text-right font-bold uppercase tracking-wider px-4 py-3 w-28">
                            Subtotal
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {categoriesList.map((cat, idx) => {
                          const qty = categoryQuantities[cat.id] || 0;
                          const isSelected = qty > 0;
                          const t1 = convert(cat.tier1_price ?? cat.early_bird_fee ?? cat.price ?? 0);
                          const t2 = convert(cat.tier2_price ?? cat.standard_fee ?? cat.price ?? 0);
                          const t3 = convert(cat.tier3_price ?? cat.price ?? 0);
                          const subtotal = t3 * qty;
                          const maxLimit = getCategoryLimit(cat);

                          return (
                            <tr
                              key={cat.id}
                              onClick={() => {
                                if (qty === 0) handleIncreaseQuantity(cat);
                              }}
                              className={`border-t border-slate-200 transition-colors ${isSelected
                                  ? 'bg-teal-50/90 font-semibold'
                                  : idx % 2 === 0 ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/60 hover:bg-teal-50/40'
                                }`}
                            >
                              <td className="px-4 py-3 align-middle">
                                <div className="flex items-center space-x-3">
                                  <input
                                    type="checkbox"
                                    aria-label={`Select ${cat.name}`}
                                    checked={isSelected}
                                    onChange={e => {
                                      e.stopPropagation();
                                      if (isSelected) {
                                        setCategoryQuantities(prev => {
                                          const next = { ...prev };
                                          delete next[cat.id];
                                          return next;
                                        });
                                      } else {
                                        handleIncreaseQuantity(cat);
                                      }
                                    }}
                                    className="w-4 h-4 text-teal-700 rounded border-slate-300 focus:ring-teal-600 cursor-pointer shrink-0"
                                  />
                                  <div>
                                    <span className="font-bold text-slate-900 block">{cat.name}</span>
                                    {cat.description && (
                                      <span className="text-[11px] text-slate-500 font-normal line-clamp-1">{cat.description}</span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-3 py-3 text-center align-middle text-slate-400 line-through decoration-slate-300 hidden md:table-cell">
                                {sym}{t1}
                              </td>
                              <td className="px-3 py-3 text-center align-middle text-slate-400 line-through decoration-slate-300 hidden md:table-cell">
                                {sym}{t2}
                              </td>
                              <td className="px-3 py-3 text-center align-middle bg-teal-50/40">
                                <span className="font-extrabold text-teal-800 text-sm">{sym}{t3}</span>
                              </td>
                              <td className="px-4 py-3 text-center align-middle" onClick={e => e.stopPropagation()}>
                                <div className="inline-flex items-center bg-white border border-slate-300 rounded-xl shadow-2xs overflow-hidden">
                                  <button
                                    type="button"
                                    aria-label={`Decrease ${cat.name} quantity`}
                                    disabled={qty === 0}
                                    onClick={() => handleDecreaseQuantity(cat)}
                                    className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors text-base font-bold select-none cursor-pointer"
                                  >
                                    −
                                  </button>
                                  <input
                                    type="number"
                                    min="0"
                                    max={maxLimit}
                                    value={qty}
                                    onChange={e => handleQuantityInputChange(cat, e.target.value)}
                                    className="w-10 h-8 text-center text-xs font-bold font-mono text-slate-900 bg-transparent border-x border-slate-200 focus:outline-none focus:bg-teal-50/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    aria-label={`${cat.name} quantity`}
                                  />
                                  <button
                                    type="button"
                                    aria-label={`Increase ${cat.name} quantity`}
                                    disabled={qty >= maxLimit}
                                    onClick={() => handleIncreaseQuantity(cat)}
                                    className="w-8 h-8 flex items-center justify-center text-teal-700 hover:text-teal-900 hover:bg-teal-50 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors text-base font-bold select-none cursor-pointer"
                                  >
                                    +
                                  </button>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-right align-middle">
                                <span className={`font-mono text-xs font-bold ${isSelected ? 'text-teal-900 font-extrabold text-sm' : 'text-slate-400'}`}>
                                  {sym}{subtotal}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Benefits of selected categories */}
                {selectedCategories.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                      Included Privileges ({selectedCategories.map(c => c.name).join(', ')}):
                    </span>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-[11px] text-slate-600 bg-slate-50 border border-slate-200 rounded-2xl p-4">
                      {Array.from(new Set(selectedCategories.flatMap(c => c.benefits || []))).slice(0, 6).map((b, i) => (
                        <li key={i} className="flex items-start space-x-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 flex-shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Accommodation Option (Admin-Configured Rates & Official Hotel Selection) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="accommodation-checkbox"
                      checked={accommodationRequired}
                      onChange={e => setAccommodationRequired(e.target.checked)}
                      className="w-5 h-5 mt-0.5 text-teal-700 rounded border-slate-300 focus:ring-teal-600 cursor-pointer"
                    />
                    <div>
                      <label htmlFor="accommodation-checkbox" className="text-sm font-bold text-slate-900 cursor-pointer flex items-center space-x-2">
                        <span>Accommodation</span>
                        <span className="text-[11px] font-mono font-bold bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded-full">
                          {sym}{accommodationRatePerDay} {currency} / night
                        </span>
                      </label>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Accommodation charges are calculated automatically based on the nightly rate configured in the admin panel and the number of nights selected.
                      </p>
                    </div>
                  </div>
                </div>

                {accommodationRequired && (
                  <div className="pt-4 border-t border-slate-100 space-y-4 animate-in fade-in">
                    {/* Hotel Selection / Display */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="md:col-span-3">
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Official Partner Hotel:
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={selectedHotel}
                            onChange={e => setSelectedHotel(e.target.value)}
                            placeholder="Official Partner 4-Star Congress Hotel"
                            className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
                          />
                        </div>
                      </div>

                      {/* Check-in Date */}
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Check-In Date:
                        </label>
                        <input
                          type="date"
                          value={checkInDate}
                          onChange={e => handleCheckInChange(e.target.value)}
                          className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white cursor-pointer"
                        />
                      </div>

                      {/* Check-out Date */}
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Check-Out Date:
                        </label>
                        <input
                          type="date"
                          min={checkInDate}
                          value={checkOutDate}
                          onChange={e => handleCheckOutChange(e.target.value)}
                          className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white cursor-pointer"
                        />
                      </div>

                      {/* Number of Nights */}
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Calculated Nights:
                        </label>
                        <div className="flex items-center space-x-1">
                          <input
                            type="number"
                            min="1"
                            max="30"
                            value={accommodationDays}
                            onChange={e => handleSelectNights(Math.max(1, Number(e.target.value) || 1))}
                            className="w-full text-xs font-bold font-mono text-center bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
                          />
                          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap px-1">nights</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Duration Buttons and Summary */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                      <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                        <span className="text-[11px] font-semibold text-slate-500 mr-1">Quick Select:</span>
                        {[1, 2, 3, 4, 5, 6].map(days => (
                          <button
                            key={days}
                            type="button"
                            onClick={() => handleSelectNights(days)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${accommodationDays === days
                                ? 'bg-teal-800 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              }`}
                          >
                            {days}n
                          </button>
                        ))}
                      </div>

                      <div className="text-left sm:text-right bg-slate-50 p-2.5 rounded-xl border border-slate-200 shrink-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Total Accommodation Cost</span>
                        <span className="text-sm font-mono font-bold text-slate-800">
                          {accommodationDays} Nights × {sym}{accommodationRatePerDay} = <span className="text-teal-800 text-base">{sym}{accommodationTotal} {currency}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Clear Price Breakdown Card */}
              <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-teal-400" />
                    <h4 className="text-sm font-bold font-display uppercase tracking-wider text-teal-300">
                      Selected Registration Summary & Price Breakdown
                    </h4>
                  </div>
                  <span className="text-xs font-mono bg-teal-950 text-teal-400 border border-teal-800 px-2.5 py-0.5 rounded-full">
                    {totalTicketsCount} {totalTicketsCount === 1 ? 'Ticket' : 'Tickets'}{accommodationRequired ? ' + Hotel' : ''}
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  {/* Selected Categories */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                      Registration Passes ({totalTicketsCount} {totalTicketsCount === 1 ? 'Ticket' : 'Tickets'})
                    </span>
                    {categoryItems.map(item => (
                      <div key={item.id} className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                          <span className="font-semibold text-slate-200">{item.name}</span>
                          <span className="text-[11px] font-mono font-bold bg-teal-950 text-teal-300 border border-teal-800/80 px-2 py-0.5 rounded-md">
                            {item.quantity} × {sym}{item.price}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-white text-sm">{sym}{item.subtotal} {currency}</span>
                      </div>
                    ))}
                  </div>

                  {/* Accommodation */}
                  {accommodationRequired && (
                    <div className="pt-2 border-t border-slate-800/80 space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                        Hotel Accommodation
                      </span>
                      <div className="flex items-start justify-between py-1">
                        <div className="flex items-start space-x-2">
                          <Hotel className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                          <div>
                            <div className="font-semibold text-slate-100">{selectedHotel}</div>
                            <div className="text-[11px] text-slate-400">
                              {checkInDate} to {checkOutDate} • {accommodationDays} {accommodationDays === 1 ? 'Night' : 'Nights'} @ {sym}{accommodationRatePerDay}/night
                            </div>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-white text-sm shrink-0">+{sym}{accommodationTotal} {currency}</span>
                      </div>
                    </div>
                  )}

                  {/* Grand Total Row */}
                  <div className="pt-3 border-t border-slate-700 flex items-center justify-between text-base">
                    <div>
                      <span className="font-bold text-white block">Grand Total Due</span>
                      <span className="text-[11px] text-slate-400">Combined total using admin-configured rates</span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black font-mono text-teal-300">
                        {sym}{totalAmount} <span className="text-sm font-semibold">{currency}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Session Verification Loading */}
          {isVerifyingSession && (
            <div className="text-center py-16 space-y-4 animate-in fade-in">
              <div className="w-12 h-12 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <h3 className="text-lg font-bold text-slate-900 font-display">Verifying Payment with Stripe...</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Please wait while we securely verify your checkout payment with Stripe and issue your official delegate registration receipt.
              </p>
            </div>
          )}

          {/* STEP 2: Billing Information */}
          {step === 2 && !isVerifyingSession && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold font-display text-slate-900">
                  Delegate Profile & Billing Information
                </h3>
                <span className="text-[11px] text-slate-500 font-mono">
                  Order Total: <strong className="text-teal-800">{sym}{totalAmount} {currency}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Arthur"
                    value={formData.first_name}
                    onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pendelton"
                    value={formData.last_name}
                    onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. a.pendelton@mit.edu"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +1 617 555 0192"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Billing Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 77 Massachusetts Ave, Cambridge, MA 02139"
                    value={formData.billing_address || formData.institution}
                    onChange={e => setFormData({ ...formData, billing_address: e.target.value, institution: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Country *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. United States, Germany, Japan"
                    value={formData.country}
                    onChange={e => setFormData({ ...formData, country: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Designation</label>
                  <select
                    value={formData.designation}
                    onChange={e => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 cursor-pointer"
                  >
                    <option value="Professor">Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Postdoctoral Fellow">Postdoctoral Fellow</option>
                    <option value="Ph.D. Candidate">Ph.D. Candidate</option>
                    <option value="Research Scientist">Research Scientist</option>
                    <option value="Industry Specialist">Industry Specialist</option>
                    <option value="Student">Student</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    placeholder="e.g. Dept of Physics"
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Attendance Mode</label>
                  <select
                    value={formData.attendance_mode}
                    onChange={e => setFormData({ ...formData, attendance_mode: e.target.value as 'In-Person' | 'Virtual' })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 cursor-pointer"
                  >
                    <option value="In-Person">In-Person Attendance</option>
                    <option value="Virtual">Virtual / Online Attendance</option>
                  </select>
                </div>
              </div>

              {paymentError && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start space-x-3 text-xs text-rose-800 animate-in fade-in">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-bold text-rose-900">Payment Notice</div>
                    <div className="leading-relaxed">{paymentError}</div>
                  </div>
                </div>
              )}

              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-center space-x-2 text-xs text-teal-900">
                <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Encrypted checkout. Clicking "Register & Pay" will immediately redirect you to the configured Stripe gateway to complete payment securely.</span>
              </div>
            </div>
          )}

          {/* STEP 4: Success & Official Receipt */}
          {step === 4 && !isVerifyingSession && (
            <div className="text-center py-6 space-y-4 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full">
                  Confirmed & Paid
                </span>
                <h2 className="text-2xl font-bold font-display text-slate-900 mt-2">
                  Delegate Registration Confirmed!
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Welcome to {activeConference.title}. Your pass and official tax receipt are ready.
                </p>
              </div>

              {/* Printable Official Receipt */}
              <div className="bg-slate-900 text-white p-6 rounded-3xl max-w-lg mx-auto shadow-xl text-left space-y-3 font-sans border border-slate-800">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-teal-400 font-bold block">SCINS MEDIA INTERNATIONAL</span>
                    <h4 className="text-sm font-bold text-white">{activeConference.short_title || activeConference.title}</h4>
                  </div>
                  <span className="text-xs font-mono font-bold bg-teal-950 text-teal-400 border border-teal-800 px-2 py-0.5 rounded">
                    PAID
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Registration ID</span>
                    <span className="font-mono font-bold text-teal-300 text-sm select-all">
                      {registrationId || 'SCINS-REG-2026-88120'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Transaction ID</span>
                    <span className="font-mono text-slate-300 text-xs select-all">
                      {paymentResult?.transaction_id || `TXN-${Date.now().toString(36).toUpperCase()}`}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Delegate Name</span>
                    <span className="text-slate-200 font-semibold">{formData.first_name} {formData.last_name}</span>
                  </div>
                  <div className="col-span-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block mb-1.5">Registered Passes & Options</span>
                    <div className="space-y-1">
                      {categoryItems.map(c => (
                        <div key={c.id} className="flex items-center justify-between text-xs text-slate-200">
                          <span>{c.quantity > 1 ? `${c.quantity}× ` : ''}{c.name} Pass (@ {sym}{c.price})</span>
                          <span className="font-mono text-teal-300 font-semibold">{sym}{c.subtotal} {currency}</span>
                        </div>
                      ))}
                      {accommodationRequired && accommodationDays > 0 && (
                        <div className="flex items-center justify-between text-xs text-slate-200 pt-1 border-t border-slate-800">
                          <span>🏨 {selectedHotel} ({accommodationDays} Nights: {checkInDate} to {checkOutDate})</span>
                          <span className="font-mono text-teal-300 font-semibold">+{sym}{accommodationTotal} {currency}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Organization</span>
                    <span className="text-slate-300 truncate block">{formData.institution || formData.billing_address}, {formData.country}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Combined Total Paid</span>
                    <span className="text-teal-300 font-bold text-base font-mono">{sym}{totalAmount} {currency}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Gateway: STRIPE</span>
                  <span>Date: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onClose) onClose();
                    else onNavigate('/');
                  }}
                  className="px-6 py-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                >
                  {isModal ? 'Close & Return to Conference' : 'Back to Homepage'}
                </button>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          {step < 3 && !isVerifyingSession && (
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(s => s - 1)}
                  disabled={submitting}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              ) : (
                <div />
              )}

              {step === 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={step === 1 && (!activeAvailability.available || isLoadingCategories || categoriesList.length === 0 || totalTicketsCount === 0)}
                  className="flex items-center space-x-1.5 px-6 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  id="register-and-pay-btn"
                  onClick={handleProceedToPayment}
                  disabled={submitting}
                  className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Redirecting to Payment Gateway...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Register & Pay ({sym}{totalAmount} {currency})</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
