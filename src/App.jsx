import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './Pages/Navbar/Navbar';
import Footer from './Pages/Footer/Footer';
import Home from './Pages/Home/Home';
import Universities from './Pages/Universities/Universities';
import Single_university from './Pages/Universities/Single_university';
import Events from './Pages/Events/Events';
import News from './Pages/News/News';
import Single_news from './Pages/News/Single_news';
import Booking from './Pages/Booking/Booking';

// A reusable animated wrapper for the dry test pages
const PageWrapper = ({ title, bgColor, textColor = 'text-white' }) => {
  return (
    <div
      className={`w-full min-h-[85vh] flex flex-col items-center justify-center ${textColor}`}
      style={{ backgroundColor: bgColor }}
    >
      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight drop-shadow-xl">{title}</h1>
      <p className="mt-6 text-xl md:text-2xl font-medium opacity-80">Test Page</p>
    </div>
  );
};

const PageTransitionWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -15 }}
    transition={{ duration: 0.4 }}
    className="w-full"
  >
    {children}
  </motion.div>
);

const App = () => {
  const location = useLocation();

  return (
    <div className='w-full min-h-screen flex flex-col font-sans overflow-x-hidden bg-gray-50'>
      <Navbar />

      <div className='flex-grow pt-[80px]'> {/* Padding to offset fixed navbar */}
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransitionWrapper><Home /></PageTransitionWrapper>} />
            
            {/* Real pages */}
            <Route path="/events" element={<PageTransitionWrapper><Events /></PageTransitionWrapper>} />
            <Route path="/news" element={<PageTransitionWrapper><News /></PageTransitionWrapper>} />
            <Route path="/news/:slug" element={<PageTransitionWrapper><Single_news /></PageTransitionWrapper>} />
            <Route path="/single_news" element={<PageTransitionWrapper><Single_news /></PageTransitionWrapper>} />
            <Route path="/universities" element={<PageTransitionWrapper><Universities /></PageTransitionWrapper>} />
            <Route path="/single_university" element={<PageTransitionWrapper><Single_university /></PageTransitionWrapper>} />
            <Route path="/booking" element={<PageTransitionWrapper><Booking /></PageTransitionWrapper>} />

            <Route path="*" element={<PageTransitionWrapper><PageWrapper title="404 - Not Found" bgColor="#1e293b" /></PageTransitionWrapper>} />
          </Routes>
        </AnimatePresence>
      </div>

      <Footer />
    </div>
  );
};

export default App;
