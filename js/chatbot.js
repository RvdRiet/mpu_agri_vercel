/**
 * AgriSupport Decision Assistant — comprehensive rule-based chatbot.
 * Full context of the entire website, farming guidance, and navigation help.
 */
(function (global) {
  'use strict';

  var root = document.getElementById('chatbotRoot');
  if (!root) return;

  /* ================================================================
   *  KNOWLEDGE BASE — grouped by topic for maintainability
   * ================================================================ */
  var qa = [].concat(

    /* ---- GREETINGS & GENERAL ---- */
    [
      { k: ['hello','hi','hey','howzit','good morning','good afternoon','good evening','greetings','molo','sawubona','dumela'], a: 'Hello! Welcome to the Mpumalanga Agricultural Decision Support System. I can help you with:<br>• Grant programmes &amp; applications<br>• Crop &amp; livestock farming guidance<br>• Weather information<br>• Alerts &amp; risk events<br>• Support contacts<br>What would you like to know?' },
      { k: ['thank','thanks','cheers','dankie','ngiyabonga'], a: "You're welcome! Feel free to ask anything else about farming, grants, or using this website. I'm here to help." },
      { k: ['bye','goodbye','see you','later','cheers'], a: "Goodbye! Wishing you a productive farming season. Come back anytime you need help." },
      { k: ['who are you','what are you','are you a robot','are you human','bot'], a: "I'm the AgriSupport Assistant — a digital helper built into this website. I have detailed knowledge of all our programmes, farming guides, and support services. While I'm not human, I can answer most farming and website questions. For complex issues, I'll point you to the right person or resource." },
      { k: ['what is this website','about this site','what does this site do','purpose'], a: "This is the <strong>Mpumalanga Agricultural Decision Support System</strong>, run by the Department of Agriculture. It provides:<br>• <a href='crop.html'>Crop</a>, <a href='livestock.html'>Livestock</a>, and <a href='environmental.html'>Environmental</a> grant programmes<br>• <a href='weather.html'>Real-time weather data</a> for Mpumalanga<br>• <a href='alerts.html'>Live farming alerts</a> from trusted SA sources<br>• <a href='guides.html'>Comprehensive farming guides</a> for all major crops and livestock<br>• <a href='support.html'>Support contacts</a> directory<br>• Online grant applications with tracking" },
      { k: ['what can you help','what can i ask','what do you know','help me','help'], a: "I can help with a wide range of topics:<br>• <strong>Grants &amp; financing:</strong> How to apply, eligibility, MADC loans, CASP, SEDA<br>• <strong>Crop farming:</strong> Maize, wheat, vegetables, fruit, sugarcane, soil health<br>• <strong>Livestock:</strong> All SA breeds, health, nutrition, breeding<br>• <strong>Disaster risk:</strong> Drought categories, flood mitigation, veld fire, early warnings<br>• <strong>Weather:</strong> Dashboard, forecasts, SAWS warnings<br>• <strong>Support:</strong> Extension officers, disaster coordinators, LED, Thusong centres<br>• <strong>Navigation:</strong> Finding anything on this website<br>Just ask your question!" },
    ],

    /* ---- WEBSITE NAVIGATION ---- */
    [
      { k: ['pages','sitemap','what pages','navigation','menu','where can i find'], a: "This website has the following pages:<br>• <a href='index.html'>Home</a> — Overview &amp; quick access<br>• <a href='crop.html'>Crop Programme</a> — Crop grant details<br>• <a href='livestock.html'>Livestock Programme</a> — Masibuyele Esibayeni<br>• <a href='environmental.html'>Environmental Programme</a> — Conservation grants<br>• <a href='weather.html'>Weather Dashboard</a> — Live weather data<br>• <a href='alerts.html'>Farming Alerts</a> — News &amp; risk events<br>• <a href='guides.html'>Advisory Guides</a> — Comprehensive farming info<br>• <a href='support.html'>Support Contacts</a> — Phone numbers &amp; services<br>• <a href='track.html'>Track Application</a> — Check grant status<br>• <a href='login.html'>Login</a> / <a href='register.html'>Register</a>" },
      { k: ['education','education dropdown','guides and e-learning','where is e-learning','where is elearning','learning resources'], a: "You can now find learning resources under the <strong>Education</strong> menu in the top navigation.<br><br>It contains:<br>• <a href='guides.html'>Guides</a> — practical crop, livestock, and environmental guidance<br>• <a href='e-learning.html'>E-learning</a> — downloadable learning materials and training resources<br><br>On mobile, Education is also available as its own section in the menu." },
      { k: ['home page','main page','homepage','landing'], a: "The <a href='index.html'>Home page</a> gives you an overview of all programmes, quick access to weather, alerts, guides, and the application tracker. It also has this chatbot to help you find what you need." },
    ],

    /* ---- GRANT PROGRAMMES — CROP ---- */
    [
      { k: ['crop programme','crop grant','crop management','crop support'], a: "The <strong>Crop Management Programme</strong> supports farmers growing maize, vegetables, fruit, sugarcane, grains, oilseeds, and nuts in Mpumalanga.<br><br><strong>Support includes:</strong> certified seeds, fertiliser, crop protection chemicals, irrigation equipment, and mechanisation.<br><br><strong>Grant amounts by category:</strong><br>• Subsistence farmers: up to R20,000<br>• Smallholder farmers: up to R150,000<br>• Commercial farmers: up to R500,000<br><br>Visit the <a href='crop.html'>Crop Programme page</a> for full details or <a href='Application/crop.html'>apply now</a>." },
      { k: ['crop eligibility','crop requirements','crop qualify'], a: "To qualify for a crop grant:<br>• South African citizen with valid 13-digit ID<br>• Active or aspiring crop farmer in Mpumalanga<br>• Valid proof of land access (title deed, lease, PTO, or CPA resolution)<br>• Land must be suitable for crop production<br>• Not receiving the same support from another programme<br>• Business plan or crop production plan<br><br>Tip: Prepare a simple business plan showing what you want to grow, how much land you have, and what support you need. Your local extension officer can help with this." },
      { k: ['crop documents','crop paperwork'], a: "Documents needed for a <strong>crop grant</strong> application:<br>• Certified copy of SA ID (all project members)<br>• Proof of land access (title deed, lease, PTO/RTO letter)<br>• Recent soil test results (recommended)<br>• Crop production plan or business plan<br>• Municipal account or proof of address<br>• Bank statement (not older than 3 months)<br>• If applicable: Environmental Impact Assessment<br><br>Tip: Get a free soil test through your local extension office before applying — it strengthens your application significantly." },
    ],

    /* ---- GRANT PROGRAMMES — LIVESTOCK ---- */
    [
      { k: ['livestock programme','livestock grant','masibuyele','masibuyele esibayeni','livestock support','livestock allocation'], a: "The <strong>Masibuyele Esibayeni Livestock Programme</strong> provides breeding stock to qualifying farmers.<br><br><strong>Subsistence farmer allocation:</strong><br>• 10 Nguni cattle (8 heifers + 2 bulls) OR<br>• 20 Boer goats (16 does + 4 bucks) OR<br>• 20 Dorper sheep (16 ewes + 4 rams) OR<br>• 5 pigs (4 sows + 1 boar) OR<br>• 100 day-old chicks + housing materials<br><br><strong>Smallholder allocation:</strong> Larger numbers tailored to farm capacity.<br><br>Visit <a href='livestock.html'>Livestock Programme</a> for full tables or <a href='Application/index.html'>apply here</a>." },
      { k: ['livestock eligibility','livestock requirements','livestock qualify'], a: "To qualify for the livestock programme:<br>• SA citizen with valid 13-digit ID<br>• Active or aspiring livestock farmer in Mpumalanga<br>• Adequate land/facilities for the livestock requested<br>• Proof of land access<br>• Existing kraaling/housing or plan to build before delivery<br>• Not currently receiving the same livestock from another programme<br><br><strong>Important:</strong> You must have adequate grazing, water, and basic infrastructure (kraal, shelter) BEFORE livestock are delivered. The extension officer will inspect your farm." },
      { k: ['livestock documents','livestock paperwork'], a: "Documents for a <strong>livestock grant</strong>:<br>• Certified SA ID copy<br>• Proof of land access<br>• Brand mark certificate (for cattle) — apply at your local DALRRD office<br>• Proof of existing infrastructure (photos of kraal, fencing, water)<br>• Business plan or livestock management plan<br>• Municipal account or proof of address<br>• Bank statement<br><br>Tip: If you don't have a brand mark yet, apply early — it can take 4-8 weeks to process." },
    ],

    /* ---- GRANT PROGRAMMES — ENVIRONMENTAL ---- */
    [
      { k: ['environmental programme','environmental grant','conservation grant','enrichment grant','environmental support'], a: "The <strong>Environmental Enrichment Programme</strong> funds conservation and sustainability projects:<br><br><strong>Focus areas:</strong><br>• Soil rehabilitation &amp; erosion control<br>• Water resource management<br>• Biodiversity conservation<br>• Invasive alien plant control<br><br><strong>Grant amounts:</strong><br>• Subsistence: up to R15,000<br>• Smallholder: up to R100,000<br>• Commercial: up to R300,000<br><br>Visit <a href='environmental.html'>Environmental Programme</a> or <a href='Application/environmental.html'>apply here</a>." },
    ],

    /* ---- APPLICATION PROCESS ---- */
    [
      { k: ['how to apply','apply for grant','application process','how do i apply','submit application','step by step'], a: "<strong>How to apply for a grant — step by step:</strong><br><br>1️⃣ <strong>Register:</strong> <a href='register.html'>Create an account</a> with your SA ID number<br>2️⃣ <strong>Choose programme:</strong> Decide between <a href='Application/crop.html'>Crop</a>, <a href='Application/index.html'>Livestock</a>, or <a href='Application/environmental.html'>Environmental</a><br>3️⃣ <strong>Complete the form:</strong> Fill in personal details, farm info, and what support you need (5 steps)<br>4️⃣ <strong>Upload documents:</strong> Attach all required documents as scans or photos<br>5️⃣ <strong>Submit:</strong> Review and submit. You'll get a reference number<br>6️⃣ <strong>Track:</strong> Check status on the <a href='track.html'>Track page</a><br><br><strong>Tip:</strong> Gather all documents BEFORE starting the form. Incomplete applications delay processing." },
      { k: ['track','status','check application','my application','where is my application','progress','reference number'], a: "To track your application:<br>1. Go to the <a href='track.html'>Track Application</a> page<br>2. Log in with your SA ID and password<br>3. View your application status<br><br><strong>Status stages:</strong><br>• <strong>Submitted</strong> — Received, awaiting review<br>• <strong>Under Review</strong> — Being assessed by officials<br>• <strong>Additional Documentation Required</strong> — Reviewer requested more documents; check the reviewer note on your tracking card<br>• <strong>Approved</strong> — Congratulations! Await delivery/payment<br>• <strong>Rejected</strong> — See reason provided; you may reapply next cycle<br><br>Processing typically takes 4-12 weeks depending on the programme." },
      { k: ['autosave','draft saved','saved draft','resume application','continue later','form saved'], a: "Application forms now have <strong>autosave</strong> in your browser.<br><br>• If you leave before submitting, your draft is saved automatically<br>• When you return, your saved data is restored<br>• Draft data clears automatically after successful submission<br><br>Note: File uploads may need to be re-selected for security reasons in some browsers." },
      { k: ['request additional documents','additional documentation required','reviewer requested documents','staff requested docs'], a: "If your status changes to <strong>Additional Documentation Required</strong>, a reviewer needs more information before final approval.<br><br>Go to <a href='track.html'>Track Application</a> and read the reviewer note on your application card. Then prepare and submit the requested documents through the instructed channel or support office." },
      { k: ['document','documents','required','upload','paperwork','what do i need'], a: "<strong>Documents required for grant applications:</strong><br><br>All programmes need:<br>• Certified copy of SA ID (all project members)<br>• Proof of land access (title deed, lease, PTO, CPA resolution)<br>• Business plan or farming profile<br>• Municipal account or proof of address<br>• Bank statement (not older than 3 months)<br><br>Programme-specific:<br>• <strong>Crop:</strong> Soil test results, crop production plan<br>• <strong>Livestock:</strong> Brand mark certificate, proof of infrastructure<br>• <strong>Environmental:</strong> Conservation plan, EIA (if applicable)<br><br>Tip: Certify ID copies at your nearest police station (free of charge)." },
      { k: ['eligibility','eligible','qualify','who can apply','am i eligible'], a: "<strong>General eligibility for all programmes:</strong><br>• South African citizen with valid 13-digit SA ID<br>• Active or aspiring farmer in Mpumalanga province<br>• Valid proof of land access (not necessarily ownership)<br>• Not receiving the same support from another government programme<br><br><strong>Farmer categories:</strong><br>• <strong>Subsistence:</strong> Annual turnover up to R50,000<br>• <strong>Smallholder:</strong> R50,001 – R1,000,000<br>• <strong>Commercial:</strong> Over R1,000,000<br><br>Your category determines the level of support. Most grants target subsistence and smallholder farmers first." },
      { k: ['register','sign up','create account','new account','registration'], a: "To register:<br>1. Go to <a href='register.html'>Register page</a><br>2. Enter your 13-digit SA ID number<br>3. Fill in your full name<br>4. Create a password (at least 6 characters)<br>5. Submit<br><br>Registration is free. Once registered, you can apply for grants and track applications." },
      { k: ['login','sign in','log in','password','forgot password','cant login','cannot login'], a: "To log in, visit the <a href='login.html'>Login page</a> and enter your SA ID number and password.<br><br>If you've forgotten your password, you'll need to contact your local agricultural extension office for assistance, or register a new account if needed.<br><br>Having trouble? Make sure you're using the same ID number you registered with." },
      { k: ['farmer category','categories','subsistence','smallholder','commercial farmer','what category am i'], a: "<strong>Farmer categories determine your grant level:</strong><br><br>• <strong>Subsistence (up to R50,000/year):</strong> Farming mainly for household food security. Small plots, manual labour, limited market sales. Most communal farmers fall here.<br><br>• <strong>Smallholder (R50,001–R1,000,000/year):</strong> Producing for both household and market. Some mechanisation, employs a few workers. Growing towards commercial.<br><br>• <strong>Commercial (over R1,000,000/year):</strong> Full-scale market-oriented farming with significant infrastructure and workforce.<br><br><strong>Not sure?</strong> Calculate your total farm income for the last 12 months. If under R50,000, you're subsistence. Your extension officer can help confirm your category." },
      { k: ['rejected','application rejected','why rejected','denied','unsuccessful','reapply'], a: "If your application was rejected:<br>1. Check the reason on the <a href='track.html'>Track page</a><br>2. Common reasons: incomplete documents, land access issues, duplicate application, ineligibility<br>3. <strong>You CAN reapply</strong> in the next application cycle after addressing the issue<br><br><strong>To improve your next application:</strong><br>• Get help from your local extension officer (free service)<br>• Ensure ALL documents are complete and certified<br>• Prepare a clear business plan<br>• Get a soil test done (for crop grants)<br>• Ensure your farm infrastructure is ready (for livestock)" },
    ],

    /* ---- WEATHER ---- */
    [
      { k: ['weather','forecast','weather dashboard','rain','rainfall','temperature','humidity','wind'], a: "The <a href='weather.html'>Weather Dashboard</a> shows real-time weather for 16 locations across Mpumalanga including Nelspruit, Ermelo, Bethal, Standerton, Middelburg, and more.<br><br><strong>What you can see:</strong><br>• Current temperature &amp; conditions<br>• Rainfall data<br>• Humidity levels<br>• Wind speed &amp; direction<br>• 5-day forecast<br>• Agricultural advisory tips<br><br><strong>Farming tip:</strong> Check weather BEFORE spraying (no rain within 6 hours), planting (soil must be moist), or harvesting (dry conditions needed for grain)." },
      { k: ['when to plant','planting season','planting time','when should i plant'], a: "<strong>Planting seasons for Mpumalanga:</strong><br><br>🌽 <strong>Maize:</strong> Mid-October to mid-November (Highveld); November–December (Lowveld)<br>🌻 <strong>Sunflower:</strong> November to January<br>🫘 <strong>Soybeans:</strong> October to November<br>🌾 <strong>Wheat:</strong> May to July (winter crop, irrigated)<br>🥔 <strong>Potatoes:</strong> August–October (summer crop); January–February (winter, irrigated)<br>🥬 <strong>Vegetables:</strong> Year-round with season planning<br>🍊 <strong>Citrus:</strong> Plant grafted trees in spring<br><br>Always check <a href='weather.html'>weather conditions</a> before planting. Soil temperature should be above 10°C for summer crops." },
    ],

    /* ---- ALERTS ---- */
    [
      { k: ['alerts','alert','news','farming news','risk events','outbreaks','warnings'], a: "The <a href='alerts.html'>Farming Alerts</a> page shows live news from three trusted SA sources:<br>• <strong>Farmer's Weekly</strong> — crop news, seasonal outlooks<br>• <strong>Food For Mzansi</strong> — livestock stories, farmer profiles<br>• <strong>African Farming</strong> — disease outbreaks, continental news<br><br>You can filter by: Mpumalanga, Crop, Livestock, Disease &amp; Pest, Weather &amp; Climate, or use the search bar.<br><br>The page auto-refreshes every 30 minutes to keep you updated on any risks to your farming operation." },
      { k: ['mpumalanga alerts','mpumalanga news','local alerts','local news'], a: "On the <a href='alerts.html'>Alerts page</a>, click the blue <strong>\"Mpumalanga\"</strong> filter to see only news mentioning the province, its towns, or regional keywords like Lowveld, Highveld, and Bushveld. Articles with Mpumalanga relevance also get a blue badge so you can spot them easily." },
    ],

    /* ---- SUPPORT & CONTACTS ---- */
    [
      { k: ['contact','phone','email','call','office','telephone','number','support contacts'], a: "Visit our <a href='support.html'>Support &amp; Contacts</a> page for a full directory. Key numbers:<br><br>🚨 <strong>Emergency:</strong><br>• State Vet: 013 288 2087<br>• Dept. of Agriculture: 013 766 4027<br>• Disaster Management: 013 766 4300<br>• Stock Theft: 086 001 0111<br><br>The Support page has contacts for irrigation, pest control, seed suppliers, vets, feed suppliers, auctioneers, insurance, and more — organised by crop and livestock categories." },
      { k: ['extension officer','extension services','agricultural advisor','advisor','farmer development'], a: "Agricultural extension officers provide <strong>FREE</strong> advice and support to farmers. They can help with:<br>• Farm planning and business plans<br>• Soil testing and crop selection<br>• Livestock management advice<br>• Grant application assistance<br>• On-farm demonstrations and training<br><br>📞 <strong>Provincial:</strong> 013 766 4027<br>📞 <strong>Farmer Development:</strong> 013 755 6328<br><br>📞 <strong>District offices:</strong><br>• Ehlanzeni East (Buffelspruit): 013 781 0024<br>• Ehlanzeni West (Tekwane): 013 747 2074<br>• Gert Sibande (Ermelo): 017 811 1897<br>• Nkangala (Bronkhorstspruit): 013 932 4835<br>• Badplaas: 017 883 1480<br>• Loopspruit: 013 930 7025<br><br>Ask for the officer covering your area — they will visit your farm." },
      { k: ['vet','veterinarian','veterinary','animal doctor','state vet'], a: "For veterinary help:<br><br>🚨 <strong>State Vet (emergencies/outbreaks):</strong> 013 288 2087<br>• Free vaccinations for notifiable diseases<br>• Disease investigation<br>• Movement permits<br><br>🏥 <strong>Find a private vet:</strong> SA Veterinary Association (SAVA) — 012 346 1150 or <a href='https://www.sava.co.za' target='_blank'>sava.co.za</a><br><br>🔬 <strong>Diagnostic lab:</strong> Onderstepoort Veterinary Institute — 012 529 9111<br><br>Visit the <a href='support.html'>Support page</a> for the full veterinary contacts list." },
      { k: ['emergency','urgent','disease outbreak','fmd','foot and mouth','outbreak report','report disease'], a: "🚨 <strong>EMERGENCY CONTACTS:</strong><br><br>• <strong>State Vet (disease/outbreak):</strong> 013 288 2087 — report ANY suspected notifiable disease immediately<br>• <strong>Disaster Management:</strong> 013 766 4300 — floods, fires, drought<br>• <strong>Stock Theft:</strong> 086 001 0111 — report theft immediately<br>• <strong>Ambulance:</strong> 10177<br>• <strong>Fire:</strong> Contact local municipality<br><br><strong>Notifiable diseases</strong> (MUST report): Foot-and-mouth disease, African swine fever, avian influenza, anthrax, rabies, Rift Valley fever, brucellosis. Failure to report is a criminal offence." },
      { k: ['loan','finance','funding','money','bank','credit','microfinance','mafisa','madc'], a: "Agricultural financing options in Mpumalanga:<br><br>🏛 <strong>MADC (Mpumalanga Agricultural Development Corporation):</strong> 013 755 6328<br>• <strong>Seasonal Loans:</strong> Covers seeds, fertiliser, chemicals — repaid within the same year<br>• <strong>Business Loans:</strong> For extending/improving your farm<br>• <strong>Revolving Credit:</strong> Trade financing for existing agribusinesses<br>• Specifically for previously disadvantaged farmers<br><br>🏦 <strong>Land Bank:</strong> 012 312 5071 — development finance<br>💰 <strong>MAFISA:</strong> Microfinance for small-scale farmers — apply through DALRRD<br>🏛 <strong>SEDA Mpumalanga:</strong> 013 755 6046 — business development &amp; cooperative support<br>🏦 <strong>Standard Bank Agriculture:</strong> 086 012 3000<br><br>You can also apply for <strong>grants</strong> (no repayment!) through our <a href='crop.html'>Crop</a>, <a href='livestock.html'>Livestock</a>, or <a href='environmental.html'>Environmental</a> programmes." },
      { k: ['insurance','insure','crop insurance','livestock insurance','hail insurance'], a: "Agricultural insurance protects your investment:<br><br>• <strong>Santam Agriculture:</strong> 086 072 6826 — crop &amp; livestock cover<br>• <strong>Old Mutual Insure:</strong> 086 023 4234 — multi-peril crop insurance<br><br><strong>What to insure:</strong><br>• Crops: hail, drought, fire, flood damage<br>• Livestock: death, theft, disease<br>• Infrastructure: buildings, equipment, fencing<br><br>Tip: Even small-scale farmers should consider insurance — one bad hail storm can wipe out an entire season's crop." },
      { k: ['casp','comprehensive agricultural support','agricultural support programme'], a: "<strong>CASP — Comprehensive Agricultural Support Programme:</strong><br><br>CASP provides post-settlement support to land reform beneficiaries and other farmers. It covers infrastructure, inputs, technical advice, training, and marketing support.<br><br>📞 <strong>District contacts:</strong><br>• Ehlanzeni: 013 759 4000/7<br>• Gert Sibande: 017 647 5917<br>• Nkangala: 013 957 2551<br><br>Visit our <a href='support.html'>Support page</a> for full programme details." },
      { k: ['thusong','service centre','walk-in','government centre','help centre','community centre'], a: "<strong>Thusong Service Centres</strong> are government walk-in centres where you can get advice on income-generating projects, programme information, and referrals — all FREE.<br><br>📍 <strong>Mpumalanga centres:</strong><br>• Casteel: 013 777 6113<br>• Matsamo (Shongwe Mission): 013 781 0659<br>• Mpuluzi (Fernie): 017 888 0300<br>• Tholulwazi (Leandra): 017 683 1031<br>• Thuthukani (Standerton): 017 797 1370<br>• Marapyane: 012 724 3812<br><br>Walk in with any questions about government support programmes!" },
      { k: ['led','local economic development','municipality','municipal support','local government'], a: "<strong>Local Economic Development (LED) Officers</strong> in your municipality can help with business plans, training referrals, and links to finance/loans/workshops:<br><br>📞 <strong>District LED managers:</strong><br>• Ehlanzeni: Ms N. Mahlalela — 013 759 8583<br>• Gert Sibande: Ms B. Alley — 017 620 3113<br>• Nkangala: Mr E. Pasha — 013 349 2239<br><br>📞 <strong>Key local municipalities:</strong><br>• Mbombela: 013 759 2029<br>• Bushbuckridge: 013 708 6018<br>• Emalahleni: 013 690 6462<br>• Nkomazi: 013 785 0391<br><br>See the <a href='support.html'>Support page</a> for all LED contacts." },
      { k: ['lrad','land redistribution','land reform','land access','land affairs'], a: "<strong>Land Redistribution for Agricultural Development (LRAD):</strong><br><br>LRAD helps previously disadvantaged individuals access agricultural land. The programme provides grants to assist with land acquisition for farming purposes.<br><br>📞 <strong>Contacts:</strong><br>• LRAD Programme: 013 656 0848<br>• LRAD Gert Sibande: 017 819 2076<br>• Dept. of Land Affairs: 013 754 4500<br><br>Also related: <strong>Land Care</strong> (sustainable land management) — Gert Sibande: 017 811 0775" },
      { k: ['seda','small enterprise','business development','cooperative','start business','register business'], a: "<strong>SEDA (Small Enterprise Development Agency)</strong> helps you start or strengthen a farming business, especially cooperatives:<br><br>📞 <strong>Mpumalanga offices:</strong><br>• Provincial Office: 013 755 6046/7<br>• Nelspruit (Ehlanzeni): 013 754 4380<br>• Bushbuckridge: 013 799 1961<br>• Secunda (Gert Sibande): 017 634 4339<br>• Witbank (Nkangala): 013 655 6970<br>• Malelane (Nkomazi): 013 790 1183<br><br>They can help with business registration, plans, and connecting you to funding. Visit <a href='support.html'>Support page</a> for more." },
      { k: ['food security','food programme','integrated food security','hunger','food shortage'], a: "<strong>Integrated Food Security Programme:</strong><br><br>This government programme supports household and community food security through food production initiatives, input support, and nutritional guidance.<br><br>📞 Contact: <strong>013 766 6161</strong><br><br>Related programmes: CASP (agricultural support) and MADC (agricultural loans at 013 755 6328)." },
      { k: ['hotline','toll-free','government hotline','information line','1020'], a: "📞 <strong>Government Information Hotline: 1020</strong> (toll-free from a landline)<br><br>This hotline provides general information about all government programmes and economic opportunities. If you're unsure which programme to contact, start here." },
    ],

    /* ---- GUIDES OVERVIEW ---- */
    [
      { k: ['guide','guides','advisory','farming guide','information','learn about farming','how to farm'], a: "Our <a href='guides.html'>Advisory Guides</a> page is the most comprehensive farming resource on this site. It covers:<br><br>🌾 <strong>Crop Farming</strong> (9 categories):<br>Maize, Wheat &amp; Barley, Sorghum &amp; Grains, Oilseeds &amp; Legumes, Vegetables, Fruit, Sugarcane, Nuts, and Soil Health<br><br>🐄 <strong>Livestock Farming</strong> (8 categories):<br>Beef Cattle (all SA breeds), Dairy, Goats, Sheep, Pigs, Poultry, Rabbits, and Aquaculture<br><br>🌿 <strong>Environmental</strong> (5 categories):<br>Soil Conservation, Water Management, Biodiversity, Climate Adaptation, Invasive Species<br><br>Each section has detailed, practical information sourced from DAFF, ARC, and breed societies." },
    ],

    /* ---- CROP FARMING GUIDANCE ---- */
    [
      { k: ['maize','mielie','corn','mealie'], a: "<strong>Maize farming guidance:</strong><br><br>🌽 Maize is SA's most important field crop. In Mpumalanga, the Highveld (Ermelo, Bethal, Standerton) is the core production area.<br><br>• <strong>Plant:</strong> Mid-October to mid-November when soil temp exceeds 10°C<br>• <strong>Soil:</strong> Well-drained loam, pH 5.5–7.0<br>• <strong>Spacing:</strong> 0.9–1.0m rows, 25,000–35,000 plants/ha dryland<br>• <strong>Fertilise:</strong> 2:3:4 at planting + LAN top-dress at 4-6 leaf stage<br>• <strong>Watch for:</strong> Fall armyworm (scout weekly!), stalk borer, grey leaf spot<br>• <strong>Harvest:</strong> At 12.5–14% moisture<br>• <strong>Yield target:</strong> 3–6 t/ha dryland; 8–14 t/ha irrigated<br><br>Visit <a href='guides.html'>Crop Guides → Maize</a> for the complete guide with varieties, soil prep, pests &amp; diseases." },
      { k: ['wheat','barley','winter wheat','spring wheat'], a: "<strong>Wheat &amp; Barley guidance:</strong><br><br>🌾 Wheat is mainly a winter/irrigated crop in Mpumalanga.<br>• <strong>Plant:</strong> May–July for winter wheat<br>• <strong>Soil:</strong> pH 5.5–7.0, well-drained<br>• <strong>Watch for:</strong> Russian wheat aphid, stripe rust, Fusarium head blight<br>• <strong>Harvest:</strong> At 12–13% moisture<br><br>Barley is mainly for malting (beer) — strict quality standards required.<br><br>Full details in <a href='guides.html'>Crop Guides → Wheat &amp; Barley</a>." },
      { k: ['soybean','soybeans','soya'], a: "<strong>Soybean guidance:</strong><br><br>🫘 Excellent rotation crop with maize — fixes nitrogen in soil!<br>• <strong>Plant:</strong> October–November at 300,000–400,000 plants/ha<br>• <strong>Critical:</strong> Inoculate seed with Bradyrhizobium before planting<br>• <strong>Soil:</strong> pH 5.5–6.5, well-drained<br>• <strong>Weed control:</strong> Critical in first 6 weeks<br>• <strong>Yield:</strong> 1.5–3.0 t/ha dryland<br><br>Tip: Always rotate soybeans with maize — it reduces N fertiliser needs by 30-50 kg/ha for the following maize crop.<br><br>More in <a href='guides.html'>Crop Guides → Oilseeds &amp; Legumes</a>." },
      { k: ['sunflower','sunflowers'], a: "<strong>Sunflower guidance:</strong><br><br>🌻 Drought-tolerant oilseed crop.<br>• <strong>Plant:</strong> November–January<br>• <strong>Key:</strong> Good pollination needed — bees improve seed set significantly<br>• <strong>Watch for:</strong> Sclerotinia head rot — avoid overhead irrigation and dense planting<br>• <strong>Yield:</strong> 1.5–2.5 t/ha dryland<br><br>More in <a href='guides.html'>Crop Guides → Oilseeds &amp; Legumes</a>." },
      { k: ['sorghum','millet','pearl millet'], a: "<strong>Sorghum &amp; Millet guidance:</strong><br><br>🌾 Grain sorghum is more drought-tolerant than maize (needs only 450–650mm rain).<br>• <strong>Plant:</strong> November–December when soil temp exceeds 15°C<br>• <strong>Major threat:</strong> Quelea birds — coordinate control with neighbours<br>• <strong>Yield:</strong> 2–4 t/ha dryland<br><br>Pearl millet is even more drought-tolerant — ideal for very dry areas and subsistence farming.<br><br>More in <a href='guides.html'>Crop Guides → Sorghum &amp; Grains</a>." },
      { k: ['groundnut','groundnuts','peanut','peanuts'], a: "<strong>Groundnut guidance:</strong><br><br>🥜 Virginia and Spanish types grown in SA.<br>• <strong>Plant:</strong> October–November in warm soils<br>• <strong>Critical:</strong> Apply gypsum (calcium sulphate) at flowering for pod filling<br>• <strong>Soil:</strong> Well-drained sandy-loam, pH 5.8–6.5<br>• <strong>Watch for:</strong> Aflatoxin risk — harvest promptly and dry quickly<br><br>More in <a href='guides.html'>Crop Guides → Oilseeds &amp; Legumes</a>." },
      { k: ['vegetable','vegetables','veggie','veggies','tomato','tomatoes','cabbage','spinach','potato','potatoes','onion','onions','pepper','peppers','butternut','pumpkin'], a: "<strong>Vegetable farming guidance:</strong><br><br>Mpumalanga's diverse climate supports year-round vegetable production:<br>• 🍅 <strong>Tomatoes:</strong> Warm-season, 20–30°C. Use drip irrigation. Watch for bacterial wilt &amp; blight<br>• 🥬 <strong>Cabbage:</strong> Cool-season, plant Feb–May. Main pest: diamondback moth<br>• 🥔 <strong>Potatoes:</strong> Plant Aug–Oct or Jan–Feb. Use certified seed. Late blight is the biggest threat<br>• 🧅 <strong>Onions:</strong> Plant March–May. Short-day varieties for Mpumalanga<br>• 🥒 <strong>Cucurbits:</strong> Warm-season. Butternut, pumpkin, watermelon — need good pollination<br><br><strong>Key tip:</strong> Start small, master one or two crops, then expand. Good water management is the #1 factor in vegetable profitability.<br><br>Full details in <a href='guides.html'>Crop Guides → Vegetables</a>." },
      { k: ['citrus','orange','lemon','grapefruit','mandarin','naartjie'], a: "<strong>Citrus farming guidance:</strong><br><br>🍊 Mpumalanga's Lowveld is a major citrus region (Nelspruit, Komatipoort, Malelane).<br>• <strong>Establish:</strong> Plant grafted nursery trees in spring, 6–8m × 3–4m spacing<br>• <strong>Water:</strong> Micro-sprinkler or drip irrigation<br>• <strong>Key threat:</strong> Citrus greening disease (HLB) transmitted by citrus psylla — IPM essential<br>• <strong>Export:</strong> SA citrus is exported worldwide — quality &amp; food safety standards are strict<br><br>Follow CRI (Citrus Research International) guidelines. More in <a href='guides.html'>Crop Guides → Fruit</a>." },
      { k: ['avocado','avo','avos'], a: "<strong>Avocado farming guidance:</strong><br><br>🥑 Mpumalanga is SA's largest avocado-producing province (Hazyview, White River).<br>• <strong>Varieties:</strong> Hass (70% of production), Fuerte, Ryan<br>• <strong>Soil:</strong> Well-drained, pH 5.5–6.5. EXTREMELY sensitive to waterlogging<br>• <strong>Biggest threat:</strong> Phytophthora root rot — mulch heavily, apply phosphonate trunk injections<br>• <strong>Tip:</strong> Avocados take 3-5 years to first harvest. Long-term investment but very profitable.<br><br>Follow SUBTROP guidelines. More in <a href='guides.html'>Crop Guides → Fruit</a>." },
      { k: ['mango','mangoes','banana','bananas','litchi','litchis','tropical fruit'], a: "<strong>Tropical fruit guidance:</strong><br><br>🥭 Grown in Mpumalanga's frost-free Lowveld:<br>• <strong>Mangoes:</strong> Harvest Nov–Feb. Tommy Atkins, Kent, Keitt. Watch for anthracnose &amp; fruit fly<br>• <strong>Bananas:</strong> Cavendish in Komatipoort/Malelane. Watch for Panama disease TR4 — a global threat<br>• <strong>Litchis:</strong> Hazyview area, harvest Nov–Jan. Sensitive to dry winters during flowering<br><br>More in <a href='guides.html'>Crop Guides → Fruit</a>." },
      { k: ['sugarcane','sugar','cane'], a: "<strong>Sugarcane guidance:</strong><br><br>🎋 Major crop in Mpumalanga's eastern Lowveld (Komatipoort, Malelane, Barberton).<br>• <strong>Plant:</strong> Setts in furrows, 1.2–1.5m spacing. Best: Feb–Apr or Aug–Oct<br>• <strong>Varieties:</strong> Use SASRI-recommended N-series (N12, N31, N41, etc.)<br>• <strong>Water:</strong> 1,200–1,800mm per growth cycle<br>• <strong>Watch for:</strong> Eldana borer — the biggest pest. Keep fields clean<br>• <strong>Harvest:</strong> Deliver to mill within 48 hours of cutting<br>• <strong>Target:</strong> 80–120 t/ha cane, 10–13% sucrose<br><br>More in <a href='guides.html'>Crop Guides → Sugarcane</a>." },
      { k: ['macadamia','macadamias','pecan','pecans','nut','nuts'], a: "<strong>Nut farming guidance:</strong><br><br>🌰 <strong>Macadamia:</strong> SA is the world's largest producer. Mpumalanga (White River, Hazyview, Barberton) is a key region.<br>• Long-term investment: first harvest at 5–7 years, full production at 12–15 years<br>• Major pest: stink bug — IPM essential<br>• Yields: 3–5 t/ha nut-in-shell (mature orchards)<br><br>🌰 <strong>Pecan:</strong> Need winter chill, well-drained alluvial soils. Plant 2+ compatible varieties for wind pollination.<br><br>More in <a href='guides.html'>Crop Guides → Nuts</a>." },
      { k: ['soil','soil health','soil test','soil testing','ph','liming','lime','organic matter','fertiliser','fertilizer','npk','nutrient'], a: "<strong>Soil health guidance:</strong><br><br>🧪 Soil is the foundation of all crop production.<br><br>• <strong>Test every 2-3 years:</strong> pH, P, K, Ca, Mg, organic carbon. Get a sample kit from your extension office<br>• <strong>Most Mpumalanga soils:</strong> Acidic (pH 4.5–5.5) — apply agricultural lime to raise to pH 5.5–6.5<br>• <strong>Lime tip:</strong> Apply 3–6 months before planting for best results. Dolomitic lime also adds magnesium<br>• <strong>Build organic matter:</strong> Compost, mulch, crop residues, cover crops. Target 2%+ organic carbon<br>• <strong>Key nutrients:</strong> N for growth, P for roots, K for disease resistance. Zinc is the most commonly deficient micronutrient<br><br><strong>Important:</strong> Never fertilise without a soil test — you might be wasting money on nutrients you don't need.<br><br>Full guide in <a href='guides.html'>Crop Guides → Soil Health</a>." },
      { k: ['conservation tillage','no till','no-till','minimum till','conservation agriculture'], a: "<strong>Conservation agriculture guidance:</strong><br><br>No-till farming reduces erosion by 80–95% and saves R1,000–R2,500/ha in fuel/labour.<br><br><strong>Three principles:</strong><br>1. Minimum soil disturbance (no ploughing)<br>2. Permanent soil cover (crop residues)<br>3. Crop rotation<br><br>ARC and Grain SA research shows after 5-10 years of no-till: soil organic carbon increases, water-holding capacity improves 15–25%, and yields equal or exceed conventional methods.<br><br>Transition tip: It takes 3-5 years. Start with one field while continuing conventional on the rest. Contact Grain SA for mentorship.<br><br>More in <a href='guides.html'>Crop Guides → Soil Health → Conservation Tillage</a>." },
      { k: ['fall armyworm','armyworm','faw','pest','pests','stalk borer','cutworm'], a: "<strong>Crop pest management guidance:</strong><br><br>🐛 <strong>Fall Armyworm (FAW):</strong> The #1 maize pest in Mpumalanga.<br>• Scout fields WEEKLY from emergence<br>• Look for window-pane feeding on leaves and frass in the whorl<br>• Spray early when larvae are small (less than 1.5cm)<br>• Bt maize helps but doesn't eliminate FAW<br>• Registered products: chlorantraniliprole, emamectin benzoate, spinosad<br><br>🐛 <strong>Stalk Borer:</strong> Apply granules into the whorl at 6-8 leaf stage<br>🐛 <strong>Cutworm:</strong> Active at night. Check seedlings at dawn. Bait with carbaryl<br><br>Key principle: <strong>Scout first, spray only if needed, use the right product at the right time.</strong><br><br>Full pest guide in <a href='guides.html'>Crop Guides → Maize → Pest &amp; Disease Management</a>." },
      { k: ['weed','weeds','weed control','herbicide','roundup','glyphosate'], a: "<strong>Weed management guidance:</strong><br><br>Weeds compete for water, nutrients, and light — they can reduce yields by 30-80% if uncontrolled.<br><br><strong>Strategies:</strong><br>• <strong>Pre-plant burndown:</strong> Glyphosate or paraquat before planting<br>• <strong>Pre-emergence:</strong> Atrazine + metolachlor for maize; metribuzin for soybeans<br>• <strong>Post-emergence:</strong> Target weeds while small (2-4 leaf stage)<br>• <strong>Rotate herbicide groups:</strong> Prevent resistance by alternating modes of action each season<br><br><strong>Important:</strong> Read the label! Always follow mixing rates, safety precautions, and withholding periods.<br><br>Tip: In conservation agriculture, herbicides replace tillage — manage carefully to avoid resistance." },
    ],

    /* ---- LIVESTOCK FARMING GUIDANCE ---- */
    [
      { k: ['beef cattle','cattle breeds','beef breeds','nguni','bonsmara','afrikaner','brahman','simmentaler','angus','hereford'], a: "<strong>Beef cattle breed guidance:</strong><br><br>🐄 Choosing the right breed is crucial:<br><br>• <strong>Nguni:</strong> Indigenous, tick-tolerant, low-input. Best for extensive/communal farming<br>• <strong>Bonsmara:</strong> SA-developed, most versatile. Good growth + adaptation. SA's most popular breed<br>• <strong>Afrikaner:</strong> Hardy, heat tolerant, strong mothering. Great dam line<br>• <strong>Brahman:</strong> Heat/tick resistant. Good crossbreeding sire<br>• <strong>Simmentaler:</strong> European, high growth, dual-purpose. Popular crossbreeding sire<br>• <strong>Angus:</strong> Excellent marbled beef, early maturity. Feedlot favourite<br><br><strong>My recommendation for beginners:</strong> Start with Nguni or Bonsmara. They handle SA conditions best and forgive management mistakes.<br><br>Full breed profiles (12+ breeds) in <a href='guides.html'>Livestock Guides → Beef Cattle</a>." },
      { k: ['dairy','dairy cattle','milk','milking','holstein','jersey'], a: "<strong>Dairy farming guidance:</strong><br><br>🥛 Intensive management required:<br>• <strong>Holstein:</strong> Highest yield but heat-sensitive<br>• <strong>Jersey:</strong> Best for Mpumalanga — heat tolerant, high butterfat<br>• <strong>Target:</strong> 15–25 L/day per cow<br><br><strong>Key success factors:</strong><br>• Consistent milking routine (twice daily, same times)<br>• Mastitis prevention (pre- &amp; post-dip, monitor SCC)<br>• Good nutrition (TMR or pasture + concentrate)<br>• Cool milk below 4°C within 2 hours<br><br>Tip: Dairy farming demands daily commitment — 365 days/year with no days off. Make sure you have reliable labour before starting.<br><br>Full guide in <a href='guides.html'>Livestock Guides → Dairy Cattle</a>." },
      { k: ['goat','goats','boer goat','boergoat','savanna goat','kalahari red','angora','mohair','meat goat','dairy goat'], a: "<strong>Goat farming guidance:</strong><br><br>🐐 SA developed the world-famous Boer goat and produces 50% of global mohair.<br><br><strong>Meat goats:</strong><br>• <strong>Boer Goat:</strong> Fastest growth, 30–35 kg kids at 100 days. Best meat goat globally<br>• <strong>Savanna:</strong> Hardier than Boer, fully pigmented skin (no sunburn)<br>• <strong>Kalahari Red:</strong> Camouflage colour, very hardy for arid areas<br>• <strong>Indigenous Veld Goat:</strong> Lowest input, hardiest. Cultural value<br><br><strong>Critical management:</strong><br>• #1 killer: Haemonchus worm. Use FAMACHA scoring — check eyelids every 2-4 weeks<br>• Vaccinate: Multivax-P every 6 months<br>• Shelter from rain (goats hate getting wet)<br>• Protect from predators — kraal at night, use guard dogs<br><br>Full breed details in <a href='guides.html'>Livestock Guides → Goats</a>." },
      { k: ['sheep','lamb','dorper','merino','wool','meatmaster','damara','dohne'], a: "<strong>Sheep farming guidance:</strong><br><br>🐑 SA has ~22 million sheep. Key breeds:<br><br><strong>Meat breeds (no shearing needed):</strong><br>• <strong>Dorper:</strong> SA's #1 meat sheep. Hardy, self-shedding, breeds year-round. BEST for beginners<br>• <strong>Meatmaster:</strong> New SA composite, maximum efficiency<br>• <strong>Damara:</strong> Indigenous, extremely hardy survivor sheep<br><br><strong>Wool breeds:</strong><br>• <strong>Merino:</strong> Fine wool, SA's 4th largest global producer<br>• <strong>Dohne Merino:</strong> SA-developed dual-purpose (wool + meat)<br><br><strong>Critical management:</strong><br>• Predator protection: jackal-proof fencing, guard dogs, kraal at night<br>• Vaccinate: Pulpy kidney (kills fast!), pasteurella, bluetongue<br>• Parasite control: Wireworm, blowfly strike<br><br>Recommendation: <strong>Dorpers for beginners</strong> — no shearing, hardy, easy lambing.<br><br>Full guide in <a href='guides.html'>Livestock Guides → Sheep</a>." },
      { k: ['pig','pigs','pork','piggery','sow','boar','kolbroek','large white','landrace'], a: "<strong>Pig farming guidance:</strong><br><br>🐖 Pigs offer fast returns — 114-day gestation, 10-14 piglets per litter, 2+ litters/year.<br><br><strong>Breeds:</strong><br>• <strong>Large White:</strong> Most common, good mothering<br>• <strong>Landrace:</strong> Long body, large litters<br>• <strong>Duroc:</strong> Sire line, fast growth, good meat quality<br>• <strong>Kolbroek:</strong> Indigenous SA breed, hardy for communal farming<br><br><strong>Critical management:</strong><br>• Housing: Shelter from sun/rain, concrete/slatted floors, good drainage<br>• Feeding: 65-70% of production cost. FCR of 2.5–3.5:1<br>• 🚨 <strong>African Swine Fever:</strong> NO vaccine exists. Strict biosecurity is the ONLY prevention — no swill feeding, controlled access, foot baths<br><br>Tip: Start with 2-3 sows and one boar. Master the basics before expanding.<br><br>Full guide in <a href='guides.html'>Livestock Guides → Pigs</a>." },
      { k: ['poultry','chicken','chickens','broiler','broilers','layer','layers','eggs','egg','koekoek','indigenous chicken'], a: "<strong>Poultry farming guidance:</strong><br><br>🐔 Most accessible entry into livestock farming.<br><br><strong>Broilers (meat):</strong><br>• Day-old to slaughter in 35–42 days<br>• Target: 2.0–2.2 kg at 35 days, FCR 1.5–1.7<br>• Key: ventilation, temperature control, clean water<br><br><strong>Layers (eggs):</strong><br>• Start laying at 18–20 weeks, peak at 25–35 weeks<br>• Hy-Line, Lohmann Brown are top commercial strains<br><br><strong>Indigenous breeds:</strong><br>• <strong>Potchefstroom Koekoek:</strong> ARC-developed, dual-purpose, hardy. Great for communal farmers<br>• <strong>Boschveld:</strong> ARC composite, hardy free-range bird<br><br>🚨 <strong>Newcastle disease WILL wipe out your flock</strong> if not vaccinated. Vaccinate at day 1, 14, and 35, then every 3 months.<br><br>Full guide in <a href='guides.html'>Livestock Guides → Poultry</a>." },
      { k: ['rabbit','rabbits','cuniculture'], a: "<strong>Rabbit farming guidance:</strong><br><br>🐇 Emerging sector with growing demand for lean, healthy meat.<br>• <strong>Breeds:</strong> New Zealand White (most common), Californian<br>• <strong>Housing:</strong> Wire mesh cages, raised off ground, protect from sun/rain<br>• <strong>Reproduction:</strong> Does breed from 5-6 months, litter of 6-12 kits, 6-8 litters/year<br>• <strong>Slaughter:</strong> 10-12 weeks at 2-2.5 kg<br>• <strong>Market:</strong> Restaurants, butcheries, direct sales<br>• <strong>Bonus:</strong> Rabbit manure is excellent fertiliser (apply directly without composting)<br><br>Full guide in <a href='guides.html'>Livestock Guides → Rabbits</a>." },
      { k: ['aquaculture','fish','fish farming','tilapia','catfish','trout'], a: "<strong>Aquaculture guidance:</strong><br><br>🐟 SA has significant potential in freshwater fish farming.<br>• <strong>Tilapia:</strong> Warm-water, fast-growing, excellent for ponds. NEMBA permits needed<br>• <strong>African Catfish:</strong> Extremely hardy, tolerates poor water quality, fast growth<br>• <strong>Trout:</strong> Cold-water species for cooler Mpumalanga streams/dams<br><br>Tip: Start with a small pond (0.1-0.5 ha) and learn water quality management before scaling.<br><br>Full guide in <a href='guides.html'>Livestock Guides → Aquaculture</a>." },
    ],

    /* ---- LIVESTOCK HEALTH & MANAGEMENT ---- */
    [
      { k: ['vaccination','vaccinate','vaccine','injection','dip','dipping','tick'], a: "<strong>Livestock vaccination guidance:</strong><br><br>💉 <strong>Cattle vaccination schedule:</strong><br>• Brucellosis: heifers 4–8 months (STATE VET only)<br>• Anthrax: annually<br>• Blackquarter: annually<br>• Botulism: annually<br>• Lumpy skin disease: annually before summer<br><br>🐐 <strong>Goats/Sheep:</strong> Multivax-P every 6 months. Pasteurella before cold/wet season.<br><br>🐔 <strong>Poultry:</strong> Newcastle disease at day 1, 14, 35, then every 3 months.<br><br>🐛 <strong>Tick control:</strong> Regular dipping or pour-on. Heartwater, redwater, and gallsickness are all tick-borne in Mpumalanga.<br><br><strong>Important:</strong> Keep a vaccination register — date, product, batch number, animals treated. This is a legal requirement for many vaccines." },
      { k: ['parasite','parasites','worm','worms','deworm','deworming','haemonchus','wireworm','famacha'], a: "<strong>Parasite management guidance:</strong><br><br>🐛 Internal parasites are the #1 killer of small stock (goats and sheep).<br><br><strong>FAMACHA system (goats &amp; sheep):</strong><br>1. Check the colour of the lower eyelid<br>2. Score 1 (red=healthy) to 5 (white=critical anaemia)<br>3. Only deworm animals scoring 3, 4, or 5<br>4. Check every 2-4 weeks during wet season<br><br><strong>Why not blanket-deworm?</strong> It causes drug resistance. On many SA farms, worms are already resistant to all major drug classes.<br><br><strong>Better approach:</strong><br>• Use FAMACHA for targeted treatment<br>• Rotate drug classes annually (not mid-season)<br>• Weigh animals — goats need HIGHER doses than sheep<br>• Do faecal egg counts (FECRT) to check which drugs still work<br>• Rotational grazing breaks the parasite cycle" },
      { k: ['breeding','breeding season','mating','bull','ram','buck','reproduction','calving','lambing','kidding','artificial insemination','ai'], a: "<strong>Livestock reproduction guidance:</strong><br><br><strong>Cattle:</strong><br>• Limit breeding to 3 months (e.g., Dec–Feb) for concentrated calving<br>• Bull:cow ratio 1:25 in extensive systems<br>• Pregnancy test at 6-8 weeks post-mating<br>• AI is cost-effective for accessing superior genetics<br><br><strong>Sheep:</strong><br>• Flush ewes 2 weeks before mating (increase nutrition)<br>• Gestation: 150 days. Ram:ewe ratio 1:30-40<br><br><strong>Goats:</strong><br>• Gestation: 148-152 days. Twinning rate 60-80% (Boer goat)<br>• Dip navels in 7% iodine immediately at birth<br><br><strong>Pigs:</strong><br>• Gestation: 114 days (3 months, 3 weeks, 3 days)<br>• 10-14 piglets per litter, 2+ litters/year<br><br>Tip: Good reproduction = good profitability. A cow that doesn't calve every year costs you money. Cull repeat non-breeders." },
      { k: ['feed','feeding','nutrition','supplement','lick','phosphorus','protein','grazing','stocking rate','overgrazing'], a: "<strong>Livestock nutrition guidance:</strong><br><br><strong>Cattle grazing:</strong><br>• Stocking rate: 4–8 ha/LSU in bushveld; 2–4 ha/LSU improved pastures<br>• <strong>Overgrazing is the #1 cause of veld degradation</strong> — be honest about your carrying capacity<br>• Rotational grazing: rest camps for 30–60 days between grazing<br>• Water: 40–70 litres/animal/day<br><br><strong>Winter supplementation:</strong><br>• Protein lick (urea-based) essential in dry season<br>• Phosphorus supplementation critical in most Mpumalanga areas<br>• Production lick for pregnant/lactating animals<br><br><strong>Key principle:</strong> Animals must be in good condition BEFORE winter starts. You can't recover condition cheaply once they've lost it — prevention is far cheaper than cure.<br><br>Full details in <a href='guides.html'>Livestock Guides</a>." },
    ],

    /* ---- ENVIRONMENTAL GUIDANCE ---- */
    [
      { k: ['erosion','contour','donga','gully','soil conservation','soil erosion'], a: "<strong>Soil erosion prevention:</strong><br><br>🏔 Mpumalanga's intense summer rainfall makes erosion a major threat.<br><br><strong>Prevention methods:</strong><br>• <strong>Contour banks:</strong> Earthen banks along slopes to slow runoff<br>• <strong>Grass waterways:</strong> Vetiver or Kikuyu in drainage lines<br>• <strong>Cover crops:</strong> Never leave soil bare after harvest<br>• <strong>Stone packing:</strong> Gabions in existing dongas<br>• <strong>Conservation tillage:</strong> No-till retains crop residues as protection<br><br>Contact your extension officer for a free contour survey of your land. The <a href='Application/environmental.html'>Environmental Grant</a> can fund erosion control projects.<br><br>More in <a href='guides.html'>Environmental Guides → Soil Conservation</a>." },
      { k: ['water management','irrigation efficiency','rainwater','harvesting','dam','borehole','wetland'], a: "<strong>Water management guidance:</strong><br><br>💧 Water is Mpumalanga's most critical farming resource.<br><br>• <strong>Drip irrigation:</strong> 90-95% efficient. Best investment for vegetables and orchards<br>• <strong>Rainwater harvesting:</strong> A 100m² roof in Nelspruit can collect 75,000 litres/year<br>• <strong>Irrigation scheduling:</strong> Use soil moisture probes — irrigate only when needed<br>• <strong>Wetlands:</strong> Protected under law. Never drain, cultivate, or dam wetlands<br><br><strong>Legal note:</strong> Farm dams need authorisation under the National Water Act. Apply to your local Water User Association.<br><br>More in <a href='guides.html'>Environmental Guides → Water Management</a>." },
      { k: ['invasive','alien plants','lantana','wattle','bugweed','triffid','working for water','nemba'], a: "<strong>Invasive species guidance:</strong><br><br>🌿 You are LEGALLY REQUIRED to control invasive plants on your property (NEMBA).<br><br><strong>Common invaders in Mpumalanga:</strong><br>• <strong>Lantana:</strong> Toxic to livestock. Cut and treat stumps with herbicide<br>• <strong>Bugweed:</strong> Spread by birds. Remove seedlings by hand<br>• <strong>Wattle:</strong> Reduces streamflow by up to 80%. Ring-bark or fell and treat<br>• <strong>Triffid weed:</strong> Spreading rapidly in Lowveld<br><br><strong>Free help:</strong> The Working for Water programme provides FREE labour for clearing on qualifying properties. Contact DFFE: 012 310 3911<br><br>More in <a href='guides.html'>Environmental Guides → Invasive Species</a>." },
      { k: ['drought','dry','water shortage','climate change','heat wave','el nino','adaptation'], a: "<strong>Drought preparedness guidance (DARDLEA):</strong><br><br>☀️ Climate change is increasing drought frequency in Mpumalanga.<br><br><strong>Prepare NOW:</strong><br>1. <strong>Diversify:</strong> Mixed crop/livestock systems spread risk<br>2. <strong>Drought-tolerant cultivars:</strong> Sorghum instead of maize in marginal areas<br>3. <strong>Drill boreholes:</strong> Equip and repair water infrastructure<br>4. <strong>Stockpile feed:</strong> 3-month hay/silage reserve for livestock<br>5. <strong>Reduce stocking rate:</strong> Sell EARLY rather than let animals starve<br>6. <strong>Water conservation:</strong> Rainwater harvesting, grey water reuse, repair all irrigation<br>7. <strong>Scout for pests:</strong> Drought-stress increases pest pressure<br><br><strong>During drought:</strong> Contact Disaster Management at <strong>013 766 4300</strong> for relief. District coordinators: Ehlanzeni (Mgiba Hillarian), Gert Sibande (Luhlanga Forgiveness), Nkangala (Mbiza Bongeikile).<br><br>More in <a href='guides.html'>Environmental Guides → Disaster Risk Management</a>." },
      { k: ['flood','flooding','rain damage','waterlogging','heavy rain','flash flood'], a: "<strong>Flood mitigation measures (DARDLEA):</strong><br><br>🌊 During flooding or heavy rain events:<br><br><strong>Protect infrastructure:</strong><br>• Lift water pumps above the flood line<br>• Remove irrigation equipment from flood plains<br>• Close all irrigation systems during flood events<br>• Open spillways to reduce pressure on earth dam walls<br>• Unblock all storm water drainage systems<br><br><strong>Field management:</strong><br>• Do NOT apply production inputs during flooding<br>• Never plant in the flood line or close to river banks<br>• Create waterways on access roads and contours to prevent silting<br><br><strong>Livestock:</strong> Move animals to safe, high-lying areas. Vaccinate against <strong>Rift Valley fever and botulism</strong> (flooding diseases).<br><br><strong>Crops:</strong> Cover horticultural crops with hail net where possible.<br><br>Report damage to Disaster Management: <strong>013 766 4300</strong>. More in <a href='guides.html'>Environmental Guides → Disaster Risk Management</a>." },
      { k: ['veld fire','fire belt','fire risk','fire break','firebreak','wildfire','bush fire','grass fire','working on fire'], a: "<strong>Veld fire risk management:</strong><br><br>🔥 Veld recovers in summer but dries rapidly in winter, dramatically increasing fire risk across Mpumalanga.<br><br><strong>Key actions:</strong><br>• <strong>Create and maintain fire belts</strong> around infrastructure, grazing camps, and crop fields — this is your most important defence<br>• Adhere to all veld fire warnings from SAWS and local fire protection associations<br>• Prepare for the winter fire season from May onwards<br>• Clear dry vegetation around buildings and fuel stores<br><br><strong>Working on Fire:</strong> The government programme assists with fire management — Mpumalanga: <strong>013 759 7300</strong><br><br>During an active fire emergency, contact <strong>Disaster Management: 013 766 4300</strong> or your local municipality fire department." },
      { k: ['drought category','d0','d1','d2','d3','d4','drought level','drought intensity','dam level','drought declared'], a: "<strong>Drought intensity categories (official DARDLEA scale):</strong><br><br>• <strong>D0 (Normal):</strong> Onset dryness. Slow growth, elevated fire risk. Dams 80–100%. 1-in-3-year event.<br>• <strong>D1 (Moderate):</strong> Some crop/livestock damage. High fire risk. Water restrictions may start. Dams 60–80%. 1-in-5-year drought.<br>• <strong>D2 (Severe):</strong> Losses common. Mandatory water restrictions. Dams 40–60%. 1-in-10-year drought.<br>• <strong>D3 (Extreme):</strong> Widespread losses. Disaster drought declared, active government response. Dams 20–40%. 1-in-20-year drought.<br>• <strong>D4 (Emergency):</strong> Exceptional losses. Water emergency. Dams 0–20%. 1-in-50-year drought.<br><br>Contact Disaster Management at <strong>013 766 4300</strong> during D2+ conditions for relief support." },
      { k: ['early warning','warning system','saws','weather warning','agro-meteorological','advisory','monthly advisory','bulk sms'], a: "<strong>DARDLEA Early Warning System:</strong><br><br>📡 The National Agro-meteorological Committee issues <strong>monthly early warning advisories</strong> with disaster risk reduction measures and precautionary guidance.<br><br><strong>How you receive warnings:</strong><br>• Bulk SMS to registered farmers<br>• Email and fax distribution<br>• Available at Agricultural District Centres<br>• Published on the DALRRD website<br><br><strong>Daily extreme weather warnings</strong> from SAWS are also relayed by DARDLEA with farming-specific risk reduction strategies.<br><br><strong>Register:</strong> Contact your district disaster coordinator to be added to the distribution list — or call <strong>013 766 4300</strong>." },
      { k: ['disaster coordinator','disaster management','disaster relief','disaster','dardlea'], a: "<strong>Agricultural Disaster Coordinators (DARDLEA):</strong><br><br>These officials coordinate drought relief, flood response, veld fire support, and early warning systems:<br><br>📞 <strong>District coordinators:</strong><br>• Ehlanzeni: Mgiba Hillarian<br>• Gert Sibande: Luhlanga Forgiveness<br>• Nkangala: Mbiza Bongeikile<br>• Bohlabela: Khumbuza Vutomi<br>• Head Office: Nkambule Kenneth &amp; Dlamini Sazelo<br><br>General disaster line: <strong>013 766 4300</strong><br><br>They can also register you for monthly early warning advisories via SMS." },
      { k: ['biodiversity','conservation','wildlife','pollinator','bees','bee','vulture','grassland'], a: "<strong>Biodiversity &amp; conservation guidance:</strong><br><br>🌍 Mpumalanga is one of SA's most biodiverse provinces.<br><br>• <strong>Grasslands:</strong> Less than 2% formally protected — avoid converting natural grassland<br>• <strong>Riparian zones:</strong> Keep 32m natural vegetation buffer along rivers (legal requirement)<br>• <strong>Pollinators:</strong> Protect bees — they pollinate your fruit, vegetables, and oilseeds. Don't spray during flowering<br>• <strong>Predators:</strong> Use non-lethal methods (guard dogs, kraaling). Poison kills vultures and other scavengers<br><br>The <a href='Application/environmental.html'>Environmental Grant</a> can fund conservation projects on your farm." },
    ],

    /* ---- LEGAL & POPIA ---- */
    [
      { k: ['popia','privacy','data','personal information','data protection'], a: "We comply with the <strong>Protection of Personal Information Act (POPIA)</strong>. Your data is:<br>• Used only for grant administration<br>• Stored securely<br>• Never sold to third parties<br>• Available for you to access, correct, or delete<br><br>Read the full <a href='popia.html'>POPIA Compliance statement</a>." },
      { k: ['terms','conditions','legal','terms of service'], a: "Our <a href='terms.html'>Terms of Service</a> cover platform use, application rules, data handling, and user responsibilities. By using this site, you agree to these terms." },
    ],

    /* ---- PRACTICAL SEASONAL ADVICE ---- */
    [
      { k: ['what should i do now','seasonal advice','this month','this season','current season','farming calendar'], a: "<strong>Check the current season and plan accordingly:</strong><br><br>🌱 <strong>Spring (Sep-Nov):</strong> Soil preparation, planting summer crops, vaccinate livestock before summer, clear invasive plants<br>☀️ <strong>Summer (Dec-Feb):</strong> Scout for pests (FAW!), top-dress crops, manage grazing, wean calves, provide shade/water for livestock<br>🍂 <strong>Autumn (Mar-May):</strong> Harvest summer crops, plant winter pastures/wheat, prepare feed reserves, condition livestock for winter<br>❄️ <strong>Winter (Jun-Aug):</strong> Supplement livestock (protein licks), plan next season, maintain equipment, apply lime to fields<br><br>Check <a href='weather.html'>Weather Dashboard</a> and <a href='alerts.html'>Alerts</a> for current conditions." },
      { k: ['beginner','new farmer','starting','start farming','first time','getting started','how to start'], a: "<strong>Getting started in farming — practical advice:</strong><br><br>1️⃣ <strong>Start SMALL.</strong> Don't try to farm 100 hectares or 200 cattle on day one<br>2️⃣ <strong>Get training:</strong> Attend Grain SA, RPO, or extension officer workshops (most are free). SEDA (013 755 6046) can help you write a business plan<br>3️⃣ <strong>Choose one enterprise:</strong> Master ONE crop or livestock type before diversifying<br>4️⃣ <strong>Get financing:</strong> Apply for a <a href='crop.html'>grant</a> (no repayment!) or contact MADC (013 755 6328) for seasonal loans to cover seeds and fertiliser<br>5️⃣ <strong>Find a mentor:</strong> Learn from an experienced farmer or visit a <strong>Thusong Centre</strong> for free advice<br>6️⃣ <strong>Use this website:</strong><br>   • Read the <a href='guides.html'>Guides</a> for your chosen enterprise<br>   • Check <a href='weather.html'>Weather</a> before making decisions<br>   • Visit the <a href='support.html'>Support page</a> for LED officers, CASP contacts &amp; service providers<br><br>Don't be afraid to ask for help. Call your extension officer at 013 766 4027 — or walk into any Thusong Centre." },
      { k: ['profitable','profit','money from farming','make money','income','market','sell','selling'], a: "<strong>Making farming profitable:</strong><br><br>💰 <strong>Key principles:</strong><br>1. <strong>Know your costs:</strong> Track every cent spent. Many farmers don't know their true cost of production<br>2. <strong>Reduce input costs:</strong> Soil testing prevents wasting fertiliser. Conservation tillage saves fuel<br>3. <strong>Increase yield:</strong> Use correct varieties, plant at the right time, manage pests early<br>4. <strong>Market wisely:</strong> Don't sell at harvest when prices are lowest. Consider storage or forward contracts<br>5. <strong>Diversify income:</strong> Combine crops + livestock. Sell value-added products<br>6. <strong>Access markets:</strong> Fresh produce markets, SAFEX, direct sales, contract farming<br><br>Visit the <a href='support.html'>Support page</a> for marketing contacts and the <a href='guides.html'>Guides</a> for production optimisation." },
      { k: ['record keeping','records','bookkeeping','farm records'], a: "<strong>Farm record keeping guidance:</strong><br><br>📋 Good records are essential for profitable farming and grant applications.<br><br><strong>Keep records of:</strong><br>• All income and expenses (every receipt)<br>• Planting dates, varieties, fertiliser applied<br>• Livestock births, deaths, sales, purchases<br>• Vaccinations and treatments (date, product, batch number)<br>• Rainfall measurements (buy a simple rain gauge)<br><br>Tip: Start simple — a school exercise book works. The important thing is to write it down EVERY DAY. You can graduate to spreadsheets or apps later.<br><br>SA Stud Book offers livestock recording services for breed registration." },
    ],

    /* ---- COMMON FARMER QUESTIONS ---- */
    [
      { k: ['what breed','which breed','best breed','recommend breed','which cattle','which goat','which sheep'], a: "<strong>Choosing the right breed depends on your situation:</strong><br><br>🐄 <strong>Cattle:</strong><br>• Communal/extensive with no inputs? → <strong>Nguni</strong><br>• Commercial with good management? → <strong>Bonsmara</strong><br>• Crossbreeding for growth? → <strong>Simmentaler bull × Nguni cows</strong><br><br>🐐 <strong>Goats:</strong><br>• Meat production? → <strong>Boer Goat</strong><br>• Low-input communal? → <strong>Indigenous Veld Goat</strong><br>• Very hot/sunny area? → <strong>Savanna</strong><br><br>🐑 <strong>Sheep (beginners):</strong> → <strong>Dorper</strong> (no shearing, hardy, easy)<br>🐔 <strong>Poultry (communal):</strong> → <strong>Potchefstroom Koekoek</strong> (dual-purpose, hardy)<br>🐖 <strong>Pigs (small-scale):</strong> → <strong>Kolbroek</strong> (indigenous, hardy) or <strong>Large White × Landrace sows</strong><br><br>Full breed profiles in <a href='guides.html'>Livestock Guides</a>." },
      { k: ['how many cattle','stocking rate','carrying capacity','how many animals','overstock','overgrazing'], a: "<strong>Stocking rate guidance:</strong><br><br>⚠️ Overstocking is the most common mistake and the biggest cause of veld degradation.<br><br><strong>Guidelines for Mpumalanga:</strong><br>• Sour Bushveld: 5–8 ha per Large Stock Unit (LSU)<br>• Mixed Bushveld: 4–6 ha/LSU<br>• Improved pastures: 2–4 ha/LSU<br>• Kikuyu pasture (irrigated): 1–2 ha/LSU<br><br>1 LSU = 1 mature cow (450 kg) = 6 sheep = 6 goats<br><br><strong>Rule of thumb:</strong> If your veld still has bare patches at the end of the rainy season, you're overstocked. Reduce numbers or increase rest periods.<br><br>Contact your extension officer for a proper veld assessment." },
      { k: ['water','how much water','water requirements','animal water','livestock water'], a: "<strong>Water requirements for livestock:</strong><br><br>💧 Per animal per day (summer, adjust down for winter):<br>• Beef cattle: 40–70 litres<br>• Dairy cows (lactating): 80–150 litres<br>• Sheep/goats: 5–10 litres<br>• Pigs: 10–25 litres<br>• Chickens: 200–300 ml each<br><br><strong>Rules:</strong><br>• Water must be clean and fresh — dirty water causes disease<br>• Animals should not walk more than 3 km to water<br>• In summer heat, ensure shade near water points<br>• Check water troughs daily for cleanliness and flow" },
      { k: ['predator','jackal','caracal','predation','predator control','livestock theft','stock theft'], a: "<strong>Predator &amp; theft protection:</strong><br><br>🐺 <strong>Predators (jackal, caracal, stray dogs):</strong><br>• Kraal animals at night — the most effective measure<br>• Livestock guardian dogs (Anatolian Karabash recommended)<br>• Jackal-proof fencing: 1.2m + electrified outrigger<br>• Avoid poison — it kills vultures and non-target species<br><br>🔒 <strong>Stock theft:</strong><br>• Brand/mark all livestock (legal requirement for cattle)<br>• Report theft IMMEDIATELY: SAPS Stock Theft Unit 086 001 0111<br>• Keep accurate records with photos of each animal<br>• Community policing forums help deter theft<br><br>Visit <a href='support.html'>Support → Fencing &amp; Infrastructure</a> for contractor contacts." },
      { k: ['market prices','price watch','nda price','commodity prices','maize price','beef price','spot price','futures'], a: "<strong>Market and price information:</strong><br><br>Use <a href='guides.html'>Guides</a> and NDA Price Watch resources to monitor trends. For practical selling decisions:<br>• Check current local auction/market prices weekly<br>• Compare farm-gate vs transport + market commission costs<br>• Use contracts where possible for price certainty<br>• Time sales around seasonal demand (avoid panic selling)<br><br>For grain producers, track SAFEX-linked trends and storage costs before deciding to hold stock." },
      { k: ['irrigation schedule','when to irrigate','drip irrigation','sprinkler','center pivot','water stress'], a: "<strong>Irrigation management:</strong><br><br>• Irrigate by crop stage and soil moisture, not by calendar only<br>• Prefer early morning irrigation to reduce evaporative loss and disease pressure<br>• Drip gives highest efficiency for vegetables and orchards<br>• Avoid over-irrigation: it leaches nutrients and increases disease<br>• Keep records: date, hours, mm applied, rainfall received<br><br>If possible, use tensiometers/soil probes for better scheduling." },
      { k: ['fertiliser program','fertilizer program','top dressing','basal dressing','nutrient deficiency','leaf analysis'], a: "<strong>Fertiliser programme basics:</strong><br><br>1) Start with a soil test and realistic yield target.<br>2) Apply basal fertiliser at planting for root establishment.<br>3) Top-dress nitrogen during active vegetative growth and before critical demand peaks.<br>4) Use leaf analysis in high-value crops to fine-tune nutrients.<br>5) Split applications on sandy soils to reduce losses.<br><br>Never copy a neighbour's rate blindly; field conditions differ." },
      { k: ['farm budget','gross margin','enterprise budget','cost of production','break even'], a: "<strong>Farm financial planning:</strong><br><br>• Build an enterprise budget per crop/livestock line<br>• Track variable costs (seed/feed/fertiliser/medication/fuel/labour)<br>• Calculate break-even yield or break-even price before season start<br>• Update budget monthly with actuals vs plan<br>• Cut low-return activities quickly and reallocate cash to profitable enterprises<br><br>SEDA and extension officers can help you prepare a practical budget template." },
      { k: ['post harvest','storage','grain storage','aflatoxin','cold chain','packhouse'], a: "<strong>Post-harvest management:</strong><br><br>• Dry grains to safe storage moisture before bagging/silos<br>• Keep stores clean, cool, and pest-controlled<br>• Sort and grade produce before marketing for better price<br>• Maintain cold chain for perishables (fruit/veg/dairy) where possible<br>• Record lot/batch details for traceability and food safety audits" },
      { k: ['food safety','haccp','globalgap','traceability','residue','withholding period'], a: "<strong>Food safety and compliance:</strong><br><br>• Follow product labels and withholding periods strictly<br>• Keep spray and treatment records (date, product, dose, operator)<br>• Use clean water and hygienic handling during harvest/packing<br>• Separate chemical storage from feed/food areas<br>• Build traceability (what was applied, where, and when)<br><br>For formal markets and exports, certification requirements may apply." },
      { k: ['tractor','mechanisation','mechanization','implements','planter calibration','sprayer calibration'], a: "<strong>Mechanisation tips:</strong><br><br>• Calibrate planters and sprayers at the start of each season<br>• Service machinery before peak operations (planting/harvest)<br>• Match implement size to tractor power to save fuel and avoid breakdowns<br>• Keep spares for high-failure wear parts<br>• Preventive maintenance is cheaper than emergency repairs during planting windows." },
      { k: ['climate smart','regenerative agriculture','carbon farming','cover crop','mulching'], a: "<strong>Climate-smart farming:</strong><br><br>• Keep soil covered (mulch/cover crops) to reduce heat and water stress<br>• Diversify crops and livestock to spread climate risk<br>• Improve soil organic matter to hold moisture longer<br>• Use drought-tolerant cultivars in marginal rainfall areas<br>• Plan enterprise calendars around historical rainfall windows and updated forecasts." },
      { k: ['farm security','biosecurity gate','visitor control','quarantine animals','new animals'], a: "<strong>Farm biosecurity and security:</strong><br><br>• Restrict and log farm visitors/vehicles<br>• Disinfect footwear/equipment at entry points where relevant<br>• Quarantine new livestock for at least 28 days before mixing<br>• Separate sick animals immediately and call a vet<br>• Keep clear movement and treatment records for audits and outbreak tracing." },
      { k: ['application stages','mesp stages','profiling and shortlisting','farm assessment status','hod approval'], a: "<strong>MESP procedure stages now tracked:</strong><br><br>Submitted → Profiling and Shortlisting → Farm Assessment → HOD Approval → Induction → Procurement → Pre and Post Delivery Inspection → Monitoring Evaluation and Advisory → Approved.<br><br>Staff capture stage evidence at each transition, and applicants can see progress on <a href='track.html'>Track Application</a>." },
      { k: ['support issue','report issue','website problem','theft report','power loss','water loss'], a: "You can report issues on the <a href='support.html'>Support page</a> when logged in.<br><br>Choose an issue type from the dropdown (website, theft, power loss, water loss, etc.), describe the problem, and submit. Staff can then move it through Submitted → In Progress → Resolved." },
      { k: ['rabbit feed','goat feed formulation','broiler feed','layer feed','ration'], a: "<strong>Feed and ration advice (general):</strong><br><br>Use feed formulations suitable for species, age, and production stage (growth, pregnancy, lactation, finishing). Sudden feed changes can cause health setbacks, so transition over several days. Ensure constant clean water, mineral balance, and quality roughage for ruminants.<br><br>For precise rations, work with an animal nutritionist or extension support in your district." },
      { k: ['soil sample','how to sample soil','sampling depth','composite sample'], a: "<strong>How to sample soil correctly:</strong><br><br>• Sample each field/block separately (do not mix very different soils)<br>• Take multiple cores in a zig-zag pattern and make a composite sample<br>• Typical depth: 0-20 cm for topsoil; deeper profiles if needed<br>• Avoid unusual spots (dung heaps, gate areas, wet patches)<br>• Label clearly (field name, date, crop history) and send promptly to lab" },
      { k: ['spray drift','pesticide safety','ppe','chemical safety','poisoning'], a: "<strong>Pesticide safety essentials:</strong><br><br>• Wear proper PPE (gloves, mask/respirator as required, coveralls, boots)<br>• Avoid spraying in high wind or temperature inversion conditions<br>• Respect buffer zones near homes, water, schools, and sensitive crops<br>• Triple-rinse containers and dispose according to legal guidelines<br>• Keep emergency numbers and product labels accessible during spraying." }
    ],

    /* ---- ADVANCED FARMING SYSTEMS ---- */
    [
      { k: ['intercropping','crop rotation plan','rotation','cover crops for maize','legume rotation'], a: "<strong>Rotation and intercropping strategy:</strong><br><br>• Rotate cereals with legumes to improve nitrogen balance and reduce pest cycles.<br>• Typical 3-year pattern: Maize → Soybean/Beans → Sunflower/Sorghum.<br>• Use cover crops after harvest to protect soil and suppress weeds.<br>• Keep residue on soil where possible to reduce erosion and water loss.<br><br>Good rotation improves yields, lowers fertiliser pressure, and reduces pesticide spend." },
      { k: ['greenhouse','tunnel farming','shade net','protected cultivation','hydroponics'], a: "<strong>Protected cultivation basics:</strong><br><br>• Use tunnels/shade-net for high-value crops where climate risk is high.<br>• Prioritise crops with reliable markets (tomato, pepper, cucumber, leafy greens).<br>• Manage ventilation and humidity to reduce disease pressure.<br>• Start with small area + strict record keeping before scaling.<br>• Ensure water quality and fertigation management are consistent." },
      { k: ['value addition','agro processing','processing','packaging','branding produce'], a: "<strong>Value addition opportunities:</strong><br><br>• Convert raw produce into higher-margin products (cleaned, graded, packaged, dried, processed).<br>• Start with market requirements first (pack size, quality spec, shelf life).<br>• Build traceability and hygiene SOPs from day one.<br>• Use SEDA/LED support for branding, compliance, and market linkage.<br><br>Value addition can stabilise income when farm-gate prices are weak." },
      { k: ['cooperative','co-op','group farming','farmer group','collective marketing'], a: "<strong>Cooperative success checklist:</strong><br><br>• Clear governance (roles, signatures, decision rules).<br>• Written production and quality standards for all members.<br>• Shared aggregation and delivery calendar.<br>• Transparent financial reporting monthly.<br>• Buyer contracts with clear volume/quality commitments.<br><br>Many co-ops fail on governance, not production. Put rules in writing early." },
      { k: ['export','export market','globalgap audit','phytosanitary'], a: "<strong>Export readiness snapshot:</strong><br><br>• Confirm buyer specification first (grade, size, residue limits, pack type).<br>• Build spray and input records for traceability.<br>• Prepare for compliance audits (GlobalG.A.P. or buyer standard).<br>• Ensure post-harvest handling and cold-chain control.<br>• Work with accredited labs and inspectors where required.<br><br>Start with domestic formal markets before scaling to export unless supported by an experienced off-taker." },
      { k: ['labour plan','seasonal workers','farm labour','staff planning'], a: "<strong>Farm labour planning:</strong><br><br>• Forecast labour demand by operation window (land prep, planting, weeding, harvest).<br>• Cross-train workers for peak periods and emergencies.<br>• Standardise task checklists and safety briefings.<br>• Track labour productivity by field/block.<br>• Align labour plan to budget before season starts." },
      { k: ['diesel cost','fuel planning','input inflation','cost control'], a: "<strong>Cost-control framework:</strong><br><br>1) Separate controllable vs non-controllable costs.<br>2) Protect top 3 profit drivers (yield, quality, market timing).<br>3) Reduce wastage via calibration + maintenance + scheduling.<br>4) Bulk-buy strategic inputs when pricing is favourable.<br>5) Review gross margin per enterprise monthly and drop weak performers quickly." },
      { k: ['farm succession','next generation','family farm planning'], a: "<strong>Farm continuity planning:</strong><br><br>• Document enterprise SOPs and decision rules.<br>• Train at least one backup operator per critical activity.<br>• Keep legal and financial records updated and accessible.<br>• Build a 12-month transition plan for leadership handover.<br>• Use advisors for legal/entity and tax planning where needed." }
    ]
  );

  var fallback = "I can help with most farming and website questions, but I need a bit more detail for this one.<br><br>Try adding context like:<br>• your <strong>enterprise</strong> (maize, cattle, poultry, goats, citrus, etc.)<br>• your <strong>goal</strong> (apply, prevent disease, improve yield, reduce costs, market produce)<br>• your <strong>location/season</strong> in Mpumalanga<br><br>Examples:<br>• \"I'm in Ermelo and planting maize next month - what should I do first?\"<br>• \"My goats are losing condition in winter - what feed plan works?\"<br>• \"What documents do I need for MESP smallholder application?\"<br><br>You can also ask about grants, pests, livestock health, irrigation, finance, weather, alerts, and support contacts.";

  /* ================================================================
   *  MATCHING ENGINE + SMART FARMER HELPERS
   * ================================================================ */
  var chatContext = {
    location: '',
    enterprise: ''
  };
  var guidedFlow = {
    active: '',
    step: 0,
    data: {}
  };

  function resetGuidedFlow() {
    guidedFlow.active = '';
    guidedFlow.step = 0;
    guidedFlow.data = {};
  }

  function startGuidedFlow(flowId) {
    guidedFlow.active = flowId;
    guidedFlow.step = 0;
    guidedFlow.data = {};
    if (flowId === 'maize_pest') {
      return "🔎 <strong>Maize diagnosis flow started.</strong><br>Step 1/3: Where is the main damage?<br>Reply with one:<br>• <code>leaves</code><br>• <code>whorl</code><br>• <code>stem</code><br>• <code>cob</code><br>Type <code>cancel</code> to stop.";
    }
    if (flowId === 'smallstock_parasite') {
      return "🔎 <strong>Goat/Sheep parasite flow started.</strong><br>Step 1/3: Which species?<br>Reply: <code>goat</code> or <code>sheep</code><br>Type <code>cancel</code> to stop.";
    }
    if (flowId === 'poultry_mortality') {
      return "🔎 <strong>Poultry mortality flow started.</strong><br>Step 1/3: Age group?<br>Reply with one:<br>• <code>day-old</code><br>• <code>1-3 weeks</code><br>• <code>grower</code><br>• <code>layer/breeder</code><br>Type <code>cancel</code> to stop.";
    }
    return '';
  }

  function normalizeSimple(input) {
    return String(input || '').toLowerCase().trim();
  }

  function handleGuidedFlowInput(input) {
    var ans = normalizeSimple(input);
    if (ans === 'cancel' || ans === 'stop' || ans === 'exit') {
      resetGuidedFlow();
      return "Guided diagnosis cancelled. You can start again anytime.";
    }

    if (guidedFlow.active === 'maize_pest') {
      if (guidedFlow.step === 0) {
        guidedFlow.data.damageSite = ans;
        guidedFlow.step = 1;
        return "Step 2/3: Do you see frass (sawdust-like droppings) in the whorl/cob?<br>Reply: <code>yes</code> or <code>no</code>";
      }
      if (guidedFlow.step === 1) {
        guidedFlow.data.frass = ans;
        guidedFlow.step = 2;
        return "Step 3/3: Is damage patchy with fresh chewing, or uniform yellowing?<br>Reply with one:<br>• <code>patchy chewing</code><br>• <code>uniform yellowing</code>";
      }
      guidedFlow.data.pattern = ans;
      var res = "<strong>Maize likely-cause output:</strong><br><br>";
      var severity = 'Medium';
      var immediate = '';
      var next24 = '';
      if ((guidedFlow.data.damageSite.indexOf('whorl') >= 0 || guidedFlow.data.damageSite.indexOf('cob') >= 0) && guidedFlow.data.frass === 'yes') {
        res += "Most likely: <strong>Fall armyworm / cob-feeding caterpillars</strong>.<br>Action: scout immediately, treat early instars, and check product label + timing.";
        severity = 'High';
        immediate = "Scout all blocks now, mark hotspots, and treat above threshold areas first.";
        next24 = "Re-check treated zones, confirm larval knockdown, and log affected hectares.";
      } else if (guidedFlow.data.pattern.indexOf('uniform') >= 0) {
        res += "Most likely: <strong>nutrient or moisture-related stress</strong> rather than acute chewing pest.<br>Action: check soil moisture, fertiliser history, and root health before spraying insecticide.";
        severity = 'Medium';
        immediate = "Run moisture + nutrient checks before any pesticide spend.";
        next24 = "Inspect roots and irrigation uniformity; correct the limiting factor first.";
      } else {
        res += "Likely mixed pressure (insect + stress factors).<br>Action: split field into zones, verify pest presence physically, and treat only above threshold.";
        severity = 'Medium-High';
        immediate = "Separate insect-damaged zones from nutrient/water stress zones.";
        next24 = "Deploy targeted intervention per zone and re-scout after 24 hours.";
      }
      res += "<br><br>Next: send photos and samples to extension support for confirmation before major chemical spend.";
      res += "<br><br><strong>Field report card:</strong><br>• Severity: <strong>" + severity + "</strong><br>• Immediate actions: " + immediate + "<br>• Next 24h plan: " + next24 + "<br>• Escalate to: Extension officer (013 766 4027) if spread accelerates.";
      resetGuidedFlow();
      return res;
    }

    if (guidedFlow.active === 'smallstock_parasite') {
      if (guidedFlow.step === 0) {
        guidedFlow.data.species = ans;
        guidedFlow.step = 1;
        return "Step 2/3: What is the eyelid colour on FAMACHA check?<br>Reply: <code>red</code>, <code>pink</code>, or <code>pale/white</code>";
      }
      if (guidedFlow.step === 1) {
        guidedFlow.data.eyelid = ans;
        guidedFlow.step = 2;
        return "Step 3/3: Is there bottle jaw or weight loss?<br>Reply: <code>yes</code> or <code>no</code>";
      }
      guidedFlow.data.clinical = ans;
      var out = "<strong>Small-stock parasite likely-cause output:</strong><br><br>";
      var sev2 = 'Medium';
      var immediate2 = '';
      var next242 = '';
      if (guidedFlow.data.eyelid.indexOf('pale') >= 0 || guidedFlow.data.eyelid.indexOf('white') >= 0 || guidedFlow.data.clinical === 'yes') {
        out += "High risk of <strong>Haemonchus (wireworm) anaemia</strong>.<br>Action: targeted deworming of affected animals, dose by weight, then reassess in 7-10 days.";
        sev2 = 'High';
        immediate2 = "Prioritise weak/pale animals for immediate intervention and close observation.";
        next242 = "Check response, hydration, and grazing pressure; isolate poor responders.";
      } else if (guidedFlow.data.eyelid.indexOf('pink') >= 0) {
        out += "Moderate parasite pressure likely.<br>Action: monitor closely, treat selective animals, and improve grazing rotation.";
        sev2 = 'Medium';
        immediate2 = "Treat selective high-risk animals and avoid blanket dosing.";
        next242 = "Re-score FAMACHA and record body condition changes.";
      } else {
        out += "Low immediate worm risk signs.<br>Action: continue monitoring and avoid blanket deworming to slow resistance.";
        sev2 = 'Low-Medium';
        immediate2 = "Maintain surveillance and nutrition support.";
        next242 = "Repeat FAMACHA checks and track any decline early.";
      }
      out += "<br><br>Confirm with faecal egg count/FECRT where possible.";
      out += "<br><br><strong>Field report card:</strong><br>• Severity: <strong>" + sev2 + "</strong><br>• Immediate actions: " + immediate2 + "<br>• Next 24h plan: " + next242 + "<br>• Escalate to: State Vet (013 288 2087) if deaths, severe anaemia, or rapid deterioration.";
      resetGuidedFlow();
      return out;
    }

    if (guidedFlow.active === 'poultry_mortality') {
      if (guidedFlow.step === 0) {
        guidedFlow.data.age = ans;
        guidedFlow.step = 1;
        return "Step 2/3: Main sign before death?<br>Reply one:<br>• <code>respiratory</code><br>• <code>diarrhea</code><br>• <code>sudden death</code><br>• <code>neurological</code>";
      }
      if (guidedFlow.step === 1) {
        guidedFlow.data.sign = ans;
        guidedFlow.step = 2;
        return "Step 3/3: Mortality trend?<br>Reply one:<br>• <code>rising fast</code><br>• <code>stable low</code>";
      }
      guidedFlow.data.trend = ans;
      var msg = "🚨 <strong>Poultry mortality triage output:</strong><br><br>";
      var sev3 = 'Medium';
      var immediate3 = '';
      var next243 = '';
      if (guidedFlow.data.trend.indexOf('rising') >= 0) {
        msg += "Treat as a potential outbreak. Isolate houses, stop movement, tighten hygiene, and contact veterinary authorities urgently.";
        sev3 = 'High';
        immediate3 = "Lock down movement, isolate houses, enforce strict hygiene controls.";
        next243 = "Track hourly mortality, secure samples, and prepare outbreak report.";
      } else {
        msg += "Likely manageable but still urgent. Check brooding/ventilation/water quality and vaccination timing immediately.";
        sev3 = 'Medium';
        immediate3 = "Correct environment and husbandry stress points immediately.";
        next243 = "Monitor trend and reassess if mortality rises.";
      }
      if (guidedFlow.data.sign.indexOf('resp') >= 0 || guidedFlow.data.sign.indexOf('neuro') >= 0) {
        msg += "<br>Possible respiratory/viral component - escalate quickly for lab confirmation.";
        sev3 = 'High';
      }
      msg += "<br><br>Contact State Vet: <strong>013 288 2087</strong>.";
      msg += "<br><br><strong>Field report card:</strong><br>• Severity: <strong>" + sev3 + "</strong><br>• Immediate actions: " + immediate3 + "<br>• Next 24h plan: " + next243 + "<br>• Escalate to: State Vet (013 288 2087) and district extension support if trend worsens.";
      resetGuidedFlow();
      return msg;
    }

    return '';
  }

  function extractContext(words) {
    var locations = ['ermelo','bethal','standerton','nelspruit','mbombela','middelburg','secunda','komatipoort','malelane','white river','hazyview','carolina','piet retief'];
    var enterprises = ['maize','soybean','sunflower','wheat','vegetable','citrus','avocado','sugarcane','cattle','goat','sheep','pig','poultry','rabbit','aquaculture','fish','dairy'];
    var joined = words.join(' ');
    for (var i = 0; i < locations.length; i++) {
      if (joined.indexOf(locations[i]) >= 0) chatContext.location = locations[i];
    }
    for (var j = 0; j < enterprises.length; j++) {
      if (joined.indexOf(enterprises[j]) >= 0) chatContext.enterprise = enterprises[j];
    }
  }

  function tryCalculatorResponse(lower) {
    // Fertiliser calculator example: "35 ha at 180 kg/ha"
    if ((lower.indexOf('kg/ha') >= 0 || lower.indexOf('kg per ha') >= 0 || lower.indexOf('kgha') >= 0) && lower.indexOf('ha') >= 0) {
      var nums = lower.match(/(\d+(\.\d+)?)/g);
      if (nums && nums.length >= 2) {
        var hectares = parseFloat(nums[0]);
        var rate = parseFloat(nums[1]);
        if (hectares > 0 && rate > 0) {
          var totalKg = hectares * rate;
          var bags = totalKg / 50;
          return "<strong>Fertiliser quick calculator:</strong><br><br>Area: " + hectares + " ha<br>Rate: " + rate + " kg/ha<br><strong>Total required: " + totalKg.toFixed(2) + " kg</strong><br>Equivalent 50 kg bags: <strong>" + bags.toFixed(1) + "</strong><br><br>Tip: Add 3-5% contingency for handling and calibration losses.";
        }
      }
    }

    // Stocking quick check example: "120 ha and 40 cattle"
    if ((lower.indexOf('stocking') >= 0 || lower.indexOf('carrying') >= 0 || lower.indexOf('overstock') >= 0 || lower.indexOf('ha') >= 0) &&
        (lower.indexOf('cattle') >= 0 || lower.indexOf('goat') >= 0 || lower.indexOf('sheep') >= 0)) {
      var n = lower.match(/(\d+(\.\d+)?)/g);
      if (n && n.length >= 2) {
        var area = parseFloat(n[0]);
        var head = parseFloat(n[1]);
        if (area > 0 && head > 0) {
          var haPerHead = area / head;
          return "<strong>Stocking quick check:</strong><br><br>Area: " + area + " ha<br>Animals: " + head + "<br><strong>Current ratio: " + haPerHead.toFixed(2) + " ha per animal</strong><br><br>This is a screening figure only. Final carrying capacity depends on veld type, rainfall, and class of livestock. Get a veld-specific assessment from your extension officer before expanding herd/flock size.";
        }
      }
    }
    return '';
  }

  function tryEmergencyResponse(lower) {
    var livestockSignals = ['not eating','off feed','diarrhea','diarrhoea','high fever','coughing','sudden death','abortion','mouth lesions','lameness'];
    var cropSignals = ['wilting','yellow leaves','leaf spots','stem rot','root rot','blight','pest outbreak'];
    var hasLivestock = lower.indexOf('cattle') >= 0 || lower.indexOf('goat') >= 0 || lower.indexOf('sheep') >= 0 || lower.indexOf('pig') >= 0 || lower.indexOf('poultry') >= 0 || lower.indexOf('chicken') >= 0;
    var hasCrop = lower.indexOf('maize') >= 0 || lower.indexOf('crop') >= 0 || lower.indexOf('tomato') >= 0 || lower.indexOf('potato') >= 0 || lower.indexOf('vegetable') >= 0;
    var i;
    for (i = 0; i < livestockSignals.length; i++) {
      if (lower.indexOf(livestockSignals[i]) >= 0 && hasLivestock) {
        return "🚨 <strong>Possible livestock health emergency:</strong><br><br>Immediate actions:<br>1) Isolate affected animals now.<br>2) Stop all animal movement on/off farm.<br>3) Record symptoms, numbers affected, and onset time.<br>4) Contact State Vet immediately: <strong>013 288 2087</strong>.<br>5) If deaths occur, do not open carcasses unless instructed by veterinary officials.<br><br>I can build a same-day response checklist if you share species and key symptoms.";
      }
    }
    for (i = 0; i < cropSignals.length; i++) {
      if (lower.indexOf(cropSignals[i]) >= 0 && hasCrop) {
        return "⚠️ <strong>Possible crop health issue:</strong><br><br>Rapid response steps:<br>1) Map affected area (hotspots vs whole field).<br>2) Check irrigation, drainage, and recent spray/fertiliser records.<br>3) Scout 10-20 random points and take clear photos.<br>4) Separate insect damage from nutrient/disease symptoms before spraying.<br>5) Contact extension support for diagnosis confirmation before major chemical spend.<br><br>If you share crop, growth stage, and symptoms, I can provide a targeted troubleshooting guide.";
      }
    }
    return '';
  }

  function detectSeasonByMonth() {
    var month = new Date().getMonth() + 1;
    if (month >= 9 && month <= 11) return 'spring';
    if (month >= 12 || month <= 2) return 'summer';
    if (month >= 3 && month <= 5) return 'autumn';
    return 'winter';
  }

  function seasonPlan(season, enterprise) {
    var ent = enterprise || 'mixed farming';
    if (season === 'spring') {
      return "<strong>Spring action plan (" + ent + "):</strong><br><br>• Finalise soil prep and input procurement.<br>• Calibrate planters/sprayers before first use.<br>• Plant summer crops in optimal windows.<br>• Vaccinate and parasite-control livestock before peak summer pressure.<br>• Repair fences, water points, and drainage ahead of storms.";
    }
    if (season === 'summer') {
      return "<strong>Summer action plan (" + ent + "):</strong><br><br>• Intensify scouting (pests, disease, water stress).<br>• Execute top-dressing and weed control on time.<br>• Manage grazing pressure and provide clean water/shade.<br>• Prepare flood/heat contingency responses.<br>• Track costs weekly to avoid cash flow surprises.";
    }
    if (season === 'autumn') {
      return "<strong>Autumn action plan (" + ent + "):</strong><br><br>• Harvest and post-harvest handling discipline.<br>• Grade and market produce strategically.<br>• Build winter feed reserves for livestock.<br>• Review enterprise performance and plan adjustments.<br>• Prepare winter fields/pastures where applicable.";
    }
    return "<strong>Winter action plan (" + ent + "):</strong><br><br>• Maintain body condition with targeted supplementation.<br>• Perform equipment maintenance and pre-season repairs.<br>• Apply lime and soil amendments where planned.<br>• Update budgets and secure next-season inputs early.<br>• Fire-risk mitigation: maintain firebreaks and readiness.";
  }

  function tryPlannerResponse(lower) {
    if (lower.indexOf('weekly plan') >= 0 || lower.indexOf('week plan') >= 0 || lower.indexOf('plan my week') >= 0) {
      var ent = chatContext.enterprise || 'farm operations';
      return "<strong>7-day practical farm plan (" + ent + "):</strong><br><br><strong>Day 1:</strong> Field/livestock inspection + priority list.<br><strong>Day 2:</strong> Input checks, calibration, and procurement gaps.<br><strong>Day 3:</strong> Core operation (plant/spray/feed health intervention).<br><strong>Day 4:</strong> Follow-up scouting and corrective actions.<br><strong>Day 5:</strong> Record keeping, cost tracking, and market checks.<br><strong>Day 6:</strong> Infrastructure maintenance (water, fences, housing).<br><strong>Day 7:</strong> Review outcomes and prepare next-week plan.";
    }
    if (lower.indexOf('season plan') >= 0 || lower.indexOf('seasonal plan') >= 0 || lower.indexOf('this season plan') >= 0) {
      return seasonPlan(detectSeasonByMonth(), chatContext.enterprise);
    }
    if (lower.indexOf('startup plan') >= 0 || lower.indexOf('start up plan') >= 0 || lower.indexOf('new farm plan') >= 0) {
      var ent2 = chatContext.enterprise || 'your chosen enterprise';
      return "<strong>90-day startup plan (" + ent2 + "):</strong><br><br><strong>Days 1-30:</strong> Define enterprise scope, budget, market outlet, and input plan.<br><strong>Days 31-60:</strong> Set up infrastructure, secure inputs, train labour, establish records.<br><strong>Days 61-90:</strong> Execute first production cycle, monitor weekly KPIs, and correct quickly.<br><br>Must-have KPIs: survival/establishment rate, feed/input conversion, pest/disease incidence, gross margin trend.";
    }
    if (lower.indexOf('outbreak checklist') >= 0 || lower.indexOf('disease checklist') >= 0 || lower.indexOf('emergency checklist') >= 0) {
      return "🚨 <strong>Farm outbreak checklist (first 24 hours):</strong><br><br>1) Isolate affected animals/fields immediately.<br>2) Restrict movement of people, tools, and vehicles.<br>3) Document signs, numbers affected, and timing.<br>4) Notify authorities/State Vet where required.<br>5) Separate clean/dirty zones and disinfect equipment.<br>6) Preserve evidence/samples for diagnosis.<br>7) Communicate one clear protocol to all workers.<br>8) Start a daily incident log until closure.";
    }
    return '';
  }

  function contextualTail() {
    var bits = [];
    if (chatContext.enterprise) bits.push('enterprise: <strong>' + chatContext.enterprise + '</strong>');
    if (chatContext.location) bits.push('location: <strong>' + chatContext.location + '</strong>');
    if (!bits.length) return '';
    return "<br><br><em>Saved context (" + bits.join(' | ') + ").</em> Ask follow-up questions without repeating everything.";
  }

  function normalizeText(input) {
    var lower = input.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
    var alias = {
      fertlizer: 'fertilizer', fertiliser: 'fertilizer', farme: 'farm', farmr: 'farmer',
      cattel: 'cattle', chiken: 'chicken', poutry: 'poultry', vegtable: 'vegetable',
      appliation: 'application', documnts: 'documents', wheather: 'weather',
      aquacuture: 'aquaculture', irigation: 'irrigation', enviromental: 'environmental',
      progamme: 'programme', eligiblity: 'eligibility'
    };
    var words = lower.split(/\s+/).filter(function (w) { return w.length > 1; }).map(function (w) {
      return alias[w] || w;
    });
    return { lower: words.join(' '), words: words };
  }

  function matchAnswer(input) {
    var normalized = normalizeText(input);
    var lower = normalized.lower;
    var words = normalized.words;

    if (guidedFlow.active) {
      return handleGuidedFlowInput(input);
    }

    if (lower.indexOf('maize diagnosis') >= 0 || lower.indexOf('maize pest diagnosis') >= 0 || lower.indexOf('diagnose maize') >= 0) {
      return startGuidedFlow('maize_pest');
    }
    if (lower.indexOf('goat parasite diagnosis') >= 0 || lower.indexOf('sheep parasite diagnosis') >= 0 || lower.indexOf('small stock parasite diagnosis') >= 0) {
      return startGuidedFlow('smallstock_parasite');
    }
    if (lower.indexOf('poultry mortality diagnosis') >= 0 || lower.indexOf('diagnose poultry deaths') >= 0 || lower.indexOf('poultry outbreak diagnosis') >= 0) {
      return startGuidedFlow('poultry_mortality');
    }

    extractContext(words);

    var quickCalc = tryCalculatorResponse(lower);
    if (quickCalc) return quickCalc + contextualTail();

    var emergency = tryEmergencyResponse(lower);
    if (emergency) return emergency + contextualTail();

    var planner = tryPlannerResponse(lower);
    if (planner) return planner + contextualTail();

    var bestScore = 0;
    var bestAnswer = fallback;
    var secondScore = 0;
    var secondAnswer = '';

    for (var i = 0; i < qa.length; i++) {
      var score = 0;
      var kws = qa[i].k;
      for (var j = 0; j < kws.length; j++) {
        var kw = kws[j].toLowerCase();
        if (kw.indexOf(' ') >= 0) {
          if (lower.indexOf(kw) >= 0) score += 4;
        } else {
          for (var w = 0; w < words.length; w++) {
            if (words[w] === kw) { score += 3; }
            else if (words[w].length > 3 && kw.length > 3) {
              if (words[w].indexOf(kw) >= 0 || kw.indexOf(words[w]) >= 0) score += 1.5;
            }
          }
        }
      }
      if (score > bestScore) {
        secondScore = bestScore;
        secondAnswer = bestAnswer;
        bestScore = score;
        bestAnswer = qa[i].a;
      } else if (score > secondScore) {
        secondScore = score;
        secondAnswer = qa[i].a;
      }
    }

    if (bestScore < 3) return fallback + contextualTail();

    // When users ask broad multi-part questions, return two strong answers.
    if (secondScore >= 5 && secondAnswer && secondAnswer !== bestAnswer) {
      return bestAnswer + "<hr style='border:none;border-top:1px solid rgba(0,0,0,.1);margin:10px 0;'>" + secondAnswer + contextualTail();
    }
    return bestAnswer + contextualTail();
  }

  /* ================================================================
   *  UI RENDERING & EVENT HANDLING (unchanged structure)
   * ================================================================ */
  var isOpen = false;
  var messages = [];

  function render() {
    var html = '<button class="chatbot-fab" id="chatbotFab" type="button" aria-label="Open chat assistant">' +
      '<span class="chatbot-fab__icon">&#128172;</span>' +
      '<span class="chatbot-fab__badge" id="chatbotBadge" hidden>1</span>' +
    '</button>';

    html += '<div class="chatbot-panel' + (isOpen ? ' open' : '') + '" id="chatbotPanel">';
    html += '<div class="chatbot-header">';
    html += '<div class="chatbot-header__info"><span class="chatbot-header__title">AgriSupport Assistant</span><span class="chatbot-header__status">Online — ask me anything</span></div>';
    html += '<button class="chatbot-header__close" id="chatbotClose" type="button" aria-label="Close chat">&#10005;</button>';
    html += '</div>';

    html += '<div class="chatbot-messages" id="chatbotMessages">';
    if (messages.length === 0) {
      html += '<div class="chatbot-msg chatbot-msg--bot"><div class="chatbot-msg__bubble">Hello! I\'m the AgriSupport Assistant. I know everything about this website, all three grant programmes, crop and livestock farming in South Africa, weather, alerts, and more.<br><br>Ask me anything — from "How do I apply for a grant?" to "What breed of cattle should I start with?" to "How do I control fall armyworm?"</div></div>';
      html += '<div class="chatbot-suggestions" id="chatbotSuggestions">';
      html += '<button class="chatbot-suggestion" type="button">How do I apply for a grant?</button>';
      html += '<button class="chatbot-suggestion" type="button">Which cattle breed is best for beginners?</button>';
      html += '<button class="chatbot-suggestion" type="button">When should I plant maize?</button>';
      html += '<button class="chatbot-suggestion" type="button">How do I control fall armyworm?</button>';
      html += '<button class="chatbot-suggestion" type="button">Calculate fertiliser for 35 ha at 180 kg/ha</button>';
      html += '<button class="chatbot-suggestion" type="button">I have 120 ha and 40 cattle - is this overstocked?</button>';
      html += '<button class="chatbot-suggestion" type="button">Give me a weekly plan for my farm</button>';
      html += '<button class="chatbot-suggestion" type="button">Give me a season plan for this month</button>';
      html += '<button class="chatbot-suggestion" type="button">Outbreak emergency checklist</button>';
      html += '<button class="chatbot-suggestion" type="button">Start maize pest diagnosis</button>';
      html += '<button class="chatbot-suggestion" type="button">Start goat/sheep parasite diagnosis</button>';
      html += '<button class="chatbot-suggestion" type="button">Start poultry mortality diagnosis</button>';
      html += '<button class="chatbot-suggestion" type="button">Emergency contacts</button>';
      html += '<button class="chatbot-suggestion" type="button">I\'m a new farmer — where do I start?</button>';
      html += '</div>';
    } else {
      for (var i = 0; i < messages.length; i++) {
        var m = messages[i];
        html += '<div class="chatbot-msg chatbot-msg--' + m.from + '"><div class="chatbot-msg__bubble">' + m.text + '</div></div>';
      }
    }
    html += '</div>';

    html += '<form class="chatbot-input" id="chatbotForm">';
    html += '<input class="chatbot-input__field" id="chatbotInputField" type="text" placeholder="Ask about farming, grants, breeds, pests..." autocomplete="off">';
    html += '<button class="chatbot-input__send" type="submit" aria-label="Send">&#10148;</button>';
    html += '</form>';
    html += '</div>';

    root.innerHTML = html;
    bindEvents();
    scrollToBottom();
  }

  function scrollToBottom() {
    var el = document.getElementById('chatbotMessages');
    if (el) el.scrollTop = el.scrollHeight;
  }

  function sendMessage(text) {
    text = text.trim();
    if (!text) return;
    var safe = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    messages.push({ from: 'user', text: safe });
    var answer = matchAnswer(text);
    messages.push({ from: 'bot', text: answer });
    render();
  }

  function bindEvents() {
    var fab = document.getElementById('chatbotFab');
    var panel = document.getElementById('chatbotPanel');
    var close = document.getElementById('chatbotClose');
    var form = document.getElementById('chatbotForm');
    var input = document.getElementById('chatbotInputField');
    var badge = document.getElementById('chatbotBadge');

    if (fab) {
      fab.addEventListener('click', function () {
        isOpen = !isOpen;
        if (panel) panel.classList.toggle('open', isOpen);
        if (badge) badge.hidden = true;
        if (isOpen && input) setTimeout(function () { input.focus(); }, 200);
      });
    }

    if (close) {
      close.addEventListener('click', function () {
        isOpen = false;
        if (panel) panel.classList.remove('open');
      });
    }

    if (form && input) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        sendMessage(input.value);
        input.value = '';
      });
    }

    document.querySelectorAll('.chatbot-suggestion').forEach(function (btn) {
      btn.addEventListener('click', function () {
        sendMessage(btn.textContent);
      });
    });
  }

  render();

  if (!isOpen) {
    setTimeout(function () {
      var badge = document.getElementById('chatbotBadge');
      if (badge) badge.hidden = false;
    }, 3000);
  }
})(window);
