import { GlobalOutlined } from '@ant-design/icons';
import { Select } from 'antd';
import { SizeType } from 'antd/es/config-provider/SizeContext';
import { useState } from 'react';
import { STORAGES } from '../../constants/storage';
import { getCookie, setCookie } from '../../utils/cookie';
import { languageOptions, LANGUAGESUPPORT } from '../../constants/languages';
import { useTranslation } from 'react-i18next';

interface LanguageSelectProps {
  className?: string;
  size?: SizeType;
  mini?: boolean;
  /**
   * Explicit enable flag — framework-agnostic.
   * Callers (admin/website) resolve it from their own env var and pass in.
   * If omitted, defaults to `true`.
   */
  enabled?: boolean;
}

const LanguageSelect = ({
  className,
  size,
  mini = false,
  enabled = true,
}: LanguageSelectProps) => {
  const storedLang = getCookie(STORAGES.LANGUAGE) ?? 'vi';
  const [language, setLanguage] = useState<LANGUAGESUPPORT>(storedLang);
  const { i18n } = useTranslation();

  const handleChange = (language: LANGUAGESUPPORT) => {
    setLanguage(language);
    i18n.changeLanguage(language);
    setCookie(STORAGES.LANGUAGE, language);
  };

  if (enabled) {
    // Nếu mini = true, tạo mảng options chỉ có flag
    const options = mini
      ? languageOptions.map((option) => ({
          ...option,
          label: option.flagLabel, // thay thế label bằng flagLabel
        }))
      : languageOptions;

    return (
      <Select
        size={size}
        options={options}
        onChange={handleChange}
        defaultValue={language}
        className={className}
        value={language}
        suffixIcon={<GlobalOutlined />}
        optionLabelProp={mini ? 'flagLabel' : 'label'}
      />
    );
  } else {
    return null;
  }
};

export default LanguageSelect;
