import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiMessageSquare, FiSearch, FiFileText } from 'react-icons/fi';
import { FaCheckCircle, FaLinkedinIn, FaTelegramPlane } from 'react-icons/fa';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, Pagination } from 'swiper/modules';
import { homeApi } from '../../api/api';
import { useApiResource } from '../../hooks/useApiResource';
import { getCurrentLang, localizeItem, sortByDisplayOrder } from '../../utils/localization';
import Maps from './Maps'
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const IMAGE_PLACEHOLDER =
   'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="900" height="700" viewBox="0 0 900 700"%3E%3Crect width="900" height="700" fill="%23f1f5f9"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="38" font-weight="700" fill="%23274F94"%3EOrix Global%3C/text%3E%3C/svg%3E';

const setImageFallback = (event) => {
   event.currentTarget.onerror = null;
   event.currentTarget.src = IMAGE_PLACEHOLDER;
};

const normalizeList = (data) => (Array.isArray(data) ? data : []);

const buildMarqueeBase = (items, repeats = 4) =>
   Array.from({ length: repeats }).flatMap(() => items);

const getContactErrorMessage = (error) => {
   const data = error?.response?.data;
   if (typeof data === 'string') return data;
   if (data?.detail) return data.detail;
   if (data?.message) return data.message;
   if (data?.error) return data.error;
   if (data && typeof data === 'object') {
      return Object.values(data).flat().filter(Boolean).join(' ');
   }
   return error?.message || 'Xabar yuborishda xatolik yuz berdi.';
};

const Home = () => {
   const navigate = useNavigate();
   const lang = getCurrentLang();
   const [contactForm, setContactForm] = useState({
      firstName: '',
      lastName: '',
      phoneCode: '+998',
      phoneNumber: '',
      message: '',
   });
   const [contactSubmitting, setContactSubmitting] = useState(false);
   const [contactStatus, setContactStatus] = useState({ type: '', message: '' });

   const t = {
      uz: {
         hero1: "Janubiy Koreyada o'qish", heroSub1: "Ayni damda",
         hero2: "Janubiy Koreyada o'qish", heroSub2: "Biz bilan",
         heroDesc: "Orix Global Consulting - yorqin kelajak sari ko'prik",
         bookBtn: "Uchrashuv belgilash",
         servicesPre: "Xizmatlar",
         servicesTitle: "Xalqaro ta’lim bilan yangi imkoniyatlar sari",
         s1: "Dastlabki Konsultatsiya", s2: "Universitet va dasturlarni tanlash", s3: "Kerakli hujjatlarni yig'ish va yuborish", s4: "Universitetga qabul", s5: "Safarni rejalashtirish va viza olish",
         aboutPre: "Biz haqimizda", aboutTitle: "Orix Global Consulting",
         aboutP1: "Orix Global Consulting - bu intiluvchan talabalar va Janubiy Koreyadagi xalqaro darajadagi ta'lim o'rtasidagi ko'prikdir. Bizning jamoamiz xorijda ta'lim olish sohasida yetakchi mutaxassislardan iborat.",
         aboutP2: "Bizning Koreya consulting bo'yicha kuchli tajribamiz har bir talabaning individual ehtiyojlariga mos keladigan eng yaxshi va to'g'ri maslahatlarni olishini ta'minlaydi. O'qishni tugatgach keng imkoniyatlar yaratiladi.",
         aboutP3: "Biz Seul, Pusan va boshqa yirik shaharlarda ta'lim va martaba imkoniyatlarini taklif qilamiz. Koreya universitetlariga o'qishga kirish jarayonlarini bizning maxsus mutaxassislar jamoamiz bilan yanada osonlashing.",
         locPre: "Lokatsiyalar", locTitle: "Davlatlar",
         teamPre: "Jamoa", teamTitle: "Bizning Mutaxassislarimiz bilan tanishing",
         gallPre: "Galereya", partPre: "Hamkorlar", partTitle: "Bizning Hamkorlarimiz",
         contactPre: "Aloqa", contactTitle: "Biz bilan ishlashni boshlang",
         contactDetails: "Shaxsiy Ma'lumotlar", fName: "Ismingiz *", lName: "Familiyangiz *", tel: "Telefon raqam *", msg: "Xabaringiz", submit: "Yuborish (Submit)",
         sending: "Yuborilmoqda...", success: "Xabaringiz muvaffaqiyatli yuborildi.", required: "Majburiy maydonlarni to'ldiring.",
         exp1: "Koreyaning ilg'or universitetlariga ixtisoslashgan holda 8 yillik tajribaga egaman.",
         exp2: "Bizning jamoaga Janubiy Koreyadagi nufuzli dasturlarga yo'naltirish orqali rahbarlik qilaman.",
         exp3: "Sizning vizangizni muammosiz chiqishini ta'minlash va talabalarga yordam berish asosiy vazifam.",
         exp4: "Seuldan to Pusangacha - Janubiy Koreyadagi barcha ta'lim dasturlari bo'yicha mutaxassisman.",
         exp5: "D-2 va D-4 viza jarayonlarida barcha qiyinchiliklarni o'z zimmamga olaman.",
         exp6: "Koreya universitetlari ma'muriyati bilan to'g'ridan-to'g'ri aloqalarni ta'minlayman."
      },
      ru: {
         hero1: "Учеба в Южной Корее", heroSub1: "Уже сегодня",
         hero2: "Учеба в Южной Корее", heroSub2: "Вместе с нами",
         heroDesc: "Orix Global Consulting - ваш мост в светлое будущее",
         bookBtn: "Записаться на консультацию",
         servicesPre: "Услуги",
         servicesTitle: "На пути к новым возможностям в сфере международного образования.",
         s1: "Первичная консультация", s2: "Подбор университетов и программ", s3: "Сбор и отправка необходимых документов", s4: "Поступление в университет", s5: "Планирование поездки и получение визы",
         aboutPre: "О нас", aboutTitle: "Orix Global Consulting",
         aboutP1: "Orix Global Consulting — это главное агентство, объединяющее амбициозных студентов и образование мирового уровня в Южной Корее. Мы - лидеры в сфере зарубежного образования.",
         aboutP2: "Наш опыт в консалтинге по Корее гарантирует, что наши студенты получат детальное руководство, которое идеально соответствует их потребностям.",
         aboutP3: "Мы с гордостью связываем таланты с возможностями в Сеуле, Пусане и за их пределами. Поступление в корейские университеты еще никогда не было таким простым.",
         locPre: "Локации", locTitle: "Страны",
         teamPre: "Команда", teamTitle: "Познакомьтесь с нашими экспертами",
         gallPre: "Галерея", partPre: "Партнеры", partTitle: "Наши корейские университеты-партнеры",
         contactPre: "Контакты", contactTitle: "Начните работать с нами",
         contactDetails: "Личные данные", fName: "Имя *", lName: "Фамилия *", tel: "Номер телефона *", msg: "Ваше сообщение", submit: "Отправить",
         sending: "Отправляется...", success: "Ваше сообщение успешно отправлено.", required: "Заполните обязательные поля.",
         exp1: "Имею 8-летний опыт работы, специализируюсь на ведущих корейских университетах.",
         exp2: "Я возглавляю нашу команду, концентрируясь на престижных корейских программах.",
         exp3: "Моя задача - убедиться, что вы получите корейские визы без малейших усилий.",
         exp4: "От Сеула до Пусана — я помогаю студентам с любыми южнокорейскими университетами.",
         exp5: "Я занимаюсь сложными визовыми процессами D-2 и D-4.",
         exp6: "Я поддерживаю прочные партнерские отношения с крупными университетами."
      },
      en: {
         hero1: "Study in South Korea", heroSub1: "Today",
         hero2: "Study in South Korea", heroSub2: "With Us",
         heroDesc: "Orix Global Consulting - Your bridge to a brighter future",
         bookBtn: "Book a consultation",
         servicesPre: "Services",
         servicesTitle: "Towards new opportunities with international education",
         s1: "Primary Consultation", s2: "Selection of Universities and Programs", s3: "Collecting and Sending Documents", s4: "Admission to the University", s5: "Planning a Trip and Obtaining a Visa",
         aboutPre: "About Us", aboutTitle: "Orix Global Consulting",
         aboutP1: "Orix Global Consulting is a premier agency dedicated to bridging the gap between ambitious students and world-class education in South Korea.",
         aboutP2: "Our expertise in Korea consulting ensures that our students receive nuanced guidance. We prepare you comprehensively for international academics.",
         aboutP3: "We proudly connect talents with dynamic opportunities across Seoul, Busan, and beyond. Navigating admissions has never been easier thanks to our team.",
         locPre: "Locations", locTitle: "Countries",
         teamPre: "Team", teamTitle: "Meet Our Experts",
         gallPre: "Gallery", partPre: "Partners", partTitle: "Our Partners",
         contactPre: "Contact", contactTitle: "Let's Work Together",
         contactDetails: "Personal Details", fName: "First Name *", lName: "Last Name *", tel: "Phone number *", msg: "Leave us a message", submit: "Submit",
         sending: "Sending...", success: "Your message has been sent successfully.", required: "Please fill in the required fields.",
         exp1: "I've been in the field for 8 years, specializing in top-tier Korean universities.",
         exp2: "I lead our team in building futures focusing on prestigious South Korean programs.",
         exp3: "I thoroughly enjoy my role, watching students obtain their Korean visas effortlessly.",
         exp4: "Assisting students with universities is my expertise. From Seoul to Busan, I cover it all.",
         exp5: "I handle the complex D-2 and D-4 visa processes so you focus on packing your bags.",
         exp6: "I maintain strong partnerships and direct links with major Korean universities."
      }
   }[lang];

   const bannersQuery = useApiResource(homeApi.getBanners, []);
   const servicesQuery = useApiResource(homeApi.getServices, []);
   const aboutQuery = useApiResource(homeApi.getAbout, []);
   const countriesQuery = useApiResource(homeApi.getCountries, []);
   const staffQuery = useApiResource(homeApi.getStaffMembers, []);
   const galleryQuery = useApiResource(homeApi.getGallery, []);
   const partnersQuery = useApiResource(homeApi.getPartners, []);
   const contactInfoQuery = useApiResource(homeApi.getContactInfo, []);

   useEffect(() => {
      const hash = window.location.hash;
      if (hash) {
         setTimeout(() => {
            const element = document.querySelector(hash);
            if (element) {
               const offset = 80;
               const bodyRect = document.body.getBoundingClientRect().top;
               const elementRect = element.getBoundingClientRect().top;
               const offsetPosition = (elementRect - bodyRect) - offset;
               window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
            }
         }, 100);
      }
   }, []);

   const fadeIn = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };

   const banners = useMemo(
      () =>
         normalizeList(bannersQuery.data)
            .filter((banner) => banner?.is_active !== false)
            .map((banner) => localizeItem(banner, ['title', 'description'], lang)),
      [bannersQuery.data, lang]
   );

   const services = useMemo(
      () => normalizeList(servicesQuery.data).map((service) => localizeItem(service, ['title', 'description'], lang)),
      [servicesQuery.data, lang]
   );

   const  about = useMemo(() => {
      if (!aboutQuery.data || aboutQuery.data?.is_active === false) return null;
      return localizeItem(aboutQuery.data, ['title', 'content'], lang);
   }, [aboutQuery.data, lang]);

   const countries = useMemo(
      () =>
         normalizeList(countriesQuery.data)
            .filter(country => {
               if (countriesQuery.loading) return true;
               const slug = country?.slug?.toLowerCase();
               return slug !== 'uzbekistan' && slug !== 'boshqa-slug';
            })

            .map((country) => localizeItem(country, ['name'], lang)),
      [countriesQuery.data, lang]
   );

   const experts = useMemo(
      () =>
         sortByDisplayOrder(normalizeList(staffQuery.data)).map((member) =>
            localizeItem(member, ['full_name', 'role', 'bio'], lang)
         ),
      [staffQuery.data, lang]
   );

   const galleryImages = useMemo(
      () => sortByDisplayOrder(normalizeList(galleryQuery.data)).filter((image) => image?.imageUrl),
      [galleryQuery.data]
   );

   const partners = useMemo(
      () => sortByDisplayOrder(normalizeList(partnersQuery.data)).filter((partner) => partner?.logoUrl),
      [partnersQuery.data]
   );

   const galleryMarqueeBase = useMemo(() => buildMarqueeBase(galleryImages), [galleryImages]);
   const partnerMarqueeBase = useMemo(() => buildMarqueeBase(partners), [partners]);
   const defaultCountry = countries?.[0]?.slug || countries?.[0]?.name || '';
   const contactInfo = useMemo(() => {
      if (!contactInfoQuery.data || contactInfoQuery.data?.is_active === false) return null;
      return localizeItem(contactInfoQuery.data, ['title', 'address'], lang);
   }, [contactInfoQuery.data, lang]);

   const serviceIcons = useMemo(
      () => [
         <FiMessageSquare key="message" />,
         <FiSearch key="search" />,
         <FiFileText key="file" />,
         <img key="admission" src="https://cdn-icons-png.flaticon.com/512/3306/3306085.png" alt="Admission" className="w-10 h-10 object-contain filter-red opacity-80" />,
         <img key="visa" src="https://cdn-icons-png.flaticon.com/512/2065/2065064.png" alt="Visa" className="w-10 h-10 object-contain filter-red opacity-80" />,
      ],
      []
   );

   const serviceIconMap = useMemo(
      () => ({
         yangilik: <FiMessageSquare key="yangilik" />,
         konsultatsiya: <FiMessageSquare key="konsultatsiya" />,
         consultation: <FiMessageSquare key="consultation" />,
         search: <FiSearch key="search-map" />,
         tanlash: <FiSearch key="tanlash" />,
         hujjat: <FiFileText key="hujjat" />,
         document: <FiFileText key="document" />,
         file: <FiFileText key="file-map" />,
      }),
      []
   );

   const getServiceIcon = (icon, index) => {
      if (icon && (String(icon).startsWith('http') || String(icon).startsWith('/'))) {
         return <img src={icon} alt="service" className="w-10 h-10 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />;
      }
      return serviceIconMap[String(icon || '').toLowerCase()] || serviceIcons[index % serviceIcons.length];
   };

   const handleContactChange = (event) => {
      const { name, value } = event.target;
      setContactForm((prev) => ({ ...prev, [name]: value }));
   };

   const handleContactSubmit = async (event) => {
      event.preventDefault();
      setContactStatus({ type: '', message: '' });

      if (!contactForm.firstName.trim() || !contactForm.lastName.trim() || !contactForm.phoneNumber.trim()) {
         setContactStatus({ type: 'error', message: t.required });
         return;
      }

      setContactSubmitting(true);

      try {
         await homeApi.sendContact({
            country: defaultCountry,
            firstName: contactForm.firstName.trim(),
            lastName: contactForm.lastName.trim(),
            phoneCode: contactForm.phoneCode,
            phoneNumber: contactForm.phoneNumber.trim(),
            message: contactForm.message.trim(),
         });

         setContactStatus({ type: 'success', message: t.success });
         setContactForm({ firstName: '', lastName: '', phoneCode: '+998', phoneNumber: '', message: '' });
      } catch (error) {
         setContactStatus({ type: 'error', message: getContactErrorMessage(error) });
      } finally {
         setContactSubmitting(false);
      }
   };

   return (
      <div className="w-full bg-white font-sans overflow-hidden">

         <section id="home" className="relative w-full h-[85vh] bg-[#f8f9fc] flex items-center pt-20">
            <Swiper modules={[Autoplay, Pagination]} autoplay={{ delay: 5000 }} pagination={{ clickable: true }} className="w-full h-full">
               {(bannersQuery.loading ? [{ id: 'loading' }] : banners.length ? banners : [{ id: 'empty', title: t.hero2, description: t.heroDesc, imageUrl: IMAGE_PLACEHOLDER }]).map((banner, idx) => (
                  <SwiperSlide key={banner?.id || idx}>
                     <div className="w-full h-full px-[30px] flex flex-col md:mb-[0px] md:flex-row items-center max-w-[1400px] mx-auto px md:px-12">
                        <div className="mx-3 md:w-1/2 pt-10 md:pt-0 pb-10 z-10 relative">
                           {bannersQuery.loading ? (
                              <div className="animate-pulse">
                                 <div className="h-14 md:h-20 bg-[#274F94]/10 rounded-md mb-4 max-w-[620px]"></div>
                                 <div className="h-6 bg-[#274F94]/10 rounded-md mb-8 max-w-[420px]"></div>
                              </div>
                           ) : (
                              <>
                                 <motion.h1
                                    initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
                                    className="text-[45px] md:text-[65px] lg:text-[70px] font-extrabold text-[#274F94] leading-[1.1] tracking-tight mb-4"
                                 >
                                    {banner?.title || t.hero2}
                                 </motion.h1>
                                 <motion.p
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.7 }}
                                    className="text-lg md:text-xl font-medium text-[#274F94] opacity-70 mb-8"
                                 >
                                    {banner?.description || t.heroDesc}
                                 </motion.p>
                              </>
                           )}
                           <motion.button
                              onClick={() => navigate('/booking')}
                              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                              className="bg-[#8F0810] hover:bg-[#6a060b] text-white px-8 py-3.5 rounded-md font-bold text-[15px] transition-all shadow-md"
                           >
                              {t.bookBtn}
                           </motion.button>
                        </div>
                        <div className="mb-[40px] pb-[50px] w-full md:w-1/2 h-[50vh] md:h-[80vh] flex justify-center items-center  md:relative overflow-hidden opacity-30 md:opacity-100 mt-10 md:mt-0 pt-0 !items-end">
                           <img src={banner?.imageUrl || IMAGE_PLACEHOLDER} onError={setImageFallback} alt={banner?.title || 'Orix Global'} className="h-[90%] md:h-[85%] w-full object-cover block md:rounded-b-full md:rounded-t-[300px] shadow-2xl z-0 border-[10px] border-white" loading={idx === 0 ? 'eager' : 'lazy'} />
                        </div>
                     </div>
                  </SwiperSlide>
               ))}
            </Swiper>
         </section>

         <section id="services" className="w-full py-24 px-6 text-center max-w-[1200px] mx-auto">
            <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="text-[#8F0810] font-bold tracking-widest text-xs lg:text-sm mb-4 uppercase">{t.servicesPre}</motion.p>
            <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ delay: 0.2 }} variants={fadeIn} className="text-2xl md:text-4xl font-extrabold text-[#274F94] mb-20 max-w-2xl mx-auto">
               {t.servicesTitle}
            </motion.h2>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 md:gap-10">
               {(servicesQuery.loading ? Array.from({ length: 5 }, (_, index) => ({ id: `loading-${index}` })) : services).map((service, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex flex-col items-center">
                     <div className="w-16 h-16 flex items-center justify-center text-[#8F0810] text-4xl mb-4 border-2 border-[#8F0810] rounded-xl bg-white shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
                        {servicesQuery.loading ? <div className="w-10 h-10 bg-[#8F0810]/10 rounded-md animate-pulse"></div> : getServiceIcon(service?.icon, i)}
                     </div>
                     {servicesQuery.loading ? (
                        <div className="w-full animate-pulse">
                           <div className="h-4 bg-[#274F94]/10 rounded-md mb-2"></div>
                           <div className="h-3 bg-[#274F94]/10 rounded-md mx-4"></div>
                        </div>
                     ) : (
                        <>
                           <h4 className="font-semibold text-[#274F94] text-xs md:text-sm lg:text-[13px] text-center leading-tight">{service?.title}</h4>
                           {service?.description && <p className="text-[#274F94] opacity-70 text-[11px] leading-relaxed mt-2 font-medium">{service.description}</p>}
                        </>
                     )}
                  </motion.div>
               ))}
            </div>
         </section>

         <section id="about" className="w-full py-20 bg-white">
            <div className="max-w-[1300px] mx-auto flex flex-col lg:flex-row items-center gap-12 px-6 lg:px-12">
               <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="w-full lg:w-1/2 relative h-[400px] md:h-[600px] bg-gray-100 flex items-center justify-center rounded-md overflow-hidden shrink-0">
                  <img src={about?.imageUrl || IMAGE_PLACEHOLDER} onError={setImageFallback} alt={about?.title || 'About'} className="w-full h-full object-cover border-[1px] border-[#8F0810] rounded-[15px]" loading="lazy" />
               </motion.div>
               <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="w-full lg:w-1/2 pl-0 lg:pl-10">
                  <p className="text-[#8F0810] font-bold tracking-widest text-xs mb-4 uppercase">{t.aboutPre}</p>
                  {aboutQuery.loading ? (
                     <div className="animate-pulse">
                        <div className="h-10 bg-[#274F94]/10 rounded-md mb-8 max-w-[420px]"></div>
                        <div className="h-4 bg-[#274F94]/10 rounded-md mb-4"></div>
                        <div className="h-4 bg-[#274F94]/10 rounded-md mb-4"></div>
                        <div className="h-4 bg-[#274F94]/10 rounded-md mb-10 w-4/5"></div>
                     </div>
                  ) : (
                     <>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-[#274F94] mb-8 leading-tight">{about?.title || t.aboutTitle}</h2>
                        {(about?.content ? String(about.content).split(/\n+/).filter(Boolean) : [t.aboutP1, t.aboutP2, t.aboutP3]).map((paragraph, index, list) => (
                           <p key={index} className={`text-[#274F94] opacity-80 text-[13px] md:text-[14px] ${index === list.length - 1 ? 'mb-10' : 'mb-5'} leading-relaxed font-medium`}>{paragraph}</p>
                        ))}
                     </>
                  )}
                  {aboutQuery.error && <p className="text-[#8F0810] text-sm font-semibold mb-5">{aboutQuery.error}</p>}
                  <div className="flex gap-4 items-center flex-wrap">
                     {normalizeList(about?.accreditations).map((item) => (
                        <a key={item?.id || item?.imageUrl} href={item?.websiteUrl || '#'} target="_blank" rel="noreferrer" className="inline-flex">
                           <img src={item?.imageUrl || IMAGE_PLACEHOLDER} onError={setImageFallback} alt="Accreditation" className="h-30 object-contain opacity-70" loading="lazy" />
                        </a>
                     ))}
                  </div>
               </motion.div>
            </div>
         </section>

         <section id="universities" className="w-full pt-24 bg-white px-6">
            <div className="max-w-[1300px] mx-auto text-center">
               <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="text-[#8F0810] font-bold tracking-widest text-xs uppercase mb-3">{t.locPre}</motion.p>
               <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ delay: 0.2 }} variants={fadeIn} className="text-2xl md:text-4xl font-extrabold text-[#274F94] mb-12 flex flex-col items-center">
                  {t.locTitle}
                  <div className="w-8 h-1 bg-[#274F94] mt-6"></div>
               </motion.h2>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {(countriesQuery.loading ? Array.from({ length: 3 }, (_, index) => ({ id: `loading-${index}` })) : countries).map((country, i) => (
                     <motion.div
                        key={country?.id || i} onClick={() => !countriesQuery.loading && navigate('/universities', { state: { countrySlug: country?.slug, countryName: country?.name } })}
                        initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                        className="group relative w-full h-[300px] md:h-[400px] overflow-hidden bg-gray-200 cursor-pointer rounded-xl shadow-md border-[6px] border-white"
                     >
                        <img src={country?.imageUrl || IMAGE_PLACEHOLDER} onError={setImageFallback} alt={country?.name || 'Country'} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-[#8F0810]/40 transition-colors duration-300"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                           <span className="text-[35px] md:text-[50px] font-extrabold text-white tracking-widest drop-shadow-md bg-black/20 group-hover:bg-transparent px-6 py-2 rounded-md backdrop-blur-sm transition-all border border-white/20">
                              {countriesQuery.loading ? '' : country?.name}
                           </span>
                        </div>
                     </motion.div>
                  ))}
               </div>
               {!countriesQuery.loading && countries.length === 0 && (
                  <p className="text-[#274F94] opacity-70 text-sm font-semibold mt-6">Davlatlar topilmadi.</p>
               )}
            </div>
         </section>

         <section id="team" className="w-full py-24 bg-[#f8f9fc] px-6">
            <div className="max-w-[1300px] mx-auto text-center">
               <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="text-[#8F0810] font-bold tracking-widest text-xs uppercase mb-3">{t.teamPre}</motion.p>
               <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ delay: 0.2 }} variants={fadeIn} className="text-2xl md:text-4xl font-extrabold text-[#274F94] mb-16 flex flex-col items-center">
                  {t.teamTitle}
                  <div className="w-8 h-1 bg-[#274F94] mt-6"></div>
               </motion.h2>

               <div className="relative max-w-[1100px] mx-auto group">
                  <Swiper
                     modules={[Navigation, Autoplay]}
                     spaceBetween={30}
                     slidesPerView={1}
                     navigation={{ nextEl: '.swiper-expert-next', prevEl: '.swiper-expert-prev' }}
                     autoplay={{ delay: 3000, disableOnInteraction: false }}
                     breakpoints={{ 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }}
                     className="pb-10"
                  >
                     {(staffQuery.loading ? Array.from({ length: 3 }, (_, index) => ({ id: `loading-${index}` })) : experts).map((exp, i) => (
                        <SwiperSlide key={exp?.id || i}>
                           <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 flex flex-col text-left h-full hover:shadow-lg">
                              <div className="h-[280px] w-full overflow-hidden bg-gray-100">
                                 <img src={exp?.imageUrl || IMAGE_PLACEHOLDER} onError={setImageFallback} alt={exp?.full_name || 'Team member'} className="w-full h-full object-cover" loading="lazy" />
                              </div>
                              <div className="p-6 flex flex-col grow">
                                 {staffQuery.loading ? (
                                    <div className="animate-pulse flex-grow">
                                       <div className="h-5 bg-[#274F94]/10 rounded-md mb-2"></div>
                                       <div className="h-3 bg-[#8F0810]/10 rounded-md mb-4 w-2/3"></div>
                                       <div className="h-3 bg-[#274F94]/10 rounded-md mb-2"></div>
                                       <div className="h-3 bg-[#274F94]/10 rounded-md mb-6 w-4/5"></div>
                                    </div>
                                 ) : (
                                    <>
                                       <h4 className="text-lg font-bold text-[#274F94] mb-0.5">{exp?.full_name}</h4>
                                       <p className="text-[#8F0810] font-bold text-[11px] uppercase tracking-wider mb-4">{exp?.role}</p>
                                       <p className="text-[#274F94] opacity-80 text-[13px] leading-relaxed mb-6 flex-grow font-medium">{exp?.bio}</p>
                                    </>
                                 )}
                                 <div className="flex items-center gap-3 text-white">
                                    <a href={exp?.linkedinUrl || '#'} target="_blank" rel="noreferrer" className="bg-[#274F94] hover:bg-[#8F0810] p-2 rounded-full transition-colors"><FaLinkedinIn size={14} /></a>
                                    <a href={exp?.telegramUrl || '#'} target="_blank" rel="noreferrer" className="bg-[#274F94] hover:bg-[#8F0810] p-2 rounded-full transition-colors"><FaTelegramPlane size={14} /></a>
                                 </div>
                              </div>
                           </div>
                        </SwiperSlide>
                     ))}
                  </Swiper>
               </div>
            </div>
         </section>

         <section id="gallery" className="w-full bg-[#8F0810] py-8 text-center border-b-[4px] border-[#274F94]">
            <p className="text-white font-bold tracking-widest text-xs uppercase">{t.gallPre}</p>
         </section>
         <section className="w-full bg-[#f8f9fc] py-6 flex overflow-hidden">
            <div className="orix-marquee-track flex whitespace-nowrap items-center min-w-max">
               {(galleryQuery.loading ? Array.from({ length: 8 }, (_, index) => ({ id: `loading-${index}` })) : [...galleryMarqueeBase, ...galleryMarqueeBase]).map((item, i) => (
                  <div key={i} className="w-[300px] h-[400px] mx-3 overflow-hidden rounded-xl shadow-md bg-gray-100 flex items-center justify-center">
                     {galleryQuery.loading ? (
                        <div className="w-full h-full bg-[#274F94]/10 animate-pulse"></div>
                     ) : (
                        <img src={item?.imageUrl || IMAGE_PLACEHOLDER} onError={setImageFallback} alt="Gallery" className="w-full h-full object-cover" loading="lazy" />
                     )}
                  </div>
               ))}
            </div>
         </section>

         <section id="partners" className="w-full pt-20 pb-10 bg-white">
            <div className="max-w-[1300px] mx-auto text-center mb-10">
               <p className="text-[#8F0810] font-bold tracking-widest text-xs uppercase mb-3">{t.partPre}</p>
               <h2 className="text-2xl md:text-4xl font-extrabold text-[#274F94]">{t.partTitle}</h2>
            </div>
            <div className="flex overflow-hidden">
               <div className=" orix-marquee-track orix-marquee-track--partners flex whitespace-nowrap items-center min-w-max mb-10">
                  {(partnersQuery.loading ? Array.from({ length: 10 }, (_, index) => ({ id: `loading-${index}` })) : [...partnerMarqueeBase, ...partnerMarqueeBase]).map((partner, i) => (
                     <a key={i} href={partner?.websiteUrl || '#'} target="_blank" rel="noreferrer" className="w-[180px] h-[200px] mx-8  opacity-70 hover:opacity-100 transition-opacity flex items-center justify-center bg-gray-50 h-[100px] rounded-md shadow-sm border border-gray-100">
                        {partnersQuery.loading ? (
                           <div className="w-full h-full bg-[#274F94]/10 animate-pulse rounded-md"></div>
                        ) : (
                           <img src={partner?.logoUrl || IMAGE_PLACEHOLDER} onError={setImageFallback} alt={partner?.name || 'Partner'} className="max-h-full object-contain w-full transition-all" loading="lazy" />
                        )}
                     </a>
                  ))}
               </div>
            </div>
         </section>

         <section id="contact" className="w-full py-20 bg-[#f8f9fc] border-t border-gray-100 pb-10">
            <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row gap-16 md:gap-10 items-center">
               <div className="w-full md:w-1/2">
                  <p className="text-[#8F0810] font-bold tracking-widest text-xs uppercase mb-3">{t.contactPre}</p>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-[#274F94] mb-6">{contactInfo?.title || t.contactTitle}</h2>
                  <div className="text-[14px] text-[#274F94] opacity-80 font-medium space-y-2 mb-8">
                     <p>{contactInfo?.address || '33 Bunyodkor Ave., Block 1, Chilanzar district'}</p>
                  </div>
                  <div className="text-[14px] text-[#274F94] font-medium space-y-2 mb-8">
                     <p>Mail: <a href={`mailto:${contactInfo?.email || 'info@orixglobal.uz'}`} className="text-[#8F0810] underline">{contactInfo?.email || 'info@orixglobal.uz'}</a></p>
                     <p>Tel: {contactInfo?.phoneNumber || '+998 90 000 00 00'}</p>
                  </div>
               </div>

               <div className="w-full md:w-1/2 flex flex-col bg-white p-8 rounded-md shadow-sm border border-gray-100 shrink-0 relative mt-4 md:mt-0 z-10">
                  <h3 className="text-xl font-bold text-[#274F94] mb-6 border-b border-gray-100 pb-4">{t.contactDetails}</h3>
                  <form className="w-full space-y-6" onSubmit={handleContactSubmit}>
                     <div className="flex flex-col md:flex-row gap-6">
                        <div className="w-full md:w-1/2">
                           <label className="text-[13px] font-bold text-[#274F94] block mb-2">{t.fName}</label>
                           <input type="text" name="firstName" value={contactForm.firstName} onChange={handleContactChange} className="w-full border border-gray-300 p-3 rounded-md bg-transparent outline-none focus:border-[#8F0810] transition-colors" />
                        </div>
                        <div className="w-full md:w-1/2">
                           <label className="text-[13px] font-bold text-[#274F94] block mb-2">{t.lName}</label>
                           <input type="text" name="lastName" value={contactForm.lastName} onChange={handleContactChange} className="w-full border border-gray-300 p-3 rounded-md bg-transparent outline-none focus:border-[#8F0810] transition-colors" />
                        </div>
                     </div>
                     <div className="flex flex-col md:flex-row gap-6">
                        <div className="w-full md:w-1/3">
                           <label className="text-[13px] font-bold text-[#274F94] block mb-2">Code *</label>
                           <select name="phoneCode" value={contactForm.phoneCode} onChange={handleContactChange} className="w-full border border-gray-300 p-3 rounded-md bg-transparent outline-none focus:border-[#8F0810] transition-colors text-[#274F94]">
                              <option value="+998">UZ +998</option>
                           </select>
                        </div>
                        <div className="w-full md:w-2/3">
                           <label className="text-[13px] font-bold text-[#274F94] block mb-2">{t.tel}</label>
                           <input type="text" name="phoneNumber" value={contactForm.phoneNumber} onChange={handleContactChange} placeholder="Phone number" className="w-full border border-gray-300 p-3 rounded-md bg-transparent outline-none focus:border-[#8F0810] transition-colors" />
                        </div>
                     </div>
                     <div>
                        <label className="text-[13px] font-bold text-[#274F94] block mb-2">{t.msg}</label>
                        <textarea rows="3" name="message" value={contactForm.message} onChange={handleContactChange} placeholder="..." className="w-full border border-gray-300 p-3 rounded-md bg-transparent outline-none focus:border-[#8F0810] transition-colors resize-none"></textarea>
                     </div>
                     {contactStatus.message && (
                        <div className={`flex items-center gap-2 text-sm font-semibold ${contactStatus.type === 'success' ? 'text-green-600' : 'text-[#8F0810]'}`}>
                           {contactStatus.type === 'success' && <FaCheckCircle />}
                           <span>{contactStatus.message}</span>
                        </div>
                     )}
                     <div className="pt-2">
                        <button type="submit" disabled={contactSubmitting} className="bg-[#8F0810] hover:bg-[#6a060b] disabled:opacity-60 disabled:cursor-not-allowed text-white px-8 py-3 rounded-md font-bold text-sm shadow-md transition-colors w-full">
                           {contactSubmitting ? t.sending : t.submit}
                        </button>
                     </div>
                  </form>
               </div>
            </div>

            {/* MAP - Placed directly under the contact section */}
            <Maps className='z-0' />
         </section>

      </div>
   );
};

export default Home;
