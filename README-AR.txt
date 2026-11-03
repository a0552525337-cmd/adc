إعداد صفحة Broadcast Atlas وربط اشتراك Xtream Codes

الحالة
- نُشر وسيط Xtream في Cloudflare Workers.
- رابط الوسيط: https://almoghani-xtream-bridge.almoghani-atlas.workers.dev/api/xtream
- بيانات المستخدم وكلمة المرور لا توجد داخل هذه الملفات ولا تُحفظ في Worker؛ تدخلها في نموذج الصفحة عند الاستخدام.
- صفحة GitHub Pages الحالية https://a0552525337-cmd.github.io/adc/ تعرض 404، لذلك لم تُنشر الصفحة من المستودع بعد.

ما يلزم لعرض الصفحة على GitHub Pages
1. افتح المستودع: https://github.com/a0552525337-cmd/adc
2. من Settings ثم Pages، اختر Build and deployment: Deploy from a branch.
3. اختر الفرع main والمجلد /(root)، ثم Save.
4. استبدل index.html الموجود في جذر المستودع بالملف index.html الموجود في هذه الحزمة، ثم Commit changes إلى main.
5. بعد اكتمال النشر، افتح: https://a0552525337-cmd.github.io/adc/

مهم
- لا تضع بيانات الاشتراك في ملفات GitHub.
- worker.js نسخة مصدر احتياطية للوسيط المنشور؛ لا يلزم رفعه إلى GitHub كي تعمل الصفحة.
- إذا استخدمت نطاقًا مخصصًا بدل a0552525337-cmd.github.io، يجب إضافة ذلك الأصل إلى قائمة CORS في Worker قبل أن تعمل الصفحة.
- فتح رابط الوسيط مباشرةً ليس صفحة ويب؛ سيُرفض الطلب من أصل غير GitHub Pages عن قصد. هذا طبيعي.
- تحميل قائمة القنوات لا يضمن تشغيل الفيديو؛ تشغيل البث نفسه يعتمد أيضًا على إعدادات المزود ودعم المتصفح لرابط البث.
