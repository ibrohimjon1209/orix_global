import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMapPin, FiClock, FiX } from 'react-icons/fi';
import { FaCheckCircle, FaLinkedinIn, FaTelegramPlane } from 'react-icons/fa';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
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

const getErrorMessage = (error) => {
  const data = error?.response?.data;
  if (typeof data === 'string') return data;
  if (data?.detail) return data.detail;
  if (data?.message) return data.message;
  if (data && typeof data === 'object') return Object.values(data).flat().filter(Boolean).join(' ');
  return error?.message || 'Xatolik yuz berdi.';
};

const formatEventDate = (value, lang) => {
  if (!value) return { day: '--', month: '', fullDate: '' };
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { day: '--', month: '', fullDate: '' };

  const locale = lang === 'ru' ? 'ru-RU' : lang === 'en' ? 'en-US' : 'uz-UZ';
  return {
    day: new Intl.DateTimeFormat(locale, { day: '2-digit' }).format(date),
    month: new Intl.DateTimeFormat(locale, { month: 'short' }).format(date),
    fullDate: new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(date),
  };
};

const formatEventTime = (start, end) => {
  if (!start) return '';
  const startDate = new Date(start);
  const endDate = end ? new Date(end) : null;
  const format = (date) =>
    Number.isNaN(date.getTime())
      ? ''
      : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return endDate ? `${format(startDate)} - ${format(endDate)}` : format(startDate);
};

const Events = () => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phoneCode: '+998',
    phoneNumber: '',
    institutionName: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const lang = getCurrentLang();

  const t = {
    uz: {
      eventsTitle: 'Yaqinlashib kelayotgan Tadbirlar',
      eventsSub: "Bog'laning, o'rganing va yangi imkoniyatlarga tayyorlaning",
      teamPre: 'Jamoa',
      teamTitle: 'Bizning Mutaxassislarimiz bilan tanishing',
      regNow: "Ro'yxatdan o'tish",
      regModal: "Tadbirga Ro'yxatdan O'tish",
      fName: 'Ismingiz *',
      lName: 'Familiyangiz *',
      tel: 'Telefon raqam *',
      uniName: 'Universitet yoki Maktab nomi',
      submitBtn: 'Tasdiqlash',
      pending: 'Yuborilmoqda...',
      success: "Ro'yxatdan o'tdingiz!",
      required: "Majburiy maydonlarni to'ldiring.",
      noEvents: 'Hozircha tadbirlar mavjud emas.',
      noTeam: 'Jamoa aʼzolari topilmadi.',
    },
    ru: {
      eventsTitle: 'Предстоящие События',
      eventsSub: 'Общайтесь, учитесь и готовьтесь к новым возможностям',
      teamPre: 'Команда',
      teamTitle: 'Познакомьтесь с нашими экспертами',
      regNow: 'Зарегистрироваться',
      regModal: 'Регистрация на событие',
      fName: 'Имя *',
      lName: 'Фамилия *',
      tel: 'Номер телефона *',
      uniName: 'Название университета или школы',
      submitBtn: 'Отправить',
      pending: 'Отправляется...',
      success: 'Успешно зарегистрировано!',
      required: 'Заполните обязательные поля.',
      noEvents: 'Событий пока нет.',
      noTeam: 'Члены команды не найдены.',
    },
    en: {
      eventsTitle: 'Upcoming Events',
      eventsSub: 'Connect, learn, and prepare for new opportunities',
      teamPre: 'Team',
      teamTitle: 'Meet Our Experts',
      regNow: 'Register Now',
      regModal: 'Event Registration',
      fName: 'First Name *',
      lName: 'Last Name *',
      tel: 'Phone number *',
      uniName: 'University or School Name',
      submitBtn: 'Register',
      pending: 'Sending...',
      success: 'Registered successfully!',
      required: 'Please fill in the required fields.',
      noEvents: 'No events yet.',
      noTeam: 'No team members found.',
    },
  }[lang];

  const eventsQuery = useApiResource(homeApi.getEvents);
  const staffQuery = useApiResource(homeApi.getStaffMembers);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const eventsData = useMemo(
    () =>
      normalizeList(eventsQuery.data)
        .map((event) => localizeItem(event, ['title', 'description', 'location', 'eventType'], lang))
        .sort((a, b) => new Date(a?.startsAt || 0) - new Date(b?.startsAt || 0)),
    [eventsQuery.data, lang]
  );

  const experts = useMemo(
    () =>
      sortByDisplayOrder(normalizeList(staffQuery.data)).map((member) =>
        localizeItem(member, ['full_name', 'role', 'bio'], lang)
      ),
    [staffQuery.data, lang]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const openRegistration = (event) => {
    setSelectedEvent(event);
    setStatus({ type: '', message: '' });
    setForm({ firstName: '', lastName: '', phoneCode: '+998', phoneNumber: '', institutionName: '' });
  };

  const closeRegistration = () => {
    if (submitting) return;
    setSelectedEvent(null);
    setStatus({ type: '', message: '' });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: '', message: '' });

    if (!form.firstName.trim() || !form.lastName.trim() || !form.phoneNumber.trim()) {
      setStatus({ type: 'error', message: t.required });
      return;
    }

    setSubmitting(true);
    try {
      await homeApi.registerEvent({
        eventSlug: selectedEvent?.slug,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phoneCode: form.phoneCode,
        phoneNumber: form.phoneNumber.trim(),
        institutionName: form.institutionName.trim(),
      });

      setStatus({ type: 'success', message: t.success });
      setForm({ firstName: '', lastName: '', phoneCode: '+998', phoneNumber: '', institutionName: '' });
    } catch (error) {
      setStatus({ type: 'error', message: getErrorMessage(error) });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-[#f8f9fc] font-sans min-h-screen">
      <div className="relative w-full h-[40vh] bg-[#274F94] flex items-center justify-center pt-20 border-b-[8px] border-[#8F0810]">
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <img src={eventsData?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1511578314322-379aee9c1bac?w=1200&q=80'} onError={setImageFallback} alt="Events Banner" className="absolute inset-0 w-full h-full object-cover z-0" />
        <div className="relative z-20 text-center px-4">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 drop-shadow-md">{t.eventsTitle}</h1>
          <p className="text-lg text-gray-200 font-medium">{t.eventsSub}</p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-20">
        {eventsQuery.loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 h-[520px] animate-pulse"></div>
            ))}
          </div>
        ) : eventsData.length === 0 ? (
          <p className="text-[#274F94] opacity-70 text-center font-semibold">{t.noEvents}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {eventsData.map((ev, i) => {
              const date = formatEventDate(ev?.startsAt, lang);
              const time = formatEventTime(ev?.startsAt, ev?.endsAt);

              return (
                <motion.div
                  key={ev?.id || ev?.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-lg transition-all flex flex-col"
                >
                  <div className="relative h-[220px] overflow-hidden">
                    <img src={ev?.imageUrl || IMAGE_PLACEHOLDER} onError={setImageFallback} alt={ev?.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    <div className="absolute top-4 left-4 bg-[#8F0810] text-white px-4 py-2 rounded-md text-center shadow-md">
                      <p className="text-2xl font-extrabold leading-none">{date.day}</p>
                      <p className="text-[10px] font-bold uppercase">{date.month}</p>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col grow">
                    <h3 className="text-[#274F94] text-xl font-bold mb-3 leading-tight">{ev?.title}</h3>
                    <p className="text-gray-500 text-sm mb-6 flex-grow font-medium leading-relaxed">{ev?.description}</p>

                    <div className="flex flex-col gap-2 mb-6 border-t border-gray-100 pt-4">
                      <div className="flex items-center gap-2 text-[12px] font-semibold text-[#274F94]">
                        <FiClock className="text-[#8F0810]" /> {date.fullDate} {time && `| ${time}`}
                      </div>
                      <div className="flex items-center gap-2 text-[12px] font-semibold text-[#274F94]">
                        <FiMapPin className="text-[#8F0810]" /> {ev?.location} {ev?.eventType && `(${ev.eventType})`}
                      </div>
                    </div>

                    <button
                      onClick={(clickEvent) => {
                        clickEvent.stopPropagation();
                        openRegistration(ev);
                      }}
                      className="w-full bg-[#8F0810] hover:bg-[#6a060b] text-white px-6 py-2.5 rounded-md font-bold text-sm shadow-md transition-colors"
                    >
                      {t.regNow}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <section id="team" className="w-full py-24 bg-white px-6">
        <div className="max-w-[1300px] mx-auto text-center">
          <motion.p className="text-[#8F0810] font-bold tracking-widest text-xs uppercase mb-3">{t.teamPre}</motion.p>
          <motion.h2 className="text-2xl md:text-4xl font-extrabold text-[#274F94] mb-16 flex flex-col items-center">
            {t.teamTitle}
            <div className="w-8 h-1 bg-[#274F94] mt-6"></div>
          </motion.h2>

          <div className="relative max-w-[1100px] mx-auto group">
            <Swiper
              modules={[Navigation, Autoplay]}
              spaceBetween={30}
              slidesPerView={1}
              navigation={{ nextEl: '.swiper-expert-next2', prevEl: '.swiper-expert-prev2' }}
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              breakpoints={{ 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }}
              className="pb-10"
            >
              {(staffQuery.loading ? Array.from({ length: 3 }, (_, index) => ({ id: `loading-${index}` })) : experts).map((exp, i) => (
                <SwiperSlide key={exp?.id || i}>
                  <div className="bg-[#f8f9fc] rounded-xl overflow-hidden shadow-sm border border-gray-100 flex flex-col text-left h-full hover:shadow-lg transition-all">
                    <div className="h-[280px] w-full overflow-hidden bg-gray-200">
                      <img src={exp?.imageUrl || IMAGE_PLACEHOLDER} onError={setImageFallback} alt={exp?.full_name || 'Team member'} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <div className="p-6 flex flex-col grow">
                      {staffQuery.loading ? (
                        <div className="animate-pulse flex-grow">
                          <div className="h-5 bg-[#274F94]/10 rounded-md mb-2"></div>
                          <div className="h-3 bg-[#8F0810]/10 rounded-md mb-4 w-2/3"></div>
                          <div className="h-3 bg-[#274F94]/10 rounded-md mb-2"></div>
                          <div className="h-3 bg-[#274F94]/10 rounded-md mb-6 w-4/5"></div>
                        </div>
                      ) : (
                        <>
                          <h4 className="text-lg font-bold text-[#274F94] mb-0.5">{exp?.full_name}</h4>
                          <p className="text-[#8F0810] font-bold text-[11px] uppercase tracking-wider mb-4">{exp?.role}</p>
                          <p className="text-[#274F94] opacity-80 text-[13px] leading-relaxed mb-6 flex-grow font-medium">{exp?.bio}</p>
                        </>
                      )}
                      <div className="flex items-center gap-3 text-white">
                        <a href={exp?.linkedinUrl || '#'} target="_blank" rel="noreferrer" className="bg-[#274F94] hover:bg-[#8F0810] p-2 rounded-full transition-colors"><FaLinkedinIn size={14} /></a>
                        <a href={exp?.telegramUrl || '#'} target="_blank" rel="noreferrer" className="bg-[#274F94] hover:bg-[#8F0810] p-2 rounded-full transition-colors"><FaTelegramPlane size={14} /></a>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
            {!staffQuery.loading && experts.length === 0 && <p className="text-[#274F94] opacity-70 text-sm font-semibold">{t.noTeam}</p>}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center px-4"
            onClick={closeRegistration}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white max-w-[600px] w-full rounded-md shadow-2xl relative flex flex-col max-h-[90vh]"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                onClick={closeRegistration}
                className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 text-[#274F94] p-2 rounded-full transition-colors z-10"
              >
                <FiX size={20} />
              </button>

              <div className="bg-[#f8f9fc] p-6 pb-4 border-b border-gray-100 rounded-t-md shrink-0">
                <p className="text-[#8F0810] text-[11px] font-bold uppercase mb-1">{t.regModal}</p>
                <h3 className="text-[#274F94] text-xl font-extrabold pr-8 leading-tight">{selectedEvent.title}</h3>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar">
                <form className="w-full space-y-6" onSubmit={handleSubmit}>
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-1/2">
                      <label className="text-[13px] font-bold text-[#274F94] block mb-2">{t.fName}</label>
                      <input type="text" name="firstName" value={form.firstName} onChange={handleChange} className="w-full border border-gray-300 p-3 rounded-md bg-transparent outline-none focus:border-[#8F0810] transition-colors" />
                    </div>
                    <div className="w-full md:w-1/2">
                      <label className="text-[13px] font-bold text-[#274F94] block mb-2">{t.lName}</label>
                      <input type="text" name="lastName" value={form.lastName} onChange={handleChange} className="w-full border border-gray-300 p-3 rounded-md bg-transparent outline-none focus:border-[#8F0810] transition-colors" />
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-1/3">
                      <label className="text-[13px] font-bold text-[#274F94] block mb-2">Code *</label>
                      <select name="phoneCode" value={form.phoneCode} onChange={handleChange} className="w-full border border-gray-300 p-3 rounded-md bg-transparent outline-none focus:border-[#8F0810] transition-colors text-[#274F94]">
                        <option value="+998">UZ +998</option>
                      </select>
                    </div>
                    <div className="w-full md:w-2/3">
                      <label className="text-[13px] font-bold text-[#274F94] block mb-2">{t.tel}</label>
                      <input type="text" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} placeholder="Phone number" className="w-full border border-gray-300 p-3 rounded-md bg-transparent outline-none focus:border-[#8F0810] transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[13px] font-bold text-[#274F94] block mb-2">{t.uniName}</label>
                    <input type="text" name="institutionName" value={form.institutionName} onChange={handleChange} className="w-full border border-gray-300 p-3 rounded-md bg-transparent outline-none focus:border-[#8F0810] transition-colors" />
                  </div>
                  {status.message && (
                    <div className={`flex items-center gap-2 text-sm font-semibold ${status.type === 'success' ? 'text-green-600' : 'text-[#8F0810]'}`}>
                      {status.type === 'success' && <FaCheckCircle />}
                      <span>{status.message}</span>
                    </div>
                  )}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submitting || status.type === 'success'}
                      className="bg-[#8F0810] hover:bg-[#6a060b] disabled:opacity-60 disabled:cursor-not-allowed text-white px-8 py-3 rounded-md font-bold text-sm shadow-md transition-colors w-full"
                    >
                      {submitting ? t.pending : t.submitBtn}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Events;
