import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      Settings: 'Settings',
      'Profile Information': 'Profile Information',
      'Display Name': 'Display Name',
      Email: 'Email',
      'Phone Number': 'Phone Number',
      'Regional Settings': 'Regional Settings',
      Language: 'Language',
      Currency: 'Currency',
      Timezone: 'Timezone',
      Save: 'Save',
      Cancel: 'Cancel',
      'Change Password': 'Change Password',
      'Update Email': 'Update Email',
      'Update Phone Number': 'Update Phone Number',
      'Not set': 'Not set',
      English: 'English',
      Hindi: 'Hindi',
      Marathi: 'Marathi',
      Gujarati: 'Gujarati',
      'Settings updated successfully': 'Settings updated successfully',
      'Profile updated successfully': 'Profile updated successfully',
      'Loading settings...': 'Loading settings...'
    }
  },
  hi: {
    translation: {
      Settings: 'सेटिंग्स',
      'Profile Information': 'प्रोफ़ाइल जानकारी',
      'Display Name': 'प्रदर्शित नाम',
      Email: 'ईमेल',
      'Phone Number': 'मोबाइल नंबर',
      'Regional Settings': 'क्षेत्रीय सेटिंग्स',
      Language: 'भाषा',
      Currency: 'मुद्रा',
      Timezone: 'समय क्षेत्र',
      Save: 'सहेजें',
      Cancel: 'रद्द करें',
      'Change Password': 'पासवर्ड बदलें',
      'Update Email': 'ईमेल अपडेट करें',
      'Update Phone Number': 'मोबाइल नंबर अपडेट करें',
      'Not set': 'सेट नहीं',
      English: 'अंग्रे़ी',
      Hindi: 'हिंदी',
      Marathi: 'मराठी',
      Gujarati: 'गुजराती',
      'Settings updated successfully': 'सेटिंग्स सफलतापूर्वक अपडेट की गईं',
      'Profile updated successfully': 'प्रोफ़ाइल सफलतापूर्वक अपडेट की गई',
      'Loading settings...': 'सेटिंग्स लोड हो रही हैं...'
    }
  },
  mr: {
    translation: {
      Settings: 'सेटिंग्ज',
      'Profile Information': 'प्रोफाइल माहिती',
      'Display Name': 'प्रदर्शन नाव',
      Email: 'ईमेल',
      'Phone Number': 'फोन नंबर',
      'Regional Settings': 'प्रादेशिक सेटिंग्ज',
      Language: 'भाषा',
      Currency: 'चलन',
      Timezone: 'वेळ क्षेत्र',
      Save: 'जतन करा',
      Cancel: 'रद्द करा',
      'Change Password': 'पासवर्ड बदला',
      'Update Email': 'ईमेल अपडेट करा',
      'Update Phone Number': 'फोन नंबर अपडेट करा',
      'Not set': 'सेट नाही',
      English: 'इंग्रजी',
      Hindi: 'हिंदी',
      Marathi: 'मराठी',
      Gujarati: 'गुजराती',
      'Settings updated successfully': 'सेटिंग्ज यशस्वीरित्या अपडेट केल्या',
      'Profile updated successfully': 'प्रोफाइल यशस्वीरित्या अपडेट केली',
      'Loading settings...': 'सेटिंग्ज लोड होत आहेत...'
    }
  },
  gu: {
    translation: {
      Settings: 'સેટિંગ્સ',
      'Profile Information': 'પ્રોફાઇલ માહિતી',
      'Display Name': 'પ્રદર્શન નામ',
      Email: 'ઇમેઇલ',
      'Phone Number': 'ફોન નંબર',
      'Regional Settings': 'પ્રાદેશિક સેટિંગ્સ',
      Language: 'ભાષા',
      Currency: 'કરન્સી',
      Timezone: 'સમય ઝોન',
      Save: 'સેવ કરો',
      Cancel: 'રદ કરો',
      'Change Password': 'પાસવર્ડ બદલો',
      'Update Email': 'ઇમેઇલ અપડેટ કરો',
      'Update Phone Number': 'ફોન નંબર અપડેટ કરો',
      'Not set': 'સેટ નથી',
      English: 'અંગ્રેજી',
      Hindi: 'હિન્દી',
      Marathi: 'મરાઠી',
      Gujarati: 'ગુજરાતી',
      'Settings updated successfully': 'સેટિંગ્સ સફળતાપૂર્વક અપડેટ થઈ',
      'Profile updated successfully': 'પ્રોફાઇલ સફળતાપૂર્વક અપડેટ થઈ',
      'Loading settings...': 'સેટિંગ્સ લોડ થઈ રહી છે...'
    }
  },
  es: {
    translation: {
      Settings: 'Configuración',
      'Profile Information': 'Información del perfil',
      'Display Name': 'Nombre para mostrar',
      Email: 'Correo electrónico',
      'Phone Number': 'Número de teléfono',
      'Regional Settings': 'Configuración regional',
      Language: 'Idioma',
      Currency: 'Moneda',
      Timezone: 'Zona horaria',
      Save: 'Guardar',
      Cancel: 'Cancelar',
      'Change Password': 'Cambiar contraseña',
      'Update Email': 'Actualizar correo electrónico',
      'Update Phone Number': 'Actualizar número de teléfono',
      'Not set': 'No establecido',
      English: 'Inglés',
      Hindi: 'Hindi',
      Marathi: 'Maratí',
      Gujarati: 'Gujarati',
      Spanish: 'Español',
      'Settings updated successfully': 'Configuración actualizada correctamente',
      'Profile updated successfully': 'Perfil actualizado correctamente',
      'Loading settings...': 'Cargando configuración...'
    }
  },
  fr: {
    translation: {
      Settings: 'Paramètres',
      'Profile Information': 'Informations du profil',
      'Display Name': 'Nom affiché',
      Email: 'E-mail',
      'Phone Number': 'Numéro de téléphone',
      'Regional Settings': 'Paramètres régionaux',
      Language: 'Langue',
      Currency: 'Devise',
      Timezone: 'Fuseau horaire',
      Save: 'Enregistrer',
      Cancel: 'Annuler',
      'Change Password': 'Changer le mot de passe',
      'Update Email': 'Mettre à jour l\'e-mail',
      'Update Phone Number': 'Mettre à jour le numéro de téléphone',
      'Not set': 'Non défini',
      English: 'Anglais',
      Hindi: 'Hindi',
      Marathi: 'Marathi',
      Gujarati: 'Gujarati',
      Spanish: 'Espagnol',
      French: 'Français',
      Chinese: 'Chinois',
      'Settings updated successfully': 'Paramètres mis à jour avec succès',
      'Profile updated successfully': 'Profil mis à jour avec succès',
      'Loading settings...': 'Chargement des paramètres...'
    }
  },
  zh: {
    translation: {
      Settings: '设置',
      'Profile Information': '个人信息',
      'Display Name': '显示名称',
      Email: '电子邮件',
      'Phone Number': '电话号码',
      'Regional Settings': '区域设置',
      Language: '语言',
      Currency: '货币',
      Timezone: '时区',
      Save: '保存',
      Cancel: '取消',
      'Change Password': '更改密码',
      'Update Email': '更新电子邮件',
      'Update Phone Number': '更新电话号码',
      'Not set': '未设置',
      English: '英语',
      Hindi: '印地语',
      Marathi: '马拉地语',
      Gujarati: '古吉拉特语',
      Spanish: '西班牙语',
      French: '法语',
      Chinese: '中文',
      'Settings updated successfully': '设置已成功更新',
      'Profile updated successfully': '个人资料已成功更新',
      'Loading settings...': '正在加载设置...'
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n; 