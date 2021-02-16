<script>
	import Input from "./components/forms/Input.svelte";
	import CheckBox from "./components/forms/CheckBox.svelte";
	import Radio from "./components/forms/Radio.svelte";
	import Select from "./components/forms/Select.svelte";
	import Number from "./components/forms/Number.svelte";
	import Date from "./components/forms/Date.svelte";
	import { update_keyed_each } from "svelte/internal";

	let output = {
		full_name: "",
		type_of_id: "mykad",
		id_number: "",
		passport_number: "",
		nationality: "malaysia",
		pr_status: "",
		pr_id_number: "",
		pr_country: "malaysia",
		date_of_birth: "",
		us_related: "",
		educations_detail: "none",
		occupation: "other outside labour force",
		job_title: "officer",
		bmmb_staff: "no",
		bmmb_staff_id: "",
		employment_type: "private employee",
		employment_sector: "information & communication",
		monthly_basic_salary: "",
		monthly_other_salary: "",
		employer_name: "",
		nature_of_business: "",
		no_of_other_banks_used: "0",
		bmmb_high_net_worth: "no",
		pep_related: "no",
		local_address: "",
		local_postal_code: "",
		local_city: "",
		local_state_code: "",
		local_coutry: "",
		foreign_address: "",
		foreign_postal_code: "",
		foreign_city: "",
		foreign_state_code: "",
		foreign_coutry: "",
		mail_same_local: "no",
		mailing_address: "",
		mailing_postal_code: "",
		mailing_city: "",
		mailing_state_code: "",
		mailing_coutry: "",
		property_ownership: "owned",
		mobile_number: "",
		office_number: "",
		email_address: "",
		race: "malay",
		gender: "male",
		maritial_status: "single",
		spouse_name: "",
		no_of_dependents: "",
		contact_person_name: "",
		contact_relationship: "other",
		contact_mobile_number: "",
		bmmb_account_type: "saving account (sa)",
		purpose_of_account: "payroll/saving",
		product_to_open: "sa muss",
		prefered_branch: "jalan melaka",
	};

	$: console.log(output);

	let step = 1;
	let last_step = 7;

	let id_type_options = [
		{
			label: "Mykad",
		},
		{
			label: "Army Personnel ID",
		},
		{
			label: "Police Personnel ID",
		},
		{
			label: "MyPR",
		},
		{
			label: "Passport",
		},
	];

	let nationality_options = [
		{
			label: "AFGHANISTAN",
		},
		{
			label: "ALBANIA",
		},
		{
			label: "ALGERIA",
		},
		{
			label: "AMERICA SAMOA",
		},
		{
			label: "ANDORRA",
		},
		{
			label: "ANGOLA",
		},
		{
			label: "ANGUILLA",
		},
		{
			label: "ANTARCTICA",
		},
		{
			label: "ANTIGUA",
		},
		{
			label: "ARGENTINA",
		},
		{
			label: "ARMENIA",
		},
		{
			label: "ARUBA",
		},
		{
			label: "AUSTRALIA",
		},
		{
			label: "AUSTRIA",
		},
		{
			label: "AZERBAIJAN",
		},
		{
			label: "BAHAMAS",
		},
		{
			label: "BAHRAIN",
		},
		{
			label: "BANGLADESH",
		},
		{
			label: "BARBADOS",
		},
		{
			label: "BELARUS",
		},
		{
			label: "BELGIUM",
		},
		{
			label: "BELIZE",
		},
		{
			label: "BENIN",
		},
		{
			label: "BERMUDA",
		},
		{
			label: "BHUTAN",
		},
		{
			label: "BOLIVIA",
		},
		{
			label: "BOTSWANA",
		},
		{
			label: "BOUVET ISLAND",
		},
		{
			label: "BRAZIL",
		},
		{
			label: "BRITISH INDIAN OCEAN TERRITORY",
		},
		{
			label: "BRITISH VIRGIN ISLANDS",
		},
		{
			label: "BRUNEI",
		},
		{
			label: "BULGARIA",
		},
		{
			label: "BURKINA FASO",
		},
		{
			label: "BURMA",
		},
		{
			label: "BURUNDI",
		},
		{
			label: "CAMBODIA",
		},
		{
			label: "CAMEROON, UNITED REPUBLIC",
		},
		{
			label: "CANADA",
		},
		{
			label: "CANTON AND ENDERBURY ISLAN",
		},
		{
			label: "CAPE VERDE",
		},
		{
			label: "CAYMAN ISLANDS",
		},
		{
			label: "CENTRAL AFRICAN REPUBLIC",
		},
		{
			label: "CHAD",
		},
		{
			label: "CHILE",
		},
		{
			label: "CHINA",
		},
		{
			label: "CHRISTMAS ISLANDS",
		},
		{
			label: "COCOS(KEELING)ISLANDS",
		},
		{
			label: "COLOMBIA",
		},
		{
			label: "COMOROS",
		},
		{
			label: "CONGO",
		},
		{
			label: "COOK ISLANDS",
		},
		{
			label: "COSTA RICA",
		},
		{
			label: "COTE D'IVOIRE (IVORY COAST)",
		},
		{
			label: "CROATIA",
		},
		{
			label: "CUBA",
		},
		{
			label: "CYPRUS",
		},
		{
			label: "CZECHOSLOVAKIA",
		},
		{
			label: "DENMARK",
		},
		{
			label: "DJIBOUTI",
		},
		{
			label: "DOMINICA",
		},
		{
			label: "DOMINICAN REPUBLIC",
		},
		{
			label: "DRONNING MAUD LAND",
		},
		{
			label: "EAST TIMOR",
		},
		{
			label: "ECUADOR",
		},
		{
			label: "EGYPT",
		},
		{
			label: "EL SALVADOR",
		},
		{
			label: "EQUATORIAL GUINEA",
		},
		{
			label: "ESTONIA",
		},
		{
			label: "ETHIOPIA",
		},
		{
			label: "FAEROE ISLANDS",
		},
		{
			label: "FALKLAND ISLANDS (MALVINAS)",
		},
		{
			label: "FIJI",
		},
		{
			label: "FINLAND",
		},
		{
			label: "FRANCE",
		},
		{
			label: "FRENCH GUIANA",
		},
		{
			label: "FRENCH POLYNESIA",
		},
		{
			label: "FRENCH SOUTHERN TERRITORIES",
		},
		{
			label: "GABON",
		},
		{
			label: "GAMBIA",
		},
		{
			label: "GEORGIA",
		},
		{
			label: "GERMAN DEMOCRATIC REPUBLIC",
		},
		{
			label: "GERMANY",
		},
		{
			label: "GHANA",
		},
		{
			label: "GIBRALTAR",
		},
		{
			label: "GREECE",
		},
		{
			label: "GREENLAND",
		},
		{
			label: "GRENADA",
		},
		{
			label: "GUADELOUPE",
		},
		{
			label: "GUAM",
		},
		{
			label: "GUATEMALA",
		},
		{
			label: "GUERNSEY, C.I.",
		},
		{
			label: "GUINEA",
		},
		{
			label: "GUINEA BISSAU",
		},
		{
			label: "GUYANA",
		},
		{
			label: "HAITI",
		},
		{
			label: "HEARD AND MCDONALD ISLANDS",
		},
		{
			label: "HONDURAS",
		},
		{
			label: "HONG KONG",
		},
		{
			label: "HUNGARY",
		},
		{
			label: "ICELAND",
		},
		{
			label: "INDIA",
		},
		{
			label: "INDONESIA",
		},
		{
			label: "IRAN",
		},
		{
			label: "IRAQ",
		},
		{
			label: "IRELAND",
		},
		{
			label: "ISLE OF MAN",
		},
		{
			label: "ISRAEL",
		},
		{
			label: "ITALY",
		},
		{
			label: "JAMAICA",
		},
		{
			label: "JAPAN",
		},
		{
			label: "JERSEY, C.I.",
		},
		{
			label: "JOHNSTON ISLAND",
		},
		{
			label: "JORDAN",
		},
		{
			label: "KAZAKHSTAN",
		},
		{
			label: "KENYA",
		},
		{
			label: "KIRIBATI",
		},
		{
			label: "KOREA",
		},
		{
			label: "KOREA DEMOCRATIC PEOPLES REP",
		},
		{
			label: "KUWAIT",
		},
		{
			label: "KYRGYZSTAN",
		},
		{
			label: "LAO PEOPLE'S DEMOCRATIC REP",
		},
		{
			label: "LATVIA",
		},
		{
			label: "LEBANON",
		},
		{
			label: "LESOTHO",
		},
		{
			label: "LIBERIA",
		},
		{
			label: "LIBYAN ARAB JAMAHIRIYA",
		},
		{
			label: "LICHTENSTEIN",
		},
		{
			label: "LITHUANIA",
		},
		{
			label: "LUXEMBOURG",
		},
		{
			label: "MACAU",
		},
		{
			label: "MADAGASCAR",
		},
		{
			label: "MALAWI",
		},
		{
			label: "MALAYSIA",
		},
		{
			label: "MALDIVES",
		},
		{
			label: "MALI",
		},
		{
			label: "MALTA",
		},
		{
			label: "MARSHALL ISLANDS",
		},
		{
			label: "MARTINIQUE",
		},
		{
			label: "MAURITANIA",
		},
		{
			label: "MAURITIUS",
		},
		{
			label: "MEXICO",
		},
		{
			label: "MICRONESIA",
		},
		{
			label: "MIDWAY ISLANDS",
		},
		{
			label: "MOLDOVA, REPUBLIC OF",
		},
		{
			label: "MONACO",
		},
		{
			label: "MONGOLIA",
		},
		{
			label: "MONTSERRAT",
		},
		{
			label: "MOROCCO",
		},
		{
			label: "MOZAMBIQUE",
		},
		{
			label: "MYANMAR",
		},
		{
			label: "NAMIBIA",
		},
		{
			label: "NAURU",
		},
		{
			label: "NEPAL",
		},
		{
			label: "NETHERLANDS",
		},
		{
			label: "NETHERLANDS ANTILLES",
		},
		{
			label: "NEUTRAL ZONE(BET.S.ARABIA)",
		},
		{
			label: "NEW CALEDONIA",
		},
		{
			label: "NEW ZEALAND",
		},
		{
			label: "NICARAGUA",
		},
		{
			label: "NIGER",
		},
		{
			label: "NIGERIA",
		},
		{
			label: "NIUE",
		},
		{
			label: "NORFOLK ISLAND",
		},
		{
			label: "NORTHERN MARIANA ISLANDS",
		},
		{
			label: "NORWAY",
		},
		{
			label: "OMAN",
		},
		{
			label: "OTHERS",
		},
		{
			label: "PACIFIC ISLANDS",
		},
		{
			label: "PACIFIC ISLANDS (TRUST TER)",
		},
		{
			label: "PAKISTAN",
		},
		{
			label: "PALAU",
		},
		{
			label: "PANAMA",
		},
		{
			label: "PAPUA NEW GUINEA",
		},
		{
			label: "PARAGUAY",
		},
		{
			label: "PERU",
		},
		{
			label: "PHILIPPINES",
		},
		{
			label: "PITCAIRN",
		},
		{
			label: "POLAND",
		},
		{
			label: "PORTUGAL",
		},
		{
			label: "PUERTO RICO",
		},
		{
			label: "QATAR",
		},
		{
			label: "REUNION",
		},
		{
			label: "ROMANIA",
		},
		{
			label: "RUSSIA",
		},
		{
			label: "RWANDA",
		},
		{
			label: "SAINT LUCIA",
		},
		{
			label: "SAINT VINCENT AND THE GRENE",
		},
		{
			label: "SAMOA",
		},
		{
			label: "SAN MARINO",
		},
		{
			label: "SAO TOME AND PRINCIPE",
		},
		{
			label: "SAUDI ARABIA",
		},
		{
			label: "SENEGAL",
		},
		{
			label: "SEYCHELLES",
		},
		{
			label: "SIERRA LEONE",
		},
		{
			label: "SINGAPORE",
		},
		{
			label: "SLOVENIA",
		},
		{
			label: "SOLOMON ISLANDS",
		},
		{
			label: "SOMALIA",
		},
		{
			label: "SOUTH AFRICA",
		},
		{
			label: "SPAIN",
		},
		{
			label: "SRI LANKA",
		},
		{
			label: "ST.HELENA",
		},
		{
			label: "ST.KITTS-NEVIS-ANGUILLA",
		},
		{
			label: "ST.PIERRE AND MIQUELON",
		},
		{
			label: "SUDAN",
		},
		{
			label: "SURINAME",
		},
		{
			label: "SVALBARD AND JAN MAYEN ISL",
		},
		{
			label: "SWAZILAND",
		},
		{
			label: "SWEDEN",
		},
		{
			label: "SWITZERLAND",
		},
		{
			label: "SYRIAN ARAB REPUBLIC",
		},
		{
			label: "TAIWAN",
		},
		{
			label: "TAJIKISTAN",
		},
		{
			label: "TANZANIA, UNITED REPUBLIC",
		},
		{
			label: "THAILAND",
		},
		{
			label: "TOGO",
		},
		{
			label: "TOKELAU",
		},
		{
			label: "TONGA",
		},
		{
			label: "TRINIDAD AND TOBAGO",
		},
		{
			label: "TUNISIA",
		},
		{
			label: "TURKEY",
		},
		{
			label: "TURKMENISTAN",
		},
		{
			label: "TURKS AND CAICOS ISLANDS",
		},
		{
			label: "TUVALU",
		},
		{
			label: "UGANDA",
		},
		{
			label: "UKRAINE",
		},
		{
			label: "UNITED ARAB EMIRATES",
		},
		{
			label: "UNITED KINGDOM",
		},
		{
			label: "UNITED STATES",
		},
		{
			label: "UNITED STATES MINOR OUTLYING",
		},
		{
			label: "UPPER VOLTA",
		},
		{
			label: "URUGUAY",
		},
		{
			label: "USSR",
		},
		{
			label: "UZBEKISTAN",
		},
		{
			label: "VANUATU",
		},
		{
			label: "VATICAN CITY STATE (HOLY S)",
		},
		{
			label: "VENEZUELA",
		},
		{
			label: "VIETNAM",
		},
		{
			label: "VIRGIN ISLANDS UNITED STATES",
		},
		{
			label: "WAKE ISLAND",
		},
		{
			label: "WALLIS AND FUTUNA ISLANDS",
		},
		{
			label: "WESTERN SAHARA",
		},
		{
			label: "YEMEN DEMOCRATIC",
		},
		{
			label: "YEMEN, REPUBLIC OF",
		},
		{
			label: "YUGOSLAVIA",
		},
		{
			label: "ZAIRE",
		},
		{
			label: "ZAMBIA",
		},
		{
			label: "ZIMBABWE",
		},
	];

	let pr_status_options = [
		{
			label: "No PR",
		},
		{
			label: "Foreign PR",
		},
	];

	let educations_detail_options = [
		{
			label: "NONE",
		},
		{
			label: "PRIMARY",
		},
		{
			label: "SECONDARY",
		},
		{
			label: "CERTIFICATE",
		},
		{
			label: "PRE-UNIVERSITY",
		},
		{
			label: "DIPLOMA",
		},
		{
			label: "DEGREE",
		},
		{
			label: "MASTER",
		},
		{
			label: "DOCTORATE",
		},
		{
			label: "PROFESSIONAL",
		},
	];

	let occupation_options = [
		{
			label: "Other Outside Labour Force",
		},
		{
			label: "Retiree",
		},
		{
			label: "Student",
		},
		{
			label: "Housewife/Househusband",
		},
		{
			label: "Armed Forces Occupations",
		},
		{
			label: "Elementary Occupations",
		},
		{
			label: "Plant and Machine Operators, and Assemblers",
		},
		{
			label: "Craft and Related Trades Workers",
		},
		{
			label:
				"Skilled Agricultural, Forestry, Livestock and Fishery Workers",
		},
		{
			label: "Service and Sales Workers",
		},
		{
			label: "Clerical Support Workers",
		},
		{
			label: "Regulatory Government Associate Professionals",
		},
		{
			label: "Social, Cultural and Related Associate Professionals",
		},
		{
			label: "Information and Communications Technicians",
		},
		{
			label: "Legal Associate Professionals",
		},
		{
			label: "Business and Administrations Associate Professionals",
		},
		{
			label: "Health Associate Professionals",
		},
		{
			label: "Science and Engineering Associate Professionals",
		},
		{
			label: "Regulatory Government Professionals",
		},
		{
			label: "Social and Cultural Professionals",
		},
		{
			label: "Hospitality and Related Services Professionals",
		},
		{
			label: "Legal Professionals n.e.c.",
		},
		{
			label: "Judges",
		},
		{
			label: "Lawyers",
		},
		{
			label: "Information and Communications Technology Professionals",
		},
		{
			label: "Sales, Marketing and Public Relations Professionals",
		},
		{
			label: "Administration Professionals",
		},
		{
			label: "Financial Analysts",
		},
		{
			label: "Financial and Investment Advisers",
		},
		{
			label: "Accountants",
		},
		{
			label: "Teaching Professionals",
		},
		{
			label: "Health Professionals Not Elsewhere Classified",
		},
		{
			label: "Optometrists and Ophthalmic Opticians",
		},
		{
			label: "Pharmacists",
		},
		{
			label: "Dentists",
		},
		{
			label: "Nursing and Midwifery Professionals",
		},
		{
			label: "Medical Doctors",
		},
		{
			label: "Science and Engineering Professionals",
		},
		{
			label: "Services Managers",
		},
		{
			label: "Information and Communications Technology Managers",
		},
		{
			label: "Hospitality, Retail and Other Services Managers",
		},
		{
			label: "Production and Manufacturing Managers",
		},
		{
			label: "Administrative and Commercial Managers",
		},
		{
			label: "Managing Directors and Chief Executives",
		},
		{
			label: "Legislators and Senior Officials",
		},
	];

	let job_title_options = [
		{
			label: "UNIFORM PERSONNEL",
		},
		{
			label: "SUPERVISOR",
		},
		{
			label: "SEMI SKILLED WORKERS",
		},
		{
			label: "SENIOR MANAGEMENT",
		},
		{
			label: "SENIOR OFFICER",
		},
		{
			label: "SELF EMPLOYED",
		},
		{
			label: "PROFESSIONAL",
		},
		{
			label: "OPERATOR (FACTORY)",
		},
		{
			label: "OTHER PROFESSION",
		},
		{
			label: "OFFICER",
		},
		{
			label: "NOT APPLICABLE",
		},
		{
			label: "NON-FIXED INCOME EARNER",
		},
		{
			label: "NON-CLERICAL",
		},
		{
			label: "MANAGERIAL",
		},
		{
			label: "MANAGER",
		},
		{
			label: "MINISTER",
		},
		{
			label: "HOUSEWIFE",
		},
		{
			label: "GENERAL MANAGER",
		},
		{
			label: "GENERAL WORKER",
		},
		{
			label: "FOREIGN WORKER",
		},
		{
			label: "EXECUTIVE",
		},
		{
			label: "DIRECTOR",
		},
		{
			label: "CONSULTANT",
		},
		{
			label: "CLERICAL",
		},
		{
			label: "CHAIRMAN",
		},
		{
			label: "ASSISTANT MANAGER",
		},
	];

	let bmmb_staff_options = [
		{
			label: "No",
		},
		{
			label: "Yes",
		},
	];
	let employment_type_options = [
		{
			label: "Employer",
		},
		{
			label: "Self employed",
		},
		{
			label: "Private Employee",
		},
		{
			label: "Government Employee",
		},
		{
			label: "Outside Labour Force",
		},
	];
	let employment_sector_options = [
		{
			label: "Agriculture, Forestry & Fishing",
		},
		{
			label: "Information & Communication",
		},
		{
			label: "Human Health & Social Work Activities",
		},
		{
			label: "Other Service Activities",
		},
		{
			label: "Professional, Scientific & Technical Activities",
		},
		{
			label: "Administrative & Support Service Activities",
		},
		{
			label: "Education",
		},
		{
			label: "Public Admin & Defence,Compulsory Social Security",
		},
		{
			label: "Not Applicable",
		},
	];
	let nature_of_business_options = [
		{
			label: "OTHERS",
		},
		{
			label: "MANUFACTURING",
		},
		{
			label: "TEXTILES",
		},
		{
			label: "TRAVEL/TRANSPORTATION",
		},
		{
			label: "TELECOMMUNICATIONS/NETWORKING",
		},
		{
			label: "SOCIAL SERVICES",
		},
		{
			label: "SERVICES",
		},
		{
			label: "REAL ESTATE",
		},
		{
			label: "PHARMACEUTICALS",
		},
		{
			label: "GEOLOGY",
		},
		{
			label: "NON-PROFIT ORGANIZATION",
		},
		{
			label: "MEDICAL/HEALTH SERVICES",
		},
		{
			label: "MEDIA/PUBLISHING/ENTERTAINMENT/ARTS",
		},
		{
			label: "JOURNALIST/EDITOR",
		},
		{
			label: "INVESTMENT",
		},
		{
			label: "HUMAN RESOURCES",
		},
		{
			label: "HOTEL/FOOD",
		},
		{
			label: "RECREATION/HOSPITALITY/SPORTS",
		},
		{
			label: "GOVERNMENT/MILITARY/PUBLIC SERVICE",
		},
		{
			label: "FREIGHT/SHIPPING",
		},
		{
			label: "FINANCE/BANKING/INSURANCE",
		},
		{
			label: "ENGINEERING",
		},
		{
			label: "ENERGY/MINING",
		},
		{
			label: "EDUCATION(INCLUDES STUDENTS)/TRAINING",
		},
		{
			label: "CUSTOMER SERVICE",
		},
		{
			label: "CREATIVE/GRAPHICS",
		},
		{
			label: "CONSTRUCTION",
		},
		{
			label: "COMPUTERS/ELECTRONICS",
		},
		{
			label: "BUYING RETAIL",
		},
		{
			label: "AVIATION",
		},
		{
			label: "AUTOMOTIVE/MANUFACTURING.PRODUCTION",
		},
		{
			label: "ARCHITECTURE",
		},
		{
			label: "AGRICULTURAL/CHEMICALS/FOREST PRODUCTS",
		},
		{
			label: "AEROSPACE",
		},
		{
			label: "ADVERTISING/MARKETING/PR",
		},
		{
			label: "ACTUARIAL/STATISTIC",
		},
		{
			label: "ACCOUNTING",
		},
	];

	let bmmb_high_net_worth_options = [
		{
			label: "Yes",
		},
		{
			label: "No",
		},
	];

	let pep_related_options = [
		{
			label: "Yes",
		},
		{
			label: "No",
		},
	];

	let property_ownership_options = [
		{
			label: "UNKNOWN",
		},
		{
			label: "RENTED",
		},
		{
			label: "HOSTEL",
		},
		{
			label: "RELATIVES",
		},
		{
			label: "QUARTERS",
		},
		{
			label: "PARENT",
		},
		{
			label: "OWNED",
		},
	];

	let race_options = [
		{
			label: "MALAY",
		},
		{
			label: "SABAH",
		},
		{
			label: "SARAWAK",
		},
		{
			label: "CHINESE",
		},
		{
			label: "INDIAN",
		},
		{
			label: "OTHERS",
		},
	];

	let gender_options = [
		{
			label: "Male",
		},
		{
			label: "Female",
		},
	];

	let maritial_status_options = [
		{
			label: "UNKNOWN",
		},
		{
			label: "SINGLE",
		},
		{
			label: "Primary",
		},
		{
			label: "MARRIED",
		},
		{
			label: "DIVORCED",
		},
		{
			label: "WIDOWED",
		},
	];

	let contact_relationship_options = [
		{
			label: "Father",
		},
		{
			label: "Mother",
		},
		{
			label: "Sibling",
		},
		{
			label: "Other",
		},
	];

	let bmmb_account_type_options = [
		{
			label: "Saving Account (SA)",
		},
		{
			label: "Current Account (CA)",
		},
		{
			label: "Fixed Term Account (FA)",
		},
	];

	let purpose_of_account_options = [
		{
			label: "Payroll/Saving",
		},
		{
			label: "Saving & Payment",
		},
		{
			label: "Financing Disbursement",
		},
		{
			label: "Receive Payment from 3rd Parties",
		},
		{
			label: "Deposit Campaign",
		},
	];

	let product_to_open_options = [
		{
			label: "SA MuSS",
		},
		{
			label: "SA One Reach",
		},
	];

	let prefered_branch_options = [
		{
			label: "(ALOR SETAR) SOUQ AL BUKHARY",
		},
		{
			label: "ALAM DAMAI",
		},
		{
			label: "ALOR SETAR",
		},
		{
			label: "AMPANG POINT",
		},
		{
			label: "BANDAR BARU BANGI",
		},
		{
			label: "BATU CAVES",
		},
		{
			label: "BATU PAHAT",
		},
		{
			label: "BAYAN BARU",
		},
		{
			label: "BINTULU",
		},
		{
			label: "EAST COAST SALES HUB (KOTA BHARU)",
		},
		{
			label: "GEMAS",
		},
		{
			label: "GLENMARIE",
		},
		{
			label: "GUA MUSANG",
		},
		{
			label: "IPOH",
		},
		{
			label: "JALAN IPOH",
		},
		{
			label: "JALAN MELAKA",
		},
		{
			label: "JALAN SULTAN YAHYA PETRA",
		},
		{
			label: "JALAN TUANKU ABD RAHMAN",
		},
		{
			label: "JELI",
		},
		{
			label: "JOHOR BAHRU",
		},
		{
			label: "JOHOR JAYA",
		},
		{
			label: "KAJANG",
		},
		{
			label: "KAMPUNG RAJA",
		},
		{
			label: "KANGAR",
		},
		{
			label: "KELANG",
		},
		{
			label: "KEMAMAN",
		},
		{
			label: "KLUANG",
		},
		{
			label: "KOK LANAS",
		},
		{
			label: "KOTA BHARU",
		},
		{
			label: "KOTA KINABALU",
		},
		{
			label: "KOTA TINGGI",
		},
		{
			label: "KUALA LUMPUR SALES HUB",
		},
		{
			label: "KUALA TERENGGANU",
		},
		{
			label: "KUANTAN",
		},
		{
			label: "KUCHING",
		},
		{
			label: "KULAI",
		},
		{
			label: "KULIM",
		},
		{
			label: "LABUAN",
		},
		{
			label: "LAMAN SERI",
		},
		{
			label: "LEBUH PANTAI",
		},
		{
			label: "MELAKA",
		},
		{
			label: "MENTAKAB",
		},
		{
			label: "MIRI",
		},
		{
			label: "MUAR",
		},
		{
			label: "NORTHERN SALES HUB",
		},
		{
			label: "PARIT BUNTAR",
		},
		{
			label: "PEKAN",
		},
		{
			label: "PETALING JAYA",
		},
		{
			label: "PKNS, SHAH ALAM",
		},
		{
			label: "PORT DICKSON",
		},
		{
			label: "PUNCAK ALAM",
		},
		{
			label: "PUTRAJAYA",
		},
		{
			label: "RAWANG",
		},
		{
			label: "SABAH SALES HUB",
		},
		{
			label: "SANDAKAN",
		},
		{
			label: "SARAWAK SALES HUB",
		},
		{
			label: "SEBERANG JAYA",
		},
		{
			label: "SEGAMAT",
		},
		{
			label: "SELANGOR SALES HUB (PKNS)",
		},
		{
			label: "SEREMBAN",
		},
		{
			label: "SERI MANJUNG",
		},
		{
			label: "SOUTHERN SALES HUB (JOHOR)",
		},
		{
			label: "SUBANG JAYA",
		},
		{
			label: "SUNGAI BESI",
		},
		{
			label: "SUNGAI PETANI",
		},
		{
			label: "TAIPING",
		},
		{
			label: "TAMAN CHENG BARU",
		},
		{
			label: "TAMAN MELAWATI",
		},
		{
			label: "TAMAN UNIVERSITI",
		},
		{
			label: "TANAH MERAH",
		},
		{
			label: "TAWAU",
		},
		{
			label: "TEMERLOH",
		},
		{
			label: "UNIVERSITY ISLAM ANTARABANGSA",
		},
		{
			label: "UTHM",
		},
	];

	let form_display = {
		full_name: {
			display: false,
			disable: false,
		},
		type_of_id: {
			display: false,
			disable: false,
		},
		id_number: {
			display: false,
			disable: false,
		},
		passport_number: {
			display: false,
			disable: false,
		},
		nationality: {
			display: false,
			disable: false,
		},
		pr_status: {
			display: false,
			disable: false,
		},
		pr_id_number: {
			display: false,
			disable: false,
		},
		pr_country: {
			display: false,
			disable: false,
		},
		date_of_birth: {
			display: false,
			disable: false,
		},
		us_related: {
			display: true,
			disable: false,
		},
		educations_detail: {
			display: true,
			disable: false,
		},
		occupation: {
			display: true,
			disable: false,
		},
		job_title: {
			display: true,
			disable: false,
		},
		bmmb_staff: {
			display: true,
			disable: false,
		},
		bmmb_staff_id: {
			display: true,
			disable: false,
		},
		employment_type: {
			display: true,
			disable: false,
		},
		employment_sector: {
			display: true,
			disable: false,
		},
		monthly_basic_salary: {
			display: true,
			disable: false,
		},
		monthly_other_salary: {
			display: true,
			disable: false,
		},
		employer_name: {
			display: true,
			disable: false,
		},
		nature_of_business: {
			display: true,
			disable: false,
		},
		no_of_other_banks_used: {
			display: true,
			disable: false,
		},
		bmmb_high_net_worth: {
			display: true,
			disable: false,
		},
		pep_related: {
			display: true,
			disable: false,
		},
		local_address: {
			display: true,
			disable: false,
		},
		local_postal_code: {
			display: true,
			disable: false,
		},
		local_city: {
			display: true,
			disable: false,
		},
		local_state_code: {
			display: true,
			disable: false,
		},
		local_coutry: {
			display: true,
			disable: false,
		},
		foreign_address: {
			display: true,
			disable: false,
		},
		foreign_postal_code: {
			display: true,
			disable: false,
		},
		foreign_city: {
			display: true,
			disable: false,
		},
		foreign_state_code: {
			display: true,
			disable: false,
		},
		foreign_coutry: {
			display: true,
			disable: false,
		},
		mailing_address: {
			display: false,
			disable: false,
		},
		mailing_postal_code: {
			display: true,
			disable: false,
		},
		mailing_city: {
			display: true,
			disable: false,
		},
		mailing_state_code: {
			display: true,
			disable: false,
		},
		mailing_coutry: {
			display: true,
			disable: false,
		},
		property_ownership: {
			display: true,
			disable: false,
		},
		mobile_number: {
			display: true,
			disable: false,
		},
		office_number: {
			display: true,
			disable: false,
		},
		email_address: {
			display: true,
			disable: false,
		},
		race: {
			display: true,
			disable: false,
		},
		gender: {
			display: true,
			disable: false,
		},
		maritial_status: {
			display: true,
			disable: false,
		},
		spouse_name: {
			display: true,
			disable: false,
		},
		no_of_dependents: {
			display: true,
			disable: false,
		},
		contact_person_name: {
			display: true,
			disable: false,
		},
		contact_relationship: {
			display: true,
			disable: false,
		},
		contact_mobile_number: {
			display: true,
			disable: false,
		},
		bmmb_account_type: {
			display: true,
			disable: false,
		},
		purpose_of_account: {
			display: true,
			disable: false,
		},
		product_to_open: {
			display: true,
			disable: false,
		},
		prefered_branch: {
			display: true,
			disable: false,
		},
	};

	$: if (output.us_related == "no") {
		form_display.full_name.display = true;
		form_display.type_of_id.display = true;
		form_display.nationality.display = true;
		// form_display.pr_status.display = true;
		// form_display.pr_id_number.display = true;
		// form_display.pr_country.display = true;
		form_display.date_of_birth.display = true;
	} else {
		form_display.full_name.display = false;
		form_display.type_of_id.display = false;
		form_display.nationality.display = false;
		form_display.date_of_birth.display = false;
	}

	// $: if (
	// 	form_display.type_of_id.display &&
	// 	!output.type_of_id == "passport"
	// ) {
	// 	form_display.id_number.display = true;
	// 	form_display.passport_number.display = false;
	// } else {
	// 	form_display.id_number.display = false;
	// 	form_display.passport_number.display = true;
	// }

	$: form_display.id_number.display =
		form_display.type_of_id.display && output.type_of_id != "passport"
			? true
			: false;

	$: form_display.passport_number.display =
		form_display.type_of_id.display && output.type_of_id == "passport"
			? true
			: false;

	$: form_display.nationality.disable =
		form_display.type_of_id.display && output.type_of_id != "passport"
			? true
			: false;

	$: form_display.pr_status.display =
		form_display.id_number.display &&
		!(output.type_of_id == "mypr" || output.type_of_id == "passport")
			? true
			: false;
	$: form_display.pr_id_number.display =
		form_display.id_number.display && output.pr_status == "foreign pr"
			? true
			: false;
	$: form_display.pr_country.display =
		form_display.id_number.display && output.pr_status == "foreign pr"
			? true
			: false;
	$: form_display.date_of_birth.disable =
		form_display.id_number.display && output.type_of_id != "passport"
			? true
			: false;

	let dob = "";
	$: if (form_display.date_of_birth.display && output.id_number.length >= 6) {
		let century = output.id_number.slice(0, 2) > 21 ? "19" : "20";
		let year = century + output.id_number.slice(0, 2);
		let month = output.id_number.slice(2, 4);
		let day = output.id_number.slice(4, 6);
		dob = `${year}-${month}-${day}`;
		update_dob(dob);
	}

	$: if (output.type_of_id !== "passport") {
		output.nationality = "malaysia";
	}

	$: form_display.bmmb_staff_id.display =
		output.bmmb_staff != "no" ? true : false;

	$: form_display.employment_type.display =
		output.bmmb_staff != "yes" ? true : false;
	$: form_display.employment_sector.display =
		output.bmmb_staff != "yes" ? true : false;
	$: form_display.employer_name.display =
		output.bmmb_staff != "yes" ? true : false;
	$: form_display.nature_of_business.display =
		output.bmmb_staff != "yes" ? true : false;

	$: form_display.mailing_address.display =
		output.mail_same_local != "yes" ? true : false;
	$: form_display.mailing_postal_code.display =
		output.mail_same_local != "yes" ? true : false;
	$: form_display.mailing_city.display =
		output.mail_same_local != "yes" ? true : false;
	$: form_display.mailing_state_code.display =
		output.mail_same_local != "yes" ? true : false;
	$: form_display.mailing_coutry.display =
		output.mail_same_local != "yes" ? true : false;

	function update_dob(dob) {
		output.date_of_birth = dob;
	}

	let next_disabled = true;
	$: if (output.us_related == "no") {
		next_disabled = next_step1();
	}

	function next_step1() {
		if (step == 1) {
			if (output.us_related == "") {
				return true;
			}
			if (form_display.full_name.display && output.full_name == "") {
				return true;
			}
			if (form_display.type_of_id.display && output.type_of_id == "") {
				return true;
			}
			if (form_display.id_number.display && output.id_number == "") {
				return true;
			}
			if (
				form_display.passport_number.display &&
				output.passport_number == ""
			) {
				return true;
			}
			if (form_display.nationality.display && output.nationality == "") {
				return true;
			}
			if (form_display.pr_status.display && output.pr_status == "") {
				return true;
			}
			if (
				form_display.pr_id_number.display &&
				output.pr_id_number == ""
			) {
				return true;
			}
			if (form_display.pr_country.display && output.pr_country == "") {
				return true;
			}
			if (
				form_display.date_of_birth.display &&
				output.date_of_birth == ""
			) {
				return true;
			}
		}
		if (step == 2) {
			if (
				form_display.monthly_basic_salary.display &&
				output.monthly_basic_salary == ""
			) {
				return true;
			}
			if (
				form_display.monthly_other_salary.display &&
				output.monthly_other_salary == ""
			) {
				return true;
			}
		}
		if (step == 3) {
			if (
				form_display.local_address.display &&
				output.local_address == ""
			) {
				return true;
			}
			if (
				form_display.local_postal_code.display &&
				output.local_postal_code == ""
			) {
				return true;
			}
			if (form_display.local_city.display && output.local_city == "") {
				return true;
			}
			if (
				form_display.local_state_code.display &&
				output.local_state_code == ""
			) {
				return true;
			}

			if (
				form_display.local_coutry.display &&
				output.local_coutry == ""
			) {
				return true;
			}
		}
		if (step == 4) {
			if (
				form_display.mobile_number.display &&
				output.mobile_number == ""
			) {
				return true;
			}

			if (
				form_display.email_address.display &&
				output.email_address == ""
			) {
				return true;
			}
		}
		if (step == 5) {
			if (
				form_display.contact_person_name.display &&
				output.contact_person_name == ""
			) {
				return true;
			}

			if (
				form_display.contact_mobile_number.display &&
				output.contact_mobile_number == ""
			) {
				return true;
			}
		}

		return false;
	}

	function next_page() {
		step += 1;
		if (step > last_step) {
			step = 1;
		}
	}

	function prev_page() {
		step -= 1;
		if (step == 0) {
			step = 1;
		}
	}
</script>

<svelte:head>
	<link
		rel="stylesheet"
		href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css"
	/>
</svelte:head>

<div class="container-fluid mt-3">
	<div class="row">
		<div class="offset-2 col-8">
			<div class="card">
				<div class="card-body">
					<h1 class="card-title">Saving Application Application</h1>
					<h4 class="card-text">Basic Informations</h4>
		
					<div class="row">
						<div class="col-md-6">
							<p>Are you a US Citizen or US Indicia:</p>
						</div>
					</div>
					<div class="row">
						<div class="col-md-6">
							<div class="form-check">
								<label class="form-check-label">
								<input type="radio" class="form-check-input" name="RadioBtnCitizen" id="citizenYes" value="checkedValue" checked>
								Yes
							  </label>
							</div>
							<div class="form-check">
								<label class="form-check-label">
								<input type="radio" class="form-check-input" name="RadioBtnCitizen" id="citizenNo" value="checkedValue" checked>
								No
							  </label>
							</div>
						</div>
					</div>
					<div class="row mt-3">
						<div class="col-12">
							<div class="form-group">
							  <label for="">Full Name</label>
							  <input type="text" name="txtName" id="name" class="form-control" placeholder="Full Name">
							  <small id="helpId" class="form-text text-muted"> Please ensure name as per MyKad</small>
							</div>
						</div>
					</div>
					<div class="row">
						<div class="col-6">
							<div class="form-group">
							  <label for="">Type of Identification</label>
							  <select class="form-control" name="SelectID" id="typeofId">
								<option>MyKad</option>
								<option>Army Personnel</option>
								<option>Police Personnel</option>
								<option>My PR</option>
								<option>Passport</option>
							  </select>
							</div>
						</div>
						<div class="col-6">
							<div class="form-group">
								<label for="">ID Number</label>
								<input type="text" name="txtIdNumber" id="idNumber" class="form-control" placeholder="Full Name">
							  </div>
						</div>
					</div>
					<div class="row">
						<div class="col-6">
							<div class="form-group">
							  <label for="">Nationality</label>
							  <select class="form-control" name="selectNationality" id="nationality">
								<option>--Please Select--</option>
								<option>AFGHANISTAN</option>
								<option>MALAYSIA</option>
							  </select>
							</div>
						</div>
						<div class="col-6">
							<div class="form-group">
								<label for="">Date of Birth</label>
								<input type="text"
								  class="form-control" name="txtDOB" id="DOB" placeholder="">
							  </div>
						</div>
					</div>
					<div class="row mt-3">
						<div class="col-md-6">
							<a name="" id="" class="btn btn-primary" href="#" role="button">Next</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
	<div class="row mt-3">
		<div class="offset-2 col-8">
			<div class="card">
				<div class="card-body">
					<h2 class="card-text">Employment Details</h2>

					<div class="row">
						<div class="col-12">
							<div class="form-group">
							  <label for="">Educational Level</label>
							  <select class="form-control" name="eduLevel" id="eduLevel">
								<option>--Please Select--</option>
								<option>Primary</option>
								<option>Secondary</option>
								<option>Certificate</option>
								<option>Pre-University</option>
								<option>Diploma</option>
								<option>Degree</option>
								<option>Master</option>
								<option>Doctorate</option>
								<option>Professional</option>
							  </select>
							</div>
						</div>
					</div>
					<div class="row">
						<div class="col-6">
							<div class="form-group">
							  <label for="">Occupation</label>
							  <select class="form-control" name="occupation" id="occupation">
								<option>--Please Select--</option>
								<option>Accountant</option>
								<option>Housewife/Househusband</option>
							  </select>
							</div>
						</div>
						<div class="col-6">
							<div class="form-group">
								<label for="">Job Title</label>
								<select class="form-control" name="occupation" id="occupation">
								  <option>--Please Select--</option>
								  <option>Officer</option>
								  <option>Manager</option>
								  <option>Professional</option>
								</select>
							  </div>
						</div>
					</div>
					<div class="row">
						<div class="col-6">
							<p>BMMB Staff?</p>
						</div>
					</div>
					<div class="row">
						<div class="col-md-6">
							<div class="form-check form-check-inline">
								<label class="form-check-label">
								<input type="radio" class="form-check-input" name="RadioBtnCitizen" id="citizenYes" value="checkedValue" checked>
								Yes
							  </label>
							</div>
							<div class="form-check form-check-inline">
								<label class="form-check-label">
								<input type="radio" class="form-check-input" name="RadioBtnCitizen" id="citizenNo" value="checkedValue" checked>
								No
							  </label>
							</div>
						</div>
					</div>
					<div class="row mt-3">
						<div class="col-12">
							<div class="form-group">
							  <label for="">BMMB Staff ID:</label>
							  <input type="text"
								class="form-control" name="txtStaffID" id="staffID" placeholder="BMMB Staff ID">
							</div>
						</div>
					</div>
					<div class="row">
						<div class="col-6">
							<div class="form-group">
								<label for="">Monthly Basic Salary:</label>
								<input type="text"
								  class="form-control" name="txtStaffSalary" id="staffBasicSalary" placeholder="Monthly Basic Salary">
							  </div>
						</div>
						<div class="col-6">
							<div class="form-group">
								<label for="">Monthly Other Salary:</label>
								<input type="text"
								  class="form-control" name="txtStaffCommitment" id="StaffCommitment" placeholder="Monthly Other Salary">
							  </div>
						</div>
					</div>
					<div class="row">
						<div class="col-12">
							<div class="form-group">
							  <label for="">No. of Other Banks Used:</label>
							  <input type="text"
								class="form-control" name="txtNoOfBankUsed" id="noOfBankUsed" placeholder="No. of Other Banks Used:">
								</div>
						</div>
					</div>
					<div class="row">
						<div class="col-6">
							<div class="form-group">
								<label for="">Employment Type:</label>
								<input type="text"
								  class="form-control" name="txtEmploymentType" id="employmentType" placeholder="Employment Type">
							  </div>
						</div>
						<div class="col-6">
							<div class="form-group">
								<label for="">Employment Sector:</label>
								<input type="text"
								  class="form-control" name="txtEmploymentSector" id="employmentSector" placeholder="Employment Sectory">
							  </div>
						</div>
					</div>
					<div class="row">
						<div class="col-6">
							<div class="form-group">
								<label for="">Monthly Basic Salary:</label>
								<input type="text"
								  class="form-control" name="txtSalary" id="basicSalary" placeholder="Monthly Basic Salary">
							  </div>
						</div>
						<div class="col-6">
							<div class="form-group">
								<label for="">Monthly Other Salary:</label>
								<input type="text"
								  class="form-control" name="txtCommitment" id="Commitment" placeholder="Monthly Other Salary">
							  </div>
						</div>
					</div>
					<div class="row">
						<div class="col-6">
							<div class="form-group">
								<label for="">Employer Name:</label>
								<input type="text"
								  class="form-control" name="txtEmployerName" id="employerName" placeholder="Employer Name">
							  </div>
						</div>
						<div class="col-6">
							<div class="form-group">
								<label for="">Nature of Business:</label>
								<input type="text"
								  class="form-control" name="txtnatureOfBusiness" id="natureOfBusiness" placeholder="Nature of Business">
							  </div>
						</div>
					</div>
					<div class="row">
						<div class="col-12">
							<div class="form-group">
							  <label for="">No. of Other Banks Used:</label>
							  <input type="text"
								class="form-control" name="txtNoOfBankUsed" id="noOfBankUsed" placeholder="No. of Other Banks Used:">
								</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>



<div class="container">
	<div class="row">
		<div class="col">
			<form>
				<h1>DOA Form</h1>
				{#if step == 1}
					<h2>Basic Infomations</h2>
					{#if form_display.us_related.display}
						<Radio
							label="Are you a US Citizen or US Indicia"
							bind:output={output.us_related}
						/>
					{/if}
					{#if form_display.full_name.display}
						<Input
							label="Full Name"
							bind:output={output.full_name}
						/>
					{/if}
					{#if form_display.type_of_id.display}
						<Select
							label="Type of Identifications (ID)"
							values={id_type_options}
							bind:output={output.type_of_id}
						/>
					{/if}
					{#if form_display.id_number.display}
						<Number
							label="ID Number"
							bind:output={output.id_number}
							pattern="[0-9]{'{'}12{'}'}"
							title="Please enter your id number"
						/>
					{/if}
					{#if form_display.passport_number.display}
						<Number
							label="Passport Number"
							bind:output={output.passport_number}
							pattern="[0-9]{'{'}12{'}'}"
							title="Please enter your id number"
						/>
					{/if}
					{#if form_display.nationality.display}
						<Select
							label="Nationality"
							values={nationality_options}
							bind:output={output.nationality}
							disabled={form_display.nationality.disable}
						/>
					{/if}
					{#if form_display.pr_status.display}
						<Radio
							label="PR Status"
							values={pr_status_options}
							bind:output={output.pr_status}
						/>
					{/if}
					{#if form_display.pr_id_number.display}
						<Input
							label="PR ID Number"
							bind:output={output.pr_id_number}
						/>
					{/if}
					{#if form_display.pr_country.display}
						<Select
							label="PR County"
							values={nationality_options}
							bind:output={output.pr_country}
						/>
					{/if}
					{#if form_display.date_of_birth.display}
						<Date
							label="Date Of Birth"
							bind:output={output.date_of_birth}
							disabled={form_display.date_of_birth.disable}
						/>
					{/if}
				{:else if step == 2}
					<h2>Employment Details</h2>
					{#if form_display.educations_detail.display}
						<Select
							label="Education Level"
							values={educations_detail_options}
							bind:output={output.educations_detail}
						/>
					{/if}
					{#if form_display.occupation.display}
						<Select
							label="Occupation"
							values={occupation_options}
							bind:output={output.occupation}
						/>
					{/if}
					{#if form_display.job_title.display}
						<Select
							label="Job Title"
							values={job_title_options}
							bind:output={output.job_title}
						/>
					{/if}
					{#if form_display.bmmb_staff.display}
						<Select
							label="BMMB Staff?"
							values={bmmb_staff_options}
							bind:output={output.bmmb_staff}
						/>
					{/if}
					{#if form_display.bmmb_staff_id.display}
						<Number
							label="BMMB Staff ID Number"
							bind:output={output.bmmb_staff_id}
							pattern="[0-9]{'{'}6{'}'}"
							title="Please enter your id number"
						/>
					{/if}
					{#if form_display.employment_type.display}
						<Select
							label="Employment Type"
							values={employment_type_options}
							bind:output={output.employment_type}
						/>
					{/if}
					{#if form_display.employment_sector.display}
						<Select
							label="Employment Sector"
							values={employment_sector_options}
							bind:output={output.employment_sector}
						/>
					{/if}
					{#if form_display.monthly_basic_salary.display}
						<Number
							label="Monthly Basic Salary"
							bind:output={output.monthly_basic_salary}
							pattern="[0-9]{'{'}7{'}'}"
							title="Please enter your monthly basic salary"
						/>
					{/if}
					{#if form_display.monthly_other_salary.display}
						<Number
							label="Monthly Other Salary"
							bind:output={output.monthly_other_salary}
							pattern="[0-9]{'{'}7{'}'}"
							title="Please enter your monthly other salary"
						/>
					{/if}
					{#if form_display.employer_name.display}
						<Input
							label="Employer Name"
							bind:output={output.employer_name}
						/>
					{/if}
					{#if form_display.nature_of_business.display}
						<Select
							label="Nature Of Business"
							values={nature_of_business_options}
							bind:output={output.nature_of_business}
						/>
					{/if}
					{#if form_display.no_of_other_banks_used.display}
						<Number
							label="No. of Other Banks Used"
							bind:output={output.no_of_other_banks_used}
							pattern="[0-9]{'{'}7{'}'}"
							title="Please enter your number of other banks used"
						/>
					{/if}
				{:else if step == 3}
					<h2>Address Details</h2>
					{#if form_display.bmmb_high_net_worth.display}
						<Select
							label="Are you one of BMMB High Net worth customer?"
							values={bmmb_high_net_worth_options}
							bind:output={output.bmmb_high_net_worth}
						/>
					{/if}
					{#if form_display.pep_related.display}
						<Select
							label="Are you a Political Expose Person (PEP) or a Family Member(s) of PEP or Related Close Assosiate(s) of PEP?"
							values={pep_related_options}
							bind:output={output.pep_related}
						/>
					{/if}
					{#if form_display.local_address.display}
						<Input
							label="Address"
							bind:output={output.local_address}
						/>
					{/if}
					{#if form_display.local_postal_code.display}
						<Input
							label="Postal Code"
							bind:output={output.local_postal_code}
						/>
					{/if}

					{#if form_display.local_city.display}
						<Input label="City" bind:output={output.local_city} />
					{/if}

					{#if form_display.local_state_code.display}
						<Input
							label="State"
							bind:output={output.local_state_code}
						/>
					{/if}
					{#if form_display.local_coutry.display}
						<Input
							label="Country"
							bind:output={output.local_coutry}
						/>
					{/if}
					{#if form_display.foreign_address.display}
						<Input
							label="Foreign Address"
							bind:output={output.foreign_address}
						/>
					{/if}
					{#if form_display.foreign_postal_code.display}
						<Input
							label="Foreign Postal Code"
							bind:output={output.foreign_postal_code}
						/>
					{/if}

					{#if form_display.foreign_city.display}
						<Input
							label="Foreign City"
							bind:output={output.foreign_city}
						/>
					{/if}

					{#if form_display.foreign_state_code.display}
						<Input
							label="Foreign State"
							bind:output={output.foreign_state_code}
						/>
					{/if}
					{#if form_display.foreign_coutry.display}
						<Input
							label="Foreign Country"
							bind:output={output.foreign_coutry}
						/>
					{/if}

					<Select
						label="Mailing Address the same as Local Address"
						values={pep_related_options}
						bind:output={output.mail_same_local}
					/>

					{#if form_display.mailing_address.display}
						<Input
							label="Mailing Address"
							bind:output={output.mailing_address}
						/>
					{/if}
					{#if form_display.mailing_postal_code.display}
						<Input
							label="Mailing Postal Code"
							bind:output={output.mailing_postal_code}
						/>
					{/if}

					{#if form_display.mailing_city.display}
						<Input
							label="Mailing City"
							bind:output={output.mailing_city}
						/>
					{/if}

					{#if form_display.mailing_state_code.display}
						<Input
							label="Mailing State"
							bind:output={output.mailing_state_code}
						/>
					{/if}
					{#if form_display.mailing_coutry.display}
						<Input
							label="Mailing Country"
							bind:output={output.mailing_coutry}
						/>
					{/if}

					{#if form_display.property_ownership.display}
						<Select
							label="Property Ownership"
							values={property_ownership_options}
							bind:output={output.property_ownership}
						/>
					{/if}
				{:else if step == 4}
					<h2>Additional Infomations</h2>
					{#if form_display.mobile_number.display}
						<Number
							label="Mobile Number"
							bind:output={output.mobile_number}
							pattern="[0-9]{'{'}10,11{'}'}"
							title="Please enter your mobile number"
						/>
					{/if}
					{#if form_display.office_number.display}
						<Number
							label="Office Number"
							bind:output={output.office_number}
							pattern="[0-9]{'{'}10{'}'}"
							title="Please enter your number of other banks used"
						/>
					{/if}

					{#if form_display.email_address.display}
						<Input
							label="Email Address"
							bind:output={output.email_address}
						/>
					{/if}

					{#if form_display.race.display}
						<Select
							label="Race"
							values={race_options}
							bind:output={output.race}
						/>
					{/if}
					{#if form_display.gender.display}
						<Select
							label="Gender"
							values={gender_options}
							bind:output={output.gender}
						/>
					{/if}

					{#if form_display.maritial_status.display}
						<Select
							label="Maritial Status"
							values={maritial_status_options}
							bind:output={output.maritial_status}
						/>
					{/if}

					{#if form_display.no_of_dependents.display}
						<Number
							label="Number of Dependents"
							bind:output={output.no_of_dependents}
							pattern="[0-9]{'{'}2{'}'}"
							title="Please enter your number of other banks used"
						/>
					{/if}
				{:else if step == 5}
					<h2>Energcency Contact Person Details</h2>
					{#if form_display.contact_person_name.display}
						<Input
							label="Contact Person Name"
							bind:output={output.contact_person_name}
						/>
					{/if}
					{#if form_display.contact_relationship.display}
						<Select
							label="Relationship"
							values={contact_relationship_options}
							bind:output={output.contact_relationship}
						/>
					{/if}
					{#if form_display.contact_mobile_number.display}
						<Number
							label="Contact Person Mobile Number"
							bind:output={output.contact_mobile_number}
							pattern="[0-9]{'{'}10,11{'}'}"
							title="Please enter your mobile number"
						/>
					{/if}
				{:else if step == 6}
					<h2>Account Selections</h2>
					{#if form_display.bmmb_account_type.display}
						<Select
							label="Select the BMMB account type you wish to open"
							values={bmmb_account_type_options}
							bind:output={output.bmmb_account_type}
						/>
					{/if}
					{#if form_display.purpose_of_account.display}
						<Select
							label="Select purpose of account opening"
							values={purpose_of_account_options}
							bind:output={output.purpose_of_account}
						/>
					{/if}
					{#if form_display.product_to_open.display}
						<Select
							label="Select the product you wish to open"
							values={product_to_open_options}
							bind:output={output.product_to_open}
						/>
					{/if}
					{#if form_display.prefered_branch.display}
						<Select
							label="Prefered Branch"
							values={prefered_branch_options}
							bind:output={output.prefered_branch}
						/>
					{/if}
				{:else if step == 7}
					<h2>Confirm Page</h2>
				{/if}
				{#if step >= 2}<button type="button" on:click={prev_page}
						>Previous</button
					>{/if}
				{#if step < last_step}
					<button
						type="button"
						disabled={next_disabled}
						on:click={next_page}>Next</button
					>
				{/if}
				<br />
				<br />
			</form>
		</div>
	</div>
</div>
