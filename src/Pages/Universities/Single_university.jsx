import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { homeApi } from '../../api/api';
import { useApiResource } from '../../hooks/useApiResource';
import { getCurrentLang, localizeItem } from '../../utils/localization';

const IMAGE_PLACEHOLDER =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="900" height="700" viewBox="0 0 900 700"%3E%3Crect width="900" height="700" fill="%23f1f5f9"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="38" font-weight="700" fill="%23274F94"%3EOrix Global%3C/text%3E%3C/svg%3E';

const normalizeList = (data) => (Array.isArray(data) ? data : []);

const setImageFallback = (event) => {
  event.currentTarget.onerror = null;
  event.currentTarget.src = IMAGE_PLACEHOLDER;
};

const Single_university = () => {
  const location = useLocation();
  const lang = getCurrentLang();
  const citySlug = location.state?.citySlug;
  const selectedCity = location.state?.cityName || location.state?.city || 'Universitetlar';

  const t = {
    uz: { uniTitle: "Universitetlar", visit: "Saytga kirish", rank: "Reyting", empty: "Bu shahar uchun universitetlar topilmadi.", fakeDesc: "Bu universitet haqida batafsil ma'lumot tez orada qo'shiladi." },
    ru: { uniTitle: "Университеты", visit: "Вебсайт", rank: "Рейтинг", empty: "Для этого города университеты не найдены.", fakeDesc: "Подробная информация об этом университете скоро будет добавлена." },
    en: { uniTitle: "Universities", visit: "Visit Website", rank: "Rank", empty: "No universities found for this city.", fakeDesc: "Detailed information about this university will be added soon." },
  }[lang];

  const universitiesQuery = useApiResource(homeApi.getUniversities);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const universities = useMemo(
    () =>
      normalizeList(universitiesQuery.data)
        .filter((university) => (!citySlug ? true : university?.citySlug === citySlug))
        .map((university) => localizeItem(university, ['name', 'location', 'cityName', 'about'], lang))
        .sort((a, b) => (a?.rank ?? 9999) - (b?.rank ?? 9999)),
    [universitiesQuery.data, citySlug, lang]
  );

  return (
    <div className="w-full min-h-screen bg-[#f8f9fc] py-24 px-4 md:px-8 font-sans">
      <div className="max-w-[1400px] mx-auto mt-6">
        <div className="text-center mb-16">
          <p className="text-[#8F0810] font-bold tracking-widest text-[11px] md:text-sm uppercase mb-2">{t.uniTitle}</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#274F94]">{selectedCity}</h1>
          <div className="w-10 h-1 bg-[#274F94] mx-auto mt-4 rounded-full"></div>
        </div>

        {universitiesQuery.loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="bg-white rounded-[16px] border border-gray-100 shadow-sm h-[350px] animate-pulse"></div>
            ))}
          </div>
        ) : universities.length === 0 ? (
          <p className="text-[#274F94] opacity-70 text-center font-semibold">{t.empty}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {universities.map((uni, index) => (
              <motion.div
                key={uni?.id || uni?.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (index % 10) * 0.05 }}
                className="bg-white rounded-[16px] border border-gray-100 shadow-sm hover:shadow-lg transition-all flex flex-col sm:flex-row xl:flex-col overflow-hidden h-[300px] xl:h-[350px]"
              >
                <div className="w-full sm:w-[40%] xl:w-full h-[150px] sm:h-full xl:h-[160px] bg-gray-200 shrink-0">
                  <img src={uni?.imageUrl || IMAGE_PLACEHOLDER} onError={setImageFallback} alt={uni?.name} className="w-full h-full object-cover" loading="lazy" />
                </div>

                <div className="p-4 md:p-5 flex flex-col grow justify-between bg-white w-full sm:w-[60%] xl:w-full">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-[#274F94] opacity-80 text-[11px] md:text-xs font-semibold truncate xl:max-w-[120px]">{uni?.location || uni?.cityName}</p>
                    {uni?.rank && (
                      <div className="flex items-center gap-1.5 shrink-0 bg-white border border-orange-200 px-2 py-0.5 rounded-full shadow-sm">
                        <img src="/qs small new.png" alt="QS" className="h-[18px] w-[18px] object-contain rounded-[3px]" />
                        <span className="font-bold text-[#274F94] text-[11px]">#{uni.rank}</span>
                      </div>
                    )}
                  </div>

                  <h3 className="text-[16px] md:text-[18px] font-bold text-[#274F94] leading-tight mb-2 line-clamp-2">
                    {uni?.name}
                  </h3>
                  <p className="text-[11px] text-[#274F94] opacity-55 leading-relaxed mb-3 line-clamp-2 flex-grow">
                    {uni?.about || t.fakeDesc}
                  </p>

                  <div className="flex items-center gap-2 mt-auto">
                    <a href={uni?.websiteUrl || '#'} target="_blank" rel="noreferrer" className="bg-[#8F0810] hover:bg-[#6a060b] text-white flex-1 text-[11px] font-bold py-2 rounded-full flex justify-center items-center gap-1 transition-colors">
                      {t.visit}
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Single_university;
