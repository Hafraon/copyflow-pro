export const SUPPORTED_LANGUAGES = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    rtl: false,
    currency: 'USD',
    region: 'US'
  },
  ua: {
    code: 'ua',
    name: 'Ukrainian',
    nativeName: 'Українська',
    flag: '🇺🇦',
    rtl: false,
    currency: 'UAH',
    region: 'UA'
  },
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    rtl: false,
    currency: 'EUR',
    region: 'DE'
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    rtl: false,
    currency: 'EUR',
    region: 'ES'
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    rtl: false,
    currency: 'EUR',
    region: 'FR'
  },
  it: {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    rtl: false,
    currency: 'EUR',
    region: 'IT'
  },
  pl: {
    code: 'pl',
    name: 'Polish',
    nativeName: 'Polski',
    flag: '🇵🇱',
    rtl: false,
    currency: 'PLN',
    region: 'PL'
  },
  pt: {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇵🇹',
    rtl: false,
    currency: 'EUR',
    region: 'PT'
  },
  zh: {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳',
    rtl: false,
    currency: 'CNY',
    region: 'CN'
  },
  ja: {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    rtl: false,
    currency: 'JPY',
    region: 'JP'
  },
  ru: {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺',
    rtl: false,
    currency: 'RUB',
    region: 'RU'
  },
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    rtl: true,
    currency: 'SAR',
    region: 'SA'
  }
} as const;

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES;

export const CULTURAL_CONTEXTS = {
  en: {
    values: ['innovation', 'efficiency', 'value', 'convenience'],
    trustSignals: ['certified', 'tested', 'guaranteed', 'award-winning'],
    communication: 'direct, benefit-focused',
    socialProof: ['reviews', 'testimonials', 'ratings'],
    urgency: ['limited time', 'while supplies last', 'act now']
  },
  ua: {
    values: ['сім\'я', 'якість', 'надійність', 'цінність'],
    trustSignals: ['гарантія', 'перевірено', 'український', 'сертифіковано'],
    communication: 'емоційний, орієнтований на сім\'ю',
    socialProof: ['відгуки', 'рекомендації', 'довіра'],
    urgency: ['обмежена пропозиція', 'поки є в наявності', 'встигніть']
  },
  de: {
    values: ['Präzision', 'Qualität', 'Langlebigkeit', 'Effizienz'],
    trustSignals: ['TÜV geprüft', 'Made in Germany', 'Qualität', 'zertifiziert'],
    communication: 'technisch, detailliert, sachlich',
    socialProof: ['Bewertungen', 'Expertenmeinungen', 'Auszeichnungen'],
    urgency: ['begrenzte Zeit', 'solange Vorrat reicht', 'jetzt handeln']
  },
  es: {
    values: ['familia', 'tradición', 'pasión', 'calidad'],
    trustSignals: ['garantizado', 'probado', 'recomendado', 'premiado'],
    communication: 'cálido, expresivo, personal',
    socialProof: ['reseñas', 'testimonios', 'recomendaciones'],
    urgency: ['oferta limitada', 'últimas unidades', 'no te lo pierdas']
  },
  fr: {
    values: ['élégance', 'sophistication', 'qualité', 'art de vivre'],
    trustSignals: ['certifié', 'testé', 'approuvé', 'primé'],
    communication: 'raffiné, sophistiqué, culturel',
    socialProof: ['avis', 'témoignages', 'recommandations'],
    urgency: ['offre limitée', 'stock limité', 'profitez-en maintenant']
  },
  it: {
    values: ['stile', 'tradizione', 'passione', 'bellezza'],
    trustSignals: ['certificato', 'testato', 'garantito', 'premiato'],
    communication: 'appassionato, stiloso, espressivo',
    socialProof: ['recensioni', 'testimonianze', 'raccomandazioni'],
    urgency: ['offerta limitata', 'ultimi pezzi', 'non perdere']
  },
  pl: {
    values: ['rodzina', 'tradycja', 'jakość', 'wartość'],
    trustSignals: ['certyfikowane', 'sprawdzone', 'gwarantowane', 'nagrodzone'],
    communication: 'ciepły, rodzinny, szczery',
    socialProof: ['opinie', 'rekomendacje', 'oceny'],
    urgency: ['ograniczona oferta', 'ostatnie sztuki', 'nie czekaj']
  },
  pt: {
    values: ['família', 'tradição', 'qualidade', 'confiança'],
    trustSignals: ['certificado', 'testado', 'garantido', 'premiado'],
    communication: 'caloroso, familiar, confiável',
    socialProof: ['avaliações', 'testemunhos', 'recomendações'],
    urgency: ['oferta limitada', 'últimas unidades', 'aproveite agora']
  },
  zh: {
    values: ['创新', '技术', '地位', '品质'],
    trustSignals: ['认证', '测试', '保证', '获奖'],
    communication: '现代化，技术导向，地位象征',
    socialProof: ['评价', '推荐', '口碑'],
    urgency: ['限时优惠', '数量有限', '立即行动']
  },
  ja: {
    values: ['品質', '技術', '伝統', '革新'],
    trustSignals: ['認証済み', 'テスト済み', '保証付き', '受賞'],
    communication: '丁寧、技術重視、品質志向',
    socialProof: ['レビュー', '推薦', '評価'],
    urgency: ['期間限定', '在庫限り', '今すぐ']
  },
  ru: {
    values: ['качество', 'надёжность', 'престиж', 'традиция'],
    trustSignals: ['сертифицировано', 'проверено', 'гарантировано', 'награждено'],
    communication: 'авторитетный, престижный, надёжный',
    socialProof: ['отзывы', 'рекомендации', 'оценки'],
    urgency: ['ограниченное предложение', 'пока есть в наличии', 'действуйте сейчас']
  },
  ar: {
    values: ['احترام', 'تقليد', 'عائلة', 'جودة'],
    trustSignals: ['معتمد', 'مختبر', 'مضمون', 'حائز على جوائز'],
    communication: 'محترم، تقليدي، عائلي',
    socialProof: ['مراجعات', 'شهادات', 'توصيات'],
    urgency: ['عرض محدود', 'كمية محدودة', 'اطلب الآن']
  }
} as const;

export const VIRAL_PLATFORMS = {
  tiktok: {
    name: 'TikTok',
    icon: '🎵',
    hooks: {
      en: ['POV:', 'The secret that...', 'Nobody will tell you...', 'This changed everything:', 'Wait for it...'],
      ua: ['POV:', 'Секрет, який...', 'Ніхто не розповість вам...', 'Це все змінило:', 'Зачекайте...'],
      de: ['POV:', 'Das Geheimnis, das...', 'Niemand wird dir sagen...', 'Das hat alles verändert:', 'Warte ab...'],
      es: ['POV:', 'El secreto que...', 'Nadie te dirá...', 'Esto lo cambió todo:', 'Espera...'],
      fr: ['POV:', 'Le secret que...', 'Personne ne vous dira...', 'Cela a tout changé:', 'Attendez...'],
      it: ['POV:', 'Il segreto che...', 'Nessuno ti dirà...', 'Questo ha cambiato tutto:', 'Aspetta...'],
      pl: ['POV:', 'Sekret, który...', 'Nikt ci nie powie...', 'To zmieniło wszystko:', 'Czekaj...'],
      pt: ['POV:', 'O segredo que...', 'Ninguém vai te contar...', 'Isso mudou tudo:', 'Espere...'],
      zh: ['POV:', '没人告诉你的秘密...', '这改变了一切:', '等等...'],
      ja: ['POV:', '誰も教えてくれない秘密...', 'これがすべてを変えた:', '待って...'],
      ru: ['POV:', 'Секрет, который...', 'Никто не расскажет вам...', 'Это изменило всё:', 'Подождите...'],
      ar: ['POV:', 'السر الذي...', 'لن يخبرك أحد...', 'هذا غير كل شيء:', 'انتظر...']
    },
    videoScript: {
      en: ['Hook (0-3s)', 'Problem (3-8s)', 'Solution (8-20s)', 'Proof (20-25s)', 'CTA (25-30s)'],
      ua: ['Хук (0-3с)', 'Проблема (3-8с)', 'Рішення (8-20с)', 'Докази (20-25с)', 'CTA (25-30с)'],
      de: ['Hook (0-3s)', 'Problem (3-8s)', 'Lösung (8-20s)', 'Beweis (20-25s)', 'CTA (25-30s)'],
      es: ['Gancho (0-3s)', 'Problema (3-8s)', 'Solución (8-20s)', 'Prueba (20-25s)', 'CTA (25-30s)'],
      fr: ['Accroche (0-3s)', 'Problème (3-8s)', 'Solution (8-20s)', 'Preuve (20-25s)', 'CTA (25-30s)'],
      it: ['Hook (0-3s)', 'Problema (3-8s)', 'Soluzione (8-20s)', 'Prova (20-25s)', 'CTA (25-30s)'],
      pl: ['Hook (0-3s)', 'Problem (3-8s)', 'Rozwiązanie (8-20s)', 'Dowód (20-25s)', 'CTA (25-30s)'],
      pt: ['Gancho (0-3s)', 'Problema (3-8s)', 'Solução (8-20s)', 'Prova (20-25s)', 'CTA (25-30s)'],
      zh: ['钩子 (0-3秒)', '问题 (3-8秒)', '解决方案 (8-20秒)', '证明 (20-25秒)', 'CTA (25-30秒)'],
      ja: ['フック (0-3秒)', '問題 (3-8秒)', '解決策 (8-20秒)', '証明 (20-25秒)', 'CTA (25-30秒)'],
      ru: ['Хук (0-3с)', 'Проблема (3-8с)', 'Решение (8-20с)', 'Доказательство (20-25с)', 'CTA (25-30с)'],
      ar: ['الخطاف (0-3ث)', 'المشكلة (3-8ث)', 'الحل (8-20ث)', 'الدليل (20-25ث)', 'CTA (25-30ث)']
    },
    hashtags: ['#fyp', '#viral', '#trending', '#foryou', '#explore']
  },
  instagram: {
    name: 'Instagram',
    icon: '📸',
    captions: {
      casual: {
        en: 'Friendly, everyday tone',
        ua: 'Дружній, повсякденний тон',
        de: 'Freundlicher, alltäglicher Ton',
        es: 'Tono amigable y cotidiano',
        fr: 'Ton amical et quotidien',
        it: 'Tono amichevole e quotidiano',
        pl: 'Przyjazny, codzienny ton',
        pt: 'Tom amigável e cotidiano',
        zh: '友好的日常语调',
        ja: 'フレンドリーで日常的なトーン',
        ru: 'Дружелюбный, повседневный тон',
        ar: 'نبرة ودية ويومية'
      },
      professional: {
        en: 'Expert, authoritative',
        ua: 'Експертний, авторитетний',
        de: 'Fachkundig, autoritativ',
        es: 'Experto, autoritativo',
        fr: 'Expert, autoritaire',
        it: 'Esperto, autorevole',
        pl: 'Ekspercki, autorytatywny',
        pt: 'Especialista, autoritativo',
        zh: '专业权威',
        ja: '専門的で権威的',
        ru: 'Экспертный, авторитетный',
        ar: 'خبير وموثوق'
      },
      luxury: {
        en: 'Luxurious, exclusive',
        ua: 'Розкішний, ексклюзивний',
        de: 'Luxuriös, exklusiv',
        es: 'Lujoso, exclusivo',
        fr: 'Luxueux, exclusif',
        it: 'Lussuoso, esclusivo',
        pl: 'Luksusowy, ekskluzywny',
        pt: 'Luxuoso, exclusivo',
        zh: '奢华独特',
        ja: '高級で排他的',
        ru: 'Роскошный, эксклюзивный',
        ar: 'فاخر وحصري'
      }
    },
    stories: {
      en: ['Polls', 'Sliders', 'Interactive elements'],
      ua: ['Опитування', 'Слайдери', 'Інтерактивні елементи'],
      de: ['Umfragen', 'Schieberegler', 'Interaktive Elemente'],
      es: ['Encuestas', 'Deslizadores', 'Elementos interactivos'],
      fr: ['Sondages', 'Curseurs', 'Éléments interactifs'],
      it: ['Sondaggi', 'Slider', 'Elementi interattivi'],
      pl: ['Ankiety', 'Suwaki', 'Elementy interaktywne'],
      pt: ['Enquetes', 'Sliders', 'Elementos interativos'],
      zh: ['投票', '滑块', '互动元素'],
      ja: ['投票', 'スライダー', 'インタラクティブ要素'],
      ru: ['Опросы', 'Слайдеры', 'Интерактивные элементы'],
      ar: ['استطلاعات', 'منزلقات', 'عناصر تفاعلية']
    }
  },
  youtube: {
    name: 'YouTube',
    icon: '🎥',
    titles: {
      en: ['SHOCKING result', 'Nobody expected this', 'The truth about', 'Secret revealed'],
      ua: ['ШОКУЮЧИЙ результат', 'Ніхто не очікував цього', 'Правда про', 'Секрет розкрито'],
      de: ['SCHOCKIERENDES Ergebnis', 'Das hat niemand erwartet', 'Die Wahrheit über', 'Geheimnis enthüllt'],
      es: ['Resultado IMPACTANTE', 'Nadie esperaba esto', 'La verdad sobre', 'Secreto revelado'],
      fr: ['Résultat CHOQUANT', 'Personne ne s\'attendait à ça', 'La vérité sur', 'Secret révélé'],
      it: ['Risultato SCIOCCANTE', 'Nessuno se lo aspettava', 'La verità su', 'Segreto rivelato'],
      pl: ['SZOKUJĄCY wynik', 'Nikt się tego nie spodziewał', 'Prawda o', 'Sekret ujawniony'],
      pt: ['Resultado CHOCANTE', 'Ninguém esperava isso', 'A verdade sobre', 'Segredo revelado'],
      zh: ['震惊的结果', '没人预料到这个', '关于...的真相', '秘密揭露'],
      ja: ['衝撃的な結果', '誰も予想していなかった', '...の真実', '秘密が明かされた'],
      ru: ['ШОКИРУЮЩИЙ результат', 'Никто этого не ожидал', 'Правда о', 'Секрет раскрыт'],
      ar: ['نتيجة صادمة', 'لم يتوقع أحد هذا', 'الحقيقة حول', 'كشف السر']
    }
  },
  twitter: {
    name: 'Twitter/X',
    icon: '🐦',
    threads: {
      en: ['Hook tweet', 'Development', 'Conclusion + CTA'],
      ua: ['Хук-твіт', 'Розгортання', 'Висновок + CTA'],
      de: ['Hook-Tweet', 'Entwicklung', 'Fazit + CTA'],
      es: ['Tweet gancho', 'Desarrollo', 'Conclusión + CTA'],
      fr: ['Tweet d\'accroche', 'Développement', 'Conclusion + CTA'],
      it: ['Tweet hook', 'Sviluppo', 'Conclusione + CTA'],
      pl: ['Tweet-hook', 'Rozwój', 'Wniosek + CTA'],
      pt: ['Tweet gancho', 'Desenvolvimento', 'Conclusão + CTA'],
      zh: ['钩子推文', '展开', '结论 + CTA'],
      ja: ['フックツイート', '展開', '結論 + CTA'],
      ru: ['Хук-твит', 'Развитие', 'Заключение + CTA'],
      ar: ['تغريدة الخطاف', 'التطوير', 'الخلاصة + CTA']
    }
  }
} as const;

export function getAvailableLanguages(subscriptionStatus: string): LanguageCode[] {
  if (subscriptionStatus === 'free') {
    return ['en', 'ua'];
  }
  return Object.keys(SUPPORTED_LANGUAGES) as LanguageCode[];
}

export function getCulturalContext(language: LanguageCode) {
  return CULTURAL_CONTEXTS[language] || CULTURAL_CONTEXTS.en;
}

export function getViralPlatformData(platform: keyof typeof VIRAL_PLATFORMS, language: LanguageCode) {
  const platformData = VIRAL_PLATFORMS[platform];
  const result: any = { ...platformData };
  
  // Get language-specific data where available
  Object.keys(result).forEach(key => {
    if (typeof result[key] === 'object' && result[key][language]) {
      result[key] = result[key][language];
    }
  });
  
  return result;
}