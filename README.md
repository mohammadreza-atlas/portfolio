# وب‌سایت محمدرضا سلطانی

وب‌سایت استاتیک و دوزبانه (فارسی/انگلیسی) با HTML، CSS و JavaScript خالص. بدون فریم‌ورک، بدون وابستگی خارجی (CDN) و بدون Backend. برای GitHub Pages آماده است.

## ساختار پروژه

```text
/
├── index.html              صفحه اصلی
├── about.html              درباره من
├── projects.html           نمونه‌کارها (فهرست، جست‌وجو، فیلتر، مرتب‌سازی)
├── services.html           خدمات طراحی سایت
├── contact.html            فرم تماس (پیش‌نمایش پیش از ارسال) و راه‌های ارتباطی
├── project-details.html    جزئیات یک پروژه (با پارامتر ?p=<id>)
├── 404.html                صفحه خطا (noindex)
├── blog/
│   ├── index.html          فهرست مقاله‌ها
│   └── articles/           هر مقاله یک فایل HTML مستقل
├── assets/
│   ├── images/             تصاویر (og-image.png برای اشتراک‌گذاری)
│   └── icons/              favicon.svg و آیکون‌های PWA
├── css/
│   ├── variables.css       رنگ‌ها، فونت‌ها، شعاع‌ها، سایه‌ها و زمان‌بندی انیمیشن
│   ├── base.css            reset و پیش‌فرض‌های عناصر
│   ├── layout.css          container و گریدها
│   ├── components.css      دکمه، کارت، هدر، فوتر، مودال و سایر اجزا
│   ├── animations.css      انیمیشن‌های ورود و keyframeها
│   ├── responsive.css      media queryهای مشترک
│   ├── utilities.css       کلاس‌های کمکی (از استایل‌های inline قبلی ساخته شده)
│   └── pages/              استایل مخصوص هر صفحه (home, about, projects, ...)
├── js/
│   ├── core.js             منطق مشترک: زبان، منوی موبایل، مودال، کپی، اسکرول
│   ├── components.js       ویجت‌های مشترک: کارت پروژه کوچک و FAQ
│   ├── data/projects.js    داده پروژه‌ها (منبع واحد برای همه صفحات)
│   ├── lang/common.js      ترجمه‌های مشترک فارسی و انگلیسی
│   ├── lang/<page>.js      ترجمه‌های مخصوص هر صفحه
│   └── pages/<page>.js     منطق مخصوص هر صفحه
├── robots.txt
├── sitemap.xml
├── manifest.webmanifest
├── .nojekyll               برای GitHub Pages (پردازش Jekyll خاموش می‌شود)
└── README.md
```

هر صفحه فقط فایل‌های CSS و JS خودش را بارگذاری می‌کند. ترتیب بارگذاری JS: ترجمه‌ها → داده پروژه‌ها → `core.js` → ویجت‌ها (در صورت نیاز) → اسکریپت صفحه.

## اجرای محلی

فایل‌ها را با هر سرور استاتیک اجرا کنید؛ باز کردن مستقیم `index.html` هم کار می‌کند ولی برای تست بهتر است:

```bash
cd portfolio
python3 -m http.server 8000
```

سپس `http://localhost:8000` را باز کنید.

## افزودن مقاله جدید

1. یک فایل HTML در `blog/articles/` بسازید. یک مقاله موجود (مثلاً `before-ordering-website.html`) را کپی کنید.
2. این موارد را در فایل جدید ویرایش کنید:
   - `<title>`، `meta description`، `canonical`، و تگ‌های `og:*` و `twitter:*`
   - مقدار `headline`، `description`، `datePublished` و `dateModified` در بلوک JSON-LD
   - بخش `<article>`: تیتر، خلاصه، تاریخ (`<time datetime="YYYY-MM-DD">`)، زمان مطالعه و متن
   - فهرست مطالب (`.toc`) را با شناسه‌های تیتر‌های `h2` همگام کنید
   - مسیرها: فایل‌های داخل `blog/articles/` باید به `../../css/...` و `../../js/...` و `../../index.html` اشاره کنند
3. کارت مقاله را به `blog/index.html` در داخل `#blogGrid` اضافه کنید. مقدار `data-category` (مثلاً `guide` یا `seo`) و `data-title` را پر کنید تا فیلتر و جست‌وجو کار کنند.
4. آدرس مقاله را به `sitemap.xml` اضافه کنید.

**قانون محتوا:** هیچ تجربه، عدد، آمار، نظر مشتری یا نمونه‌کار ساختگی ننویسید. اگر بخشی از مقاله به تجربه شخصی نیاز دارد، آن بخش را بنویسید یا حذف کنید.

## افزودن تصویر جدید

1. فایل را در `assets/images/` قرار دهید. نام فایل را انگلیسی، کوتاه و با خط تیره بنویسید (مثلاً `project-shop-home.webp`).
2. از فرمت WebP یا AVIF استفاده کنید و اندازه را برابر نمایش واقعی یا کمی بزرگ‌تر بگذارید.
3. در HTML حتماً `width`، `height`، `alt` توصیفی و برای تصاویر پایین صفحه `loading="lazy"` بنویسید:

```html
<img src="assets/images/project-shop-home.webp" width="1200" height="800"
     alt="صفحه اصلی فروشگاه نمونه" loading="lazy" decoding="async" />
```

تنها تصاویر واقعی پروژه‌ها را استفاده کنید.

## افزودن پروژه یا صفحه جدید

**پروژه جدید:** یک شیء به آرایه `projectsData` در `js/data/projects.js` اضافه کنید. فیلدها:

```js
{
    id: 'my-project',                 // شناسه یکتا؛ در آدرس ?p= استفاده می‌شود
    repoName: 'my-repo',
    name: 'My Project',
    description: { fa: '...', en: '...' },
    details: { fa: '...', en: '...' },
    language: 'Python',               // برای نقطه رنگی؛ در LANGUAGE_COLORS تعریف کنید
    topics: ['Python', 'Automation'],
    category: 'python',               // یکی از CATEGORIES
    image: null,
    gallery: [],
    githubUrl: 'https://github.com/...',
    liveUrl: null,
    detailsUrl: null,
    featured: false,
    updatedAt: null,
    isSample: false                   // اگر نمونه یا آزمایشی است true بگذارید
}
```

با این کار پروژه به صفحه نمونه‌کارها، صفحه جزئیات و (در صورت `featured`) صفحه اصلی اضافه می‌شود.

**صفحه جدید:** یک فایل HTML بسازید و هدر، فوتر و مودال را از یک صفحه موجود کپی کنید. CSS و JS را فقط در صورت نیاز اضافه کنید. آدرس را به `sitemap.xml` اضافه کنید و لینک آن را در `NAV` (اگر لازم است) در هدر و فوتر همه صفحات قرار دهید.

**افزودن زبان یا متن:** کلید ترجمه را در `js/lang/common.js` (اگر در همه صفحات یکسان است) یا `js/lang/<page>.js` اضافه کنید و همان کلید را در HTML با `data-i18n="key"` به عنصر متصل کنید. برای attribute از `data-i18n-aria` و `data-i18n-placeholder` استفاده کنید.

## انتشار روی GitHub Pages

1. یک مخزن جدید در GitHub بسازید (مثلاً `portfolio`).
2. محتوای پوشه پروژه را در ریشه مخزن push کنید (فایل `index.html` باید در ریشه باشد).
3. از منوی **Settings → Pages** را باز کنید:
   - **Source:** Deploy from a branch
   - **Branch:** `main` و پوشه `/ (root)`
4. چند دقیقه صبر کنید تا سایت منتشر شود. آدرس پیش‌فرض `https://<username>.github.io/<repo>/` است.
5. اگر دامنه اختصاصی (`mohammadreza-soltani.ir`) دارید، در **Settings → Pages → Custom domain** آن را وارد کنید و در تنظیمات DNS رکورد لازم را اضافه کنید. سپس گزینه **Enforce HTTPS** را فعال کنید.

**نکته مهم:** تمام آدرس‌های `canonical`، `og:url`، `sitemap.xml` و `robots.txt` به دامنه `https://mohammadreza-soltani.ir` اشاره می‌کنند. اگر از آدرس GitHub Pages استفاده می‌کنید (مثلاً `username.github.io/portfolio`)، باید این آدرس‌ها را در همه فایل‌ها جایگزین کنید. با جست‌وجوی `mohammadreza-soltani.ir` در پوشه پروژه می‌توانید همه را پیدا کنید.

## اتصال به Google Search Console

1. به [search.google.com/search-console](https://search.google.com/search-console) بروید و با حساب گوگل وارد شوید.
2. **افزودن ملک (Add property)** را بزنید. برای دامنه اختصاصی، روش **Domain** را انتخاب کنید و رکورد TXT را در DNS اضافه کنید. برای آدرس GitHub Pages، روش **URL prefix** را انتخاب کنید.
3. مالکیت را تأیید کنید.
4. از منوی **Sitemaps** آدرس `sitemap.xml` را ثبت کنید (مثلاً `https://mohammadreza-soltani.ir/sitemap.xml`).
5. از **URL Inspection** صفحات اصلی را یک‌بار برای ایندکس درخواست کنید.
6. هر دو هفته گزارش **Pages** و **Performance** را بررسی کنید. خطاهای ایندکس را برطرف کنید.

## یادداشت‌های فنی

- **فرم تماس:** فرم هیچ داده‌ای به سرور ارسال نمی‌کند. با کلیک روی «ارسال»، یک پیش‌نمایش نمایش داده می‌شود و سپس با برنامه ایمیل شما (`mailto:`) پیام باز می‌شود. این رفتار عمداً شفاف است و وانمود نمی‌کند پیامی دریافت شده است.
- **زبان انگلیسی:** تغییر زبان با JavaScript انجام می‌شود و انتخاب کاربر در `localStorage` ذخیره می‌شود. نسخه انگلیسی URL جدا ندارد، بنابراین ایندکس انگلیسی جداگانه و `hreflang` وجود ندارد. اگر لازم شد نسخه انگلیسی جداگانه ایندکس شود، باید صفحات `/en/` ساخته شوند.
- **صفحه جزئیات پروژه:** محتوا با JavaScript از روی `?p=` پر می‌شود. این صفحه در `sitemap.xml` نیست چون هر پروژه آدرس مستقل ندارد. اگر نیاز به صفحه مستقل برای هر پروژه باشد، باید برای هر پروژه یک فایل HTML ایستا بسازید.
- **مرورگرهای قدیمی:** بیشتر امکانات با مرورگرهای مدرن کار می‌کنند. در مرورگرهای خیلی قدیمی، IntersectionObserver و `Object.assign` ممکن است نیاز به polyfill داشته باشند.
- **کیفیت:** قبل از انتشار، سایت را روی موبایل و دسکتاپ و با فعال کردن حالت کاهش انیمیشن مرورگر بررسی کنید.
