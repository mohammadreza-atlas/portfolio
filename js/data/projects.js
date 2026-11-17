/* ============================================================================
   projects.js — shared project data (single source for home, about, services,
   projects and project-details). Add a project here once.
============================================================================ */

const CATEGORIES = ['all', 'python', 'go', 'web', 'data', 'ai', 'other'];

const projectsData = [
    {
        id: 'portfolio-website',
        repoName: 'portfolio',
        name: 'Personal Portfolio Website',
        description: {
            fa: 'همین وب‌سایتی که در آن هستید؛ یک سایت شخصی دوزبانه که بدون هیچ کتابخانه خارجی، فقط با HTML، CSS و JavaScript ساخته شده است.',
            en: 'The very website you are browsing: a bilingual personal site built with plain HTML, CSS and JavaScript, with no external libraries.'
        },
        details: {
            fa: 'تمرکز این پروژه روی سرعت بارگذاری، نمایش درست در موبایل، رعایت اصول سئو و ساختار قابل توسعه برای اضافه‌کردن صفحات جدید بود. سیستم تغییر زبان و تم رنگی مشترک بین صفحات، بخش مهمی از کار است.',
            en: 'The focus was on load speed, correct mobile rendering, solid SEO fundamentals and a structure that can grow with new pages. The shared language switcher and color system across pages were a key part of the work.'
        },
        language: 'HTML',
        topics: ['HTML', 'CSS', 'JavaScript', 'Responsive', 'SEO', 'i18n'],
        category: 'web',
        image: null,
        gallery: [],
        githubUrl: 'https://github.com/mohammadreza-atlas',
        liveUrl: null,
        detailsUrl: null,
        featured: true,
        updatedAt: null,
        isSample: true
    },
    {
        id: 'python-automation-tools',
        repoName: 'python-tools',
        name: 'Python Automation Tools',
        description: {
            fa: 'مجموعه‌ای از اسکریپت‌های پایتون که کارهای تکراری روزمره را خودکار می‌کنند؛ مثل مرتب‌سازی فایل‌ها و پردازش ساده داده‌ها.',
            en: 'A set of Python scripts that automate repetitive daily tasks, such as organizing files and doing simple data processing.'
        },
        details: {
            fa: 'هدف این پروژه، تمرین نوشتن کد تمیز و قابل استفاده مجدد در پایتون بوده است: توابع کوچک، نام‌گذاری روشن و مدیریت خطا تا اسکریپت‌ها در شرایط مختلف قابل اعتماد باشند.',
            en: 'The goal was to practice writing clean, reusable Python code: small functions, clear naming and error handling so the scripts stay reliable in different situations.'
        },
        language: 'Python',
        topics: ['Python', 'Automation', 'CLI', 'File Processing'],
        category: 'python',
        image: null,
        gallery: [],
        githubUrl: 'https://github.com/mohammadreza-atlas',
        liveUrl: null,
        detailsUrl: null,
        featured: true,
        updatedAt: null,
        isSample: true
    },
    {
        id: 'go-learning-path',
        repoName: 'go-learning',
        name: 'Go Learning Path',
        description: {
            fa: 'تمرین‌های من در حال یادگیری زبان Go؛ از مفاهیم پایه تا نوشتن برنامه‌های کوچک و ساده.',
            en: 'My exercises while learning Go, from the basics to writing small, simple programs.'
        },
        details: {
            fa: 'این مخزن دفترچه یادگیری من است: هر پوشه یک مفهوم را پوشش می‌دهد و با مثال‌های کوتاه نوشته شده تا بعداً بتوانم سریع به آن‌ها برگردم. Go هنوز در حال یادگیری است و این پروژه بازتاب همین مسیر است.',
            en: 'This repository is my learning notebook: each folder covers one concept with short examples so I can revisit them quickly. Go is still a work in progress for me, and this project reflects that journey.'
        },
        language: 'Go',
        topics: ['Go', 'Learning', 'Concurrency Basics'],
        category: 'go',
        image: null,
        gallery: [],
        githubUrl: 'https://github.com/mohammadreza-atlas',
        liveUrl: null,
        detailsUrl: null,
        featured: false,
        updatedAt: null,
        isSample: true
    },
    {
        id: 'data-analysis-experiments',
        repoName: 'data-analysis',
        name: 'Data Analysis Experiments',
        description: {
            fa: 'آزمایش‌هایی با داده‌های واقعی: پاک‌سازی داده، بررسی الگوها و رسم نمودار برای فهمیدن داستان پشت اعداد.',
            en: 'Experiments with real datasets: cleaning data, looking for patterns and plotting charts to understand the story behind the numbers.'
        },
        details: {
            fa: 'در این پروژه یاد گرفتم چطور یک مجموعه داده نامرتب را به چیزی قابل تحلیل تبدیل کنم و نتیجه را طوری نمایش دهم که برای افراد غیرفنی هم قابل فهم باشد.',
            en: 'In this project I learned how to turn a messy dataset into something analysable, and how to present the result so non-technical people can understand it too.'
        },
        language: 'Python',
        topics: ['Python', 'Pandas', 'Matplotlib', 'Jupyter'],
        category: 'data',
        image: null,
        gallery: [],
        githubUrl: 'https://github.com/mohammadreza-atlas',
        liveUrl: null,
        detailsUrl: null,
        featured: false,
        updatedAt: null,
        isSample: true
    },
    {
        id: 'ai-notes',
        repoName: 'ai-notes',
        name: 'AI Notes & Small Experiments',
        description: {
            fa: 'یادداشت‌ها و آزمایش‌های کوچک من در حوزه هوش مصنوعی؛ برای فهمیدن مفاهیم، نه ادعای ساخت محصول.',
            en: 'My notes and small experiments in AI, written to understand concepts rather than to claim a finished product.'
        },
        details: {
            fa: 'اینجا مفاهیمی را که مطالعه می‌کنم با کد کوتاه تست می‌کنم تا از حفظ‌کردن فاصله بگیرم و واقعاً بفهمم چه اتفاقی می‌افتد. این بخش در حال تکمیل است.',
            en: 'Here I test the concepts I study with short snippets of code, so I actually understand what happens instead of memorising it. This section is still growing.'
        },
        language: 'Python',
        topics: ['Python', 'AI', 'Machine Learning Basics'],
        category: 'ai',
        image: null,
        gallery: [],
        githubUrl: 'https://github.com/mohammadreza-atlas',
        liveUrl: null,
        detailsUrl: null,
        featured: false,
        updatedAt: null,
        isSample: true
    },
    {
        id: 'iot-playground',
        repoName: 'iot-playground',
        name: 'IoT Playground',
        description: {
            fa: 'فضای تمرین من برای اینترنت اشیا؛ ایده‌های کوچک برای خواندن داده از حس‌گرها و کار با سخت‌افزار.',
            en: 'My practice space for IoT: small ideas around reading sensor data and working with hardware.'
        },
        details: {
            fa: 'این پروژه بیشتر جنبه کاوش دارد؛ ترکیب علاقه‌ام به سخت‌افزار و برنامه‌نویسی. هنوز در ابتدای مسیر است و آن را به‌عنوان یک محصول کامل معرفی نمی‌کنم.',
            en: 'This one is mostly exploration, combining my interest in hardware with programming. It is still early stage and I do not present it as a finished product.'
        },
        language: 'Python',
        topics: ['IoT', 'Sensors', 'Python', 'Prototyping'],
        category: 'other',
        image: null,
        gallery: [],
        githubUrl: 'https://github.com/mohammadreza-atlas',
        liveUrl: null,
        detailsUrl: null,
        featured: false,
        updatedAt: null,
        isSample: true
    }
];

/* رنگ نقطه زبان‌ها (هماهنگ با Home) */
const LANGUAGE_COLORS = {
    "Python": "#3572A5", "Go": "#00ADD8", "HTML": "#e34c26", "CSS": "#563d7c",
    "JavaScript": "#f1e05a", "Jupyter": "#DA5B0B", "Jupyter Notebook": "#DA5B0B",
    "Shell": "#89e051", "TypeScript": "#2b7489", "Rust": "#dea584"
};

/* پالت placeholder — هر پروژه ترکیب اختصاصی خودش را می‌گیرد */
const PLACEHOLDER_THEMES = [
    ['rgba(106,156,115,0.26)', 'rgba(201,185,173,0.16)'],
    ['rgba(81,106,70,0.30)',  'rgba(106,156,115,0.16)'],
    ['rgba(201,185,173,0.22)','rgba(85,125,90,0.20)'],
    ['rgba(58,77,50,0.34)',   'rgba(201,185,173,0.14)'],
    ['rgba(106,156,115,0.20)','rgba(176,160,149,0.20)'],
    ['rgba(176,160,149,0.20)','rgba(58,77,50,0.28)']
];
