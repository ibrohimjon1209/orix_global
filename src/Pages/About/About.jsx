import React from 'react';
import { motion } from 'framer-motion';
import { FaLinkedinIn, FaTelegramPlane } from 'react-icons/fa';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

import studyAbroadImg from '../Home/Images/study_abroad.png';

const About = () => {
  const fadeIn = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const experts = [
    { name: 'Khalilullo Isomiddinov', role: 'Director and Co-owner', img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80', desc: "I've been in the education field for 8 years now. With a bachelor's from the University of Sunderland (UK), I guide students in choosing the right major for studying abroad. As a consultant at ORIX GLOBAL, I help students reach their academic goals." },
    { name: 'Saidakhmad Makhmudov', role: 'Chief Executive Officer', img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80', desc: "As CEO of ORIX GLOBAL, I'm committed to guiding students worldwide through the maze of university selection and visa processes. With degrees from Central Queensland University, I lead our team in building futures." },
    { name: 'Abdurakhmon Kodirov', role: 'Assistant General Manager', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80', desc: "I thoroughly enjoy my role at ORIX GLOBAL, where I take great pleasure in assisting applicants in realizing their dreams. Working here brings me immense satisfaction, watching students obtain their visas." },
    { name: 'Malika Toshmatova', role: 'Senior Consultant', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80', desc: "Assisting students with South Korean universities is my expertise. From document collection to interview prep, I ensure every student has the highest chance of success." },
    { name: 'Asilbek Alimov', role: 'Consultant', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80', desc: "With multiple years of consulting under my belt, I strive to make sure every student finds their dream university across Europe and Asia without hassle." },
    { name: 'Aziz Toshmatov', role: 'Visa Support', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80', desc: "I assist students exclusively with their visa documentation, reducing the risk of rejection significantly. Welcome to ORIX Global Consulting." }
  ];

  const partners = [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Inha_University_logo.svg/1200px-Inha_University_logo.svg.png",
    "https://upload.wikimedia.org/wikipedia/en/thumb/f/fa/University_of_Sunderland_logo.svg/1200px-University_of_Sunderland_logo.svg.png",
    "https://upload.wikimedia.org/wikipedia/en/thumb/9/91/CQUniversity_logo.svg/1200px-CQUniversity_logo.svg.png",
    "https://upload.wikimedia.org/wikipedia/en/thumb/9/9f/Macquarie_University_logo.svg/1200px-Macquarie_University_logo.svg.png",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/University_of_Technology_Sydney_logo.svg/1200px-University_of_Technology_Sydney_logo.svg.png"
  ];

  const galleryImages = [
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1519452314545-56cbcd3eb606?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1525926572186-c46ca3b6e82c?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=800&auto=format&fit=crop&q=80",
  ];

  return (
    <div className="w-full bg-white font-sans pt-24 overflow-hidden">
      
      {/* 1. ABOUT US SECTION */}
      <section className="w-full py-20 bg-white">
         <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center gap-16 px-6 lg:px-12">
            <motion.div initial={{ opacity:0, x: -50 }} animate={{ opacity:1, x:0 }} transition={{ duration: 0.7 }} className="w-full lg:w-1/2 relative h-[500px] md:h-[600px]">
               <img src={studyAbroadImg} alt="Study Abroad" className="w-full h-full object-cover rounded-2xl shadow-xl" />
            </motion.div>
            <motion.div initial={{ opacity:0, x: 50 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.2, duration: 0.7 }} className="w-full lg:w-1/2">
               <p className="text-[#9f5aff] font-bold tracking-widest text-sm uppercase mb-4">Orix Global Consulting</p>
               <h2 className="text-4xl md:text-5xl font-extrabold text-[#111827] mb-8 leading-tight">
                 Leading You Towards a <br/> Brighter Future
               </h2>
               <p className="text-gray-600 text-base md:text-lg mb-6 leading-relaxed">
                 Founded in 2021 in Uzbekistan, ORIX GLOBAL, operating under the brand name Orix Global Consulting, is an education consulting company providing professional guidance to students pursuing international education. We collaborate with leading global education institutions to support students throughout the university application...
               </p>
               <p className="text-gray-600 text-base md:text-lg mb-12 leading-relaxed">
                 Our team of experienced education specialists, fluent in English, Korean, Russian, and Uzbek, includes certified professionals ensuring compliance with international education standards.
               </p>
            </motion.div>
         </div>
      </section>

      {/* 2. INFINITE MARQUEE (GALLERY / RASMLAR) */}
      <section className="w-full py-20 bg-gray-50 overflow-hidden">
         <div className="max-w-[1400px] mx-auto text-center mb-10 px-6">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#111827]">Our Gallery & Moments</h2>
            <div className="w-12 h-1 bg-[#9f5aff] mx-auto mt-4"></div>
         </div>
         <div className="flex">
            <motion.div 
               animate={{ x: [0, -1500] }}
               transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
               className="flex whitespace-nowrap items-center min-w-max"
            >
               {[...galleryImages, ...galleryImages].map((imgUrl, i) => (
                  <div key={i} className="w-[400px] h-[250px] mx-4 rounded-xl overflow-hidden shadow-lg">
                     <img src={imgUrl} alt="Gallery Post" className="w-full h-full object-cover" />
                  </div>
               ))}
            </motion.div>
         </div>
      </section>

      {/* 3. TEAM / MEET OUR EXPERTS */}
      <section className="w-full py-24 bg-white px-6">
         <div className="max-w-[1400px] mx-auto text-center">
            <motion.p initial="hidden" whileInView="visible" viewport={{ once:true }} variants={fadeIn} className="text-[#9f5aff] font-bold tracking-widest text-sm uppercase mb-4">Team</motion.p>
            <motion.h2 initial="hidden" whileInView="visible" viewport={{ once:true }} transition={{ delay: 0.2 }} variants={fadeIn} className="text-3xl md:text-5xl font-extrabold text-[#111827] mb-16 flex flex-col items-center">
              Meet Our Experts
              <div className="w-12 h-1 bg-black mt-6"></div>
            </motion.h2>

            <div className="relative max-w-[1200px] mx-auto">
               <Swiper
                  modules={[Navigation, Autoplay]}
                  spaceBetween={30}
                  slidesPerView={1}
                  navigation={{
                    nextEl: '.swiper-btn-next-about',
                    prevEl: '.swiper-btn-prev-about',
                  }}
                  autoplay={{
                    delay: 3000,
                    disableOnInteraction: false,
                  }}
                  breakpoints={{
                    768: { slidesPerView: 2 },
                    1024: { slidesPerView: 3 }, // 3 tadan ko'rinish
                  }}
                  className="pb-16"
               >
                 {experts.map((exp, i) => (
                    <SwiperSlide key={i}>
                       <div className="bg-white rounded-xl overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.05)] border border-gray-100 flex flex-col text-left h-full group hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-shadow">
                          <div className="h-[320px] w-full overflow-hidden">
                             <img src={exp.img} alt={exp.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          </div>
                          <div className="p-8 flex flex-col grow">
                             <h4 className="text-xl font-bold text-[#111827] mb-1">{exp.name}</h4>
                             <p className="text-[#9f5aff] font-semibold text-sm mb-6">{exp.role}</p>
                             <p className="text-gray-600 text-[13px] leading-relaxed mb-6 flex-grow">{exp.desc}</p>
                             <div className="flex items-center gap-4 text-gray-800">
                                <a href="#" className="hover:text-[#9f5aff] transition-colors"><FaLinkedinIn size={18} /></a>
                                <a href="#" className="hover:text-[#9f5aff] transition-colors"><FaTelegramPlane size={18} /></a>
                             </div>
                          </div>
                       </div>
                    </SwiperSlide>
                 ))}
               </Swiper>

               {/* O'ng va chap Navigatsiya tugmalari */}
               <div className="absolute top-1/2 -translate-y-1/2 -left-4 md:-left-16 z-10 swiper-btn-prev-about cursor-pointer text-[#9f5aff] hover:text-[#7f3de6] bg-white border border-[#9f5aff] w-12 h-12 flex items-center justify-center rounded-full shadow-lg">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
               </div>
               <div className="absolute top-1/2 -translate-y-1/2 -right-4 md:-right-16 z-10 swiper-btn-next-about cursor-pointer text-[#9f5aff] hover:text-[#7f3de6] bg-white border border-[#9f5aff] w-12 h-12 flex items-center justify-center rounded-full shadow-lg">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
               </div>
            </div>
         </div>
      </section>

      {/* 4. INFINITE MARQUEE (PARTNERS) */}
      <section className="w-full py-16 bg-gray-50 overflow-hidden border-t border-gray-100">
         <div className="max-w-[1400px] mx-auto text-center mb-8 px-6">
            <h2 className="text-3xl font-bold text-gray-800">Our Trusted Partners</h2>
         </div>
         <div className="flex">
            <motion.div 
               animate={{ x: [0, -1035] }}
               transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
               className="flex whitespace-nowrap items-center min-w-max"
            >
               {[...partners, ...partners, ...partners].map((logo, i) => (
                  <div key={i} className="w-[250px] mx-10 px-4 filter grayscale hover:grayscale-0 transition-all opacity-60 hover:opacity-100">
                     <img src={logo} alt="Partner" className="max-h-[60px] object-contain w-full" />
                  </div>
               ))}
            </motion.div>
         </div>
      </section>

    </div>
  );
};

export default About;