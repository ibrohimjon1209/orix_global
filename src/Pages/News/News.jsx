import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiChevronRight } from 'react-icons/fi';
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

const News = () => {
  const navigate = useNavigate();
  const lang = getCurrentLang();
  const [activeCategory, setActiveCategory] = useState('all');

  const t = {
    uz: {
      newsTitle: "Eng So'ngi Yangiliklar",
      newsSub: "Orix Global bilan doim xabardor bo'ling",
      allNews: 'Barcha Yangiliklar',
      readMore: 'Batafsil',
      noNews: 'Yangiliklar topilmadi.',
    },
    ru: {
      newsTitle: 'Последние Новости',
      newsSub: 'Будьте в курсе событий с Orix Global',
      allNews: 'Все новости',
      readMore: 'Подробнее',
      noNews: 'Новости не найдены.',
    },
    en: {
      newsTitle: 'Latest News & Insights',
      newsSub: 'Stay updated with Orix Global Consulting',
      allNews: 'All News',
      readMore: 'Read More',
      noNews: 'No news found.',
    },
  }[lang];

  const newsQuery = useApiResource(homeApi.getNews);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const newsData = useMemo(
    () =>
      normalizeList(newsQuery.data).map((news) =>
        localizeItem(news, ['title', 'category', 'excerpt', 'content'], lang)
      ),
    [newsQuery.data, lang]
  );

  const categories = useMemo(
    () => [t.allNews, ...Array.from(new Set(newsData.map((news) => news?.category).filter(Boolean)))],
    [newsData, t.allNews]
  );

  const filteredNews = useMemo(() => {
    if (activeCategory === 'all') return newsData;
    return newsData.filter((news) => news?.category === activeCategory);
  }, [activeCategory, newsData]);

  const openNews = (news) => {
    navigate(`/news/${news?.slug}`, { state: { article: news } });
  };

  return (
    <div className="w-full min-h-screen bg-[#f8f9fc] font-sans pb-20">
      <div className="relative w-full h-[40vh] bg-[#274F94] flex items-center justify-center pt-20 border-b-[8px] border-[#8F0810]">
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <img src={newsData?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1200&q=80'} onError={setImageFallback} alt="News Banner" className="absolute inset-0 w-full h-full object-cover z-0" />
        <div className="relative z-20 text-center px-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-md">{t.newsTitle}</h1>
          <p className="text-lg text-gray-200 font-medium">{t.newsSub}</p>
        </div>
      </div>

      <div className="max-w-[1300px] mx-auto px-6 mt-16">
        <div className="flex flex-wrap justify-center gap-4 mb-14">
          {categories.map((cat, index) => {
            const value = index === 0 ? 'all' : cat;
            const active = activeCategory === value;

            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(value)}
                className={`px-6 py-2 rounded-full font-bold text-[13px] border transition-colors ${
                  active
                    ? 'bg-[#8F0810] text-white border-[#8F0810]'
                    : 'bg-white text-[#274F94] border-gray-200 hover:border-[#8F0810] hover:text-[#8F0810]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {newsQuery.loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 h-[500px] animate-pulse"></div>
            ))}
          </div>
        ) : filteredNews.length === 0 ? (
          <p className="text-[#274F94] opacity-70 text-center font-semibold">{t.noNews}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredNews.map((news, index) => (
              <motion.div
                key={news?.id || news?.slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-lg transition-all flex flex-col"
              >
                <div className="h-[240px] w-full overflow-hidden relative">
                  <img src={news?.imageUrl || IMAGE_PLACEHOLDER} onError={setImageFallback} alt={news?.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  {news?.category && (
                    <div className="absolute top-4 left-4 bg-[#8F0810]/95 text-white px-3 py-1 rounded-sm text-[11px] font-bold tracking-wider uppercase shadow-sm">
                      {news.category}
                    </div>
                  )}
                </div>

                <div className="p-6 flex flex-col grow">
                  <div className="flex justify-end items-center text-[12px] font-semibold text-gray-400 mb-4">
                    <span className="flex items-center gap-1.5"><FiEye className="text-[#8F0810]" /> {news?.views ?? 0}</span>
                  </div>
                  <h3 className="text-[#274F94] text-[18px] font-bold leading-snug mb-4 group-hover:text-[#8F0810] transition-colors line-clamp-2">
                    {news?.title}
                  </h3>
                  <p className="text-[#274F94] opacity-70 text-[13px] leading-relaxed mb-6 font-medium line-clamp-3">
                    {news?.excerpt || news?.content}
                  </p>

                  <div className="mt-auto pt-4 border-t border-gray-100">
                    <button
                      onClick={() => openNews(news)}
                      className="flex items-center gap-2 text-[#8F0810] font-bold text-[13px] hover:text-[#6a060b] transition-colors"
                    >
                      {t.readMore} <FiChevronRight />
                    </button>
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

export default News;
