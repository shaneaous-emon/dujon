# 05 — Bilingual Content and SEO

| Field | Value |
|---|---|
| Product | DUJON (দুজন) |
| Version | 1.0 (draft) |
| Date | 20 November 2026 |
| Status | Awaiting owner approval — **all Bangla copy must be reviewed by a native Bangla editor before launch** |

---

## 1. Translation system

- Library: **next-intl** (App Router support, ICU message format, server and client components).
- Files: `messages/bn.json` (default) and `messages/en.json`. One nested JSON object per namespace.
- Key convention: `namespace.section.item` in camelCase, e.g. `search.filters.ageMin`. Keys describe meaning, not wording.
- Plurals and variables use ICU syntax, e.g. `"{count, plural, other {#টি প্রোফাইল পাওয়া গেছে}}"`.
- Numbers/dates formatted with `Intl` (`bn` gives Bangla digits; `en` Latin digits). **Numeric placeholders must be typed in ICU** — `{age, number}`, `{year, number, ::group-off}` — otherwise a plain `{age}` prints Latin digits in Bangla (found during M1; covered by TC-016).
- CI script `scripts/check-i18n.ts` fails if a key is missing in either file, a value is empty, or ICU syntax is invalid.
- **Adding a language later:** add `messages/<locale>.json`, add the locale to `src/i18n/routing.ts`, add `name_<locale>` columns or a translation table for locations, add metadata, update sitemap and hreflang. No component changes required.
- Tone rules: Bangla — natural, respectful standard Bangla using "আপনি", short buttons, familiar words (e.g. "প্রোফাইল", "ইমেইল", "পাসওয়ার্ড" are acceptable loanwords). English — warm, simple, no exaggerated romance. Never mix the two languages within one UI locale except brand name "DUJON".

## 2. UI copy sheet

> Bangla in the first column of values, English in the second. Placeholders in `{braces}`.

### 2.1 `common`, `nav`, `footer`

| Key | বাংলা | English |
|---|---|---|
| common.brand | দুজন | DUJON |
| common.tagline | সহজে খুঁজুন আপনার মনের মতো জীবনসঙ্গী। | Find someone who feels right. |
| common.save | সংরক্ষণ করুন | Save |
| common.saveContinue | সংরক্ষণ করে এগিয়ে যান | Save and continue |
| common.back | পেছনে | Back |
| common.cancel | বাতিল | Cancel |
| common.confirm | নিশ্চিত করুন | Confirm |
| common.close | বন্ধ করুন | Close |
| common.optional | (ঐচ্ছিক) | (optional) |
| common.required | (আবশ্যক) | (required) |
| common.loading | লোড হচ্ছে… | Loading… |
| common.yearsOld | {age} বছর | {age} years |
| common.skip | এখন নয় | Skip for now |
| nav.howItWorks | কীভাবে কাজ করে | How it works |
| nav.safety | নিরাপত্তা | Safety |
| nav.faq | সাধারণ জিজ্ঞাসা | FAQ |
| nav.contact | যোগাযোগ | Contact |
| nav.login | লগইন | Log in |
| nav.register | প্রোফাইল তৈরি করুন | Create profile |
| nav.search | খুঁজুন | Search |
| nav.interests | আগ্রহ | Interests |
| nav.saved | সংরক্ষিত | Saved |
| nav.dashboard | ড্যাশবোর্ড | Dashboard |
| nav.myProfile | আমার প্রোফাইল | My profile |
| nav.settings | সেটিংস | Settings |
| nav.logout | লগআউট | Log out |
| nav.menu | মেনু | Menu |
| nav.language | ভাষা | Language |
| footer.terms | শর্তাবলি | Terms and Conditions |
| footer.privacy | গোপনীয়তা নীতি | Privacy Policy |
| footer.guidelines | কমিউনিটি নির্দেশিকা | Community Guidelines |
| footer.copyright | © {year} দুজন। সর্বস্বত্ব সংরক্ষিত। | © {year} DUJON. All rights reserved. |

### 2.2 `home`

| Key | বাংলা | English |
|---|---|---|
| home.hero.title | সহজে খুঁজুন আপনার মনের মতো জীবনসঙ্গী | Find someone who feels right |
| home.hero.subtitle | বয়স আর এলাকা বেছে নিন, প্রোফাইল দেখুন, আর দুজনেই রাজি হলে তবেই যোগাযোগ। সহজ, সম্মানজনক ও গোপনীয়। | Choose an age range and area, browse profiles, and connect only when you both agree. Simple, respectful and private. |
| home.hero.cta | বিনামূল্যে প্রোফাইল তৈরি করুন | Create your free profile |
| home.hero.secondary | কীভাবে কাজ করে দেখুন | See how it works |
| home.search.title | জীবনসঙ্গী খুঁজুন | Find a life partner |
| home.search.submit | খুঁজুন | Search |
| home.steps.title | তিনটি সহজ ধাপ | Three simple steps |
| home.steps.1.title | প্রোফাইল তৈরি করুন | Create your profile |
| home.steps.1.body | কয়েক মিনিটে নিজের সম্পর্কে প্রয়োজনীয় তথ্য দিন। | Share the essentials about yourself in a few minutes. |
| home.steps.2.title | বয়স ও এলাকা দিয়ে খুঁজুন | Search by age and area |
| home.steps.2.body | বিভাগ, জেলা ও উপজেলা/থানা বেছে মানানসই প্রোফাইল দেখুন। | Pick a division, district and upazila/thana to see suitable profiles. |
| home.steps.3.title | আগ্রহ জানান, যুক্ত হোন | Express interest and connect |
| home.steps.3.body | অপর পক্ষ রাজি হলে তবেই দুজনের যোগাযোগের তথ্য দেখা যাবে। | Contact details are shared only when the other person accepts. |
| home.why.title | কেন দুজন? | Why DUJON? |
| home.why.privacy.title | গোপনীয়তা আগে | Privacy first |
| home.why.privacy.body | আপনার ফোন নম্বর বা ইমেইল কেউ দেখবে না, যতক্ষণ না আপনি নিজে আগ্রহ গ্রহণ করছেন। | Nobody sees your phone number or email until you accept an interest. |
| home.why.simple.title | সহজ ও পরিষ্কার | Simple and clear |
| home.why.simple.body | লম্বা বায়োডাটা নয় — দরকারি তথ্য আর অল্প কয়েকটি ফিল্টার। | No long biodata — just the essentials and a few useful filters. |
| home.why.respect.title | সম্মানজনক পরিবেশ | Respectful by design |
| home.why.respect.body | কমিউনিটি নির্দেশিকা, ব্লক ও রিপোর্ট করার সুবিধা সবার জন্য। | Community guidelines plus block and report for everyone. |
| home.why.bangla.title | বাংলায়, আপনার মতো করে | In Bangla, made for you |
| home.why.bangla.body | পুরো সাইট বাংলা ও ইংরেজিতে ব্যবহার করা যায়। | Use the whole site in Bangla or English. |
| home.safety.title | আমরা যা করি, আর যা এখনো করি না | What we do — and what we don't do yet |
| home.safety.body | দুজনে সদস্যরা নিজেরাই নিজেদের তথ্য দেন। এই সংস্করণে আমরা পরিচয় (যেমন এনআইডি) যাচাই করি না, তাই কারো সঙ্গে যোগাযোগের আগে সতর্ক থাকুন। | Members provide their own information. In this version we do not verify identity (such as NID), so please take care before contacting anyone. |
| home.safety.link | নিরাপত্তা টিপস পড়ুন | Read safety tips |
| home.stories.title | সফলতার গল্প | Success stories |
| home.stories.comingSoon | সফলতার গল্প শীঘ্রই আসছে। সদস্যদের অনুমতি নিয়েই আমরা সেগুলো প্রকাশ করব। | Success stories are coming soon. We'll only share them with members' permission. |
| home.faq.title | সাধারণ জিজ্ঞাসা | Common questions |
| home.faq.all | সব প্রশ্ন দেখুন | See all questions |
| home.cta.title | আজই শুরু করুন — একদম বিনামূল্যে | Start today — it's free |

### 2.3 `auth`

| Key | বাংলা | English |
|---|---|---|
| auth.register.title | নতুন অ্যাকাউন্ট তৈরি করুন | Create your account |
| auth.register.fullName | পূর্ণ নাম | Full name |
| auth.register.fullNameHelp | আপনার পূর্ণ নাম অন্য কেউ দেখবে না। | Your full name is never shown to others. |
| auth.register.email | ইমেইল | Email |
| auth.register.mobile | মোবাইল নম্বর | Mobile number |
| auth.register.mobileHelp | শুধু যাঁদের সঙ্গে আপনি যুক্ত হবেন, তাঁরাই দেখবেন। | Only people you connect with will see it. |
| auth.register.password | পাসওয়ার্ড | Password |
| auth.register.passwordHelp | কমপক্ষে ৮ অক্ষর। সহজে অনুমানযোগ্য পাসওয়ার্ড দেবেন না। | At least 8 characters. Avoid easy-to-guess passwords. |
| auth.register.gender | লিঙ্গ | Gender |
| auth.register.male | পুরুষ | Male |
| auth.register.female | নারী | Female |
| auth.register.dob | জন্মতারিখ | Date of birth |
| auth.register.day / month / year | দিন / মাস / বছর | Day / Month / Year |
| auth.register.lockedNote | লিঙ্গ ও জন্মতারিখ পরে পরিবর্তন করা যাবে না। | Gender and date of birth can't be changed later. |
| auth.register.agree | আমি নিশ্চিত করছি যে আমার বয়স ১৮ বছর বা তার বেশি, এবং আমি {terms} ও {privacy} পড়ে সম্মত হয়েছি। | I confirm I am 18 or older and I have read and agree to the {terms} and {privacy}. |
| auth.register.submit | অ্যাকাউন্ট তৈরি করুন | Create account |
| auth.register.haveAccount | আগে থেকেই অ্যাকাউন্ট আছে? | Already have an account? |
| auth.register.checkEmail | আপনার ইমেইলে একটি বার্তা পাঠানো হয়েছে। নির্দেশনা অনুসরণ করুন। | We've sent a message to your email. Please follow the instructions. |
| auth.login.title | লগইন করুন | Log in |
| auth.login.submit | লগইন | Log in |
| auth.login.forgot | পাসওয়ার্ড ভুলে গেছেন? | Forgot your password? |
| auth.login.noAccount | অ্যাকাউন্ট নেই? | Don't have an account? |
| auth.forgot.title | পাসওয়ার্ড রিসেট করুন | Reset your password |
| auth.forgot.body | আপনার ইমেইল দিন। অ্যাকাউন্ট থাকলে আমরা রিসেট লিংক পাঠাব। | Enter your email. If an account exists, we'll send a reset link. |
| auth.forgot.submit | লিংক পাঠান | Send link |
| auth.forgot.sent | অ্যাকাউন্ট থাকলে কয়েক মিনিটের মধ্যে ইমেইল পাবেন। স্প্যাম ফোল্ডারও দেখুন। | If an account exists, you'll get an email in a few minutes. Check your spam folder too. |
| auth.reset.title | নতুন পাসওয়ার্ড দিন | Set a new password |
| auth.reset.confirm | পাসওয়ার্ড আবার লিখুন | Confirm password |
| auth.reset.success | পাসওয়ার্ড পরিবর্তন হয়েছে। অন্যান্য ডিভাইস থেকে লগআউট করা হয়েছে। | Password changed. You've been logged out on other devices. |
| auth.verify.success | ধন্যবাদ! আপনার ইমেইল নিশ্চিত হয়েছে। | Thank you! Your email is confirmed. |
| auth.verify.expired | লিংকটির মেয়াদ শেষ বা এটি আগে ব্যবহার হয়েছে। | This link has expired or has already been used. |
| auth.verify.resend | নতুন লিংক পাঠান | Send a new link |
| auth.verify.banner | আগ্রহ পাঠাতে বা গ্রহণ করতে আপনার ইমেইল নিশ্চিত করুন। | Confirm your email to send or accept interests. |
| auth.verify.note | ইমেইল নিশ্চিত করা মানে পরিচয় যাচাই নয়। | Confirming your email is not identity verification. |

### 2.4 `profile` (fields and options)

| Key | বাংলা | English |
|---|---|---|
| profile.displayName | প্রদর্শিত নাম | Display name |
| profile.displayNameHelp | প্রথম নাম বা ডাকনাম দিন। | Use your first name or a nickname. |
| profile.createdBy | প্রোফাইলটি পরিচালনা করছেন | Profile managed by |
| profile.createdBy.self / parent / guardian / sibling / relative | নিজে / মা-বাবা / অভিভাবক / ভাই-বোন / আত্মীয় | Self / Parent / Guardian / Sibling / Relative |
| profile.managedBadge | {relation} পরিচালিত | Managed by {relation} |
| profile.maritalStatus | বৈবাহিক অবস্থা | Marital status |
| profile.marital.never_married / divorced / widowed | অবিবাহিত / তালাকপ্রাপ্ত / বিধবা-বিপত্নীক | Never married / Divorced / Widowed |
| profile.height | উচ্চতা | Height |
| profile.heightValue | {feet} ফুট {inches} ইঞ্চি | {feet}′ {inches}″ |
| profile.educationLevel | শিক্ষাগত যোগ্যতা | Education |
| profile.edu.below_ssc / ssc / hsc / diploma / bachelors / masters / doctorate / other | এসএসসি-র নিচে / এসএসসি / এইচএসসি / ডিপ্লোমা / স্নাতক / স্নাতকোত্তর / ডক্টরেট / অন্যান্য | Below SSC / SSC / HSC / Diploma / Bachelor's / Master's / Doctorate / Other |
| profile.educationDetail | পড়াশোনার বিষয় / প্রতিষ্ঠান | Subject / institution |
| profile.occupation | পেশা | Occupation |
| profile.location | এলাকা | Location |
| profile.division / district / upazila | বিভাগ / জেলা / উপজেলা বা থানা | Division / District / Upazila or Thana |
| profile.selectPlaceholder | বেছে নিন | Select |
| profile.about | নিজের সম্পর্কে | About me |
| profile.aboutHelp | আপনার স্বভাব, আগ্রহ আর কেমন জীবনসঙ্গী খুঁজছেন — সংক্ষেপে লিখুন। ফোন নম্বর, ইমেইল বা লিংক দেবেন না। | Briefly describe yourself, your interests and the partner you hope to find. Don't include phone numbers, emails or links. |
| profile.familyInfo | পরিবার সম্পর্কে | About my family |
| profile.familyInfoHelp | সংক্ষেপে লিখুন, যেমন ভাই-বোনের সংখ্যা। ঠিকানা বা ফোন নম্বর দেবেন না। | Keep it brief, e.g. number of siblings. Don't include addresses or phone numbers. |
| profile.status.draft / published / hidden | খসড়া / প্রকাশিত / লুকানো | Draft / Published / Hidden |
| profile.publish | প্রোফাইল প্রকাশ করুন | Publish profile |
| profile.hide | প্রোফাইল লুকান | Hide profile |
| profile.hideHelp | লুকালে কেউ আপনাকে খুঁজে পাবে না। আগের সংযোগগুলো থাকবে। | When hidden, nobody can find you. Existing connections stay. |
| profile.preview | অন্যরা যেভাবে দেখবেন | Preview my profile |
| profile.lockedFields | লিঙ্গ বা জন্মতারিখ সংশোধন দরকার? আমাদের সঙ্গে যোগাযোগ করুন। | Need to correct gender or date of birth? Contact us. |
| profile.checklist.title | প্রকাশের আগে সম্পূর্ণ করুন | Complete before publishing |
| profile.published | আপনার প্রোফাইল প্রকাশিত হয়েছে! | Your profile is now published! |

### 2.5 `onboarding`, `photo`, `preferences`

| Key | বাংলা | English |
|---|---|---|
| onboarding.step | ধাপ {current}/{total} | Step {current} of {total} |
| onboarding.about.title | আপনার সম্পর্কে | About you |
| onboarding.location.title | আপনি কোথায় থাকেন? | Where do you live? |
| onboarding.photo.title | একটি ছবি যোগ করুন | Add a photo |
| onboarding.preferences.title | কেমন জীবনসঙ্গী খুঁজছেন? | Who are you looking for? |
| onboarding.review | একবার দেখে নিন | Review your profile |
| photo.upload | ছবি আপলোড করুন | Upload photo |
| photo.replace | ছবি বদলান | Replace photo |
| photo.delete | ছবি মুছুন | Delete photo |
| photo.rules | JPG, PNG বা WebP, সর্বোচ্চ ৫ MB। ছবিতে শুধু আপনি থাকবেন এবং মুখ পরিষ্কার দেখা যাবে। | JPG, PNG or WebP, up to 5 MB. The photo should show only you, with your face clearly visible. |
| photo.notReviewed | এই সংস্করণে ছবি প্রকাশের আগে যাচাই করা হয় না। অনুপযুক্ত ছবি রিপোর্ট করা যাবে। | Photos are not reviewed before they appear in this version. Inappropriate photos can be reported. |
| photo.visibility | কারা আমার ছবি দেখবেন | Who can see my photo |
| photo.visibility.members | যেসব সদস্য আমার প্রোফাইল দেখতে পান | Members who can see my profile |
| photo.visibility.connections | শুধু যাঁদের সঙ্গে আমি যুক্ত | Only my connections |
| photo.error.tooLarge | ছবিটি ৫ MB-এর বেশি বড়। | The photo is larger than 5 MB. |
| photo.error.type | শুধু JPG, PNG বা WebP ছবি দিন। | Please use a JPG, PNG or WebP image. |
| photo.error.tooSmall | ছবিটি খুব ছোট — কমপক্ষে ৪০০×৪০০ পিক্সেল দরকার। | The photo is too small — at least 400×400 pixels. |
| photo.placeholderAlt | {name}-এর ছবি দেওয়া নেই | No photo for {name} |
| photo.alt | {name}-এর প্রোফাইল ছবি | {name}'s profile photo |
| preferences.title | পছন্দের জীবনসঙ্গী | Partner preferences |
| preferences.ageRange | বয়সসীমা | Age range |
| preferences.ageFrom / ageTo | থেকে / পর্যন্ত | From / To |
| preferences.area | পছন্দের এলাকা | Preferred area |
| preferences.note | পছন্দগুলো শুধু আপনার খোঁজার শুরুর ফিল্টার ঠিক করে; এতে কারো কাছ থেকে আপনি লুকিয়ে যাবেন না। | Preferences only set your default search; they don't hide you from anyone. |

### 2.6 `search`, `profileDetail`

| Key | বাংলা | English |
|---|---|---|
| search.title | জীবনসঙ্গী খুঁজুন | Find a life partner |
| search.results | {count, plural, other {#টি প্রোফাইল পাওয়া গেছে}} | {count, plural, one {# profile found} other {# profiles found}} |
| search.filters | ফিল্টার | Filters |
| search.ageMin / ageMax | সর্বনিম্ন বয়স / সর্বোচ্চ বয়স | Minimum age / Maximum age |
| search.apply | ফিল্টার প্রয়োগ করুন | Apply filters |
| search.clear | সব ফিল্টার মুছুন | Clear all filters |
| search.anyArea | যেকোনো এলাকা | Any area |
| search.empty.title | এই ফিল্টারে এখনো কোনো প্রোফাইল নেই | No profiles match these filters yet |
| search.empty.body | বয়সসীমা একটু বাড়িয়ে দেখুন অথবা উপজেলা/জেলা বাদ দিয়ে খুঁজুন। | Try a wider age range or remove the upazila/district filter. |
| search.coldStart | দুজন একদম নতুন — প্রতিদিন নতুন সদস্য যোগ দিচ্ছেন। পরে আবার দেখুন। | DUJON is new — members are joining every day. Please check back soon. |
| search.publishFirst | খোঁজা শুরু করতে আগে আপনার প্রোফাইল প্রকাশ করুন। | Publish your profile to start searching. |
| search.pageOf | পৃষ্ঠা {page}/{total} | Page {page} of {total} |
| search.prev / next | আগের / পরের | Previous / Next |
| search.view | প্রোফাইল দেখুন | View profile |
| search.saveAria | {name}-এর প্রোফাইল সংরক্ষণ করুন | Save {name}'s profile |
| profileDetail.about | নিজের সম্পর্কে | About |
| profileDetail.basics | মৌলিক তথ্য | Basic details |
| profileDetail.family | পরিবার | Family |
| profileDetail.lookingFor | যেমন জীবনসঙ্গী খুঁজছেন | Looking for |
| profileDetail.lookingForValue | {min}–{max} বছর, {area} | Aged {min}–{max}, {area} |
| profileDetail.previewBanner | অন্যরা আপনার প্রোফাইল এভাবে দেখবেন। | This is how others see your profile. |
| profileDetail.hiddenSender | প্রোফাইলটি এখন লুকানো আছে। | This profile is currently hidden. |

### 2.7 `interests`, `contact`, `safety actions`

| Key | বাংলা | English |
|---|---|---|
| interests.express | আগ্রহ প্রকাশ করুন | Express interest |
| interests.confirm.title | আগ্রহ পাঠাবেন? | Send interest? |
| interests.confirm.body | {name} আপনার আগ্রহ গ্রহণ করলে আপনাদের দুজনের ইমেইল ও মোবাইল নম্বর পরস্পর দেখতে পাবেন। | If {name} accepts, you will both be able to see each other's email and mobile number. |
| interests.sent | আগ্রহ পাঠানো হয়েছে | Interest sent |
| interests.withdraw | আগ্রহ ফিরিয়ে নিন | Withdraw interest |
| interests.received | {name} আপনার প্রতি আগ্রহ দেখিয়েছেন | {name} is interested in you |
| interests.accept | গ্রহণ করুন | Accept |
| interests.decline | এখন নয় | Decline |
| interests.acceptConfirm | গ্রহণ করলে আপনাদের দুজনের যোগাযোগের তথ্য পরস্পর দেখা যাবে। | Accepting will share your contact details with each other. |
| interests.connected | সংযুক্ত | Connected |
| interests.notAccepted | গৃহীত হয়নি | Not accepted |
| interests.tryAgainAfter | {date}-এর পর আবার চেষ্টা করতে পারবেন। | You can try again after {date}. |
| interests.tabs.received / sent / connections | পাওয়া আগ্রহ / পাঠানো আগ্রহ / সংযোগ | Received / Sent / Connections |
| interests.empty.received | এখনো কেউ আগ্রহ জানাননি। ছবিসহ পূর্ণ প্রোফাইল সাহায্য করে। | No interests yet. A complete profile with a photo helps. |
| interests.empty.sent | আপনি এখনো কাউকে আগ্রহ জানাননি। | You haven't expressed interest in anyone yet. |
| interests.empty.connections | কেউ আপনার আগ্রহ গ্রহণ করলে এখানে দেখাবে। | When someone accepts, they'll appear here. |
| interests.verifyFirst | আগ্রহ পাঠাতে আগে ইমেইল নিশ্চিত করুন | Confirm your email to express interest |
| contact.title | যোগাযোগের তথ্য | Contact details |
| contact.email / mobile | ইমেইল / মোবাইল | Email / Mobile |
| contact.noMobile | মোবাইল নম্বর দেওয়া নেই | No mobile number shared |
| contact.safety | প্রথম দেখা পাবলিক জায়গায় করুন, পরিবারকে জানিয়ে রাখুন, আর কখনো টাকা পাঠাবেন না। | Meet in a public place first, tell your family, and never send money. |
| block.action | ব্লক করুন | Block |
| block.confirm | {name}-কে ব্লক করবেন? আপনারা কেউ কাউকে আর দেখতে পাবেন না, এবং আগের আগ্রহ/সংযোগ বাতিল হবে। | Block {name}? You won't see each other anymore, and any interests or connection will end. |
| block.done | ব্লক করা হয়েছে | Blocked |
| block.unblock | আনব্লক করুন | Unblock |
| report.action | রিপোর্ট করুন | Report |
| report.title | কেন রিপোর্ট করছেন? | Why are you reporting this profile? |
| report.reason.fake_profile | ভুয়া প্রোফাইল মনে হচ্ছে | Seems like a fake profile |
| report.reason.inappropriate_photo | অনুপযুক্ত ছবি | Inappropriate photo |
| report.reason.harassment | হয়রানি বা অসম্মানজনক আচরণ | Harassment or disrespectful behaviour |
| report.reason.money_request_or_scam | টাকা চাওয়া বা প্রতারণা | Asking for money or a scam |
| report.reason.appears_underage | বয়স ১৮-এর কম মনে হচ্ছে | Appears to be under 18 |
| report.reason.married_or_misleading | বিবাহিত বা ভুল তথ্য দিচ্ছে | Married or giving false information |
| report.reason.other | অন্য কারণ | Other |
| report.details | বিস্তারিত (ঐচ্ছিক) | Details (optional) |
| report.alsoBlock | এই ব্যক্তিকে ব্লকও করুন | Also block this person |
| report.done | ধন্যবাদ। আমাদের টিম রিপোর্টটি দেখবে। | Thank you. Our team will review this report. |

### 2.8 `dashboard`, `saved`, `settings`, `deleteAccount`

| Key | বাংলা | English |
|---|---|---|
| dashboard.greeting | স্বাগতম, {name} | Welcome, {name} |
| dashboard.pending | নতুন আগ্রহ | New interests |
| dashboard.connections | সংযোগ | Connections |
| dashboard.saved | সংরক্ষিত প্রোফাইল | Saved profiles |
| dashboard.checklist.basics / location / photo / preferences / email | মৌলিক তথ্য / এলাকা / ছবি (ঐচ্ছিক) / পছন্দ / ইমেইল নিশ্চিতকরণ | Basic info / Location / Photo (optional) / Preferences / Email confirmed |
| saved.empty | পরে দেখার জন্য প্রোফাইল সংরক্ষণ করুন। | Save profiles to view them later. |
| saved.saved / removed | সংরক্ষিত হয়েছে / সংরক্ষিত তালিকা থেকে সরানো হয়েছে | Saved / Removed from saved |
| settings.language | ভাষা | Language |
| settings.notifications | ইমেইল নোটিফিকেশন | Email notifications |
| settings.notify.received | কেউ আগ্রহ জানালে | When someone expresses interest |
| settings.notify.accepted | কেউ আমার আগ্রহ গ্রহণ করলে | When someone accepts my interest |
| settings.mobile | মোবাইল নম্বর | Mobile number |
| settings.emailReadOnly | ইমেইল পরিবর্তন করতে আমাদের সঙ্গে যোগাযোগ করুন। | To change your email, contact us. |
| settings.password | পাসওয়ার্ড পরিবর্তন | Change password |
| settings.currentPassword / newPassword | বর্তমান পাসওয়ার্ড / নতুন পাসওয়ার্ড | Current password / New password |
| settings.blocked | ব্লক করা সদস্য | Blocked members |
| settings.blockedEmpty | আপনি কাউকে ব্লক করেননি। | You haven't blocked anyone. |
| settings.logoutAll | সব ডিভাইস থেকে লগআউট | Log out of all devices |
| settings.danger | অ্যাকাউন্ট মুছে ফেলা | Delete account |
| deleteAccount.title | অ্যাকাউন্ট মুছে ফেলবেন? | Delete your account? |
| deleteAccount.body | আপনার প্রোফাইল সঙ্গে সঙ্গে লুকিয়ে যাবে এবং আর লগইন করা যাবে না। ৩০ দিনের মধ্যে আপনার ব্যক্তিগত তথ্য স্থায়ীভাবে মুছে ফেলা হবে। এটি ফেরানো যাবে না। | Your profile will be hidden immediately and you won't be able to log in. Your personal data will be permanently deleted within 30 days. This cannot be undone. |
| deleteAccount.typeToConfirm | নিশ্চিত করতে লিখুন: মুছে ফেলুন | To confirm, type: DELETE |
| deleteAccount.submit | আমার অ্যাকাউন্ট মুছে ফেলুন | Delete my account |
| deleteAccount.done | আপনার অ্যাকাউন্ট মুছে ফেলার প্রক্রিয়া শুরু হয়েছে। দুজন ব্যবহার করার জন্য ধন্যবাদ। | Your account deletion has started. Thank you for using DUJON. |

### 2.9 `contactPage`

| Key | বাংলা | English |
|---|---|---|
| contactPage.title | আমাদের সঙ্গে যোগাযোগ করুন | Contact us |
| contactPage.name / email / mobile / subject / message | নাম / ইমেইল / মোবাইল / বিষয় / বার্তা | Name / Email / Mobile / Subject / Message |
| contactPage.subject.general / account_help / safety / feedback / other | সাধারণ জিজ্ঞাসা / অ্যাকাউন্ট সহায়তা / নিরাপত্তা বিষয়ক / মতামত / অন্যান্য | General question / Account help / Safety concern / Feedback / Other |
| contactPage.submit | বার্তা পাঠান | Send message |
| contactPage.success | ধন্যবাদ! আপনার বার্তা পেয়েছি, শীঘ্রই উত্তর দেব। | Thank you! We've received your message and will reply soon. |

### 2.10 `errors` (map to SRS §6 codes)

| Key | বাংলা | English |
|---|---|---|
| errors.required | এই তথ্যটি দিতে হবে। | This field is required. |
| errors.email | সঠিক ইমেইল ঠিকানা দিন। | Please enter a valid email address. |
| errors.mobile | সঠিক বাংলাদেশি মোবাইল নম্বর দিন (যেমন ০১৭১২৩৪৫৬৭৮)। | Please enter a valid Bangladeshi mobile number (e.g. 01712345678). |
| errors.passwordShort | পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে। | Password must be at least 8 characters. |
| errors.passwordCommon | এই পাসওয়ার্ডটি খুব সাধারণ। অন্য একটি দিন। | This password is too common. Please choose another. |
| errors.passwordMismatch | দুটি পাসওয়ার্ড মেলেনি। | The passwords don't match. |
| errors.underAge | দুজন ব্যবহার করতে আপনার বয়স কমপক্ষে ১৮ বছর হতে হবে। | You must be at least 18 to use DUJON. |
| errors.invalidDate | সঠিক তারিখ দিন। | Please enter a valid date. |
| errors.invalidAgeRange | সর্বনিম্ন বয়স সর্বোচ্চ বয়সের চেয়ে বেশি হতে পারবে না। | Minimum age cannot be greater than maximum age. |
| errors.locationMismatch | নির্বাচিত এলাকাগুলো মিলছে না। আবার বেছে নিন। | The selected areas don't match. Please select again. |
| errors.contactInfo | এখানে ফোন নম্বর, ইমেইল বা লিংক দেওয়া যাবে না। দুজন রাজি হলে যোগাযোগের তথ্য নিজেই দেখা যাবে। | Phone numbers, emails and links aren't allowed here. Contact details are shared automatically once you both agree. |
| errors.profileIncomplete | প্রকাশের আগে চিহ্নিত তথ্যগুলো পূরণ করুন। | Please complete the highlighted fields before publishing. |
| errors.invalidCredentials | ইমেইল বা পাসওয়ার্ড সঠিক নয়। | Email or password is incorrect. |
| errors.rateLimited | অনেকবার চেষ্টা করা হয়েছে। {minutes} মিনিট পর আবার চেষ্টা করুন। | Too many attempts. Please try again in {minutes} minutes. |
| errors.interestExists | আপনি আগেই আগ্রহ পাঠিয়েছেন। | You've already expressed interest. |
| errors.dailyLimit | আজকের আগ্রহ পাঠানোর সীমা শেষ। আগামীকাল আবার চেষ্টা করুন। | You've reached today's limit. Please try again tomorrow. |
| errors.notAvailable | প্রোফাইলটি এখন দেখা যাচ্ছে না। | This profile isn't available. |
| errors.reportExists | আপনি আগেই এই প্রোফাইলটি রিপোর্ট করেছেন। | You've already reported this profile. |
| errors.linkExpired | লিংকটির মেয়াদ শেষ হয়ে গেছে। | This link has expired. |
| errors.notFound.title | পৃষ্ঠাটি খুঁজে পাওয়া যায়নি | Page not found |
| errors.generic | কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন। (রেফারেন্স: {requestId}) | Something went wrong. Please try again. (Reference: {requestId}) |

### 2.11 Email templates (subject lines; bodies are short, plain, with one button)

| Template | বাংলা subject | English subject |
|---|---|---|
| verify-email | দুজন: আপনার ইমেইল নিশ্চিত করুন | DUJON: Confirm your email |
| reset-password | দুজন: পাসওয়ার্ড রিসেট লিংক | DUJON: Reset your password |
| registration-attempt | দুজন: আপনার ইমেইল দিয়ে নতুন অ্যাকাউন্টের চেষ্টা | DUJON: Someone tried to register with your email |
| interest-received | দুজন: নতুন একজন আপনার প্রতি আগ্রহ দেখিয়েছেন | DUJON: Someone is interested in you |
| interest-accepted | দুজন: আপনার আগ্রহ গৃহীত হয়েছে | DUJON: Your interest was accepted |
| password-changed | দুজন: আপনার পাসওয়ার্ড পরিবর্তন হয়েছে | DUJON: Your password was changed |
| account-deletion | দুজন: অ্যাকাউন্ট মুছে ফেলার অনুরোধ পেয়েছি | DUJON: We received your account deletion request |
| ops-report (internal, English only) | — | [DUJON ops] New report #{id}: {reason} |
| ops-contact (internal, English only) | — | [DUJON ops] Contact form: {subject} |

Notification emails never include the other member's photo, contact details or age; they link to the site.

### 2.12 FAQ content (initial set)

| # | প্রশ্ন / উত্তর (বাংলা) | Question / answer (English) |
|---|---|---|
| 1 | **দুজন কি বিনামূল্যে?** এই সংস্করণে দুজনের সব সুবিধা বিনামূল্যে। | **Is DUJON free?** Yes — everything in this version is free. |
| 2 | **আমার ফোন নম্বর কারা দেখতে পাবেন?** শুধু যাঁদের সঙ্গে আপনার পারস্পরিক আগ্রহ (সংযোগ) হয়েছে। | **Who can see my phone number?** Only people you are connected with through mutual interest. |
| 3 | **আপনারা কি প্রোফাইল যাচাই করেন?** এখনো না। সদস্যরা নিজেরাই তথ্য দেন। আমরা ভবিষ্যতে যাচাই-ব্যবস্থা যোগ করার পরিকল্পনা করছি। সন্দেহজনক কিছু দেখলে রিপোর্ট করুন। | **Do you verify profiles?** Not yet. Members provide their own information. We plan to add verification in future. Please report anything suspicious. |
| 4 | **কে আমার প্রোফাইল দেখতে পাবেন?** লগইন করা, প্রকাশিত প্রোফাইলসহ বিপরীত লিঙ্গের সদস্যরা। লগইন ছাড়া কেউ বা সার্চ ইঞ্জিন আপনার প্রোফাইল দেখতে পায় না। | **Who can see my profile?** Logged-in members of the opposite gender who have published profiles. Visitors and search engines cannot. |
| 5 | **বাবা-মা কি সন্তানের জন্য প্রোফাইল খুলতে পারেন?** হ্যাঁ। "প্রোফাইলটি পরিচালনা করছেন" অংশে তা উল্লেখ করুন। প্রোফাইলের ব্যক্তির বয়স অবশ্যই ১৮ বা তার বেশি হতে হবে এবং তাঁর সম্মতি থাকতে হবে। | **Can parents create a profile for their son or daughter?** Yes. Select it under "Profile managed by". The person must be 18+ and must agree. |
| 6 | **কীভাবে খুঁজব?** বয়সসীমা আর বিভাগ, জেলা, উপজেলা/থানা বেছে নিন। | **How do I search?** Choose an age range and a division, district and upazila/thana. |
| 7 | **কেউ বিরক্ত করলে কী করব?** প্রোফাইল থেকে ব্লক ও রিপোর্ট করুন। জরুরি বিপদে ৯৯৯-এ কল করুন। | **What if someone bothers me?** Block and report them from their profile. In an emergency, call 999. |
| 8 | **ছবি কি সবাই দেখবে?** আপনি ঠিক করবেন — সদস্যরা, নাকি শুধু সংযুক্ত ব্যক্তিরা। | **Will everyone see my photo?** You choose: members, or only your connections. |
| 9 | **প্রোফাইল কীভাবে লুকাব বা মুছব?** ড্যাশবোর্ড থেকে প্রোফাইল লুকাতে বা সেটিংস থেকে অ্যাকাউন্ট মুছতে পারবেন। | **How do I hide or delete my profile?** Hide it from your dashboard, or delete your account in Settings. |
| 10 | **লিঙ্গ বা জন্মতারিখ ভুল দিয়েছি, কী করব?** যোগাযোগ পাতা থেকে আমাদের জানান। | **I entered the wrong gender or date of birth.** Contact us through the contact page. |

### 2.13 Legal pages
Drafts are outlined in `09-security-privacy-and-safety.md` §10. They are written by the owner/legal adviser, not generated as final legal text.

---

## 3. SEO plan

### 3.1 URL and indexing strategy

| Path group | Example | Indexed | Notes |
|---|---|---|---|
| Public marketing | `/`, `/how-it-works`, `/safety`, `/faq`, `/contact` (+ `/en/...`) | **Yes** | In sitemap; canonical + hreflang |
| Legal | `/terms`, `/privacy`, `/community-guidelines` | Yes (low priority) | In sitemap |
| Auth | `/register`, `/login`, `/forgot-password`, `/reset-password`, `/verify-email` | No | `noindex, follow` for register/login (crawlable links), `noindex, nofollow` for token pages |
| Member | `/onboarding/*`, `/search`, `/profiles/*`, `/dashboard/*`, `/account-deleted` | **No** | `noindex, nofollow` + `X-Robots-Tag`; also login-protected |
| API | `/api/*` | No | `X-Robots-Tag: noindex`; disallowed in robots |

No district/upazila landing pages in MVP (avoids thin content). Member profile indexing stays **OFF** unless a future consent-based policy is approved.

### 3.2 Keyword map

| Page | Primary (bn) | Secondary (bn) | English |
|---|---|---|---|
| Home | পাত্র পাত্রী খুঁজুন | বাংলাদেশি ম্যাট্রিমনি, বাংলাদেশে বিয়ের ওয়েবসাইট, নিজের পছন্দের জীবনসঙ্গী খুঁজুন | Bangladeshi matrimonial website, Matrimony Bangladesh |
| How it works | বিয়ের জন্য পাত্র খুঁজুন / বিয়ের জন্য পাত্রী খুঁজুন | অনলাইনে জীবনসঙ্গী খোঁজার নিয়ম | How to find a life partner online in Bangladesh |
| Safety | নিরাপদ ম্যাট্রিমনি | ভুয়া প্রোফাইল চেনার উপায় | Safe matrimony site Bangladesh |
| FAQ | ম্যাট্রিমনি সাইট প্রশ্ন | বিনামূল্যে বিয়ের সাইট | Free matrimony site Bangladesh FAQ |
| Contact | দুজন যোগাযোগ | — | Contact DUJON |

Use keywords naturally in H1/H2, intro paragraph and meta description. No keyword stuffing, no hidden text. Keyword volumes should be checked with a keyword tool before launch; this map is a starting hypothesis.

### 3.3 Titles and meta descriptions

| Route | Title (bn) | Description (bn) | Title (en) | Description (en) |
|---|---|---|---|---|
| `/` | দুজন — পাত্র পাত্রী খুঁজুন \| বাংলাদেশি ম্যাট্রিমনি | বয়স ও এলাকা দিয়ে সহজে পাত্র-পাত্রী খুঁজুন। দুজনেই রাজি হলে তবেই যোগাযোগ — বিনামূল্যে, গোপনীয় ও সম্মানজনক। | DUJON — Bangladeshi Matrimonial Website | Find a life partner in Bangladesh by age and area. Contact is shared only when you both agree — free, private and respectful. |
| `/how-it-works` | কীভাবে কাজ করে — দুজন | প্রোফাইল তৈরি থেকে সংযোগ পর্যন্ত, দুজনে বিয়ের জন্য পাত্র বা পাত্রী খোঁজার সহজ ধাপগুলো জানুন। | How DUJON works | From creating a profile to connecting — the simple steps to finding a life partner on DUJON. |
| `/safety` | নিরাপত্তা ও গোপনীয়তা — দুজন | আমরা কী যাচাই করি আর কী করি না, নিরাপদ থাকার টিপস এবং ব্লক ও রিপোর্ট করার নিয়ম। | Safety and privacy — DUJON | What we do and don't verify, tips for staying safe, and how to block and report. |
| `/faq` | সাধারণ জিজ্ঞাসা — দুজন | দুজন ব্যবহার, গোপনীয়তা, প্রোফাইল ও যোগাযোগ নিয়ে সাধারণ প্রশ্নের উত্তর। | Frequently asked questions — DUJON | Answers about using DUJON, privacy, profiles and contact. |
| `/contact` | যোগাযোগ — দুজন | প্রশ্ন, মতামত বা সহায়তার জন্য দুজন টিমের সঙ্গে যোগাযোগ করুন। | Contact DUJON | Get in touch with the DUJON team for questions, feedback or help. |
| `/terms` | শর্তাবলি — দুজন | দুজন ব্যবহারের শর্তাবলি। | Terms and Conditions — DUJON | The terms for using DUJON. |
| `/privacy` | গোপনীয়তা নীতি — দুজন | দুজন কীভাবে আপনার তথ্য সংগ্রহ, ব্যবহার ও সুরক্ষা করে। | Privacy Policy — DUJON | How DUJON collects, uses and protects your information. |
| `/community-guidelines` | কমিউনিটি নির্দেশিকা — দুজন | দুজনে সবার জন্য সম্মানজনক ও নিরাপদ পরিবেশের নিয়ম। | Community Guidelines — DUJON | The rules that keep DUJON respectful and safe. |
| Member/auth pages | `{page} — দুজন` | — (noindex) | `{page} — DUJON` | — |

### 3.4 Canonical, hreflang, sitemap, robots

- Canonical: absolute self-URL without query string, e.g. `https://<domain>/faq` and `https://<domain>/en/faq`.
- hreflang on each public page: `bn` → `/…`, `en` → `/en/…`, `x-default` → `/…`.
- `<html lang>` matches locale.
- `sitemap.xml` (Next.js `app/sitemap.ts`): public + legal routes × 2 locales with `alternates.languages`; `lastModified` from content version.
- `robots.txt` (`app/robots.ts`):

```text
User-agent: *
Allow: /
Disallow: /api/
Disallow: /search
Disallow: /profiles/
Disallow: /dashboard
Disallow: /onboarding
Disallow: /reset-password
Disallow: /verify-email
Disallow: /en/search
Disallow: /en/profiles/
Disallow: /en/dashboard
Disallow: /en/onboarding
Disallow: /en/reset-password
Disallow: /en/verify-email
Sitemap: https://<domain>/sitemap.xml
```

(Robots rules are a courtesy; protection relies on authentication + `noindex`.) Non-production deployments (preview URLs) send `X-Robots-Tag: noindex` on every response.

### 3.5 Structured data
- Home: `Organization` (name, url, logo, contactPoint email once confirmed) and `WebSite`.
- FAQ: `FAQPage` matching the visible Q&A exactly.
- No `Review`, `AggregateRating`, `Person` or `Event` markup (would be inaccurate).

### 3.6 Social sharing
OG tags: `og:title`, `og:description`, `og:url`, `og:image` (IMG-08, 1200×630, no people), `og:locale` (`bn_BD` / `en_US`) with `og:locale:alternate`; `twitter:card=summary_large_image`.

### 3.7 Technical SEO checklist
Server-rendered/static public pages · semantic headings · descriptive link text · image `alt` in both languages · no render-blocking third-party scripts · Core Web Vitals targets (NFR-PERF-001) · submit sitemap in Google Search Console and Bing Webmaster Tools after launch.
