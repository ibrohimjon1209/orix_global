import { useCallback, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiEye, FiChevronLeft } from 'react-icons/fi';
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

const Single_news = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const lang = getCurrentLang();
  const slug = params.slug || location.state?.article?.slug;

  const t = {
    uz: {
      backBtn: 'Barcha yangiliklar',
      views: "ko'rishlar",
      recent: "So'ngi xabarlar",
      wantStudy: "O'qishni rejalashtiryapsizmi?",
      wantSub: 'Hoziroq bizning agentlarimiz bilan bog‘lanib maslahat oling.',
      bookBtn: 'Uchrashuv belgilash',
      notFound: 'Yangilik topilmadi.',
    },
    ru: {
      backBtn: 'Все новости',
      views: 'просмотров',
      recent: 'Последние новости',
      wantStudy: 'Планируете учебу?',
      wantSub: 'Запишитесь на консультацию сегодня.',
      bookBtn: 'Забронировать',
      notFound: 'Новость не найдена.',
    },
    en: {
      backBtn: 'All News',
      views: 'views',
      recent: 'Recent Posts',
      wantStudy: 'Planning to study?',
      wantSub: 'Book a consultation with our experienced agents today.',
      bookBtn: 'Book Now',
      notFound: 'News not found.',
    },
  }[lang];

  const detailLoader = useCallback(
    (config) => (slug ? homeApi.getNewsDetail(slug, config) : Promise.resolve(location.state?.article || null)),
    [slug, location.state?.article]
  );

  const articleQuery = useApiResource(detailLoader);
  const newsQuery = useApiResource(homeApi.getNews);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const article = useMemo(() => {
    const source = articleQuery.data || location.state?.article;
    return source ? localizeItem(source, ['title', 'category', 'excerpt', 'content'], lang) : null;
  }, [articleQuery.data, location.state?.article, lang]);

  const recentPosts = useMemo(
    () =>
      normalizeList(newsQuery.data)
        .filter((item) => item?.slug !== article?.slug)
        .map((item) => localizeItem(item, ['title', 'category', 'excerpt', 'content'], lang))
        .slice(0, 3),
    [newsQuery.data, article?.slug, lang]
  );

  return (
    <div className="w-full min-h-screen bg-[#f8f9fc] font-sans pb-24 pt-28 px-4 md:px-8">
      <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full lg:w-2/3 bg-white p-6 md:p-10 rounded-xl shadow-sm border border-gray-100">
          <button onClick={() => navigate('/news')} className="flex items-center gap-1 text-[#8F0810] font-bold text-sm mb-8 hover:underline">
            <FiChevronLeft /> {t.backBtn}
          </button>

          {articleQuery.loading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-[#274F94]/10 rounded-md mb-6"></div>
              <div className="h-[420px] bg-[#274F94]/10 rounded-xl mb-8"></div>
              <div className="h-4 bg-[#274F94]/10 rounded-md mb-3"></div>
              <div className="h-4 bg-[#274F94]/10 rounded-md mb-3"></div>
              <div className="h-4 bg-[#274F94]/10 rounded-md w-4/5"></div>
            </div>
          ) : !article ? (
            <p className="text-[#274F94] opacity-70 font-semibold">{t.notFound}</p>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-4">
                {article?.category && (
                  <span className="bg-[#fcf0f1] text-[#8F0810] px-3 py-1 rounded-sm text-[11px] font-bold tracking-wider uppercase">
                    {article.category}
                  </span>
                )}
                <div className="flex items-center gap-4 text-[12px] font-semibold text-gray-400">
                  <span className="flex items-center gap-1.5"><FiEye /> {article?.views ?? 0} {t.views}</span>
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl font-extrabold text-[#274F94] leading-tight mb-8">
                {article?.title}
              </h1>

              <div className="w-full h-[300px] md:h-[450px] overflow-hidden rounded-xl mb-10 border-[6px] border-gray-100 shadow-sm">
                <img src={article?.imageUrl || IMAGE_PLACEHOLDER} onError={setImageFallback} alt={article?.title} className="w-full h-full object-cover" />
              </div>

              <div className="text-[#274F94] opacity-90 text-[15px] leading-relaxed font-medium space-y-6">
                {article?.excerpt && <p className="text-[18px] font-bold italic border-l-4 border-[#8F0810] pl-4 mb-6">"{article.excerpt}"</p>}
                {String(article?.content || '')
                  .split(/\n+/)
                  .filter(Boolean)
                  .map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
              </div>
            </>
          )}
        </motion.div>

        <div className="w-full lg:w-1/3">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-28">
            <h3 className="text-xl font-extrabold text-[#274F94] mb-6 pb-4 border-b border-gray-100">{t.recent}</h3>
            <div className="flex flex-col gap-6">
              {recentPosts.map((post) => (
                <div key={post?.id || post?.slug} className="flex gap-4 group cursor-pointer" onClick={() => navigate(`/news/${post?.slug}`, { state: { article: post } })}>
                  <div className="w-[80px] h-[70px] rounded-md overflow-hidden shrink-0 bg-gray-100">
                    <img src={post?.imageUrl || IMAGE_PLACEHOLDER} onError={setImageFallback} alt={post?.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <h4 className="font-bold text-[#274F94] text-sm line-clamp-2 group-hover:text-[#8F0810] transition-colors mb-2">{post?.title}</h4>
                    <p className="text-[11px] font-semibold text-gray-400 flex items-center gap-1">{post?.category}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 bg-[#fcf0f1] p-6 rounded-md border border-[#f5d7d9] text-center shadow-sm">
              <h4 className="font-extrabold text-[#8F0810] mb-2">{t.wantStudy}</h4>
              <p className="text-[13px] text-[#274F94] mb-6 font-medium">{t.wantSub}</p>
              <button onClick={() => navigate('/booking')} className="w-full bg-[#8F0810] hover:bg-[#6a060b] text-white py-3 rounded-md font-bold text-[13px] transition-colors shadow-md">
                {t.bookBtn}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Single_news;
