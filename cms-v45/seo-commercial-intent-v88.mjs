import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=process.argv[2]||'release',base='https://rassmiy-marketing.netlify.app';
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pages=[
  {
    "kind": "hub",
    "lang": "ar",
    "file": "ar/services.html",
    "name": "خدمات التسويق الإلكتروني في الرياض",
    "lead": "خدمات التسويق المناسبة لشركتك ليست باقة ثابتة. ابدأ بتشخيص مشكلة واحدة: ضعف الظهور في البحث، ارتفاع تكلفة العميل المحتمل، غياب الطلبات من المتجر، أو عدم وضوح القياس. ثم اختر خدمة لها مخرجات ومسؤولية ومؤشر نجاح واضح، قبل التوسع إلى قنوات إضافية.",
    "blocks": [
      {
        "h": "كيف تختار خدمة التسويق الأولى؟",
        "p": "إذا كانت صفحاتك الأساسية غير مفهرسة، فالأولوية ليست تشغيل حملة لرفع الزيارات؛ ابدأ بتدقيق الفهرسة وملفات robots وCanonical والربط الداخلي. إذا كان الموقع يجلب زيارات مناسبة بلا طلبات، راجع عرض الخدمة وتجربة الهاتف ونموذج التواصل. وإذا كانت تكلفة الإعلانات ترتفع، افحص كلمات البحث والجمهور وصفحة الهبوط وتتبع التحويل قبل زيادة الميزانية.",
        "items": [
          "مشروع B2B: ابدأ بصفحات حلول وخدمات واضحة ونموذج طلب عرض سعر مؤهل، وقِس جودة الفرصة لا الرسائل فقط.",
          "متجر إلكتروني: ابدأ بالتصنيفات والمنتجات وإشارات الثقة وسلوك إضافة السلة وإتمام الشراء.",
          "خدمات محلية في الرياض: ابدأ بصفحة خدمة تشرح النطاق والمنطقة وطريقة طلب الخدمة ومراجعة المنافسة المحلية."
        ]
      },
      {
        "h": "ما الذي ينبغي أن يحدده عرض خدمات التسويق؟",
        "p": "العرض الجيد يذكر الأعمال التي ستُنفذ فعلًا: عدد الصفحات أو الحملات أو أصول المحتوى، وصلاحيات الحسابات، ومن يكتب ومن يراجع ومن يعتمد، وما الذي لا يشمله النطاق، وتواتر التقارير وطريقة احتساب الميزانية الإعلانية. نشر محتوى أو زيادة زيارات فقط لا يعني تلقائيًا تحقيق مبيعات.",
        "items": [
          "SEO: خطة إصلاح فهرسة، خريطة كلمات لصفحات موجودة، ومراجعة تحسّن الظهور التجاري.",
          "الإعلانات: هيكلة الحملات وأحداث التحويل وصفحات الهبوط ومعايير العميل المؤهل.",
          "المحتوى: رسائل بحسب مرحلة قرار العميل وروابط من المقالات إلى الخدمة المطلوبة.",
          "التحليلات: تعريف الأحداث والتحقق منها قبل اتخاذ قرارات الإنفاق."
        ]
      },
      {
        "h": "ماذا بعد أول 30 يومًا؟",
        "p": "تُراجع خطّة العمل الفعلية مقابل نقطة البداية: ما الصفحات التي أصلحت؟ ما الطلبات المؤهلة التي وصلت؟ ما الفرضيات التي ثبتت أو لم تثبت؟ ثم يُتخذ قرار بالاستمرار أو تعديل القناة أو إيقاف ما لا يضيف قيمة، بدل الالتزام بزيادة عدد المنشورات دون دليل."
      }
    ],
    "faqs": [
      [
        "هل أحتاج خدمات تسويق متكاملة من البداية؟",
        "ليس بالضرورة. قد تكفي خدمة SEO أو ضبط التتبع أو حملة اختبار إذا كانت المشكلة محددة. التوسع إلى عدة قنوات يكون بعد تحديد هدف قابل للقياس ونطاق يناسب مواردك."
      ],
      [
        "هل تشمل أتعاب إدارة الإعلانات ميزانية Google أو Meta؟",
        "يجب فصل أتعاب الإدارة عن المبالغ التي تدفع لمنصات الإعلان وأي تكلفة لإنتاج المحتوى أو تطوير صفحات الهبوط. يُوضح ذلك كتابةً في نطاق العمل."
      ],
      [
        "كيف أعرف أن التسويق جلب عملاء حقيقيين؟",
        "تبدأ بتحديد معنى العميل المؤهل ثم ربط النموذج أو الاتصال أو طلب العرض بمصدر الزيارة، ومقارنة البيانات بجودة الفرص في المبيعات، وليس مجرد حساب عدد النقرات."
      ],
      [
        "كم من الوقت يلزم لبدء قياس النتائج؟",
        "يمكن فحص صحة التتبع مبكرًا؛ أما أثر SEO أو نمو المبيعات فلا توجد مدة ثابتة لهما. يُحدد خط أساس ومواعيد مراجعة وفق حالة الموقع والمنافسة وحجم البيانات."
      ]
    ]
  },
  {
    "kind": "hub",
    "lang": "en",
    "file": "en/services.html",
    "name": "Marketing services in Riyadh",
    "lead": "The right marketing service is not a fixed bundle. Start with one measurable problem: weak organic discovery, costly leads, abandoned purchases or unreliable reporting. Match that problem to a clearly scoped deliverable and an owner, then expand only when the evidence justifies it.",
    "blocks": [
      {
        "h": "Which marketing service should come first?",
        "p": "If commercial pages are not indexed, buying more visits is not the first solution: review crawling, canonical signals and internal discovery. If qualified visitors arrive but do not enquire, inspect your offer, mobile experience and enquiry journey. If paid acquisition costs rise, review search terms, audience, landing pages and verified conversion events before adding budget.",
        "items": [
          "B2B: connect solutions to buyer needs and track qualified quotation opportunities, not messages alone.",
          "Online stores: prioritize commercial category and product clarity, delivery expectations, cart and purchase measurement.",
          "Riyadh service companies: clarify geographic scope, service deliverables and contact steps on a dedicated landing page."
        ]
      },
      {
        "h": "What should a marketing proposal specify?",
        "p": "Scope should state which pages, campaigns, content assets and measurement work will be delivered; who owns and approves each task; account access and ownership; exclusions; reporting cadence; and how platform ad spend is handled. Publication volume and vanity metrics are not substitutes for business outcomes.",
        "items": [
          "SEO: indexability corrections, query-to-page mapping and commercial visibility reviews.",
          "Paid media: campaign structure, dependable conversions, landing pages and lead-quality definitions.",
          "Content: audience-stage messages and links from education to the relevant service.",
          "Analytics: written event definitions and testing before budget decisions."
        ]
      },
      {
        "h": "How is progress reviewed after the first month?",
        "p": "Compare completed work against the baseline: what was fixed, what qualified opportunities arrived, what hypotheses held up, and what still needs measurement. This produces a decision to continue, refine or pause a channel rather than an arbitrary promise of more posts."
      }
    ],
    "faqs": [
      [
        "Do businesses need every marketing service immediately?",
        "Not necessarily. A focused SEO, tracking or paid-media engagement may be more efficient when the main issue is clear. Multi-channel work should follow a measurable objective and a realistic delivery scope."
      ],
      [
        "Does an advertising management fee include media budget?",
        "Management fees should be listed separately from Google or Meta spend and from any production or landing-page development costs. The proposal should state what is and is not included."
      ],
      [
        "How can I distinguish leads from clicks?",
        "Define a qualified enquiry, connect form or call actions to a traffic source and review actual opportunity quality with sales. A button click is not automatically a sales opportunity."
      ],
      [
        "How quickly should progress be expected?",
        "Tracking can be tested early. Search visibility, qualified pipeline and sales growth have no guaranteed timeline, so review windows should reflect the baseline, competition and available data."
      ]
    ]
  },
  {
    "kind": "agency",
    "lang": "ar",
    "file": "ar/pages/marketing-agency-riyadh/index.html",
    "name": "وكالة تسويق رقمي متكاملة في الرياض",
    "lead": "وكالة التسويق الرقمي المتكاملة تربط ظهور شركتك في البحث والإعلانات والمحتوى والقياس في مسار واحد للوصول إلى العميل المناسب. الأهم من عدد الخدمات هو وضوح من ينفذ كل مهمة، وما الذي تستلمه شركتك، ومن يملك الحسابات والبيانات عند انتهاء التعاون.",
    "blocks": [
      {
        "h": "ما الفرق بين وكالة تسويق متكاملة ومزوّد خدمة واحدة؟",
        "p": "الوكالة المتكاملة تنسق العرض والرسائل بين صفحات الخدمات والحملات والمحتوى والتحليلات، بينما قد يكون متخصص Google Ads أو SEO أنسب لمشكلة محددة لا تتطلب إدارة قنوات أخرى. في Rassmiy Marketing يقود العمل متخصص Full Stack Marketing، وتُحدد أي مساهمات خارجية ونطاقها في العرض؛ لا نفترض وجود فريق كبير أو خدمات إنتاج غير متفق عليها.",
        "items": [
          "المنشأة التي لا تظهر صفحاتها عند البحث: تحتاج أولًا تدقيق SEO وفهرسة.",
          "الشركة التي يتوقف نموها على عملاء شركات آخرين: تحتاج ربط جذب الطلبات بتأهيل الفرص والمبيعات.",
          "المتجر الذي تصله زيارات بلا مشتريات: يحتاج تحسين تجربة الصفحة والشراء والقياس قبل توسيع الإعلانات."
        ]
      },
      {
        "h": "نقاط يجب توثيقها قبل توقيع عقد التسويق",
        "p": "احتفظ بحق الإدارة في حسابات Google Ads وMeta وGA4 وGTM وSearch Console باسم منشأتك، واحصل على صلاحيات الوصول والملفات التي تحتاجها عند التسليم. اطلب تحديد المسؤول عن استراتيجية الحسابات وموافقة المحتوى وحالات التوقف والتغييرات الطارئة. تُكتب أتعاب الإدارة منفصلة عن الإنفاق الإعلاني وأي تصوير أو برمجة أو أدوات خارجية.",
        "items": [
          "مسؤول تنفيذ معروف مع مهام ومخرجات قابلة للمراجعة.",
          "تعريف مشترك للاستفسار المؤهل وكيفية تسليمه للمبيعات.",
          "توثيق ملكية الحسابات والملفات وإجراء التسليم عند انتهاء العمل.",
          "طريقة واضحة لقياس الأداء دون ضمان ترتيب أو مبيعات لا يمكن التحكم بها."
        ]
      },
      {
        "h": "ما الذي يساعد على تقييم الخبرة دون ادعاءات؟",
        "p": "راجع الخلفية المهنية والأعمال المنشورة، واطلب عند الحاجة مثالًا يتضح فيه دور المنفذ والمشكلة والحل والمقياس المسموح بعرضه. لا يكفي عرض شعارات عملاء أو أرقام عامة من دون سياق. يمكنك التعرف على الخلفية والأعمال الحالية قبل تقديم تفاصيل مشروعك."
      }
    ],
    "faqs": [
      [
        "هل الوكالة المتكاملة أفضل من الاستشاري التسويقي؟",
        "يعتمد الاختيار على احتياج شركتك. الاستشارة تركز على تشخيص المشكلة وتحديد القرار، بينما تتطلب إدارة القنوات المستمرة تنفيذًا ومراجعة وتحسينًا دوريًا. الأفضل هو النطاق المناسب لا المسمى."
      ],
      [
        "من يمتلك حسابات الإعلانات والتحليلات؟",
        "الأفضل أن تبقى الحسابات الأساسية وبيانات العملاء تحت ملكية المنشأة، مع منح مقدم الخدمة الصلاحيات اللازمة ثم سحبها عند انتهاء التعاون."
      ],
      [
        "هل توجد باقة أو سعر موحد لكل شركة؟",
        "لا توجد باقة عادلة لجميع الأنشطة. يتغير النطاق حسب القنوات والمحتوى وحالة الموقع والتتبع. اطلب مخرجات تفصيلية وأتعابًا منفصلة عن ميزانية الإعلان."
      ],
      [
        "كيف تتأكد الشركة من وجود تقدم؟",
        "قارن خط الأساس بمؤشرات تخص العمل: ظهور الصفحات التجارية، التحويلات المتحقَّق منها، الاستفسارات المؤهلة وتطور فرص البيع. راجع ما نُفّذ فعلًا بدل الاكتفاء بالتقارير الشكلية."
      ]
    ]
  },
  {
    "kind": "agency",
    "lang": "en",
    "file": "en/pages/marketing-agency-riyadh/index.html",
    "name": "Integrated digital marketing agency in Riyadh",
    "lead": "An integrated marketing agency connects organic discovery, paid campaigns, content and measurement into one buyer journey. What matters is not the number of listed services but who executes each task, what you receive and who owns the data and accounts when the engagement ends.",
    "blocks": [
      {
        "h": "Integrated agency or a single-channel specialist?",
        "p": "An integrated approach coordinates service-page messaging, paid acquisition, content and analytics. A focused SEO or Google Ads specialist may be a better choice for a specific problem. Rassmiy Marketing is specialist-led through a full-stack marketing approach; any additional contributors and production scope should be explicitly agreed rather than implied.",
        "items": [
          "Poor search discovery: assess commercial landing pages, technical SEO and indexation first.",
          "Long B2B sales cycles: connect lead capture to qualification, quotation and the sales process.",
          "E-commerce traffic without orders: investigate product clarity, checkout trust and purchase measurement."
        ]
      },
      {
        "h": "What should be clear before signing?",
        "p": "Own your primary Google Ads, Meta, GA4, GTM and Search Console accounts. Agree on access, handover, deliverables, approval processes and who is responsible for strategy and execution. Separate professional fees from platform advertising spend, production, development and external subscriptions.",
        "items": [
          "A named execution owner, agreed outputs and acceptance criteria.",
          "An explicit definition and handoff process for qualified leads.",
          "Documented account, creative and data ownership.",
          "Evidence-based reporting with no impossible ranking or revenue promises."
        ]
      },
      {
        "h": "How should relevant experience be assessed?",
        "p": "Read the professional background and published work, then ask for an example that clarifies the challenge, the work actually performed and what can legitimately be measured. Unexplained client logos and headline metrics alone are not proof of delivery quality."
      }
    ],
    "faqs": [
      [
        "Is an agency better than a marketing consultant?",
        "It depends on the work. Consulting clarifies decisions and priorities; ongoing multi-channel delivery needs implementation, review and iteration. Match the model to your problem, not the job title."
      ],
      [
        "Who should own advertising and analytics accounts?",
        "The business should ideally own its core accounts and customer data, granting the service provider the necessary access and retaining the ability to revoke it."
      ],
      [
        "Is there a fixed agency package or price?",
        "Scopes vary by channels, creative requirements, website condition and reporting. Ask for written deliverables and fees separated from the platform media budget."
      ],
      [
        "What shows that an engagement is progressing?",
        "Review improvements against baseline commercial-page visibility, verified conversions, qualified enquiries and the downstream sales process—not only presentation metrics."
      ]
    ]
  },
  {
    "kind": "consult",
    "lang": "ar",
    "file": "ar/pages/استشاري-تسويق-رقمي-الرياض/index.html",
    "name": "استشارات تسويق رقمي في الرياض",
    "lead": "استشارات التسويق تساعد صاحب الشركة على اتخاذ قرار قبل إنفاق ميزانية إضافية. يبدأ التشخيص من هدف النشاط وبيانات العملاء والقنوات الحالية، وينتهي بترتيب المشاكل وفرص التحسين وخطة مهام قابلة للتنفيذ والقياس، وليس بقائمة خدمات عامة أو وعد بنتيجة مضمونة.",
    "blocks": [
      {
        "h": "ما البيانات المطلوبة قبل جلسة استشارة تسويق؟",
        "p": "يكفي وصف المنتج أو الخدمة والجمهور والمنطقة ورابط الموقع وأهم تحدٍّ تواجهه. وإذا كانت لديك بيانات متاحة، فشارك ملخص زيارات الموقع ومصادر الاستفسارات وتكلفة الإعلان وتعريف العميل المؤهل. لا ترسل كلمات المرور أو قوائم العملاء الحساسة؛ يمكن مناقشة آلية منح صلاحيات محدودة لاحقًا.",
        "items": [
          "هدف تجاري محدد: زيادة طلبات عرض السعر، تحسين شراء المتجر، أو خفض تكلفة الفرصة.",
          "أهم صفحة خدمة أو فئة منتج مع روابطها.",
          "قنوات التسويق الحالية وما تم اختباره سابقًا.",
          "الميزانية المتاحة وحدود فريق التنفيذ وموعد مراجعة القرار."
        ]
      },
      {
        "h": "مخرجات الاستشارة وكيف تميّزها عن إدارة التسويق",
        "p": "الاستشارة تقدم تقييمًا للوضع الحالي وخريطة أولويات تتضمن أثر كل إصلاح وجهده وتبعيته ومؤشر نجاحه؛ وقد تتضمن توجيهًا للصفحات التجارية والتتبع والقنوات حسب النطاق المتفق عليه. تنفيذ الحملات والكتابة والتصميم والبرمجة خدمات منفصلة تُحدد عند الحاجة. هكذا يستطيع صاحب القرار مقارنة تكلفة الإصلاح بأثره المتوقع دون وعود.",
        "items": [
          "سجل بالمشكلات مرتّب حسب خطورتها وقربها من هدف البيع.",
          "خريطة كلمات وصفحات عند وجود مشكلة ظهور في Google.",
          "تعريف لتحويلات GA4 وطرق تأهيل العميل عند وجود مشكلة قياس.",
          "توصية بما يبدأ أولًا وما يمكن تأجيله وما يجب اختباره."
        ]
      },
      {
        "h": "مثال توضيحي لقرار استشاري",
        "p": "إذا ظهرت المقالات في Google بينما صفحة طلب الخدمة لا تظهر، فرفع عدد المقالات ليس قرارًا أوليًا جيدًا. تُفحص قابلية فهرسة صفحة الخدمة، والنية التجارية، والروابط الداخلية، ثم يُقاس ظهورها وطلبات التواصل الفعلية. هذا مثال تشخيصي عام، وليس نتيجة منسوبة لعميل أو مشروع محدد."
      }
    ],
    "faqs": [
      [
        "ما الفرق بين استشارات التسويق وإدارة الحملات؟",
        "الاستشارة تحدد المشكلة والقرار والخطة ومؤشرات القياس؛ إدارة الحملات تنفّذ وتختبر وتحسّن نشاطًا مدفوعًا. يمكن الجمع بينهما بنطاق منفصل وواضح."
      ],
      [
        "هل يلزم أن تكون لدي ميزانية إعلانية للبدء؟",
        "لا. قد تكشف الاستشارة أن إصلاح صفحة خدمة أو التتبع أو تجربة التحويل يسبق أي زيادة في الإنفاق الإعلاني."
      ],
      [
        "هل تقدم الاستشارة خطة تسويق مناسبة للسوق السعودي؟",
        "يُراعى القطاع والجمهور والمنافسة والمدينة أو مناطق البيع والقنوات المستخدمة عند إعداد التوصيات، ويُحدد عمق البحث والمخرجات وفق نطاق الاستشارة."
      ],
      [
        "هل أحتاج مشاركة الوصول لحسابات Google؟",
        "يمكن البدء بموجز وروابط وبيانات مجمعة. لا ترسل كلمات مرور، وعند الحاجة لمراجعة تقنية تُمنح صلاحيات محددة وآمنة."
      ]
    ]
  },
  {
    "kind": "consult",
    "lang": "en",
    "file": "en/pages/digital-marketing-consultant-riyadh/index.html",
    "name": "Digital marketing consulting in Riyadh",
    "lead": "Marketing consulting helps a business make an informed decision before increasing spend. Diagnosis begins with objectives, customer demand and existing channels, then produces a prioritized set of actions and measurable assumptions rather than a generic service list or guaranteed outcome.",
    "blocks": [
      {
        "h": "What should you bring to a marketing consultation?",
        "p": "Start with your product or service, target buyer, served market, website and single biggest challenge. If available, share aggregate traffic, enquiry sources, campaign costs and the meaning of a qualified lead. Do not send passwords or sensitive customer files; limited permissions can be agreed later when technically necessary.",
        "items": [
          "A specific business goal: more qualified quotes, completed orders or lower opportunity cost.",
          "Your highest-priority service or product landing page.",
          "Current channels and previous experiments.",
          "Indicative budget, execution capacity and decision deadlines."
        ]
      },
      {
        "h": "What consulting should deliver versus management",
        "p": "A useful engagement reviews the current state and produces prioritized actions with likely impact, effort, dependencies and a way to verify the outcome. The agreed scope may cover page mapping, technical discovery, conversion events or channel sequencing. Continuous content creation, campaign management and development are separate execution services unless written into the proposal.",
        "items": [
          "A prioritized issues register linked to the commercial goal.",
          "A query-to-page map where organic discovery is the constraint.",
          "An event and lead-qualification definition where measurement is unreliable.",
          "A decision on what to start, defer or test—not an unexplained list of tactics."
        ]
      },
      {
        "h": "An illustrative consulting decision",
        "p": "If blog articles are discovered but the service booking page is not, producing more articles is unlikely to be the best first action. Review the service page's indexability, commercial intent and internal links, then observe qualified enquiries. This is a hypothetical diagnostic illustration, not a client result."
      }
    ],
    "faqs": [
      [
        "How does marketing consulting differ from campaign management?",
        "Consulting identifies priorities, scope and measurement. Campaign management executes and iterates paid acquisition. They can be combined, but should be separately defined."
      ],
      [
        "Do I need an advertising budget to start?",
        "No. The initial priority may be improving a service page, tracking or the conversion journey rather than buying more traffic."
      ],
      [
        "Can the consultation address the Saudi market?",
        "Market, sector, target geography and existing channels are part of the diagnosis. The depth of local research and deliverables are agreed before work begins."
      ],
      [
        "Should I share access to Google accounts?",
        "A brief and aggregated reports may be enough initially. Do not share passwords; use properly scoped access only when necessary."
      ]
    ]
  },
  {
    "kind": "seo",
    "lang": "ar",
    "file": "ar/pages/seo-services/index.html",
    "name": "خدمات تحسين محركات البحث SEO في السعودية",
    "lead": "خدمات تحسين محركات البحث SEO في السعودية تبدأ بتحديد سبب غياب العميل عن صفحة الخدمة: هل هي غير قابلة للفهرسة، أم مفهرسة دون ترتيب، أم تجلب زيارات لا تتحول إلى طلبات؟ لكل حالة إصلاح مختلف، ولذلك نربط التدقيق التقني بالمحتوى التجاري وقياس العملاء المؤهلين.",
    "blocks": [
      {
        "h": "ثلاثة أنواع مختلفة من مشاكل SEO",
        "p": "صفحة غير مفهرسة تتطلب فحص استجابة الخادم وrobots وnoindex وCanonical وتقرير URL Inspection. صفحة مفهرسة بترتيب متأخر تتطلب تحليل المنافسين ونية البحث وجودة المحتوى وإشارات الثقة. صفحة تستقبل زيارات بلا فرص تحتاج تحسين العرض والتواصل وتجربة الهاتف وتتبع التحويل. استخدام العلاج نفسه لكل حالة يضيع الموارد.",
        "items": [
          "Crawling وIndexing: راجع HTTP وrobots.txt وSitemap وCanonical واختيار Google للنسخة الأساسية.",
          "Relevance وRanking: عيّن كلمة رئيسية واحدة لكل صفحة، وغطّ المصطلحات والكيانات ذات العلاقة دون حشو.",
          "Conversion وSXO: راجع وضوح الأسعار أو طريقة التسعير، والأدلة ومحتوى الخدمة، ومسار طلب العرض."
        ]
      },
      {
        "h": "ما الفرق بين صفحة SEO ومقال SEO؟",
        "p": "صفحة الخدمة تستهدف باحثًا يريد التعاقد على تنفيذ أو استشارة؛ لهذا توضح المشكلة والحل والمخرجات والتواصل. المقال التعليمي يشرح سؤالًا أو مقارنة ويدل القارئ على صفحة الخدمة المناسبة. لا ننشئ عدة صفحات تستهدف «خدمات SEO الرياض» بالكلمات نفسها؛ نختار صفحة أساسية ونستخدم المقالات لدعمها بروابط وصفية.",
        "items": [
          "صفحة خدمة SEO: نطاق التدقيق والإصلاح ونوع الموقع ومؤشرات النجاح.",
          "صفحة استشاري SEO: تشخيص الأولويات والمراجعة المهنية قبل التنفيذ.",
          "دليل تعليمي: إجابة سؤال مثل متى تختار SEO أو إعلانات Google ثم توجيه واضح للصفحة التجارية."
        ]
      },
      {
        "h": "كيف نقيس نجاح SEO في شركة سعودية؟",
        "p": "نراجع ظهور الصفحات التجارية للكلمات المستهدفة في Google Search Console مع النقرات وCTR واتجاه متوسط الترتيب، ثم نربط الزيارات ذات الصلة بالاستفسارات التي تم تأهيلها. قد يتحسن الزحف والفهرسة قبل أن تتحسن المراكز، وقد يزيد المرور المعلوماتي دون مبيعات؛ لذلك لا نعرض رقم الزيارات وحده كنتيجة أعمال."
      }
    ],
    "faqs": [
      [
        "موقعي موجود في Sitemap لكنه لا يظهر في Google، لماذا؟",
        "وجود الرابط في الخريطة لا يضمن فهرسته. يجب فحص القرار الفعلي في URL Inspection، وصفحة Canonical التي اختارها Google، وجودة الصفحة وروابطها الداخلية."
      ],
      [
        "هل تكرار طلب الفهرسة يرفع ترتيب الموقع؟",
        "لا. طلب إعادة الفهرسة لا يضمن القبول أو ترتيبًا أعلى. التحسين الحقيقي يعتمد على المحتوى المفيد، قابلية الوصول للصفحات، وجودة تجربة المستخدم وإشارات الصلة."
      ],
      [
        "هل أبدأ بالسيو أم إعلانات Google؟",
        "إذا كنت تريد طلبًا عاجلًا ولديك صفحة عرض وقياس جاهزان، قد تُختبر الإعلانات. SEO يدعم اكتسابًا عضويًا على مدى أطول. يمكن استخدام القناتين حسب الهدف والموارد."
      ],
      [
        "كيف تمنع تداخل الكلمات بين صفحات الموقع؟",
        "حدد نية بحث رئيسية لكل صفحة، واستخدم روابط داخلية تربط المقالات الداعمة بالصفحة التجارية الأساسية. دمج الصفحات المتشابهة أفضل أحيانًا من نشر نسخ جديدة."
      ]
    ]
  },
  {
    "kind": "seo",
    "lang": "en",
    "file": "en/pages/seo-services/index.html",
    "name": "SEO services for Saudi businesses",
    "lead": "SEO services for Saudi businesses start by diagnosing why the right buyer is not reaching the service page. An unindexed page, an indexed page with weak rankings and a page that gets traffic without enquiries are different problems requiring different fixes. Technical SEO must connect to commercial relevance and qualified demand.",
    "blocks": [
      {
        "h": "Three distinct organic search problems",
        "p": "A page that is not indexed needs a check of response codes, robots, noindex, canonical signals and Google URL Inspection. A page that ranks poorly needs buyer-intent and competitor analysis, stronger factual substance and trust signals. A page that gets visits but few leads needs a clearer offer, mobile experience and verified conversions. One generic SEO tactic will not solve all three.",
        "items": [
          "Discovery and indexing: confirm HTTP response, robots.txt, sitemap, canonical and Google-selected URL.",
          "Relevance and ranking: map one primary intent to each page and cover related entities naturally.",
          "Conversion and experience: clarify scope, evidence, contact steps and the quote journey."
        ]
      },
      {
        "h": "Service landing page versus informational SEO guide",
        "p": "The commercial service page should answer what is delivered, to whom, how scope is agreed and what happens next. A guide resolves a specific question or comparison and then links to the appropriate commercial page. Multiple pages all repeating SEO services in Riyadh can confuse buyers and compete with each other; choose a primary page and make supporting guides distinct.",
        "items": [
          "SEO service page: audit scope, fixes, business model and measurement.",
          "SEO consultant page: prioritized professional diagnosis before implementation.",
          "Educational guide: answer a focused choice such as SEO versus Google Ads and link to relevant services."
        ]
      },
      {
        "h": "What counts as SEO progress?",
        "p": "Review Google Search Console visibility for target commercial pages, relevant clicks, CTR and position direction, then connect that discovery to verifiable qualified enquiries. Crawling and indexing may improve before rankings do, and informational sessions are not automatically revenue. Report each stage separately."
      }
    ],
    "faqs": [
      [
        "My URLs are in a sitemap but not in Google. Why?",
        "A sitemap is a discovery hint, not an indexing guarantee. Check the actual URL Inspection verdict, Google's chosen canonical, page usefulness and internal links."
      ],
      [
        "Does requesting indexing repeatedly improve rankings?",
        "No. Indexing requests neither guarantee inclusion nor improve position by themselves. Helpful pages and consistent technical signals matter more."
      ],
      [
        "Should I prioritize SEO or Google Ads?",
        "For urgent demand with an effective landing page and reliable tracking, ads may be testable. SEO develops organic discovery over time. The channel mix depends on the objective and capacity."
      ],
      [
        "How do I avoid keyword cannibalization?",
        "Give each page one clear primary intent, use meaningful internal links from related guides and consolidate near-duplicate pages when they do not serve different buyer needs."
      ]
    ]
  }
];
const marker='<!-- COMMERCIAL_INTENT_V88 -->';
const other={
 ar:{hub:'/ar/services.html',agency:'/ar/pages/marketing-agency-riyadh/',consult:'/ar/pages/استشاري-تسويق-رقمي-الرياض/',seo:'/ar/pages/seo-services/',about:'/ar/about.html',portfolio:'/ar/portfolio.html',contact:'/ar/contact.html'},
 en:{hub:'/en/services.html',agency:'/en/pages/marketing-agency-riyadh/',consult:'/en/pages/digital-marketing-consultant-riyadh/',seo:'/en/pages/seo-services/',about:'/en/about.html',portfolio:'/en/portfolio.html',contact:'/en/contact.html'}
};
const routeNames={
 ar:{hub:'خدمات التسويق',agency:'الوكالة التسويقية المتكاملة',consult:'الاستشارات التسويقية',seo:'خدمات SEO',about:'الخلفية المهنية',portfolio:'أعمال منشورة',contact:'اطلب مراجعة'},
 en:{hub:'Marketing services',agency:'Integrated marketing agency',consult:'Marketing consulting',seo:'SEO services',about:'Professional background',portfolio:'Published work',contact:'Request a review'}
};
function webPath(rel){
 const p='/'+rel.replace(/index\.html$/,'');
 return p.includes('/pages/')?p:'/'+rel;
}
let count=0;
for(const page of pages){
 const file=path.join(root,page.file);
 assert.ok(fs.existsSync(file),'Missing commercial page: '+page.file);
 let html=fs.readFileSync(file,'utf8');
 assert.ok(!html.includes(marker),'Avoid duplicate commercial intent block: '+page.file);
 assert.equal([...html.matchAll(/<h1(?:\s[^>]*)?>/gi)].length,1,'Existing H1: '+page.file);
 const canonical=[...html.matchAll(/<link\s+rel="canonical"\s+href="([^"]+)"/gi)];
 assert.equal(canonical.length,1,'canonical count: '+page.file);
 const current=new URL(canonical[0][1]);
 assert.equal(current.origin,base,'canonical host: '+page.file);
 assert.ok(!/noindex/i.test(html.match(/<meta[^>]+name="robots"[^>]*>/i)?.[0]||''),'noindex: '+page.file);
 const lang=page.lang,pfx=other[lang],labels=routeNames[lang];
 const intro='<p class="commercial-intro-v88">'+esc(page.lead)+'</p>';
 html=html.replace(/<\/h1>/i,'</h1>'+intro);
 const parts=page.blocks.map(b=>'<section><h2>'+esc(b.h)+'</h2><p>'+esc(b.p)+'</p>'+(b.items?'<ul>'+b.items.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>':'')+'</section>').join('');
 const faqs=page.faqs.map(([q,a])=>'<details><summary>'+esc(q)+'</summary><p>'+esc(a)+'</p></details>').join('');
 const links=Object.entries(pfx).filter(([key])=>key!==page.kind).map(([key,href])=>'<li><a href="'+encodeURI(href)+'">'+esc(labels[key])+'</a></li>').join('');
 const navigation='<nav aria-label="'+(lang==='ar'?'خدمات وصفحات ذات صلة':'Relevant services and pages')+'"><h2>'+(lang==='ar'?'صفحات تساعدك على اتخاذ القرار':'Related decision resources')+'</h2><ul>'+links+'</ul></nav>';
 const trust=lang==='ar'
  ?'<p>المعلومات هنا توضح منهج عمل قابل للتخصيص، وليست تعهدًا بنتائج أو ادعاء شهادات أو أرقام عملاء. راجع <a href="/ar/about.html">الخلفية المهنية</a> و<a href="/ar/portfolio.html">الأعمال المنشورة</a> قبل التعاقد.</p>'
  :'<p>These are scope and decision frameworks, not guaranteed outcomes, invented certifications or client results. Review the <a href="/en/about.html">professional background</a> and <a href="/en/portfolio.html">published work</a> before engaging.</p>';
 const cta='<p><a class="btn" href="'+pfx.contact+'">'+(lang==='ar'?'اطلب مراجعة لاحتياج شركتك':'Request a marketing review')+'</a></p>';
 const block=marker+'<section class="section" id="commercial-intent-v88"><div class="container"><article class="prose">'+parts+'<section><h2>'+(lang==='ar'?'أسئلة تساعدك قبل البدء':'Questions to resolve before starting')+'</h2>'+faqs+'</section>'+navigation+trust+cta+'</article></div></section>';
 if(!html.includes('</main>') && /<\/header>/i.test(html) && /<footer\b/i.test(html)) {
  // Some legacy consultant templates are built without a main landmark.
  html=html.replace(/<\/header>/i,'</header><main id="main-content">').replace(/<footer\b/i,'</main><footer');
 }
 assert.ok(html.includes('</main>'),'No main landmark or usable header/footer: '+page.file);
 html=html.replace('</main>',block+'</main>');
 const canonicalUrl=canonical[0][1];
 const breadcrumbs=[{name:lang==='ar'?'الرئيسية':'Home',item:lang==='ar'?base+'/':base+'/en/'},{name:labels.hub,item:base+pfx.hub}];
 if(page.kind!=='hub')breadcrumbs.push({name:page.name,item:canonicalUrl});
 const schema=[
  {'@context':'https://schema.org','@type':'Service','@id':canonicalUrl+'#service',name:page.name,serviceType:page.name,description:page.lead,url:canonicalUrl,inLanguage:lang,provider:{'@id':base+'/#organization'},areaServed:[{'@type':'Country',name:'Saudi Arabia'},{'@type':'City',name:'Riyadh'}]},
  {'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:breadcrumbs.map((b,i)=>({'@type':'ListItem',position:i+1,name:b.name,item:b.item}))},
  {'@context':'https://schema.org','@type':'FAQPage','@id':canonicalUrl+'#faq',mainEntity:page.faqs.map(([q,a])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}))}
 ];
 html=html.replace('</head>',schema.map(x=>'<script type="application/ld+json">'+JSON.stringify(x).replaceAll('<','\\u003c')+'</script>').join('')+'</head>');
 // The block is supporting content. Do not overwrite the primary title or change existing slugs.
 fs.writeFileSync(file,html);count++;
}
fs.appendFileSync(path.join(root,'assets/styles.css'),"\n/* Commercial-intent sections: readable bilingual decision content. */\n.commercial-intro-v88{max-width:72ch;line-height:1.9;margin-block:1rem 1.5rem;font-size:clamp(1rem,1.3vw,1.15rem)}\n#commercial-intent-v88 details{border-block-end:1px solid #dedede;padding:.8rem 0}\n#commercial-intent-v88 summary{cursor:pointer;font-weight:650;line-height:1.7}\n#commercial-intent-v88 nav a{line-height:1.9;text-decoration:underline}\n#commercial-intent-v88 li{margin-block:.4rem}\n");
console.log('COMMERCIAL_INTENT_V88=PASS: '+count+' bilingual commercial pages enhanced');
