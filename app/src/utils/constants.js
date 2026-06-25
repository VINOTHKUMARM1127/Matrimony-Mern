/**
 * Wedring Matrimony — Application Constants
 */

// App info
export const APP_NAME = 'Wedring Matrimony';
export const APP_VERSION = '1.0.0';
export const APP_BUNDLE_ID = 'com.wedringmatrimony.app';

// Supabase
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Razorpay
export const RAZORPAY_KEY_ID = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || '';

// Fast2SMS (Mobile OTP)
export const FAST2SMS_API_KEY = process.env.EXPO_PUBLIC_FAST2SMS_API_KEY || '';
export const FAST2SMS_BASE_URL = 'https://www.fast2sms.com/dev/bulkV2';

// Storage buckets
export const STORAGE_BUCKETS = {
  PROFILE_PHOTOS: 'profile-photos',
  HOROSCOPE_IMAGES: 'horoscope-images',
  CHAT_IMAGES: 'chat-images',
};

// Pagination
export const PAGE_SIZE = 20;
export const SEARCH_DEBOUNCE_MS = 300;

// Image
export const IMAGE_CONFIG = {
  MAX_PHOTOS: 4,
  MAX_WIDTH: 1080,
  MAX_HEIGHT: 1080,
  THUMBNAIL_SIZE: 250,
  QUALITY: 0.8,
  THUMBNAIL_QUALITY: 0.6,
};

// Profile
export const PROFILE_ID_PREFIX = 'TM';

// Premium Plans
export const PREMIUM_PLANS = {
  GOLD: {
    id: 'gold',
    name: 'Gold',
    duration: '3 Months',
    price: 999,
    currency: 'INR',
    features: [
      'View contact numbers',
      'Send 50 messages/day',
      'See who viewed your profile',
      'Priority customer support',
    ],
    color: '#FFD700',
  },
  PLATINUM: {
    id: 'prime_gold',
    name: 'Platinum',
    duration: '6 Months',
    price: 1999,
    currency: 'INR',
    features: [
      'Unlimited messages',
      'View contact numbers',
      'Horoscope unlock',
      'Priority profile visibility',
      'Advanced search filters',
      'See profile visitors',
    ],
    color: '#FF6B35',
    popular: true,
  },
  PREMIUM: {
    id: 'till_u_marry',
    name: 'Premium',
    duration: 'Lifetime',
    price: 4999,
    currency: 'INR',
    features: [
      'All Platinum features',
      'Boosted profile visibility',
      'Verified profile access',
      'Dedicated relationship manager',
      'Profile highlight in search',
      'Never expires',
    ],
    color: '#008B8B',
  },
};

// Gender options
export const GENDERS = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
];

// Marital status
export const MARITAL_STATUS = [
  { label: 'Never Married', value: 'never_married' },
  { label: 'Divorced', value: 'divorced' },
  { label: 'Widowed', value: 'widowed' },
  { label: 'Awaiting Divorce', value: 'awaiting_divorce' },
];

// Religions
export const RELIGIONS = [
  { label: 'Hindu', value: 'Hindu' },
  { label: 'Muslim', value: 'Muslim' },
  { label: 'Christian', value: 'Christian' },
  { label: 'Jain', value: 'Jain' },
  { label: 'Buddhist', value: 'Buddhist' },
  { label: 'Sikh', value: 'Sikh' },
  { label: 'Other', value: 'Other' },
];

// Hindu Castes (Tamil Nadu specific)
export const CASTES = {
  Hindu: [
    {
      "label": "24 Manai Telugu Chettiar",
      "value": "24 Manai Telugu Chettiar"
    },
    {
      "label": "96 Kuli Maratha",
      "value": "96 Kuli Maratha"
    },
    {
      "label": "96K Kokanastha",
      "value": "96K Kokanastha"
    },
    {
      "label": "Adi Andhra",
      "value": "Adi Andhra"
    },
    {
      "label": "Adi Dharmi",
      "value": "Adi Dharmi"
    },
    {
      "label": "Adi Dravida",
      "value": "Adi Dravida"
    },
    {
      "label": "Adi Karnataka",
      "value": "Adi Karnataka"
    },
    {
      "label": "Agamudayar",
      "value": "Agamudayar"
    },
    {
      "label": "Agarwal",
      "value": "Agarwal"
    },
    {
      "label": "Agnikula Kshatriya",
      "value": "Agnikula Kshatriya"
    },
    {
      "label": "Agri",
      "value": "Agri"
    },
    {
      "label": "Ahir",
      "value": "Ahir"
    },
    {
      "label": "Ahom",
      "value": "Ahom"
    },
    {
      "label": "Ambalavasi",
      "value": "Ambalavasi"
    },
    {
      "label": "Arcot",
      "value": "Arcot"
    },
    {
      "label": "Arekatica",
      "value": "Arekatica"
    },
    {
      "label": "Arora",
      "value": "Arora"
    },
    {
      "label": "Arunthathiyar",
      "value": "Arunthathiyar"
    },
    {
      "label": "Arya Vysya",
      "value": "Arya Vysya"
    },
    {
      "label": "Aryasamaj",
      "value": "Aryasamaj"
    },
    {
      "label": "Ayyaraka",
      "value": "Ayyaraka"
    },
    {
      "label": "Badaga",
      "value": "Badaga"
    },
    {
      "label": "Baghel/Pal/Gaderiya",
      "value": "Baghel/Pal/Gaderiya"
    },
    {
      "label": "Bahi",
      "value": "Bahi"
    },
    {
      "label": "Baidya",
      "value": "Baidya"
    },
    {
      "label": "Baishnab",
      "value": "Baishnab"
    },
    {
      "label": "Baishya",
      "value": "Baishya"
    },
    {
      "label": "Bajantri",
      "value": "Bajantri"
    },
    {
      "label": "Balija",
      "value": "Balija"
    },
    {
      "label": "Balija - Naidu",
      "value": "Balija - Naidu"
    },
    {
      "label": "Banayat Oriya",
      "value": "Banayat Oriya"
    },
    {
      "label": "Banik",
      "value": "Banik"
    },
    {
      "label": "Baniya",
      "value": "Baniya"
    },
    {
      "label": "Barai",
      "value": "Barai"
    },
    {
      "label": "Bari",
      "value": "Bari"
    },
    {
      "label": "Barnwal",
      "value": "Barnwal"
    },
    {
      "label": "Barujibi",
      "value": "Barujibi"
    },
    {
      "label": "Besta",
      "value": "Besta"
    },
    {
      "label": "Bhandari",
      "value": "Bhandari"
    },
    {
      "label": "Bhatia",
      "value": "Bhatia"
    },
    {
      "label": "Bhatraju",
      "value": "Bhatraju"
    },
    {
      "label": "Bhavsar",
      "value": "Bhavsar"
    },
    {
      "label": "Bhovi",
      "value": "Bhovi"
    },
    {
      "label": "Billava",
      "value": "Billava"
    },
    {
      "label": "Boya/Nayak/Naik",
      "value": "Boya/Nayak/Naik"
    },
    {
      "label": "Boyer",
      "value": "Boyer"
    },
    {
      "label": "Brahmbatt",
      "value": "Brahmbatt"
    },
    {
      "label": "Brahmin - Anavil",
      "value": "Brahmin - Anavil"
    },
    {
      "label": "Brahmin - Audichya",
      "value": "Brahmin - Audichya"
    },
    {
      "label": "Brahmin - Barendra",
      "value": "Brahmin - Barendra"
    },
    {
      "label": "Brahmin - Bhatt",
      "value": "Brahmin - Bhatt"
    },
    {
      "label": "Brahmin - Bhumihar",
      "value": "Brahmin - Bhumihar"
    },
    {
      "label": "Brahmin - Brahmbhatt",
      "value": "Brahmin - Brahmbhatt"
    },
    {
      "label": "Brahmin - Dadhich/Dadheech",
      "value": "Brahmin - Dadhich/Dadheech"
    },
    {
      "label": "Brahmin - Daivadnya",
      "value": "Brahmin - Daivadnya"
    },
    {
      "label": "Brahmin - Danua",
      "value": "Brahmin - Danua"
    },
    {
      "label": "Brahmin - Deshastha",
      "value": "Brahmin - Deshastha"
    },
    {
      "label": "Brahmin - Dhiman",
      "value": "Brahmin - Dhiman"
    },
    {
      "label": "Brahmin - Dravida",
      "value": "Brahmin - Dravida"
    },
    {
      "label": "Brahmin - Embrandiri",
      "value": "Brahmin - Embrandiri"
    },
    {
      "label": "Brahmin - Goswami",
      "value": "Brahmin - Goswami"
    },
    {
      "label": "Brahmin - Gour",
      "value": "Brahmin - Gour"
    },
    {
      "label": "Brahmin - Gowd Saraswat",
      "value": "Brahmin - Gowd Saraswat"
    },
    {
      "label": "Brahmin - Gujar Gour",
      "value": "Brahmin - Gujar Gour"
    },
    {
      "label": "Brahmin - Gurukkal",
      "value": "Brahmin - Gurukkal"
    },
    {
      "label": "Brahmin - Halua",
      "value": "Brahmin - Halua"
    },
    {
      "label": "Brahmin - Havyaka",
      "value": "Brahmin - Havyaka"
    },
    {
      "label": "Brahmin - Himachali",
      "value": "Brahmin - Himachali"
    },
    {
      "label": "Brahmin - Hoysala",
      "value": "Brahmin - Hoysala"
    },
    {
      "label": "Brahmin - Iyengar",
      "value": "Brahmin - Iyengar"
    },
    {
      "label": "Brahmin - Iyer",
      "value": "Brahmin - Iyer"
    },
    {
      "label": "Brahmin - Jangid",
      "value": "Brahmin - Jangid"
    },
    {
      "label": "Brahmin - Jhadua",
      "value": "Brahmin - Jhadua"
    },
    {
      "label": "Brahmin - Jhijhotiya",
      "value": "Brahmin - Jhijhotiya"
    },
    {
      "label": "Brahmin - Kanyakubja",
      "value": "Brahmin - Kanyakubja"
    },
    {
      "label": "Brahmin - Karhade",
      "value": "Brahmin - Karhade"
    },
    {
      "label": "Brahmin - Kashmiri Pandit",
      "value": "Brahmin - Kashmiri Pandit"
    },
    {
      "label": "Brahmin - Kokanastha",
      "value": "Brahmin - Kokanastha"
    },
    {
      "label": "Brahmin - Kota",
      "value": "Brahmin - Kota"
    },
    {
      "label": "Brahmin - Kulin",
      "value": "Brahmin - Kulin"
    },
    {
      "label": "Brahmin - Kumaoni",
      "value": "Brahmin - Kumaoni"
    },
    {
      "label": "Brahmin - Madhwa",
      "value": "Brahmin - Madhwa"
    },
    {
      "label": "Brahmin - Maithili",
      "value": "Brahmin - Maithili"
    },
    {
      "label": "Brahmin - Modh",
      "value": "Brahmin - Modh"
    },
    {
      "label": "Brahmin - Mohyal",
      "value": "Brahmin - Mohyal"
    },
    {
      "label": "Brahmin - Nagar",
      "value": "Brahmin - Nagar"
    },
    {
      "label": "Brahmin - Namboodiri",
      "value": "Brahmin - Namboodiri"
    },
    {
      "label": "Brahmin - Niyogi",
      "value": "Brahmin - Niyogi"
    },
    {
      "label": "Brahmin - Niyogi Nandavariki",
      "value": "Brahmin - Niyogi Nandavariki"
    },
    {
      "label": "Brahmin - Other",
      "value": "Brahmin - Other"
    },
    {
      "label": "Brahmin - Paliwal",
      "value": "Brahmin - Paliwal"
    },
    {
      "label": "Brahmin - Panda",
      "value": "Brahmin - Panda"
    },
    {
      "label": "Brahmin - Pareek",
      "value": "Brahmin - Pareek"
    },
    {
      "label": "Brahmin - Pushkarna",
      "value": "Brahmin - Pushkarna"
    },
    {
      "label": "Brahmin - Rarhi",
      "value": "Brahmin - Rarhi"
    },
    {
      "label": "Brahmin - Rudraj",
      "value": "Brahmin - Rudraj"
    },
    {
      "label": "Brahmin - Sakaldwipi",
      "value": "Brahmin - Sakaldwipi"
    },
    {
      "label": "Brahmin - Sanadya",
      "value": "Brahmin - Sanadya"
    },
    {
      "label": "Brahmin - Sanketi",
      "value": "Brahmin - Sanketi"
    },
    {
      "label": "Brahmin - Saraswat",
      "value": "Brahmin - Saraswat"
    },
    {
      "label": "Brahmin - Sarua",
      "value": "Brahmin - Sarua"
    },
    {
      "label": "Brahmin - Saryuparin",
      "value": "Brahmin - Saryuparin"
    },
    {
      "label": "Brahmin - Shivhalli",
      "value": "Brahmin - Shivhalli"
    },
    {
      "label": "Brahmin - Shrimali",
      "value": "Brahmin - Shrimali"
    },
    {
      "label": "Brahmin - Smartha",
      "value": "Brahmin - Smartha"
    },
    {
      "label": "Brahmin - Sri Vaishnava",
      "value": "Brahmin - Sri Vaishnava"
    },
    {
      "label": "Brahmin - Stanika",
      "value": "Brahmin - Stanika"
    },
    {
      "label": "Brahmin - Tyagi",
      "value": "Brahmin - Tyagi"
    },
    {
      "label": "Brahmin - Vaidiki",
      "value": "Brahmin - Vaidiki"
    },
    {
      "label": "Brahmin - Vaikhanasa",
      "value": "Brahmin - Vaikhanasa"
    },
    {
      "label": "Brahmin - Velanadu",
      "value": "Brahmin - Velanadu"
    },
    {
      "label": "Brahmin - Viswabrahmin",
      "value": "Brahmin - Viswabrahmin"
    },
    {
      "label": "Brahmin - Vyas",
      "value": "Brahmin - Vyas"
    },
    {
      "label": "Brahmo",
      "value": "Brahmo"
    },
    {
      "label": "Buddar",
      "value": "Buddar"
    },
    {
      "label": "Bunt (Shetty)",
      "value": "Bunt (Shetty)"
    },
    {
      "label": "CKP",
      "value": "CKP"
    },
    {
      "label": "Chalawadi Holeya",
      "value": "Chalawadi Holeya"
    },
    {
      "label": "Chambhar",
      "value": "Chambhar"
    },
    {
      "label": "Chandravanshi Kahar",
      "value": "Chandravanshi Kahar"
    },
    {
      "label": "Chasa",
      "value": "Chasa"
    },
    {
      "label": "Chattada Sri Vaishnava",
      "value": "Chattada Sri Vaishnava"
    },
    {
      "label": "Chaudary",
      "value": "Chaudary"
    },
    {
      "label": "Chaurasia",
      "value": "Chaurasia"
    },
    {
      "label": "Chekkala - Nair",
      "value": "Chekkala - Nair"
    },
    {
      "label": "Chennadasar",
      "value": "Chennadasar"
    },
    {
      "label": "Cheramar",
      "value": "Cheramar"
    },
    {
      "label": "Chettiar",
      "value": "Chettiar"
    },
    {
      "label": "Chhetri",
      "value": "Chhetri"
    },
    {
      "label": "Chippolu/Mera",
      "value": "Chippolu/Mera"
    },
    {
      "label": "Devadiga",
      "value": "Devadiga"
    },
    {
      "label": "Devanga",
      "value": "Devanga"
    },
    {
      "label": "Devar/Thevar/Mukkulathor",
      "value": "Devar/Thevar/Mukkulathor"
    },
    {
      "label": "Devendra Kula Vellalar",
      "value": "Devendra Kula Vellalar"
    },
    {
      "label": "Dhangar",
      "value": "Dhangar"
    },
    {
      "label": "Dheevara",
      "value": "Dheevara"
    },
    {
      "label": "Dhiman",
      "value": "Dhiman"
    },
    {
      "label": "Dhoba",
      "value": "Dhoba"
    },
    {
      "label": "Digambar",
      "value": "Digambar"
    },
    {
      "label": "Dommala",
      "value": "Dommala"
    },
    {
      "label": "Dusadh",
      "value": "Dusadh"
    },
    {
      "label": "Ediga",
      "value": "Ediga"
    },
    {
      "label": "Ezhava",
      "value": "Ezhava"
    },
    {
      "label": "Ezhuthachan",
      "value": "Ezhuthachan"
    },
    {
      "label": "Gabit",
      "value": "Gabit"
    },
    {
      "label": "Ganakar",
      "value": "Ganakar"
    },
    {
      "label": "Gandla",
      "value": "Gandla"
    },
    {
      "label": "Ganiga",
      "value": "Ganiga"
    },
    {
      "label": "Gatti",
      "value": "Gatti"
    },
    {
      "label": "Gavali",
      "value": "Gavali"
    },
    {
      "label": "Gavara",
      "value": "Gavara"
    },
    {
      "label": "Ghumar",
      "value": "Ghumar"
    },
    {
      "label": "Goala",
      "value": "Goala"
    },
    {
      "label": "Goswami",
      "value": "Goswami"
    },
    {
      "label": "Goud",
      "value": "Goud"
    },
    {
      "label": "Gounder",
      "value": "Gounder"
    },
    {
      "label": "Gowda",
      "value": "Gowda"
    },
    {
      "label": "Gramani",
      "value": "Gramani"
    },
    {
      "label": "Gudia",
      "value": "Gudia"
    },
    {
      "label": "Gujjar",
      "value": "Gujjar"
    },
    {
      "label": "Gupta",
      "value": "Gupta"
    },
    {
      "label": "Guptan",
      "value": "Guptan"
    },
    {
      "label": "Gurjar",
      "value": "Gurjar"
    },
    {
      "label": "Halwai",
      "value": "Halwai"
    },
    {
      "label": "Hegde",
      "value": "Hegde"
    },
    {
      "label": "Helava",
      "value": "Helava"
    },
    {
      "label": "Hugar (Jeer)",
      "value": "Hugar (Jeer)"
    },
    {
      "label": "Intercaste",
      "value": "Intercaste"
    },
    {
      "label": "Jaalari",
      "value": "Jaalari"
    },
    {
      "label": "Jaiswal",
      "value": "Jaiswal"
    },
    {
      "label": "Jandra",
      "value": "Jandra"
    },
    {
      "label": "Jangam",
      "value": "Jangam"
    },
    {
      "label": "Jat",
      "value": "Jat"
    },
    {
      "label": "Jatav",
      "value": "Jatav"
    },
    {
      "label": "Jetty Malla",
      "value": "Jetty Malla"
    },
    {
      "label": "Kachara",
      "value": "Kachara"
    },
    {
      "label": "Kaibarta",
      "value": "Kaibarta"
    },
    {
      "label": "Kakkalan",
      "value": "Kakkalan"
    },
    {
      "label": "Kalar",
      "value": "Kalar"
    },
    {
      "label": "Kalinga",
      "value": "Kalinga"
    },
    {
      "label": "Kalinga Vysya",
      "value": "Kalinga Vysya"
    },
    {
      "label": "Kalita",
      "value": "Kalita"
    },
    {
      "label": "Kalwar",
      "value": "Kalwar"
    },
    {
      "label": "Kamboj",
      "value": "Kamboj"
    },
    {
      "label": "Kamma",
      "value": "Kamma"
    },
    {
      "label": "Kamma Naidu",
      "value": "Kamma Naidu"
    },
    {
      "label": "Kammala",
      "value": "Kammala"
    },
    {
      "label": "Kaniyan",
      "value": "Kaniyan"
    },
    {
      "label": "Kansari",
      "value": "Kansari"
    },
    {
      "label": "Kanu",
      "value": "Kanu"
    },
    {
      "label": "Kapu",
      "value": "Kapu"
    },
    {
      "label": "Kapu Naidu",
      "value": "Kapu Naidu"
    },
    {
      "label": "Karana",
      "value": "Karana"
    },
    {
      "label": "Karmakar",
      "value": "Karmakar"
    },
    {
      "label": "Kartha",
      "value": "Kartha"
    },
    {
      "label": "Karuneegar",
      "value": "Karuneegar"
    },
    {
      "label": "Kasar",
      "value": "Kasar"
    },
    {
      "label": "Kashyap",
      "value": "Kashyap"
    },
    {
      "label": "Kavuthiyya/Ezhavathy",
      "value": "Kavuthiyya/Ezhavathy"
    },
    {
      "label": "Kayastha",
      "value": "Kayastha"
    },
    {
      "label": "Khandayat",
      "value": "Khandayat"
    },
    {
      "label": "Khandelwal",
      "value": "Khandelwal"
    },
    {
      "label": "Kharwar",
      "value": "Kharwar"
    },
    {
      "label": "Khatik",
      "value": "Khatik"
    },
    {
      "label": "Khatri",
      "value": "Khatri"
    },
    {
      "label": "Kirar",
      "value": "Kirar"
    },
    {
      "label": "Koli",
      "value": "Koli"
    },
    {
      "label": "Koli Patel",
      "value": "Koli Patel"
    },
    {
      "label": "Kongu Vellala Gounder",
      "value": "Kongu Vellala Gounder"
    },
    {
      "label": "Korama",
      "value": "Korama"
    },
    {
      "label": "Kori",
      "value": "Kori"
    },
    {
      "label": "Koshti",
      "value": "Koshti"
    },
    {
      "label": "Krishnavaka",
      "value": "Krishnavaka"
    },
    {
      "label": "Kshatriya",
      "value": "Kshatriya"
    },
    {
      "label": "Kshatriya - Bhavasar",
      "value": "Kshatriya - Bhavasar"
    },
    {
      "label": "Kshatriya/Raju/Varma",
      "value": "Kshatriya/Raju/Varma"
    },
    {
      "label": "Kudumbi",
      "value": "Kudumbi"
    },
    {
      "label": "Kulal",
      "value": "Kulal"
    },
    {
      "label": "Kulalar",
      "value": "Kulalar"
    },
    {
      "label": "Kulita",
      "value": "Kulita"
    },
    {
      "label": "Kumawat",
      "value": "Kumawat"
    },
    {
      "label": "Kumbara",
      "value": "Kumbara"
    },
    {
      "label": "Kumbhakar/Kumbhar",
      "value": "Kumbhakar/Kumbhar"
    },
    {
      "label": "Kumhar",
      "value": "Kumhar"
    },
    {
      "label": "Kummari",
      "value": "Kummari"
    },
    {
      "label": "Kunbi",
      "value": "Kunbi"
    },
    {
      "label": "Kurava",
      "value": "Kurava"
    },
    {
      "label": "Kuravan",
      "value": "Kuravan"
    },
    {
      "label": "Kurmi",
      "value": "Kurmi"
    },
    {
      "label": "Kurmi Kshatriya",
      "value": "Kurmi Kshatriya"
    },
    {
      "label": "Kuruba",
      "value": "Kuruba"
    },
    {
      "label": "Kuruhina Shetty",
      "value": "Kuruhina Shetty"
    },
    {
      "label": "Kurumbar",
      "value": "Kurumbar"
    },
    {
      "label": "Kurup",
      "value": "Kurup"
    },
    {
      "label": "Kushwaha",
      "value": "Kushwaha"
    },
    {
      "label": "Lambadi/Banjara",
      "value": "Lambadi/Banjara"
    },
    {
      "label": "Lambani",
      "value": "Lambani"
    },
    {
      "label": "Leva Patil",
      "value": "Leva Patil"
    },
    {
      "label": "Lingayath",
      "value": "Lingayath"
    },
    {
      "label": "Lohana",
      "value": "Lohana"
    },
    {
      "label": "Lohar",
      "value": "Lohar"
    },
    {
      "label": "Loniya/Lonia/Lunia",
      "value": "Loniya/Lonia/Lunia"
    },
    {
      "label": "Lubana",
      "value": "Lubana"
    },
    {
      "label": "Madhesiya",
      "value": "Madhesiya"
    },
    {
      "label": "Madiga",
      "value": "Madiga"
    },
    {
      "label": "Mahajan",
      "value": "Mahajan"
    },
    {
      "label": "Mahar",
      "value": "Mahar"
    },
    {
      "label": "Mahendra",
      "value": "Mahendra"
    },
    {
      "label": "Maheshwari",
      "value": "Maheshwari"
    },
    {
      "label": "Mahindra",
      "value": "Mahindra"
    },
    {
      "label": "Mahishya",
      "value": "Mahishya"
    },
    {
      "label": "Majabi",
      "value": "Majabi"
    },
    {
      "label": "Mala",
      "value": "Mala"
    },
    {
      "label": "Malayalee Variar",
      "value": "Malayalee Variar"
    },
    {
      "label": "Mali",
      "value": "Mali"
    },
    {
      "label": "Mallah",
      "value": "Mallah"
    },
    {
      "label": "Mangalorean",
      "value": "Mangalorean"
    },
    {
      "label": "Maniyani",
      "value": "Maniyani"
    },
    {
      "label": "Mannadiar",
      "value": "Mannadiar"
    },
    {
      "label": "Mannan",
      "value": "Mannan"
    },
    {
      "label": "Mapila",
      "value": "Mapila"
    },
    {
      "label": "Marar",
      "value": "Marar"
    },
    {
      "label": "Maratha",
      "value": "Maratha"
    },
    {
      "label": "Maratha - Gomantak",
      "value": "Maratha - Gomantak"
    },
    {
      "label": "Maruthuvar",
      "value": "Maruthuvar"
    },
    {
      "label": "Marvar",
      "value": "Marvar"
    },
    {
      "label": "Marwari",
      "value": "Marwari"
    },
    {
      "label": "Matang",
      "value": "Matang"
    },
    {
      "label": "Maurya",
      "value": "Maurya"
    },
    {
      "label": "Meda",
      "value": "Meda"
    },
    {
      "label": "Medara",
      "value": "Medara"
    },
    {
      "label": "Meena",
      "value": "Meena"
    },
    {
      "label": "Meenavar",
      "value": "Meenavar"
    },
    {
      "label": "Meghwal",
      "value": "Meghwal"
    },
    {
      "label": "Mehra",
      "value": "Mehra"
    },
    {
      "label": "Menon",
      "value": "Menon"
    },
    {
      "label": "Meru Darji",
      "value": "Meru Darji"
    },
    {
      "label": "Modak",
      "value": "Modak"
    },
    {
      "label": "Mogaveera",
      "value": "Mogaveera"
    },
    {
      "label": "Monchi",
      "value": "Monchi"
    },
    {
      "label": "Mudaliar",
      "value": "Mudaliar"
    },
    {
      "label": "Mudaliar - Arcot",
      "value": "Mudaliar - Arcot"
    },
    {
      "label": "Mudaliar - Saiva",
      "value": "Mudaliar - Saiva"
    },
    {
      "label": "Mudaliar - Senguntha",
      "value": "Mudaliar - Senguntha"
    },
    {
      "label": "Mudiraj",
      "value": "Mudiraj"
    },
    {
      "label": "Munnuru Kapu",
      "value": "Munnuru Kapu"
    },
    {
      "label": "Muthuraja",
      "value": "Muthuraja"
    },
    {
      "label": "Naagavamsam",
      "value": "Naagavamsam"
    },
    {
      "label": "Nadar",
      "value": "Nadar"
    },
    {
      "label": "Nagaralu",
      "value": "Nagaralu"
    },
    {
      "label": "Nai",
      "value": "Nai"
    },
    {
      "label": "Naicken",
      "value": "Naicken"
    },
    {
      "label": "Naicker",
      "value": "Naicker"
    },
    {
      "label": "Naidu",
      "value": "Naidu"
    },
    {
      "label": "Naik",
      "value": "Naik"
    },
    {
      "label": "Nair",
      "value": "Nair"
    },
    {
      "label": "Nair - Vaniya",
      "value": "Nair - Vaniya"
    },
    {
      "label": "Nair - Velethadathu",
      "value": "Nair - Velethadathu"
    },
    {
      "label": "Nair - Vilakkithala",
      "value": "Nair - Vilakkithala"
    },
    {
      "label": "Namasudra",
      "value": "Namasudra"
    },
    {
      "label": "Nambiar",
      "value": "Nambiar"
    },
    {
      "label": "Nambisan",
      "value": "Nambisan"
    },
    {
      "label": "Namdev",
      "value": "Namdev"
    },
    {
      "label": "Namosudra",
      "value": "Namosudra"
    },
    {
      "label": "Napit",
      "value": "Napit"
    },
    {
      "label": "Nayak",
      "value": "Nayak"
    },
    {
      "label": "Nayaka",
      "value": "Nayaka"
    },
    {
      "label": "Neeli",
      "value": "Neeli"
    },
    {
      "label": "Nhavi",
      "value": "Nhavi"
    },
    {
      "label": "OBC - Barber/Naayee",
      "value": "OBC - Barber/Naayee"
    },
    {
      "label": "Oswal",
      "value": "Oswal"
    },
    {
      "label": "Otari",
      "value": "Otari"
    },
    {
      "label": "Padmasali",
      "value": "Padmasali"
    },
    {
      "label": "Panchal",
      "value": "Panchal"
    },
    {
      "label": "Pandaram",
      "value": "Pandaram"
    },
    {
      "label": "Panicker",
      "value": "Panicker"
    },
    {
      "label": "Paravan",
      "value": "Paravan"
    },
    {
      "label": "Parit",
      "value": "Parit"
    },
    {
      "label": "Parkava Kulam",
      "value": "Parkava Kulam"
    },
    {
      "label": "Partraj",
      "value": "Partraj"
    },
    {
      "label": "Pasi",
      "value": "Pasi"
    },
    {
      "label": "Paswan",
      "value": "Paswan"
    },
    {
      "label": "Patel",
      "value": "Patel"
    },
    {
      "label": "Patel - Desai",
      "value": "Patel - Desai"
    },
    {
      "label": "Patel - Dodia",
      "value": "Patel - Dodia"
    },
    {
      "label": "Patel - Kadva",
      "value": "Patel - Kadva"
    },
    {
      "label": "Patel - Leva",
      "value": "Patel - Leva"
    },
    {
      "label": "Patnaick",
      "value": "Patnaick"
    },
    {
      "label": "Patra",
      "value": "Patra"
    },
    {
      "label": "Patwa",
      "value": "Patwa"
    },
    {
      "label": "Perika",
      "value": "Perika"
    },
    {
      "label": "Pillai",
      "value": "Pillai"
    },
    {
      "label": "Pisharody",
      "value": "Pisharody"
    },
    {
      "label": "Poduval",
      "value": "Poduval"
    },
    {
      "label": "Poosala",
      "value": "Poosala"
    },
    {
      "label": "Porwal",
      "value": "Porwal"
    },
    {
      "label": "Prajapati",
      "value": "Prajapati"
    },
    {
      "label": "Pulaya",
      "value": "Pulaya"
    },
    {
      "label": "Raigar",
      "value": "Raigar"
    },
    {
      "label": "Rajaka/Chakali/Dhobi",
      "value": "Rajaka/Chakali/Dhobi"
    },
    {
      "label": "Rajbhar",
      "value": "Rajbhar"
    },
    {
      "label": "Rajput",
      "value": "Rajput"
    },
    {
      "label": "Rajput - Kumaoni",
      "value": "Rajput - Kumaoni"
    },
    {
      "label": "Rajput - Lodhi",
      "value": "Rajput - Lodhi"
    },
    {
      "label": "Ramdasia",
      "value": "Ramdasia"
    },
    {
      "label": "Ramgharia",
      "value": "Ramgharia"
    },
    {
      "label": "Rauniyar",
      "value": "Rauniyar"
    },
    {
      "label": "Ravidasia",
      "value": "Ravidasia"
    },
    {
      "label": "Rawat",
      "value": "Rawat"
    },
    {
      "label": "Reddiar",
      "value": "Reddiar"
    },
    {
      "label": "Reddy",
      "value": "Reddy"
    },
    {
      "label": "Relli",
      "value": "Relli"
    },
    {
      "label": "SSK",
      "value": "SSK"
    },
    {
      "label": "Sadgop",
      "value": "Sadgop"
    },
    {
      "label": "Sagara - Uppara",
      "value": "Sagara - Uppara"
    },
    {
      "label": "Saha",
      "value": "Saha"
    },
    {
      "label": "Sahu",
      "value": "Sahu"
    },
    {
      "label": "Saini",
      "value": "Saini"
    },
    {
      "label": "Saiva Vellala",
      "value": "Saiva Vellala"
    },
    {
      "label": "Saliya",
      "value": "Saliya"
    },
    {
      "label": "Sambava",
      "value": "Sambava"
    },
    {
      "label": "Satnami",
      "value": "Satnami"
    },
    {
      "label": "Savji",
      "value": "Savji"
    },
    {
      "label": "Scheduled Caste (SC)",
      "value": "Scheduled Caste (SC)"
    },
    {
      "label": "Scheduled Tribe (ST)",
      "value": "Scheduled Tribe (ST)"
    },
    {
      "label": "Senai Thalaivar",
      "value": "Senai Thalaivar"
    },
    {
      "label": "Sepahia",
      "value": "Sepahia"
    },
    {
      "label": "Setti Balija",
      "value": "Setti Balija"
    },
    {
      "label": "Shah",
      "value": "Shah"
    },
    {
      "label": "Shilpkar",
      "value": "Shilpkar"
    },
    {
      "label": "Shimpi",
      "value": "Shimpi"
    },
    {
      "label": "Sindhi - Bhanusali",
      "value": "Sindhi - Bhanusali"
    },
    {
      "label": "Sindhi - Bhatia",
      "value": "Sindhi - Bhatia"
    },
    {
      "label": "Sindhi - Chhapru",
      "value": "Sindhi - Chhapru"
    },
    {
      "label": "Sindhi - Dadu",
      "value": "Sindhi - Dadu"
    },
    {
      "label": "Sindhi - Hyderabadi",
      "value": "Sindhi - Hyderabadi"
    },
    {
      "label": "Sindhi - Larai",
      "value": "Sindhi - Larai"
    },
    {
      "label": "Sindhi - Lohana",
      "value": "Sindhi - Lohana"
    },
    {
      "label": "Sindhi - Rohiri",
      "value": "Sindhi - Rohiri"
    },
    {
      "label": "Sindhi - Sehwani",
      "value": "Sindhi - Sehwani"
    },
    {
      "label": "Sindhi - Thatai",
      "value": "Sindhi - Thatai"
    },
    {
      "label": "Sindhi-Amil",
      "value": "Sindhi-Amil"
    },
    {
      "label": "Sindhi-Baibhand",
      "value": "Sindhi-Baibhand"
    },
    {
      "label": "Sindhi-Larkana",
      "value": "Sindhi-Larkana"
    },
    {
      "label": "Sindhi-Sahiti",
      "value": "Sindhi-Sahiti"
    },
    {
      "label": "Sindhi-Sakkhar",
      "value": "Sindhi-Sakkhar"
    },
    {
      "label": "Sindhi-Shikarpuri",
      "value": "Sindhi-Shikarpuri"
    },
    {
      "label": "Somvanshi",
      "value": "Somvanshi"
    },
    {
      "label": "Sonar",
      "value": "Sonar"
    },
    {
      "label": "Soni",
      "value": "Soni"
    },
    {
      "label": "Sozhiya Vellalar",
      "value": "Sozhiya Vellalar"
    },
    {
      "label": "Sri Vaishnava",
      "value": "Sri Vaishnava"
    },
    {
      "label": "Srisayana",
      "value": "Srisayana"
    },
    {
      "label": "Subarna Banik",
      "value": "Subarna Banik"
    },
    {
      "label": "Sugali (Naika)",
      "value": "Sugali (Naika)"
    },
    {
      "label": "Sundhi",
      "value": "Sundhi"
    },
    {
      "label": "Surya Balija",
      "value": "Surya Balija"
    },
    {
      "label": "Sutar",
      "value": "Sutar"
    },
    {
      "label": "Suthar",
      "value": "Suthar"
    },
    {
      "label": "Swakula Sali",
      "value": "Swakula Sali"
    },
    {
      "label": "Swarnakar",
      "value": "Swarnakar"
    },
    {
      "label": "Tamboli",
      "value": "Tamboli"
    },
    {
      "label": "Tanti",
      "value": "Tanti"
    },
    {
      "label": "Tantuway",
      "value": "Tantuway"
    },
    {
      "label": "Telaga",
      "value": "Telaga"
    },
    {
      "label": "Teli",
      "value": "Teli"
    },
    {
      "label": "Thachar",
      "value": "Thachar"
    },
    {
      "label": "Thakkar",
      "value": "Thakkar"
    },
    {
      "label": "Thakur",
      "value": "Thakur"
    },
    {
      "label": "Thandan",
      "value": "Thandan"
    },
    {
      "label": "Thigala",
      "value": "Thigala"
    },
    {
      "label": "Thiyya",
      "value": "Thiyya"
    },
    {
      "label": "Thuluva Vellala",
      "value": "Thuluva Vellala"
    },
    {
      "label": "Tili",
      "value": "Tili"
    },
    {
      "label": "Togata",
      "value": "Togata"
    },
    {
      "label": "Turupu Kapu",
      "value": "Turupu Kapu"
    },
    {
      "label": "Udayar",
      "value": "Udayar"
    },
    {
      "label": "Urali Gounder",
      "value": "Urali Gounder"
    },
    {
      "label": "Urs",
      "value": "Urs"
    },
    {
      "label": "Vada Balija",
      "value": "Vada Balija"
    },
    {
      "label": "Vadagalai",
      "value": "Vadagalai"
    },
    {
      "label": "Vaddera",
      "value": "Vaddera"
    },
    {
      "label": "Vaduka",
      "value": "Vaduka"
    },
    {
      "label": "Vaish",
      "value": "Vaish"
    },
    {
      "label": "Vaish - Dhaneshawat",
      "value": "Vaish - Dhaneshawat"
    },
    {
      "label": "Vaishnav",
      "value": "Vaishnav"
    },
    {
      "label": "Vaishnav - Bhatia",
      "value": "Vaishnav - Bhatia"
    },
    {
      "label": "Vaishnav - Vania",
      "value": "Vaishnav - Vania"
    },
    {
      "label": "Vaishya",
      "value": "Vaishya"
    },
    {
      "label": "Vallala",
      "value": "Vallala"
    },
    {
      "label": "Valluvan",
      "value": "Valluvan"
    },
    {
      "label": "Valmiki",
      "value": "Valmiki"
    },
    {
      "label": "Vanika Vyshya",
      "value": "Vanika Vyshya"
    },
    {
      "label": "Vaniya Chettiar",
      "value": "Vaniya Chettiar"
    },
    {
      "label": "Vanjara",
      "value": "Vanjara"
    },
    {
      "label": "Vankar",
      "value": "Vankar"
    },
    {
      "label": "Vannan",
      "value": "Vannan"
    },
    {
      "label": "Vannar",
      "value": "Vannar"
    },
    {
      "label": "Vanniyakullak Kshatriya",
      "value": "Vanniyakullak Kshatriya"
    },
    {
      "label": "Vanniyar",
      "value": "Vanniyar"
    },
    {
      "label": "Variar",
      "value": "Variar"
    },
    {
      "label": "Varshney",
      "value": "Varshney"
    },
    {
      "label": "Veerashaiva",
      "value": "Veerashaiva"
    },
    {
      "label": "Velaan",
      "value": "Velaan"
    },
    {
      "label": "Velama",
      "value": "Velama"
    },
    {
      "label": "Velar",
      "value": "Velar"
    },
    {
      "label": "Vellalar",
      "value": "Vellalar"
    },
    {
      "label": "Veluthedathu - Nair",
      "value": "Veluthedathu - Nair"
    },
    {
      "label": "Vettuva Gounder",
      "value": "Vettuva Gounder"
    },
    {
      "label": "Vishwakarma",
      "value": "Vishwakarma"
    },
    {
      "label": "Viswabrahmin",
      "value": "Viswabrahmin"
    },
    {
      "label": "Vokkaliga",
      "value": "Vokkaliga"
    },
    {
      "label": "Vysya",
      "value": "Vysya"
    },
    {
      "label": "Waada Balija",
      "value": "Waada Balija"
    },
    {
      "label": "Yadav",
      "value": "Yadav"
    },
    {
      "label": "Yellapu",
      "value": "Yellapu"
    },
    {
      "label": "Caste No Bar",
      "value": "Caste No Bar"
    },
    {
      "label": "Other",
      "value": "Other"
    }
  ],
  Muslim: [
    { label: 'Sunni', value: 'Sunni' },
    { label: 'Shia', value: 'Shia' },
    { label: 'Lebbai', value: 'Lebbai' },
    { label: 'Rowther', value: 'Rowther' },
    { label: 'Marakayar', value: 'Marakayar' },
    { label: 'Other', value: 'Other' },
  ],
  Christian: [
    { label: 'Roman Catholic', value: 'Roman Catholic' },
    { label: 'Protestant', value: 'Protestant' },
    { label: 'CSI', value: 'CSI' },
    { label: 'Pentecostal', value: 'Pentecostal' },
    { label: 'Syrian Catholic', value: 'Syrian Catholic' },
    { label: 'Latin Catholic', value: 'Latin Catholic' },
    { label: 'Other', value: 'Other' },
  ],
};

// Dosham
export const DOSHAM_OPTIONS = [
  { label: 'Yes', value: 'yes' },
  { label: 'No', value: 'no' },
  { label: 'Not Sure', value: 'not_sure' },
];

// Education
export const EDUCATION_LEVELS = [
  { label: 'No Education Bar', value: 'No Education Bar' },
  { label: 'School (10th)', value: '10th' },
  { label: 'School (12th)', value: '12th' },
  { label: 'Diploma', value: 'Diploma' },
  { label: 'B.E / B.Tech', value: 'BE_BTech' },
  { label: 'B.Sc', value: 'BSc' },
  { label: 'B.Com', value: 'BCom' },
  { label: 'B.A', value: 'BA' },
  { label: 'BBA / BBM', value: 'BBA' },
  { label: 'BCA', value: 'BCA' },
  { label: 'B.L / LLB', value: 'LLB' },
  { label: 'MBBS', value: 'MBBS' },
  { label: 'BDS', value: 'BDS' },
  { label: 'B.Pharm', value: 'BPharm' },
  { label: 'M.E / M.Tech', value: 'ME_MTech' },
  { label: 'M.Sc', value: 'MSc' },
  { label: 'M.Com', value: 'MCom' },
  { label: 'M.A', value: 'MA' },
  { label: 'MBA', value: 'MBA' },
  { label: 'MCA', value: 'MCA' },
  { label: 'MD / MS', value: 'MD_MS' },
  { label: 'Ph.D', value: 'PhD' },
  { label: 'CA', value: 'CA' },
  { label: 'CS', value: 'CS' },
  { label: 'ICWA', value: 'ICWA' },
  { label: 'Other', value: 'Other' },
];

// Occupations
export const OCCUPATIONS = [
  { label: 'Software / IT', value: 'IT' },
  { label: 'Doctor', value: 'Doctor' },
  { label: 'Engineer', value: 'Engineer' },
  { label: 'Teacher / Professor', value: 'Teacher' },
  { label: 'Government Employee', value: 'Government' },
  { label: 'Business', value: 'Business' },
  { label: 'Banking / Finance', value: 'Banking' },
  { label: 'Lawyer', value: 'Lawyer' },
  { label: 'Chartered Accountant', value: 'CA' },
  { label: 'Architect', value: 'Architect' },
  { label: 'Defence', value: 'Defence' },
  { label: 'Police', value: 'Police' },
  { label: 'Agriculture', value: 'Agriculture' },
  { label: 'Private Company', value: 'Private' },
  { label: 'Self Employed', value: 'SelfEmployed' },
  { label: 'Not Working', value: 'NotWorking' },
  { label: 'Other', value: 'Other' },
];

// Annual Income
export const INCOME_RANGES = [
  { label: 'Below ₹1 Lakh', value: 'below_1L' },
  { label: '₹1-2 Lakhs', value: '1L_2L' },
  { label: '₹2-3 Lakhs', value: '2L_3L' },
  { label: '₹3-5 Lakhs', value: '3L_5L' },
  { label: '₹5-7 Lakhs', value: '5L_7L' },
  { label: '₹7-10 Lakhs', value: '7L_10L' },
  { label: '₹10-15 Lakhs', value: '10L_15L' },
  { label: '₹15-20 Lakhs', value: '15L_20L' },
  { label: '₹20-30 Lakhs', value: '20L_30L' },
  { label: '₹30-50 Lakhs', value: '30L_50L' },
  { label: '₹50 Lakhs - 1 Crore', value: '50L_1Cr' },
  { label: 'Above ₹1 Crore', value: 'above_1Cr' },
];

// Height range (cm)
export const HEIGHT_OPTIONS = (() => {
  const heights = [];
  for (let cm = 140; cm <= 210; cm++) {
    const feet = Math.floor(cm / 30.48);
    const inches = Math.round((cm / 2.54) % 12);
    heights.push({
      label: `${feet}' ${inches}" (${cm} cm)`,
      value: cm,
    });
  }
  return heights;
})();

// Weight range (kg)
export const WEIGHT_OPTIONS = (() => {
  const weights = [];
  for (let kg = 40; kg <= 120; kg += 5) {
    weights.push({ label: `${kg} kg`, value: kg });
  }
  return weights;
})();

// Physical Status
export const PHYSICAL_STATUS = [
  { label: 'Normal', value: 'normal' },
  { label: 'Physically Challenged', value: 'physically_challenged' },
];

// Family Values
export const FAMILY_VALUES = [
  { label: 'Orthodox', value: 'orthodox' },
  { label: 'Traditional', value: 'traditional' },
  { label: 'Moderate', value: 'moderate' },
  { label: 'Liberal', value: 'liberal' },
];

// Food habits
export const FOOD_HABITS = [
  { label: 'Vegetarian', value: 'vegetarian' },
  { label: 'Non-Vegetarian', value: 'non_vegetarian' },
  { label: 'Eggetarian', value: 'eggetarian' },
];

// Smoking
export const SMOKING_OPTIONS = [
  { label: 'No', value: 'no' },
  { label: 'Yes', value: 'yes' },
  { label: 'Occasionally', value: 'occasionally' },
];

// Drinking
export const DRINKING_OPTIONS = [
  { label: 'No', value: 'no' },
  { label: 'Yes', value: 'yes' },
  { label: 'Occasionally', value: 'occasionally' },
];

// Family type
export const FAMILY_TYPES = [
  { label: 'Joint Family', value: 'joint' },
  { label: 'Nuclear Family', value: 'nuclear' },
];

// Family status
export const FAMILY_STATUS = [
  { label: 'Middle Class', value: 'middle_class' },
  { label: 'Upper Middle Class', value: 'upper_middle_class' },
  { label: 'Rich', value: 'rich' },
  { label: 'Affluent', value: 'affluent' },
];

// Tamil Stars (Nakshatras)
export const STARS = [
  { label: 'Ashwini (அஸ்வினி)', value: 'Ashwini', tamil: 'அஸ்வினி' },
  { label: 'Bharani (பரணி)', value: 'Bharani', tamil: 'பரணி' },
  { label: 'Karthigai (கார்த்திகை)', value: 'Karthigai', tamil: 'கார்த்திகை' },
  { label: 'Rohini (ரோகிணி)', value: 'Rohini', tamil: 'ரோகிணி' },
  { label: 'Mrigashirsha (மிருகசீரிஷம்)', value: 'Mrigashirsha', tamil: 'மிருகசீரிஷம்' },
  { label: 'Thiruvathirai (திருவாதிரை)', value: 'Thiruvathirai', tamil: 'திருவாதிரை' },
  { label: 'Punarpoosam (புனர்பூசம்)', value: 'Punarpoosam', tamil: 'புனர்பூசம்' },
  { label: 'Poosam (பூசம்)', value: 'Poosam', tamil: 'பூசம்' },
  { label: 'Ayilyam (ஆயில்யம்)', value: 'Ayilyam', tamil: 'ஆயில்யம்' },
  { label: 'Magam (மகம்)', value: 'Magam', tamil: 'மகம்' },
  { label: 'Pooram (பூரம்)', value: 'Pooram', tamil: 'பூரம்' },
  { label: 'Uthiram (உத்திரம்)', value: 'Uthiram', tamil: 'உத்திரம்' },
  { label: 'Hastham (அஸ்தம்)', value: 'Hastham', tamil: 'அஸ்தம்' },
  { label: 'Chithirai (சித்திரை)', value: 'Chithirai', tamil: 'சித்திரை' },
  { label: 'Swathi (சுவாதி)', value: 'Swathi', tamil: 'சுவாதி' },
  { label: 'Visakam (விசாகம்)', value: 'Visakam', tamil: 'விசாகம்' },
  { label: 'Anusham (அனுஷம்)', value: 'Anusham', tamil: 'அனுஷம்' },
  { label: 'Kettai (கேட்டை)', value: 'Kettai', tamil: 'கேட்டை' },
  { label: 'Moolam (மூலம்)', value: 'Moolam', tamil: 'மூலம்' },
  { label: 'Pooradam (பூராடம்)', value: 'Pooradam', tamil: 'பூராடம்' },
  { label: 'Uthiradam (உத்திராடம்)', value: 'Uthiradam', tamil: 'உத்திராடம்' },
  { label: 'Thiruvonam (திருவோணம்)', value: 'Thiruvonam', tamil: 'திருவோணம்' },
  { label: 'Avittam (அவிட்டம்)', value: 'Avittam', tamil: 'அவிட்டம்' },
  { label: 'Sathayam (சதயம்)', value: 'Sathayam', tamil: 'சதயம்' },
  { label: 'Poorattathi (பூரட்டாதி)', value: 'Poorattathi', tamil: 'பூரட்டாதி' },
  { label: 'Uthirattathi (உத்திரட்டாதி)', value: 'Uthirattathi', tamil: 'உத்திரட்டாதி' },
  { label: 'Revathi (ரேவதி)', value: 'Revathi', tamil: 'ரேவதி' },
];

// Raasi (Moon signs)
export const RAASIS = [
  { label: 'Mesham (மேஷம்)', value: 'Mesham', tamil: 'மேஷம்' },
  { label: 'Rishabam (ரிஷபம்)', value: 'Rishabam', tamil: 'ரிஷபம்' },
  { label: 'Mithunam (மிதுனம்)', value: 'Mithunam', tamil: 'மிதுனம்' },
  { label: 'Kadagam (கடகம்)', value: 'Kadagam', tamil: 'கடகம்' },
  { label: 'Simmam (சிம்மம்)', value: 'Simmam', tamil: 'சிம்மம்' },
  { label: 'Kanni (கன்னி)', value: 'Kanni', tamil: 'கன்னி' },
  { label: 'Thulam (துலாம்)', value: 'Thulam', tamil: 'துலாம்' },
  { label: 'Viruchigam (விருச்சிகம்)', value: 'Viruchigam', tamil: 'விருச்சிகம்' },
  { label: 'Dhanusu (தனுசு)', value: 'Dhanusu', tamil: 'தனுசு' },
  { label: 'Magaram (மகரம்)', value: 'Magaram', tamil: 'மகரம்' },
  { label: 'Kumbam (கும்பம்)', value: 'Kumbam', tamil: 'கும்பம்' },
  { label: 'Meenam (மீனம்)', value: 'Meenam', tamil: 'மீனம்' },
];

// Tamil Nadu Districts
export const TN_DISTRICTS = [
  'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore',
  'Dharmapuri', 'Dindigul', 'Erode', 'Kallakurichi', 'Kancheepuram',
  'Karur', 'Krishnagiri', 'Madurai', 'Mayiladuthurai', 'Nagapattinam',
  'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai', 'Ramanathapuram',
  'Ranipet', 'Salem', 'Sivagangai', 'Tenkasi', 'Thanjavur',
  'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli', 'Tirupattur',
  'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur', 'Vellore', 'Viluppuram',
  'Virudhunagar',
];

// Languages
export const LANGUAGES = [
  'Tamil', 'English', 'Hindi', 'Telugu', 'Kannada',
  'Malayalam', 'Marathi', 'Urdu', 'Bengali', 'Gujarati',
  'Odia', 'Punjabi', 'French', 'German', 'Other',
];

// Interest/Hobby options
export const INTERESTS_OPTIONS = [
  'Reading', 'Travelling', 'Cooking', 'Music', 'Dancing',
  'Photography', 'Painting', 'Sports', 'Yoga', 'Meditation',
  'Movies', 'Gaming', 'Gardening', 'Volunteering', 'Writing',
  'Fitness', 'Shopping', 'Crafts', 'Technology', 'Nature',
];

// Notification types
export const NOTIFICATION_TYPES = {
  NEW_INTEREST: 'new_interest',
  INTEREST_ACCEPTED: 'interest_accepted',
  NEW_MESSAGE: 'new_message',
  PROFILE_VIEW: 'profile_view',
  DAILY_MATCH: 'daily_match',
  PREMIUM_EXPIRY: 'premium_expiry',
  SYSTEM: 'system',
};

// Activity types
export const ACTIVITY_TYPES = {
  PROFILE_VIEW: 'profile_view',
  INTEREST_SENT: 'interest_sent',
  INTEREST_RECEIVED: 'interest_received',
  MESSAGE_SENT: 'message_sent',
  PROFILE_UPDATED: 'profile_updated',
  PHOTO_UPLOADED: 'photo_uploaded',
  SUBSCRIPTION_PURCHASED: 'subscription_purchased',
};
