import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPhoneCall, FiMenu, FiX, FiGlobe } from 'react-icons/fi';
import logo from './Images/logo.png';
import logo_3 from './Images/logo 2.png';
import logo_2 from './Images/logo_3.png';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeHash, setActiveHash] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const lang = localStorage.getItem('lang') || 'en';

  const t = {
    uz: {
      home: "Bosh sahifa", about: "Biz haqimizda", universities: "Universitetlar", team: "Jamoa",
      gallery: "Galereya", partners: "Hamkorlar", contact: "Aloqa", events: "Tadbirlar", news: "Yangiliklar",
      bookBtn: "Uchrashuv belgilash"
    },
    ru: {
      home: "Главная", about: "О нас", universities: "Университеты", team: "Команда",
      gallery: "Галерея", partners: "Партнеры", contact: "Контакты", events: "События", news: "Новости",
      bookBtn: "Консультация"
    },
    en: {
      home: "Home", about: "About", universities: "Universities", team: "Team",
      gallery: "Gallery", partners: "Partners", contact: "Contact", events: "Events", news: "News",
      bookBtn: "Book Consultation"
    }
  }[lang];

  const navLinks = [
    { title: t.home, path: '#home' },
    { title: t.about, path: '#about' },
    { title: t.universities, path: '#universities' },
    { title: t.team, path: '#team' },
    { title: t.gallery, path: '#gallery' },
    // { title: t.partners, path: '#partners' },
    { title: t.events, path: 'events' },
    { title: t.news, path: 'news' },
    { title: t.contact, path: '#contact' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      if (location.pathname === '/') {
        const sections = navLinks.filter(link => link.path.startsWith('#')).map(link => link.path.substring(1));
        let currentActive = '';
        for (let section of sections) {
          const element = document.getElementById(section);
          if (element) {
            const rect = element.getBoundingClientRect();
            if (rect.top <= 100 && rect.bottom >= 100) {
              currentActive = `#${section}`;
            }
          }
        }
        if (currentActive !== activeHash) setActiveHash(currentActive);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname, activeHash]);

  useEffect(() => {
     if(location.pathname === '/' && !location.hash) {
       setActiveHash('#home');
     } else if (location.hash) {
       setActiveHash(location.hash);
     } else {
       setActiveHash('');
     }
  }, [location.pathname, location.hash]);

  const handleNavClick = (e, path) => {
    e.preventDefault();
    setIsOpen(false);

    if (!path.startsWith('#')) {
      navigate(`/${path.replace(/^\//, '')}`);
      return;
    }

    if (location.pathname !== '/') {
      navigate(`/${path}`);
    } else {
      const element = document.querySelector(path);
      if (element) {
        const offset = 80;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = element.getBoundingClientRect().top;
        const offsetPosition = (elementRect - bodyRect) - offset;

        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        window.history.pushState(null, '', path);
        setActiveHash(path);
      } else if (path === '#home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        window.history.pushState(null, '', '/');
        setActiveHash('#home');
      }
    }
  };

  const handleLangChange = (e) => {
    localStorage.setItem('lang', e.target.value); 
    window.location.reload();
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-md py-3' : 'bg-white shadow-sm py-4 md:py-6'}`}
    >
      <div className="max-w-[1400px] mx-auto px-4 md:px-10 flex justify-between items-center w-full">
        {/* Logo */}
        <Link to="/" onClick={(e) => handleNavClick(e, '#home')} className="flex items-center gap-2 relative z-50 shrink-0">
          <div className="relative flex items-center justify-center">
             <img src={logo_2} alt="Orix Global" className="max-h-[35px] md:max-h-[45px] object-contain" />
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden xl:flex items-center gap-8">
          <ul className="flex items-center gap-6">
            {navLinks.map((link, index) => {
              const isOnOtherPage = location.pathname !== '/' && !link.path.startsWith('#') && location.pathname.includes(link.path);
              const isActive = (location.pathname === '/' && activeHash === link.path) || isOnOtherPage;
              return (
                <li key={index} className="relative">
                  <a
                    href={link.path}
                    onClick={(e) => handleNavClick(e, link.path)}
                    className={`relative px-1 py-2 text-[13px] md:text-sm font-bold tracking-wide transition-colors duration-300 ${isActive ? 'text-[#8F0810]' : 'text-[#274F94] hover:text-[#8F0810]'}`}
                  >
                    {link.title}
                  </a>
                  {isActive && (
                    <motion.div layoutId="activeTab" className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[#8F0810] rounded-t-md mx-auto w-[60%]" />
                  )}
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-5">
            {/* Language Switcher */}
            <div className="flex items-center gap-1.5 text-[#274F94] border border-gray-200 px-3 py-1.5 rounded-full shadow-sm bg-gray-50">
               <FiGlobe size={16} />
               <select 
                 value={lang} 
                 onChange={handleLangChange}
                 className="bg-transparent font-bold text-sm outline-none cursor-pointer uppercase"
               >
                 <option value="uz">UZ</option>
                 <option value="ru">RU</option>
                 <option value="en">EN</option>
               </select>
            </div>

            {/* Action Button */}
            <Link to="/booking">
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 bg-[#8F0810] hover:bg-[#6a060b] text-white px-7 py-2.5 rounded-md font-bold transition-all shadow-md text-sm md:text-base shrink-0"
              >
                <span>{t.bookBtn}</span>
              </motion.button>
            </Link>
          </div>
        </div>

        {/* Mobile Toggle & Language */}
        <div className="xl:hidden flex items-center gap-3 relative z-50">
          <div className="flex items-center gap-1.5 text-[#274F94]">
             <FiGlobe size={16} />
             <select 
               value={lang} 
               onChange={handleLangChange}
               className="bg-transparent font-bold text-sm outline-none cursor-pointer uppercase"
             >
               <option value="uz">UZ</option>
               <option value="ru">RU</option>
               <option value="en">EN</option>
             </select>
          </div>
          <button
            className="text-[#274F94] p-2 hover:bg-slate-100 rounded-full transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <FiX size={28} /> : <FiMenu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: '100dvh' }} 
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="xl:hidden fixed top-0 left-0 w-full bg-white flex flex-col pt-[80px] z-40 overflow-hidden"
          >
            <ul className="flex flex-col px-6 py-4 gap-1 h-full overflow-y-auto pb-[120px] custom-scrollbar">
               {navLinks.map((link, index) => {
                 const isOnOtherPage = location.pathname !== '/' && !link.path.startsWith('#') && location.pathname.includes(link.path);
                 const isActive = (location.pathname === '/' && activeHash === link.path) || isOnOtherPage;
                 return (
                  <motion.li
                    key={index}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <a
                      href={link.path}
                      onClick={(e) => handleNavClick(e, link.path)}
                      className={`block py-3 text-xl font-bold border-b border-gray-100 transition-colors ${isActive ? 'text-[#8F0810]' : 'text-[#274F94]'}`}
                    >
                      {link.title}
                    </a>
                  </motion.li>
                 );
              })}
              <motion.li
                className="pt-6 pb-20 w-full"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: navLinks.length * 0.05 }}
              >
                <Link to="/booking" onClick={() => setIsOpen(false)} className="block w-full">
                  <button className="flex w-full justify-center items-center gap-2 bg-[#8F0810] text-white px-6 py-4 rounded-md font-bold text-lg shadow-md">
                    <FiPhoneCall size={20} />
                    <span>{t.bookBtn}</span>
                  </button>
                </Link>
              </motion.li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;