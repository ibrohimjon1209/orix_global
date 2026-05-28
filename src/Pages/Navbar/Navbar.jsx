import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPhoneCall, FiMenu, FiX, FiGlobe, FiSearch } from 'react-icons/fi';
import logo from './Images/logo.png';
import logo_3 from './Images/logo 2.png';
import logo_2 from './Images/logo_3.png';
import { homeApi } from '../../api/api';
import { localizeItem } from '../../utils/localization';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeHash, setActiveHash] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [allUniversities, setAllUniversities] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);
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

  const loadUniversities = useCallback(async () => {
    if (allUniversities.length > 0) return;
    setSearchLoading(true);
    try {
      const data = await homeApi.getUniversities();
      setAllUniversities(Array.isArray(data) ? data : []);
    } catch { }
    finally { setSearchLoading(false); }
  }, [allUniversities.length]);

  const openSearch = () => {
    setSearchOpen(true);
    loadUniversities();
    setTimeout(() => searchInputRef.current?.focus(), 80);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery('');
  };

  useEffect(() => {
    if (!searchOpen) return;
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) closeSearch();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchOpen]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.trim().toLowerCase();
    return allUniversities
      .map((u) => localizeItem(u, ['name', 'location', 'cityName'], lang))
      .filter((u) => (u?.name || '').toLowerCase().includes(query))
      .slice(0, 8);
  }, [allUniversities, searchQuery, lang]);

  const searchPlaceholder = { uz: 'Universitet qidirish...', ru: 'Поиск университетов...', en: 'Search universities...' }[lang];
  const notFound = { uz: 'Topilmadi', ru: 'Не найдено', en: 'Not found' }[lang];

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
        {/* Logo - always visible, above search overlay */}
        <Link to="/" onClick={(e) => handleNavClick(e, '#home')} className="flex items-center gap-2 relative z-[60] shrink-0">
          <div className="relative flex items-center justify-center">
            <img src={logo_2} alt="Orix Global" className="max-h-[35px] md:max-h-[45px] object-contain" />
          </div>
        </Link>

        {/* Desktop: flex-1 area hosts both nav and search overlay */}
        <div className="hidden xl:flex flex-1 justify-end items-center relative">

          {/* Normal nav - fades out when search opens */}
          <motion.div
            animate={{ opacity: searchOpen ? 0 : 1 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-8"
            style={{ pointerEvents: searchOpen ? 'none' : 'auto' }}
          >
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

            <div className="flex items-center gap-4">
              {/* Search icon */}
              <button onClick={openSearch} className="text-[#274F94] hover:text-[#8F0810] transition-colors p-1.5">
                <FiSearch size={20} />
              </button>

              {/* Language Switcher */}
              <div className="flex items-center gap-1.5 text-[#274F94] border border-gray-200 px-3 py-1.5 rounded-full shadow-sm bg-gray-50">
                <FiGlobe size={16} />
                <select value={lang} onChange={handleLangChange} className="bg-transparent font-bold text-sm outline-none cursor-pointer uppercase">
                  <option value="uz">UZ</option>
                  <option value="ru">RU</option>
                  <option value="en">EN</option>
                </select>
              </div>

              {/* Book button */}
              <Link to="/booking">
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 bg-[#8F0810] hover:bg-[#6a060b] text-white px-7 py-2.5 rounded-md font-bold transition-all shadow-md text-sm md:text-base shrink-0"
                >
                  <span>{t.bookBtn}</span>
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* Search overlay - covers the flex-1 area, slides in from right */}
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                ref={searchRef}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="absolute inset-0 flex items-center bg-white z-10 gap-3 pl-6"
              >
                <FiSearch size={20} className="text-[#274F94] opacity-40 shrink-0" />
                <input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="flex-1 text-[16px] font-medium text-[#274F94] outline-none bg-transparent placeholder-[#274F94]/35"
                />
                <button onClick={closeSearch} className="text-[#274F94] hover:text-[#8F0810] transition-colors p-1.5 shrink-0">
                  <FiX size={22} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Toggle & Language */}
        <div className="xl:hidden flex items-center gap-3 relative z-50">
          <div className="flex items-center gap-1.5 text-[#274F94]">
            <FiGlobe size={16} />
            <select value={lang} onChange={handleLangChange} className="bg-transparent font-bold text-sm outline-none cursor-pointer uppercase">
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

      {/* Search results - full width panel below navbar */}
      <AnimatePresence>
        {searchOpen && searchQuery.trim() && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="absolute top-full left-0 right-0 bg-white shadow-2xl border-t border-gray-100 z-[55] max-h-[380px] overflow-y-auto"
          >
            <div className="max-w-[1400px] mx-auto px-4 md:px-10 py-2">
              {searchLoading ? (
                <div className="py-6 text-center text-[#274F94] text-sm opacity-50">...</div>
              ) : searchResults.length === 0 ? (
                <div className="py-6 text-center text-[#274F94] opacity-50 text-sm">{notFound}</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-1 py-2">
                  {searchResults.map((uni, i) => (
                    <button
                      key={uni?.id || i}
                      onClick={() => {
                        navigate('/single_university', { state: { citySlug: uni?.citySlug, cityName: uni?.cityName || uni?.location } });
                        closeSearch();
                      }}
                      className="text-left px-4 py-3 rounded-lg hover:bg-[#f8f9fc] flex flex-col transition-colors"
                    >
                      <span className="font-semibold text-[#274F94] text-sm line-clamp-1">{uni?.name}</span>
                      {(uni?.cityName || uni?.location) && (
                        <span className="text-[11px] text-[#274F94] opacity-45 mt-0.5">{uni?.cityName || uni?.location}</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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