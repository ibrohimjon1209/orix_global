const SUPPORTED_LANGS = ['uz', 'ru', 'en'];

const toTitle = (value) => value.charAt(0).toUpperCase() + value.slice(1);

export const getCurrentLang = () => {
  const lang = localStorage.getItem('lang');
  return SUPPORTED_LANGS.includes(lang) ? lang : 'en';
};

export const pickLocalized = (item, field, lang = getCurrentLang()) => {
  if (!item) return '';

  const normalizedLang = SUPPORTED_LANGS.includes(lang) ? lang : 'uz';
  const titleLang = toTitle(normalizedLang);
  const fallbackTitleLang = toTitle('uz');
  const candidates = [
    item?.[field]?.[normalizedLang],
    item?.translations?.[normalizedLang]?.[field],
    item?.[`${field}_${normalizedLang}`],
    item?.[`${field}${titleLang}`],
    item?.[`${normalizedLang}_${field}`],
    item?.[field]?.uz,
    item?.translations?.uz?.[field],
    item?.[`${field}_uz`],
    item?.[`${field}${fallbackTitleLang}`],
    item?.[`uz_${field}`],
    item?.[field],
  ];

  return candidates.find((value) => value !== undefined && value !== null && value !== '') || '';
};

export const localizeItem = (item, fields, lang = getCurrentLang()) =>
  fields.reduce(
    (acc, field) => ({
      ...acc,
      [field]: pickLocalized(item, field, lang),
    }),
    { ...item }
  );

export const sortByDisplayOrder = (items = []) =>
  [...items].sort((a, b) => (a?.display_order ?? 9999) - (b?.display_order ?? 9999));
