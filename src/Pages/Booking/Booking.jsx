import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiVideo, FiMapPin, FiChevronDown, FiChevronUp, FiUser, FiCheckCircle } from 'react-icons/fi';
import { homeApi } from '../../api/api';
import { useApiResource } from '../../hooks/useApiResource';
import { getCurrentLang, localizeItem, sortByDisplayOrder } from '../../utils/localization';
import office from './office.png'
import online from './online.png'

const UZBEKISTAN_SLUG = 'uzbekistan';
const OFFICE_MEETING = 'Office Meeting';
const ONLINE_MEETING = 'Online Meeting';

const normalizeList = (data) => (Array.isArray(data) ? data : []);

const localeByLang = {
  uz: 'uz-UZ',
  ru: 'ru-RU',
  en: 'en-US',
};

const getDateParts = (dateValue) => {
  const [year, month, day] = dateValue.split('-').map(Number);
  return { year, month, day };
};

const getLocalDateFromValue = (dateValue) => {
  const { year, month, day } = getDateParts(dateValue);
  return new Date(year, month - 1, day);
};

const isSundayDate = (dateValue) => {
  if (!dateValue) return false;
  return getLocalDateFromValue(dateValue).getDay() === 0;
};

const getOfficeIdFromStaff = (staff) => {
  const office = staff?.office;
  if (office && typeof office === 'object') return office?.id;
  return staff?.officeId ?? staff?.office_id ?? office;
};

const normalizeSearchText = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\u0400-\u04ff]+/gi, ' ')
    .trim();

const hasOfficeRelation = (staff) => {
  const relatedOfficeId = getOfficeIdFromStaff(staff);
  return (
    (relatedOfficeId !== undefined && relatedOfficeId !== null && relatedOfficeId !== '') ||
    Array.isArray(staff?.officeIds) ||
    Array.isArray(staff?.office_ids)
  );
};

const staffBelongsToOffice = (staff, officeId) => {
  const relatedOfficeId = getOfficeIdFromStaff(staff);
  if (relatedOfficeId !== undefined && relatedOfficeId !== null) {
    return String(relatedOfficeId) === String(officeId);
  }

  const officeIds = staff?.officeIds ?? staff?.office_ids;
  if (Array.isArray(officeIds)) {
    return officeIds.some((id) => String(id) === String(officeId));
  }

  return true;
};

const staffMatchesOfficeText = (staff, officeItem) => {
  const officeTokens = normalizeSearchText(`${officeItem?.name || ''} ${officeItem?.address || ''}`)
    .split(' ')
    .filter((token) => token.length > 3 && !['ofisi', 'offis', 'filiali', 'shahri'].includes(token));
  const staffText = normalizeSearchText(`${staff?.full_name || ''} ${staff?.role || ''} ${staff?.bio || ''}`);

  return officeTokens.some((token) => staffText.includes(token));
};

const getErrorMessage = (error) => {
  const data = error?.response?.data;
  if (typeof data === 'string') return data;
  if (data?.detail) return data.detail;
  if (data?.message) return data.message;
  if (data && typeof data === 'object') return Object.values(data).flat().filter(Boolean).join(' ');
  return error?.message || 'Bron qilishda xatolik yuz berdi.';
};

const Booking = () => {
  const [step, setStep] = useState(1);
  const [showDetails, setShowDetails] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const lang = getCurrentLang();
  const countriesQuery = useApiResource(homeApi.getCountries);
  const officesQuery = useApiResource(homeApi.getOffices);
  const staffQuery = useApiResource(homeApi.getStaffMembers);

  const t = {
    uz: {
      servicesTitle: "Bizning Xizmatlar",
      officeTime: "30 daq",
      bookNow: "Band qilish",
      back: "< Orqaga",
      selectInfo: "Ma'lumotlarni tanlang",
      locationLabel: "Lokatsiya (Offisni tanlang)",
      anyLoc: "Farqi yo'q (Ixtiyoriy)",
      staffLabel: "Xodimni tanlang",
      anyStaff: "Farqi yo'q (Ixtiyoriy)",
      emptyCal: "Kalendardan o'zingizga qulay sanani tanlang.",
      freeTimes: "Bo'sh vaqtlar",
      bookingDetails: "Uchrashuv Tafsilotlari",
      noDate: "Sana va vaqt tanlanmagan",
      availOnline: "Onlayn Mavjud",
      moreDetails: "Ko'proq malumot",
      clientInfo: "Mijoz ma'lumotlari:",
      notFilled: "Hali to'ldirilmadi",
      personalInfo: "Shaxsiy Ma'lumotlar",
      fName: "Ismingiz *",
      lName: "Familiyangiz *",
      email: "Elektron Pochta *",
      phone: "Telefon raqam *",
      msgLabel: "Xabaringiz (Ixtiyoriy)",
      msgPlaceholder: "Uchrashuv uchun qo'shimcha ma'lumotlar...",
      bookIt: "Uchrashuvni Tasdiqlash",
      validation: "Iltimos, sana va vaqtni tanlang!",
      formValidation: "Iltimos, majburiy maydonlarni to'ldiring!",
      officeValidation: "Tanlangan davlat uchun ofis topilmadi.",
      successTitle: "Muvaffaqiyatli saqlandi!",
      successDesc: "Tez orada menejerlarimiz siz bilan bog'lanishadi. Ma'lumotlaringiz muvaffaqiyatli qabul qilindi.",
      yourAppt: "Sizning uchrashuv ma'lumotlaringiz:",
      serviceType: "Xizmat turi:",
      staffStr: "Xodim:",
      locStr: "Lokatsiya:",
      timeStr: "Vaqt:",
      backHome: "Bosh sahifaga qaytish",
      month: "May 2026",
      countryLabel: "Davlatni tanlang",
      noOffices: "Bu davlat uchun ofis mavjud emas",
      weekendValidation: "Yakshanba kunlari uchrashuv mavjud emas.",
      daysNames: ["YAK","DSH","SESH","CHOR","PAY","JUM","SHAN"]
    },
    ru: {
      servicesTitle: "Наши Услуги",
      officeTime: "30 мин",
      bookNow: "Забронировать",
      back: "< Назад",
      selectInfo: "Выберите данные",
      locationLabel: "Локация (Выберите офис)",
      anyLoc: "Не имеет значения",
      staffLabel: "Выберите сотрудника",
      anyStaff: "Любой специалист",
      emptyCal: "Выберите удобную дату в календаре.",
      freeTimes: "Свободное время",
      bookingDetails: "Детали Бронирования",
      noDate: "Дата и время не выбраны",
      availOnline: "Доступно онлайн",
      moreDetails: "Подробнее",
      clientInfo: "Данные клиента:",
      notFilled: "Пока не заполнено",
      personalInfo: "Личные данные",
      fName: "Имя *",
      lName: "Фамилия *",
      email: "Email *",
      phone: "Номер телефона *",
      msgLabel: "Ваше сообщение (Необязательно)",
      msgPlaceholder: "Дополнительная информация для встречи...",
      bookIt: "Подтвердить",
      validation: "Пожалуйста, выберите дату и время!",
      formValidation: "Пожалуйста, заполните обязательные поля!",
      officeValidation: "Для выбранной страны офис не найден.",
      successTitle: "Успешно сохранено!",
      successDesc: "Наши менеджеры скоро свяжутся с вами. Ваши данные были успешно получены.",
      yourAppt: "Детали вашей встречи:",
      serviceType: "Тип услуги:",
      staffStr: "Сотрудник:",
      locStr: "Локация:",
      timeStr: "Время:",
      backHome: "Вернуться на главную",
      month: "Май 2026",
      countryLabel: "Выберите страну",
      noOffices: "Для этой страны офисов нет",
      weekendValidation: "В воскресенье встречи недоступны.",
      daysNames: ["ВС","ПН","ВТ","СР","ЧТ","ПТ","СБ"]
    },
    en: {
      servicesTitle: "Our Services",
      officeTime: "30 min",
      bookNow: "Book Now",
      back: "< Back",
      selectInfo: "Select your details",
      locationLabel: "Location (Choose an office)",
      anyLoc: "Doesn't matter (Any)",
      staffLabel: "Choose a staff member",
      anyStaff: "Any Staff",
      emptyCal: "Please select a convenient date from the calendar.",
      freeTimes: "Available Times",
      bookingDetails: "Booking Details",
      noDate: "No date and time selected",
      availOnline: "Available Online",
      moreDetails: "More details",
      clientInfo: "Client Info:",
      notFilled: "Not filled yet",
      personalInfo: "Personal Details",
      fName: "First Name *",
      lName: "Last Name *",
      email: "Email Address *",
      phone: "Phone Number *",
      msgLabel: "Your Message (Optional)",
      msgPlaceholder: "Any additional details for the meeting...",
      bookIt: "Confirm Booking",
      validation: "Please select a date and time!",
      formValidation: "Please fill in the required fields!",
      officeValidation: "No office found for the selected country.",
      successTitle: "Successfully Booked!",
      successDesc: "Our managers will contact you shortly. Your information has been received successfully.",
      yourAppt: "Your Appointment Info:",
      serviceType: "Service Type:",
      staffStr: "Staff:",
      locStr: "Location:",
      timeStr: "Time:",
      backHome: "Return Home",
      month: "May 2026",
      countryLabel: "Choose a country",
      noOffices: "No offices for this country",
      weekendValidation: "Meetings are not available on Sundays.",
      daysNames: ["SUN","MON","TUE","WED","THU","FRI","SAT"]
    }
  }[lang];

  const [bookingData, setBookingData] = useState({
    type: null,
    country: '',
    location: t.anyLoc,
    office: 0,
    staff: t.anyStaff,
    staffMember: 0,
    date: '',
    scheduledDate: '',
    time: '',
    scheduledTime: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: ''
  });

  const countries = useMemo(
    () =>
      normalizeList(countriesQuery.data)
        .filter((country) => country?.is_active !== false)
        .map((country) => localizeItem(country, ['name'], lang)),
    [countriesQuery.data, lang]
  );

  const staffMembers = useMemo(
    () =>
      sortByDisplayOrder(normalizeList(staffQuery.data)).map((staff) =>
        localizeItem(staff, ['full_name', 'role'], lang)
      ),
    [staffQuery.data, lang]
  );

  const offices = useMemo(
    () =>
      sortByDisplayOrder(normalizeList(officesQuery.data)).map((office) =>
        localizeItem(office, ['name', 'address'], lang)
      ),
    [officesQuery.data, lang]
  );

  const uzbekistanCountry = useMemo(
    () =>
      countries.find((country) => country?.slug === UZBEKISTAN_SLUG) || {
        id: UZBEKISTAN_SLUG,
        name: "O'zbekiston",
        slug: UZBEKISTAN_SLUG,
      },
    [countries]
  );

  const visibleOffices = useMemo(
    () => offices.filter((office) => office?.countrySlug === UZBEKISTAN_SLUG),
    [offices]
  );

  const visibleStaffMembers = useMemo(() => {
    const selectedOffice = visibleOffices.find((office) => String(office?.id) === String(bookingData.office)) || visibleOffices?.[0];
    const selectedOfficeId = selectedOffice?.id;
    const countryStaff = staffMembers.filter((staff) => staff?.countrySlug === UZBEKISTAN_SLUG);

    if (bookingData.type === ONLINE_MEETING) return countryStaff;
    if (!selectedOfficeId) return countryStaff;

    if (countryStaff.some(hasOfficeRelation)) {
      return countryStaff.filter((staff) => staffBelongsToOffice(staff, selectedOfficeId));
    }

    const textMatchedStaff = countryStaff.filter((staff) => staffMatchesOfficeText(staff, selectedOffice));
    return textMatchedStaff.length > 0 ? textMatchedStaff : countryStaff;
  }, [bookingData.office, bookingData.type, staffMembers, visibleOffices]);

  const officeMeetingImage = uzbekistanCountry?.imageUrl || office;
  const calendarBaseDate = useMemo(() => new Date(), []);
  const calendarYear = calendarBaseDate.getFullYear();
  const calendarMonthIndex = calendarBaseDate.getMonth();
  const calendarLocale = localeByLang[lang] || localeByLang.en;
  const calendarMonthLabel = useMemo(
    () => new Intl.DateTimeFormat(calendarLocale, { month: 'long', year: 'numeric' }).format(calendarBaseDate),
    [calendarBaseDate, calendarLocale]
  );
  const calendarDateFormatter = useMemo(
    () => new Intl.DateTimeFormat(calendarLocale, { month: 'long', day: 'numeric', year: 'numeric' }),
    [calendarLocale]
  );
  const calendarDays = useMemo(() => {
    const daysInMonth = new Date(calendarYear, calendarMonthIndex + 1, 0).getDate();
    const firstDayOfMonth = new Date(calendarYear, calendarMonthIndex, 1).getDay();
    const leadingBlankCount = firstDayOfMonth === 0 ? 0 : firstDayOfMonth - 1;
    const days = Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1;
      const date = new Date(calendarYear, calendarMonthIndex, day);
      const dateValue = `${calendarYear}-${String(calendarMonthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      return {
        day,
        date,
        dateValue,
        displayDate: calendarDateFormatter.format(date),
      };
    }).filter(({ date }) => date.getDay() !== 0);

    return { leadingBlankCount, days };
  }, [calendarDateFormatter, calendarMonthIndex, calendarYear]);

  useEffect(() => {
    if (bookingData.country !== UZBEKISTAN_SLUG) {
      setBookingData((prev) => ({ ...prev, country: UZBEKISTAN_SLUG }));
    }
  }, [bookingData.country]);

  useEffect(() => {
    const selectedStaffExists = visibleStaffMembers.some((staff) => String(staff?.id) === String(bookingData.staffMember));

    if (!selectedStaffExists) {
      const nextStaff = visibleStaffMembers?.[0];
      setBookingData((prev) => ({
        ...prev,
        staffMember: nextStaff?.id || '',
        staff: nextStaff?.full_name || t.anyStaff,
      }));
    }
  }, [bookingData.staffMember, visibleStaffMembers, t.anyStaff]);

  useEffect(() => {
    const selectedOfficeExists = visibleOffices.some((office) => String(office?.id) === String(bookingData.office));

    if (!selectedOfficeExists) {
      const nextOffice = visibleOffices?.[0];
      setBookingData((prev) => ({
        ...prev,
        office: nextOffice?.id || '',
        location: nextOffice?.name || t.anyLoc,
      }));
    }
  }, [bookingData.office, visibleOffices, t.anyLoc]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  const handleSelectService = (type) => {
    setBookingData({ ...bookingData, type });
    setStep(2);
  };

  const handleNext = () => {
    if (step === 2 && (!bookingData.date || !bookingData.time)) {
      alert(t.validation);
      return;
    }
    if (step === 2 && isSundayDate(bookingData.scheduledDate)) {
      alert(t.weekendValidation);
      return;
    }
    setStep((prev) => prev + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!bookingData.firstName.trim() || !bookingData.lastName.trim() || !bookingData.email.trim() || !bookingData.phone.trim() || !bookingData.scheduledDate || !bookingData.time) {
      setSubmitError(t.formValidation);
      return;
    }

    if (isSundayDate(bookingData.scheduledDate)) {
      setSubmitError(t.weekendValidation);
      return;
    }

    if (bookingData.type !== ONLINE_MEETING && !bookingData.office) {
      setSubmitError(t.officeValidation);
      return;
    }

    setSubmitting(true);

    try {
      const selectedOffice = visibleOffices.find((office) => String(office?.id) === String(bookingData.office)) || visibleOffices?.[0];
      const selectedStaff = visibleStaffMembers.find((staff) => String(staff?.id) === String(bookingData.staffMember)) || visibleStaffMembers?.[0];

      const payload = {
        country: UZBEKISTAN_SLUG,
        staffMember: Number(selectedStaff?.id) || undefined,
        serviceType: bookingData.type === ONLINE_MEETING ? 'online' : 'office',
        scheduledDate: bookingData.scheduledDate,
        scheduledTime: bookingData.scheduledTime,
        firstName: bookingData.firstName.trim(),
        lastName: bookingData.lastName.trim(),
        email: bookingData.email.trim(),
        phone: bookingData.phone.trim(),
        message: bookingData.message.trim(),
      };

      if (bookingData.type !== ONLINE_MEETING) {
        payload.office = Number(selectedOffice?.id) || undefined;
      }

      await homeApi.createBooking(payload);

      setStep(4);
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const availableTimes = [
    { label: '09:30 am', value: '09:30:00' },
    { label: '10:00 am', value: '10:00:00' },
    { label: '10:30 am', value: '10:30:00' },
    { label: '11:00 am', value: '11:00:00' },
    { label: '11:30 am', value: '11:30:00' },
    { label: '12:00 pm', value: '12:00:00' },
    { label: '01:00 pm', value: '13:00:00' },
    { label: '01:30 pm', value: '13:30:00' },
    { label: '02:00 pm', value: '14:00:00' },
    { label: '02:30 pm', value: '14:30:00' },
    { label: '03:00 pm', value: '15:00:00' },
    { label: '03:30 pm', value: '15:30:00' },
    { label: '04:00 pm', value: '16:00:00' },
    { label: '04:30 pm', value: '16:30:00' },
    { label: '05:00 pm', value: '17:00:00' }
  ];

  const renderCalendar = () => {
    const workdayNames = t.daysNames.slice(1);

    return (
      <div className="w-full md:w-1/2 bg-white p-6 border border-gray-200 shadow-sm rounded-md">
        <h4 className="font-bold text-center mb-6 text-[#274F94]">{calendarMonthLabel}</h4>
        <div className="grid grid-cols-6 gap-1 text-center text-[10px] md:text-[11px] mb-2 font-bold text-gray-400">
          {workdayNames.map((d, i) => <div key={i}>{d}</div>)}
        </div>
        <div className="grid grid-cols-6 gap-1 text-center text-sm font-medium">
          {Array.from({ length: calendarDays.leadingBlankCount }, (_, index) => (
            <div key={`blank-${index}`}></div>
          ))}
          {calendarDays.days.map(({ day, dateValue, displayDate }) => (
             <div 
               key={dateValue}
               onClick={() => setBookingData({...bookingData, date: displayDate, scheduledDate: dateValue, time: '', scheduledTime: ''})}
               className={`p-2.5 cursor-pointer rounded-full transition-colors flex items-center justify-center 
               ${bookingData.scheduledDate === dateValue ? 'bg-[#8F0810] text-white shadow-md font-bold' : 'text-[#274F94] hover:bg-red-50'}`}
             >
               {day}
             </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSidebar = () => (
    <div className="bg-white border border-gray-200 p-6 shadow-sm flex flex-col w-full h-fit sticky top-24 rounded-md">
      <h3 className="text-xl font-extrabold text-[#274F94] mb-4 pb-4 border-b border-gray-200">{t.bookingDetails}</h3>
      
      <p className="text-lg font-bold text-[#111827] mb-1">{bookingData.type}</p>
      
      {bookingData.date && bookingData.time ? (
         <p className="text-[#8F0810] font-bold text-md mb-4">{bookingData.date} at {bookingData.time}</p>
      ) : (
         <p className="text-gray-400 font-medium text-sm mb-4">{t.noDate}</p>
      )}

      <div className="flex flex-col gap-3 mb-6">
        {bookingData.type === ONLINE_MEETING ? (
          <div className="flex items-center gap-2 text-sm font-bold text-[#274F94] bg-gray-100 px-3 py-2 rounded-md border border-gray-300">
            <FiVideo className="text-[#8F0810]"/> {t.availOnline}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm font-bold text-[#274F94] bg-gray-100 px-3 py-2 rounded-md border border-gray-300">
            <FiMapPin className="text-[#8F0810]"/> {bookingData.location}
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-[#274F94] font-bold bg-gray-100 px-3 py-2 rounded-md border border-gray-300">
           <FiUser className="text-[#8F0810]"/> {bookingData.staff}
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <div 
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center justify-between cursor-pointer group"
        >
          <span className="text-sm font-semibold text-[#274F94] group-hover:text-[#8F0810] transition-colors">{t.moreDetails}</span>
          {showDetails ? <FiChevronUp className="text-[#8F0810]" /> : <FiChevronDown className="text-gray-400 group-hover:text-[#8F0810]" />}
        </div>
        
        <AnimatePresence>
          {showDetails && (
            <motion.div 
               initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
               className="overflow-hidden mt-4"
            >
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200 text-sm">
                <p className="text-[#274F94] mb-1 font-semibold">{t.clientInfo}</p>
                {(bookingData.firstName || bookingData.lastName) ? (
                  <p className="font-bold text-[#111827]">{bookingData.firstName} {bookingData.lastName}</p>
                ) : (
                  <p className="text-orange-500 font-medium italic">{t.notFilled}</p>
                )}
                {bookingData.email && <p className="text-gray-600 mt-1">{bookingData.email}</p>}
                {bookingData.phone && <p className="text-gray-600 mt-1">{bookingData.phone}</p>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-[#f4f6f9] py-16 px-6 relative font-sans">
      <div className="max-w-[1100px] mx-auto mt-10">

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              className="flex flex-col items-center"
            >
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#274F94] mb-12">{t.servicesTitle}</h2>
              <div className="flex flex-col md:flex-row gap-8 justify-center w-full max-w-[800px]">
                <div className="bg-white shadow-md w-full md:w-1/2 flex flex-col group hover:shadow-xl transition-shadow cursor-default rounded-md overflow-hidden">
                  <div className="h-[220px] w-full overflow-hidden">
                    <img src={officeMeetingImage} alt="Office" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-6 pb-8 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-[#274F94] mb-6">{OFFICE_MEETING}</h3>
                    <p className="text-gray-500 text-sm font-medium">{t.officeTime}</p>
                  </div>
                  <div className="p-6">
                    <button onClick={() => handleSelectService(OFFICE_MEETING)} className="bg-[#8F0810] hover:bg-[#6a060b] text-white px-6 py-2 rounded-sm font-bold text-sm shadow-md">{t.bookNow}</button>
                  </div>
                </div>

                <div className="bg-white shadow-md w-full md:w-1/2 flex flex-col group hover:shadow-xl transition-shadow cursor-default rounded-md overflow-hidden">
                  <div className="h-[220px] w-full overflow-hidden">
                    <img src={online} alt="Online" className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-6 pb-8 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-[#274F94] mb-6">{ONLINE_MEETING}</h3>
                    <p className="text-gray-500 text-sm font-medium">{t.officeTime}</p>
                  </div>
                  <div className="p-6">
                    <button onClick={() => handleSelectService(ONLINE_MEETING)} className="bg-[#8F0810] hover:bg-[#6a060b] text-white px-6 py-2 rounded-sm font-bold text-sm shadow-md">{t.bookNow}</button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              className="flex flex-col lg:flex-row gap-8 lg:gap-16 w-full max-w-[1200px]"
            >
              <div className="flex-1">
                <button onClick={() => setStep(1)} className="text-[#8F0810] font-bold text-sm hover:underline mb-6 flex items-center gap-1">{t.back}</button>
                <h2 className="text-3xl font-extrabold text-[#274F94] mb-8">{t.selectInfo}</h2>
                <div className="flex flex-col md:flex-row gap-6 mb-8">
                  <div className="flex-1">
                    <label className="block text-sm font-bold text-[#274F94] mb-2">{t.countryLabel}</label>
                    <select className="w-full border border-gray-300 p-3 bg-white font-medium outline-none text-[#274F94] shadow-sm rounded-md focus:border-[#8F0810]" value={bookingData.country} onChange={() => setBookingData({...bookingData, country: UZBEKISTAN_SLUG, office: '', location: t.anyLoc})}>
                      <option value={UZBEKISTAN_SLUG}>{uzbekistanCountry.name}</option>
                    </select>
                  </div>
                  <div className={`flex-1 ${bookingData.type === ONLINE_MEETING ? 'opacity-50 pointer-events-none' : ''}`}>
                    <label className="block text-sm font-bold text-[#274F94] mb-2">{t.locationLabel}</label>
                    <select className="w-full border border-gray-300 p-3 bg-white font-medium outline-none text-[#274F94] shadow-sm rounded-md focus:border-[#8F0810]" value={bookingData.office} onChange={(e) => {
                      const selected = visibleOffices.find((office) => String(office?.id) === e.target.value);
                      setBookingData({...bookingData, office: e.target.value, location: selected?.name || t.anyLoc, staffMember: '', staff: t.anyStaff});
                    }}>
                      {visibleOffices.length > 0 ? (
                        visibleOffices.map((office) => (
                          <option key={office?.id} value={office?.id}>{office?.name}</option>
                        ))
                      ) : (
                        <option value="">{t.noOffices}</option>
                      )}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-bold text-[#274F94] mb-2">{t.staffLabel}</label>
                    <select className="w-full border border-gray-300 p-3 bg-white font-medium outline-none text-[#274F94] shadow-sm rounded-md focus:border-[#8F0810]" value={bookingData.staffMember} onChange={(e) => {
                      const selected = visibleStaffMembers.find((staff) => String(staff?.id) === e.target.value);
                      setBookingData({...bookingData, staffMember: e.target.value, staff: selected?.full_name || t.anyStaff});
                    }}>
                      {visibleStaffMembers.length > 0 ? (
                        visibleStaffMembers.map((staff) => (
                          <option key={staff?.id} value={staff?.id}>{staff?.full_name}</option>
                        ))
                      ) : (
                        <option value="">{t.anyStaff}</option>
                      )}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                  {renderCalendar()}
                  <div className="w-full md:w-1/2 flex flex-col bg-white border border-gray-200 shadow-sm rounded-md">
                    <h4 className="font-bold text-center py-4 border-b border-gray-200 text-[#274F94] bg-gray-50 rounded-t-md">{t.freeTimes}</h4>
                    <div className="flex-1 h-[250px] overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar">
                      {bookingData.date ? (
                        availableTimes.map((time, idx) => (
                          <div key={idx} className="flex gap-2">
                            <button onClick={() => setBookingData({...bookingData, time: time.label, scheduledTime: time.value})} className={`flex-1 py-3 border rounded-md font-bold text-sm transition-colors ${bookingData.scheduledTime === time.value ? 'border-[#8F0810] bg-[#fcf0f1] text-[#8F0810]' : 'border-gray-200 text-[#274F94] hover:border-[#8F0810] hover:text-[#8F0810]'}`}>{time.label}</button>
                            {bookingData.scheduledTime === time.value && (
                              <motion.button initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} onClick={handleNext} className="w-[80px] bg-[#8F0810] text-white font-bold text-sm rounded-md hover:bg-[#6a060b] shadow-sm transition-colors">Next</motion.button>
                            )}
                          </div>
                        ))
                      ) : (<div className="h-full flex items-center justify-center text-gray-400 font-medium text-sm text-center px-4">{t.emptyCal}</div>)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full lg:w-[350px]">{renderSidebar()}</div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              className="flex flex-col lg:flex-row gap-8 lg:gap-16 w-full max-w-[1200px]"
            >
              <div className="flex-1 bg-white p-6 md:p-8 border border-gray-200 shadow-sm rounded-md">
                <button onClick={() => setStep(2)} className="text-[#8F0810] font-bold text-sm hover:underline mb-8 flex items-center gap-1">{t.back}</button>
                <h2 className="text-3xl font-extrabold text-[#274F94] mb-8">{t.personalInfo}</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <label className="block text-[13px] font-bold text-[#274F94] mb-2">{t.fName}</label>
                      <input required type="text" className="w-full border border-gray-300 p-3 rounded-md bg-transparent outline-none focus:border-[#8F0810]" value={bookingData.firstName} onChange={e=>setBookingData({...bookingData, firstName: e.target.value})} />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[13px] font-bold text-[#274F94] mb-2">{t.lName}</label>
                      <input required type="text" className="w-full border border-gray-300 p-3 rounded-md bg-transparent outline-none focus:border-[#8F0810]" value={bookingData.lastName} onChange={e=>setBookingData({...bookingData, lastName: e.target.value})} />
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row gap-6">
                     <div className="flex-1">
                      <label className="block text-[13px] font-bold text-[#274F94] mb-2">{t.email}</label>
                      <input required type="email" className="w-full border border-gray-300 p-3 rounded-md bg-transparent outline-none focus:border-[#8F0810]" value={bookingData.email} onChange={e=>setBookingData({...bookingData, email: e.target.value})} />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[13px] font-bold text-[#274F94] mb-2">{t.phone}</label>
                      <input required type="text" className="w-full border border-gray-300 p-3 rounded-md bg-transparent outline-none focus:border-[#8F0810]" value={bookingData.phone} onChange={e=>setBookingData({...bookingData, phone: e.target.value})} />
                    </div>
                  </div>
                  <div>
                     <label className="block text-[13px] font-bold text-[#274F94] mb-2">{t.msgLabel}</label>
                     <textarea rows="4" className="w-full border border-gray-300 p-3 rounded-md bg-transparent outline-none focus:border-[#8F0810]" value={bookingData.message} onChange={e=>setBookingData({...bookingData, message: e.target.value})} placeholder={t.msgPlaceholder}></textarea>
                  </div>
                  <div className="pt-4 border-t border-gray-100 flex justify-end">
                     <div className="w-full md:w-auto">
                       {submitError && <p className="text-[#8F0810] font-semibold text-sm mb-3">{submitError}</p>}
                       <button type="submit" disabled={submitting} className="bg-[#8F0810] hover:bg-[#6a060b] disabled:opacity-60 disabled:cursor-not-allowed text-white px-10 py-3.5 rounded-md font-bold shadow-md transition-colors w-full md:w-auto">{submitting ? '...' : t.bookIt}</button>
                     </div>
                  </div>
                </form>
              </div>
              <div className="w-full lg:w-[350px]">{renderSidebar()}</div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="w-full flex justify-center items-center py-10"
            >
              <div className="bg-white p-8 md:p-14 rounded-md shadow-lg border border-gray-100 text-center max-w-[600px] w-full">
                <div className="flex justify-center mb-6"><FiCheckCircle className="text-green-500 text-7xl" /></div>
                <h2 className="text-3xl font-extrabold text-[#274F94] mb-4">{t.successTitle}</h2>
                <p className="text-[#274F94] font-medium mb-8">{t.successDesc}</p>
                <div className="bg-[#fcf0f1] p-6 rounded-md border border-[#fad2d5] text-left mb-8">
                  <h4 className="font-bold text-[#8F0810] mb-4">{t.yourAppt}</h4>
                  <p className="text-sm font-medium text-[#274F94] mb-2"><strong>{t.clientInfo.replace(':','')}</strong> {bookingData.firstName} {bookingData.lastName}</p>
                  <p className="text-sm font-medium text-[#274F94] mb-2"><strong>{t.serviceType}</strong> {bookingData.type}</p>
                  <p className="text-sm font-medium text-[#274F94] mb-2"><strong>{t.staffStr}</strong> {bookingData.staff}</p>
                  {bookingData.type !== ONLINE_MEETING && (
                     <p className="text-sm font-medium text-[#274F94] mb-2"><strong>{t.locStr}</strong> {bookingData.location}</p>
                  )}
                  <p className="text-sm font-medium text-[#274F94]"><strong>{t.timeStr}</strong> {bookingData.date} | {bookingData.time}</p>
                </div>
                <div className="flex justify-center">
                  <button onClick={() => { setStep(1); setSubmitError(''); setBookingData({...bookingData, firstName:'', lastName:'', email:'', phone:'', message:'', date:'', scheduledDate:'', time:'', scheduledTime:''}) }} className="bg-[#8F0810] hover:bg-[#6a060b] text-white px-8 py-3 rounded-md font-bold shadow-md transition-colors">{t.backHome}</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Booking;
