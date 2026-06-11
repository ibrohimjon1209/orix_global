import { useCallback, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiChevronLeft, FiExternalLink, FiMapPin } from 'react-icons/fi';
import { homeApi } from '../../api/api';
import { useApiResource } from '../../hooks/useApiResource';
import { getCurrentLang, localizeItem } from '../../utils/localization';

const IMAGE_PLACEHOLDER =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="900" height="700" viewBox="0 0 900 700"%3E%3Crect width="900" height="700" fill="%23f1f5f9"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="38" font-weight="700" fill="%23274F94"%3EOrix Global%3C/text%3E%3C/svg%3E';

const setImageFallback = (event) => {
  event.currentTarget.onerror = null;
  event.currentTarget.src = IMAGE_PLACEHOLDER;
};

const normalizeList = (data) => (Array.isArray(data) ? data : []);

const University_detail = () => {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const lang = getCurrentLang();

  const citySlug = location.state?.citySlug;
  const cityName = location.state?.cityName;

  const t = {
    uz: {
      backBtn: 'Orqaga',
      visit: 'Rasmiy saytga kirish',
      rank: 'QS Reyting',
      location: 'Joylashuv',
      about: 'Universitet haqida',
      related: 'Shu shahardagi boshqa universitetlar',
      notFound: 'Universitet topilmadi.',
      fakeDesc: "Bu universitet haqida batafsil ma'lumot tez orada qo'shiladi.",
      bookTitle: "O'qishga tayyormisiz?",
      bookSub: "Mutaxassislarimiz bilan uchrashuv belgilang va xorijda ta'lim olish yo'lingizni boshlang.",
      bookBtn: 'Uchrashuv belgilash',
    },
    ru: {
      backBtn: 'Назад',
      visit: 'Перейти на сайт',
      rank: 'Рейтинг QS',
      location: 'Местоположение',
      about: 'Об университете',
      related: 'Другие университеты в этом городе',
      notFound: 'Университет не найден.',
      fakeDesc: 'Подробная информация об этом университете скоро будет добавлена.',
      bookTitle: 'Готовы учиться?',
      bookSub: 'Запишитесь на консультацию и начните свой путь к образованию за рубежом.',
      bookBtn: 'Записаться',
    },
    en: {
      backBtn: 'Back',
      visit: 'Visit Official Website',
      rank: 'QS Ranking',
      location: 'Location',
      about: 'About the University',
      related: 'Other Universities in This City',
      notFound: 'University not found.',
      fakeDesc: 'Detailed information about this university will be added soon.',
      bookTitle: 'Ready to Study Abroad?',
      bookSub: 'Book a consultation with our experts and start your journey to international education.',
      bookBtn: 'Book a Meeting',
    },
  }[lang];

  const detailLoader = useCallback(
    (config) =>
      slug
        ? homeApi.getUniversityDetail(slug, config)
        : Promise.resolve(location.state?.uni || null),
    [slug, location.state?.uni]
  );

  const uniQuery = useApiResource(detailLoader);
  const allUnisQuery = useApiResource(homeApi.getUniversities);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const uni = useMemo(() => {
    const source = uniQuery.data || location.state?.uni;
    return source ? localizeItem(source, ['name', 'location', 'cityName', 'about'], lang) : null;
  }, [uniQuery.data, location.state?.uni, lang]);

  const relatedUnis = useMemo(() => {
    const resolvedCitySlug = citySlug || uni?.citySlug;
    if (!resolvedCitySlug) return [];
    return normalizeList(allUnisQuery.data)
      .filter((u) => u?.citySlug === resolvedCitySlug && u?.slug !== slug)
      .map((u) => localizeItem(u, ['name', 'location', 'cityName', 'about'], lang))
      .sort((a, b) => (a?.rank ?? 9999) - (b?.rank ?? 9999))
      .slice(0, 4);
  }, [allUnisQuery.data, slug, citySlug, uni?.citySlug, lang]);

  const handleBack = () => {
    if (citySlug) {
      navigate('/single_university', { state: { citySlug, cityName } });
    } else {
      navigate('/universities');
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#f8f9fc] font-sans pb-24 pt-28 px-4 md:px-8">
      <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-10">

        {/* Main content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full lg:w-2/3 bg-white p-6 md:p-10 rounded-xl shadow-sm border border-gray-100"
        >
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-[#8F0810] font-bold text-sm mb-8 hover:underline"
          >
            <FiChevronLeft /> {t.backBtn}
          </button>

          {uniQuery.loading ? (
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-[#274F94]/10 rounded-md w-3/4"></div>
              <div className="h-[380px] bg-[#274F94]/10 rounded-xl"></div>
              <div className="h-4 bg-[#274F94]/10 rounded-md"></div>
              <div className="h-4 bg-[#274F94]/10 rounded-md w-5/6"></div>
              <div className="h-4 bg-[#274F94]/10 rounded-md w-4/6"></div>
            </div>
          ) : !uni ? (
            <p className="text-[#274F94] opacity-70 font-semibold">{t.notFound}</p>
          ) : (
            <>
              {/* Rank + location row */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {uni?.rank && (
                  <div className="flex items-center gap-2 bg-white border border-orange-200 px-3 py-1.5 rounded-full shadow-sm">
                    <img src="/qs small new.png" alt="QS" className="h-[20px] w-[20px] object-contain rounded-[3px]" />
                    <span className="font-bold text-[#274F94] text-sm">#{uni.rank}</span>
                  </div>
                )}
                {(uni?.location || uni?.cityName) && (
                  <span className="flex items-center gap-1 text-[#274F94] opacity-70 text-sm font-semibold">
                    <FiMapPin className="text-[#8F0810]" />
                    {uni?.location || uni?.cityName}
                  </span>
                )}
              </div>

              {/* University name */}
              <h1 className="text-3xl md:text-4xl font-extrabold text-[#274F94] leading-tight mb-8">
                {uni?.name}
              </h1>

              {/* Hero image */}
              <div className="w-full h-[280px] md:h-[420px] overflow-hidden rounded-xl mb-10 border-[6px] border-gray-100 shadow-sm">
                <img
                  src={uni?.imageUrl || IMAGE_PLACEHOLDER}
                  onError={setImageFallback}
                  alt={uni?.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* About section */}
              <div className="mb-10">
                <h2 className="text-xl font-extrabold text-[#274F94] mb-4 pb-3 border-b border-gray-100">
                  {t.about}
                </h2>
                <div className="text-[#274F94] opacity-90 text-[15px] leading-relaxed font-medium space-y-4">
                  {String(uni?.about || t.fakeDesc)
                    .split(/\n+/)
                    .filter(Boolean)
                    .map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                </div>
              </div>

              {/* Visit website button */}
              {uni?.websiteUrl && (
                <a
                  href={uni.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 bg-[#8F0810] hover:bg-[#6a060b] text-white font-bold px-8 py-3 rounded-full transition-colors shadow-md text-sm"
                >
                  <FiExternalLink />
                  {t.visit}
                </a>
              )}
            </>
          )}
        </motion.div>

        {/* Sidebar */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-28 space-y-8">

            {/* Related universities */}
            {relatedUnis.length > 0 && (
              <div>
                <h3 className="text-lg font-extrabold text-[#274F94] mb-5 pb-4 border-b border-gray-100">
                  {t.related}
                </h3>
                <div className="flex flex-col gap-4">
                  {relatedUnis.map((related) => (
                    <div
                      key={related?.id || related?.slug}
                      className="flex gap-3 group cursor-pointer"
                      onClick={() =>
                        navigate(`/universities/${related?.slug}`, {
                          state: { citySlug: related?.citySlug, cityName: related?.cityName },
                        })
                      }
                    >
                      <div className="w-[72px] h-[60px] rounded-md overflow-hidden shrink-0 bg-gray-100">
                        <img
                          src={related?.imageUrl || IMAGE_PLACEHOLDER}
                          onError={setImageFallback}
                          alt={related?.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        />
                      </div>
                      <div className="flex flex-col justify-center">
                        <h4 className="font-bold text-[#274F94] text-sm line-clamp-2 group-hover:text-[#8F0810] transition-colors mb-1">
                          {related?.name}
                        </h4>
                        {related?.rank && (
                          <p className="text-[11px] font-semibold text-gray-400 flex items-center gap-1">
                            QS #{related.rank}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA block */}
            <div className="bg-[#fcf0f1] p-6 rounded-md border border-[#f5d7d9] text-center shadow-sm">
              <h4 className="font-extrabold text-[#8F0810] mb-2">{t.bookTitle}</h4>
              <p className="text-[13px] text-[#274F94] mb-6 font-medium">{t.bookSub}</p>
              <button
                onClick={() => navigate('/booking')}
                className="w-full bg-[#8F0810] hover:bg-[#6a060b] text-white py-3 rounded-md font-bold text-[13px] transition-colors shadow-md"
              >
                {t.bookBtn}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default University_detail;
