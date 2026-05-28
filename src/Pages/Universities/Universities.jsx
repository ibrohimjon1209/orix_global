import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { homeApi } from '../../api/api';
import { useApiResource } from '../../hooks/useApiResource';
import { getCurrentLang, localizeItem, sortByDisplayOrder } from '../../utils/localization';

const IMAGE_PLACEHOLDER =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="900" height="700" viewBox="0 0 900 700"%3E%3Crect width="900" height="700" fill="%23f1f5f9"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="38" font-weight="700" fill="%23274F94"%3EOrix Global%3C/text%3E%3C/svg%3E';

const normalizeList = (data) => (Array.isArray(data) ? data : []);

const setImageFallback = (event) => {
  event.currentTarget.onerror = null;
  event.currentTarget.src = IMAGE_PLACEHOLDER;
};

const Universities = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const lang = getCurrentLang();
  const [selectedCountrySlug, setSelectedCountrySlug] = useState(location.state?.countrySlug || '');
  const [search, setSearch] = useState('');

  const t = {
    uz: {
      pre: "Universitetlar",
      title: "Davlat bo’yicha shaharlar",
      countriesTitle: "Davlatni tanlang",
      search: "Shahar bo’yicha qidirish...",
      cities: "Shaharlar",
      universities: "universitet",
      noCities: "Bu davlat uchun shaharlar topilmadi.",
      noResults: "Shahar topilmadi.",
      open: "Universitetlarni ko’rish",
    },
    ru: {
      pre: "Университеты",
      title: "Города по стране",
      countriesTitle: "Выберите страну",
      search: "Поиск по городу...",
      cities: "Городов",
      universities: "университетов",
      noCities: "Городов для этой страны не найдено.",
      noResults: "Город не найден.",
      open: "Посмотреть университеты",
    },
    en: {
      pre: "Universities",
      title: "Cities by Country",
      countriesTitle: "Select a Country",
      search: "Search by city...",
      cities: "Cities",
      universities: "universities",
      noCities: "No cities found for this country.",
      noResults: "City not found.",
      open: "View Universities",
    },
  }[lang];

  const countriesQuery = useApiResource(homeApi.getCountries);
  const citiesQuery = useApiResource(homeApi.getCities);
  const universitiesQuery = useApiResource(homeApi.getUniversities);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (location.state?.countrySlug) {
      setSelectedCountrySlug(location.state.countrySlug);
    }
  }, [location.state?.countrySlug]);

  const cities = useMemo(
    () =>
      sortByDisplayOrder(
        normalizeList(citiesQuery.data)
          .filter((city) => city?.is_active !== false)
          .map((city) => localizeItem(city, ['name'], lang))
      ),
    [citiesQuery.data, lang]
  );

  const universities = useMemo(
    () =>
      normalizeList(universitiesQuery.data)
        .map((university) => localizeItem(university, ['name', 'location', 'cityName'], lang))
        .sort((a, b) => (a?.rank ?? 9999) - (b?.rank ?? 9999)),
    [universitiesQuery.data, lang]
  );

  // ==================== SHAHARLARI BOR DAVLATLAR ====================
  const countries = useMemo(() => {
    const allCountries = normalizeList(countriesQuery.data)
      .filter((country) => country?.is_active !== false)
      .map((country) => localizeItem(country, ['name'], lang));

    // Faqat shaharlari bor davlatlarni qoldirish
    return allCountries
      .filter((country) => {
        const countryCities = cities.filter(
          (city) => city?.countrySlug === country?.slug
        );
        return countryCities.length > 0;
      })
      .sort((a, b) => (a?.display_order || 0) - (b?.display_order || 0));
  }, [countriesQuery.data, cities, lang]);

  const selectedCountry = useMemo(
    () => countries.find((country) => country?.slug === selectedCountrySlug),
    [countries, selectedCountrySlug]
  );

  const countryCities = useMemo(() => {
    if (!selectedCountry) return [];
    return cities.filter((city) => city?.countrySlug === selectedCountry?.slug);
  }, [cities, selectedCountry]);

  const countryCitySlugs = useMemo(
    () => new Set(countryCities.map((city) => city?.slug)),
    [countryCities]
  );

  const countryUniversities = useMemo(
    () => universities.filter((university) => countryCitySlugs.has(university?.citySlug)),
    [universities, countryCitySlugs]
  );

  const filteredCities = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return countryCities;
    return countryCities.filter((city) =>
      (city?.name || '').toLowerCase().includes(query)
    );
  }, [countryCities, search]);

  const selectCountry = (country) => {
    setSelectedCountrySlug(country?.slug || '');
    setSearch('');
  };

  const openCity = (city) => {
    navigate('/single_university', {
      state: {
        citySlug: city?.slug,
        cityName: city?.name,
        countrySlug: selectedCountrySlug,
        countryName: selectedCountry?.name,
      },
    });
  };

  const loading = countriesQuery.loading || citiesQuery.loading || universitiesQuery.loading;

  return (
    <div className="w-full min-h-screen bg-[#f8f9fc] py-24 px-4 md:px-8 font-sans">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-8">
          <p className="text-[#8F0810] font-bold tracking-widest text-[11px] md:text-sm uppercase mb-2">{t.pre}</p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#274F94]">
            {selectedCountry?.name ? `${selectedCountry.name}: ${t.cities}` : t.countriesTitle}
          </h1>
          <div className="w-10 h-1 bg-[#274F94] mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Qidiruv */}
        {selectedCountrySlug && (
          <div className="mb-8">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.search}
              className="w-full border border-gray-200 p-3 rounded-md outline-none focus:border-[#8F0810]"
            />
            {/* searchResults qismi kerak bo'lsa qoldiring */}
          </div>
        )}

        {/* Davlatlar */}
        <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {(countriesQuery.loading
            ? Array.from({ length: 4 }, (_, index) => ({ id: `loading-${index}` }))
            : countries
          ).map((country) => (
            <button
              key={country?.id || country?.slug}
              onClick={() => !countriesQuery.loading && selectCountry(country)}
              className={`p-4 rounded-lg border transition-all ${
                selectedCountrySlug === country?.slug
                  ? 'border-[#8F0810] bg-[#fff7f7]'
                  : 'border-gray-100 bg-white hover:shadow-md'
              }`}
            >
              <div className="font-bold text-[#274F94]">{country?.name}</div>
              <div className="text-sm text-[#274F94] opacity-70 mt-1">
                {cities.filter((c) => c?.countrySlug === country?.slug).length} {t.cities.toLowerCase()}
              </div>
            </button>
          ))}
        </div>

        {/* Shaharlar qismi */}
        {selectedCountrySlug && (
          <div>
            <h3 className="text-lg font-bold text-[#274F94] mb-4">{selectedCountry?.name}</h3>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-[170px] bg-white rounded-lg animate-pulse" />
                ))}
              </div>
            ) : filteredCities.length === 0 ? (
              <p className="text-[#274F94] opacity-70">{search.trim() ? t.noResults : t.noCities}</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredCities.map((city) => (
                  <motion.div
                    key={city?.id || city?.slug}
                    whileHover={{ y: -4 }}
                    className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden flex flex-col cursor-pointer"
                    onClick={() => openCity(city)}
                  >
                    <div className="h-[150px] bg-gray-200 overflow-hidden">
                      <img src={city?.imageUrl || IMAGE_PLACEHOLDER} onError={setImageFallback} alt={city?.name} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <div className="p-4 flex flex-col grow">
                      <h4 className="font-semibold text-[#274F94] text-lg">{city?.name}</h4>
                      <button className="mt-4 bg-[#8F0810] hover:bg-[#6a060b] text-white px-4 py-2 rounded-full font-bold text-sm transition-colors">
                        {t.open}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Universities;