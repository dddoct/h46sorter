import { createI18n } from 'vue-i18n'
import zh from '../locales/zh.json'
import ja from '../locales/ja.json'
import en from '../locales/en.json'

const messages = {
  zh,
  ja,
  en
}

const i18n = createI18n({
  legacy: false,
  locale: 'zh',
  fallbackLocale: 'zh',
  messages
})

export { i18n }
export default i18n
