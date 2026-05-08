import { FaLinkedinIn, FaTelegramPlane, FaFacebookF, FaInstagram } from 'react-icons/fa';
import { FiPhoneCall, FiMail, FiMapPin, FiArrowRight } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { homeApi } from '../../api/api';
import { useApiResource } from '../../hooks/useApiResource';
import { getCurrentLang, localizeItem } from '../../utils/localization';
import logo from '../Navbar/Images/logo.png';

const Footer = () => {
  const navigate = useNavigate();
  const lang = getCurrentLang();
  const footerQuery = useApiResource(homeApi.getFooter);
  const contactInfoQuery = useApiResource(homeApi.getContactInfo);

  const t = {
    uz: {
      desc: "Orix Global Consulting - Janubiy Koreyaning nufuzli universitetlariga kirishda sizning ishonchli ta'lim agentligingiz. Biz orqali kelajagingizni quring.",
      quickLinks: "Tezkor havolalar",
      contact: "Biz bilan bog'lanish",
      readyTitle: "Boshlashga tayyormisiz?",
      readyDesc: "Koreya universitetlaridan joyingizni naqd qilish uchun mutaxassislarimiz bilan uchrashuv belgilang.",
      bookBtn: "Uchrashuv belgilash",
      copy: "Orix Global Consulting. Barcha huquqlar himoyalangan.",
      home: "Bosh sahifa", about: "Biz haqimizda", universities: "Universitetlar", events: "Tadbirlar", news: "Yangiliklar",
      address: "Chilonzor tumani, Bunyodkor 33-uy, 1-blok, Toshkent 100135"
    },
    ru: {
      desc: "Orix Global Consulting — ваше ведущее образовательное агентство, обеспечивающее беспрепятственное поступление в ведущие университеты Южной Кореи.",
      quickLinks: "Быстрые ссылки",
      contact: "Свяжитесь с нами",
      readyTitle: "Готовы начать?",
      readyDesc: "Запишитесь на консультацию к нашей команде экспертов, чтобы зарезервировать место в корейском университете.",
      bookBtn: "Консультация",
      copy: "Orix Global Consulting. Все права защищены.",
      home: "Главная", about: "О нас", universities: "Университеты", events: "События", news: "Новости",
      address: "пр. Бунёдкор 33, Блок 1, Чиланзарский р-н, Ташкент 100135"
    },
    en: {
      desc: "Orix Global Consulting is a leading education agency facilitating seamless pathways to premier South Korean Universities. We guarantee a brighter future through expert guidance.",
      quickLinks: "Quick Links",
      contact: "Contact Us",
      readyTitle: "Ready to Start?",
      readyDesc: "Book a consultation directly with our expert team to secure your place in a Korean university.",
      bookBtn: "Book Online",
      copy: "Orix Global Consulting. All rights reserved.",
      home: "Home", about: "About Us", universities: "Universities", events: "Events", news: "Latest News",
      address: "33 Bunyodkor Ave., Block 1, Chilanzar district, Tashkent 100135"
    }
  }[lang];

  const footerData =
    footerQuery.data?.is_active === false
      ? null
      : localizeItem(footerQuery.data, ['content'], lang);

  const footerContent = footerData?.content || t.desc;
  const contactInfo =
    contactInfoQuery.data?.is_active === false
      ? null
      : localizeItem(contactInfoQuery.data, ['address'], lang);

  return (
    <footer className="w-full bg-[#274F94] font-sans pt-16 pb-6 text-white overflow-hidden relative border-t-[8px] border-[#8F0810]">
      {/* Decorative large logo fade in background */}
      <div className="absolute top-[-50px] right-[-50px] text-[150px] font-extrabold opacity-5 select-none text-white leading-none">
         ORIX <br/> GLOBAL
      </div>

      <div className="max-w-[1300px] mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          
          {/* Column 1: About Setup */}
          <div className="flex flex-col gap-5 lg:pr-8">
            <div className="flex items-center gap-2 bg-white/10 p-2 rounded-md w-fit">
               {/* Adding a light layer to make dark logo visible if logo is dark, but text fallback just in case */}
               <img src={logo} alt="Orix Global" className="max-h-[35px] object-contain invert brightness-0" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
               <span className="hidden text-2xl font-extrabold tracking-tight text-white drop-shadow-md">ORIX <span className="text-[#8F0810]">GLOBAL</span></span>
            </div>
            <p className="text-gray-300 text-[13px] leading-relaxed font-medium mt-2">
              {footerQuery.loading ? '...' : footerContent}
            </p>
            <div className="flex items-center gap-3 mt-4">
               <a href={footerData?.facebookUrl || '#'} target="_blank" rel="noreferrer" className="bg-white/10 hover:bg-[#8F0810] text-white p-2.5 rounded-full transition-colors"><FaFacebookF size={16} /></a>
               <a href={footerData?.instagramUrl || '#'} target="_blank" rel="noreferrer" className="bg-white/10 hover:bg-[#8F0810] text-white p-2.5 rounded-full transition-colors"><FaInstagram size={16} /></a>
               <a href={footerData?.telegramUrl || '#'} target="_blank" rel="noreferrer" className="bg-white/10 hover:bg-[#8F0810] text-white p-2.5 rounded-full transition-colors"><FaTelegramPlane size={16} /></a>
               <a href={footerData?.linkedinUrl || '#'} target="_blank" rel="noreferrer" className="bg-white/10 hover:bg-[#8F0810] text-white p-2.5 rounded-full transition-colors"><FaLinkedinIn size={16} /></a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col gap-5 mt-2 lg:mt-0">
             <h3 className="text-xl font-bold border-b-2 border-[#8F0810] pb-2 inline-block w-fit mb-2">{t.quickLinks}</h3>
             <ul className="flex flex-col gap-3 font-medium text-gray-300">
               <li><a href="/#about" className="hover:text-white hover:translate-x-1 transition-all flex items-center gap-2"><FiArrowRight size={14}/> {t.about}</a></li>
               <li><a href="/#universities" className="hover:text-white hover:translate-x-1 transition-all flex items-center gap-2"><FiArrowRight size={14}/> {t.universities}</a></li>
               <li><Link to="/events" className="hover:text-white hover:translate-x-1 transition-all flex items-center gap-2"><FiArrowRight size={14}/> {t.events}</Link></li>
               <li><Link to="/news" className="hover:text-white hover:translate-x-1 transition-all flex items-center gap-2"><FiArrowRight size={14}/> {t.news}</Link></li>
             </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div className="flex flex-col gap-5 mt-2 lg:mt-0">
             <h3 className="text-xl font-bold border-b-2 border-[#8F0810] pb-2 inline-block w-fit mb-2">{t.contact}</h3>
             <ul className="flex flex-col gap-4 font-medium text-gray-300">
               <li className="flex items-start gap-3">
                 <FiMapPin size={20} className="text-[#8F0810] mt-1 shrink-0" />
                 <span className="text-sm">{contactInfo?.address || t.address}</span>
               </li>
               <li className="flex items-center gap-3">
                 <FiPhoneCall size={18} className="text-[#8F0810] shrink-0" />
                 <span className="text-sm">{contactInfo?.phoneNumber || '+998 90 000 00 00'}</span>
               </li>
               <li className="flex items-center gap-3">
                 <FiMail size={18} className="text-[#8F0810] shrink-0" />
                 <a href={`mailto:${contactInfo?.email || 'info@orixglobal.uz'}`} className="text-sm hover:text-white transition-colors">{contactInfo?.email || 'info@orixglobal.uz'}</a>
               </li>
             </ul>
          </div>

          {/* Column 4: Newsletter / Booking */}
          <div className="flex flex-col gap-5 mt-2 lg:mt-0 bg-white/5 p-6 rounded-md border border-white/10">
             <h3 className="text-lg font-bold text-white mb-2">{t.readyTitle}</h3>
             <p className="text-gray-300 text-sm font-medium mb-4">{t.readyDesc}</p>
             <button 
               onClick={() => { window.scrollTo(0,0); navigate('/booking'); }}
               className="w-full bg-[#8F0810] hover:bg-[#6a060b] py-3 rounded-md font-bold transition-colors shadow-md"
             >
               {t.bookBtn}
             </button>
          </div>

        </div>

        {/* Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-6 border-t border-white/10 text-gray-400 text-xs font-semibold gap-4 md:gap-0">
           <p>© {new Date().getFullYear()} {t.copy}</p>
           <div className="flex items-center gap-6">
              <a href="https://t.me/nsd_corporation" target="_blank" rel="noreferrer" className="  gap-[5px] inline-flex items-center opacity-80 hover:opacity-100 transition-opacity">
                <h1 className='font-inter text-white font-[600] text-[16px]'>Powered by</h1>
                <img src="/nsd_logo.png" alt="NSD Corporation" className="h-12 w-auto object-contain" />
              </a>
           </div>
        </div>
      </div>
    </footer>
  );
};  

export default Footer;
