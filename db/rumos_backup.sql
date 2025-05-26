--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

-- Started on 2025-05-26 20:02:07

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 872 (class 1247 OID 16414)
-- Name: heating_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.heating_type AS ENUM (
    'central',
    'individual',
    'district'
);


ALTER TYPE public.heating_type OWNER TO postgres;

--
-- TOC entry 869 (class 1247 OID 16404)
-- Name: property_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.property_type AS ENUM (
    'apartment',
    'officetel',
    'house',
    'studio'
);


ALTER TYPE public.property_type OWNER TO postgres;

--
-- TOC entry 863 (class 1247 OID 16388)
-- Name: user_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_role AS ENUM (
    'user',
    'agent',
    'admin'
);


ALTER TYPE public.user_role OWNER TO postgres;

--
-- TOC entry 866 (class 1247 OID 16396)
-- Name: verification_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.verification_status AS ENUM (
    'pending',
    'verified',
    'rejected'
);


ALTER TYPE public.verification_status OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 220 (class 1259 OID 16436)
-- Name: agents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.agents (
    agent_id integer NOT NULL,
    user_id integer NOT NULL,
    license_image character varying(255) NOT NULL,
    verification_status public.verification_status DEFAULT 'pending'::public.verification_status NOT NULL,
    company_name character varying(100),
    office_address text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.agents OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16435)
-- Name: agents_agent_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.agents_agent_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.agents_agent_id_seq OWNER TO postgres;

--
-- TOC entry 5047 (class 0 OID 0)
-- Dependencies: 219
-- Name: agents_agent_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.agents_agent_id_seq OWNED BY public.agents.agent_id;


--
-- TOC entry 230 (class 1259 OID 16542)
-- Name: board_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.board_categories (
    category_id integer NOT NULL,
    name character varying(50) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.board_categories OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16541)
-- Name: board_categories_category_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.board_categories_category_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.board_categories_category_id_seq OWNER TO postgres;

--
-- TOC entry 5048 (class 0 OID 0)
-- Dependencies: 229
-- Name: board_categories_category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.board_categories_category_id_seq OWNED BY public.board_categories.category_id;


--
-- TOC entry 234 (class 1259 OID 16574)
-- Name: board_comments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.board_comments (
    comment_id integer NOT NULL,
    post_id integer NOT NULL,
    user_id integer NOT NULL,
    content text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_deleted boolean DEFAULT false NOT NULL
);


ALTER TABLE public.board_comments OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 16573)
-- Name: board_comments_comment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.board_comments_comment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.board_comments_comment_id_seq OWNER TO postgres;

--
-- TOC entry 5049 (class 0 OID 0)
-- Dependencies: 233
-- Name: board_comments_comment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.board_comments_comment_id_seq OWNED BY public.board_comments.comment_id;


--
-- TOC entry 232 (class 1259 OID 16552)
-- Name: board_posts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.board_posts (
    post_id integer NOT NULL,
    user_id integer NOT NULL,
    category_id integer,
    title character varying(255) NOT NULL,
    content text NOT NULL,
    view_count integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_deleted boolean DEFAULT false NOT NULL,
    views integer DEFAULT 0
);


ALTER TABLE public.board_posts OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 16551)
-- Name: board_posts_post_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.board_posts_post_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.board_posts_post_id_seq OWNER TO postgres;

--
-- TOC entry 5050 (class 0 OID 0)
-- Dependencies: 231
-- Name: board_posts_post_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.board_posts_post_id_seq OWNED BY public.board_posts.post_id;


--
-- TOC entry 228 (class 1259 OID 16515)
-- Name: contact_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contact_requests (
    request_id integer NOT NULL,
    user_id integer NOT NULL,
    property_id integer NOT NULL,
    agent_id integer NOT NULL,
    message text,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.contact_requests OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16514)
-- Name: contact_requests_request_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.contact_requests_request_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.contact_requests_request_id_seq OWNER TO postgres;

--
-- TOC entry 5051 (class 0 OID 0)
-- Dependencies: 227
-- Name: contact_requests_request_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.contact_requests_request_id_seq OWNED BY public.contact_requests.request_id;


--
-- TOC entry 226 (class 1259 OID 16495)
-- Name: favorites; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.favorites (
    favorite_id integer NOT NULL,
    user_id integer NOT NULL,
    property_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.favorites OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16494)
-- Name: favorites_favorite_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.favorites_favorite_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.favorites_favorite_id_seq OWNER TO postgres;

--
-- TOC entry 5052 (class 0 OID 0)
-- Dependencies: 225
-- Name: favorites_favorite_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.favorites_favorite_id_seq OWNED BY public.favorites.favorite_id;


--
-- TOC entry 222 (class 1259 OID 16453)
-- Name: properties; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.properties (
    property_id integer NOT NULL,
    agent_id integer NOT NULL,
    address text NOT NULL,
    deposit integer NOT NULL,
    monthly_rent integer NOT NULL,
    maintenance_fee integer DEFAULT 0,
    construction_date date,
    available_from date,
    room_size double precision,
    room_count integer DEFAULT 1,
    bathroom_count integer DEFAULT 1,
    floor integer,
    total_floors integer,
    heating_type public.heating_type,
    property_type public.property_type,
    min_stay_months integer DEFAULT 6,
    has_bed boolean DEFAULT false,
    has_washing_machine boolean DEFAULT false,
    has_refrigerator boolean DEFAULT false,
    has_microwave boolean DEFAULT false,
    has_desk boolean DEFAULT false,
    has_closet boolean DEFAULT false,
    has_air_conditioner boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    city character varying(50) NOT NULL,
    district character varying(50),
    is_active boolean DEFAULT true
);


ALTER TABLE public.properties OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16452)
-- Name: properties_property_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.properties_property_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.properties_property_id_seq OWNER TO postgres;

--
-- TOC entry 5053 (class 0 OID 0)
-- Dependencies: 221
-- Name: properties_property_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.properties_property_id_seq OWNED BY public.properties.property_id;


--
-- TOC entry 224 (class 1259 OID 16481)
-- Name: property_images; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.property_images (
    image_id integer NOT NULL,
    property_id integer NOT NULL,
    image_path character varying(255) NOT NULL,
    is_thumbnail boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.property_images OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16480)
-- Name: property_images_image_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.property_images_image_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.property_images_image_id_seq OWNER TO postgres;

--
-- TOC entry 5054 (class 0 OID 0)
-- Dependencies: 223
-- Name: property_images_image_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.property_images_image_id_seq OWNED BY public.property_images.image_id;


--
-- TOC entry 218 (class 1259 OID 16422)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    username character varying(50) NOT NULL,
    password character varying(255) NOT NULL,
    email character varying(100) NOT NULL,
    phone_number character varying(20) NOT NULL,
    role public.user_role DEFAULT 'user'::public.user_role NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 16421)
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_user_id_seq OWNER TO postgres;

--
-- TOC entry 5055 (class 0 OID 0)
-- Dependencies: 217
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- TOC entry 4798 (class 2604 OID 16439)
-- Name: agents agent_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agents ALTER COLUMN agent_id SET DEFAULT nextval('public.agents_agent_id_seq'::regclass);


--
-- TOC entry 4826 (class 2604 OID 16545)
-- Name: board_categories category_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.board_categories ALTER COLUMN category_id SET DEFAULT nextval('public.board_categories_category_id_seq'::regclass);


--
-- TOC entry 4834 (class 2604 OID 16577)
-- Name: board_comments comment_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.board_comments ALTER COLUMN comment_id SET DEFAULT nextval('public.board_comments_comment_id_seq'::regclass);


--
-- TOC entry 4828 (class 2604 OID 16555)
-- Name: board_posts post_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.board_posts ALTER COLUMN post_id SET DEFAULT nextval('public.board_posts_post_id_seq'::regclass);


--
-- TOC entry 4822 (class 2604 OID 16518)
-- Name: contact_requests request_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contact_requests ALTER COLUMN request_id SET DEFAULT nextval('public.contact_requests_request_id_seq'::regclass);


--
-- TOC entry 4820 (class 2604 OID 16498)
-- Name: favorites favorite_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorites ALTER COLUMN favorite_id SET DEFAULT nextval('public.favorites_favorite_id_seq'::regclass);


--
-- TOC entry 4802 (class 2604 OID 16456)
-- Name: properties property_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.properties ALTER COLUMN property_id SET DEFAULT nextval('public.properties_property_id_seq'::regclass);


--
-- TOC entry 4817 (class 2604 OID 16484)
-- Name: property_images image_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.property_images ALTER COLUMN image_id SET DEFAULT nextval('public.property_images_image_id_seq'::regclass);


--
-- TOC entry 4794 (class 2604 OID 16425)
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- TOC entry 5027 (class 0 OID 16436)
-- Dependencies: 220
-- Data for Name: agents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.agents (agent_id, user_id, license_image, verification_status, company_name, office_address, created_at, updated_at) FROM stdin;
1	1	license_image1.jpg	verified	인하 부동산	인천 미추홀구 인하로 93-1	2025-05-26 05:44:57.808799	2025-05-26 05:44:57.808799
2	2	license_image2.jpg	verified	샘터공인중개사사무소	인천 미추홀구 인하로 97 1층	2025-05-26 05:44:57.808799	2025-05-26 05:44:57.808799
3	3	license_image3.jpg	verified	한그루공인중개사사무소	인천 미추홀구 인하로47번길 42	2025-05-26 05:44:57.808799	2025-05-26 05:44:57.808799
4	4	license_image1.jpg	verified	엘시티대박부동산	부산 해운대구 중동 해운대해변로298번길 29	2025-05-26 05:44:57.808799	2025-05-26 05:44:57.808799
5	5	license_image2.jpg	verified	타이거부동산중개	서울 강남구 논현동 도산대로 176 3층	2025-05-26 05:44:57.808799	2025-05-26 05:44:57.808799
\.


--
-- TOC entry 5037 (class 0 OID 16542)
-- Dependencies: 230
-- Data for Name: board_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.board_categories (category_id, name, description, created_at) FROM stdin;
1	General	General discussions about housing in Korea	2025-05-14 15:13:42.535499
2	Questions	Questions about using the platform or finding housing	2025-05-14 15:13:42.535499
3	Reviews	Reviews of properties or neighborhoods	2025-05-14 15:13:42.535499
4	Tips	Tips for living in Korea as a foreigner	2025-05-14 15:13:42.535499
\.


--
-- TOC entry 5041 (class 0 OID 16574)
-- Dependencies: 234
-- Data for Name: board_comments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.board_comments (comment_id, post_id, user_id, content, created_at, updated_at, is_deleted) FROM stdin;
1	1	1	test	2025-05-26 07:55:38.598635	2025-05-26 07:55:38.598635	f
\.


--
-- TOC entry 5039 (class 0 OID 16552)
-- Dependencies: 232
-- Data for Name: board_posts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.board_posts (post_id, user_id, category_id, title, content, view_count, created_at, updated_at, is_deleted, views) FROM stdin;
1	1	1	general_test	test	0	2025-05-26 07:55:28.528228	2025-05-26 08:37:15.335763	f	13
2	1	2	question_test	test2	0	2025-05-26 08:36:17.716116	2025-05-26 08:37:24.519908	f	8
3	1	3	reviews_test	test	0	2025-05-26 08:37:37.982659	2025-05-26 08:37:37.982659	f	1
4	1	4	tips_test	trest	0	2025-05-26 08:37:48.840709	2025-05-26 08:37:48.840709	f	3
\.


--
-- TOC entry 5035 (class 0 OID 16515)
-- Dependencies: 228
-- Data for Name: contact_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contact_requests (request_id, user_id, property_id, agent_id, message, is_read, created_at, updated_at) FROM stdin;
1	7	1	1	hello	f	2025-05-26 12:07:52.246487	2025-05-26 12:07:52.246487
\.


--
-- TOC entry 5033 (class 0 OID 16495)
-- Dependencies: 226
-- Data for Name: favorites; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.favorites (favorite_id, user_id, property_id, created_at) FROM stdin;
1	2	1	2025-05-26 05:46:08.370687
3	11	13	2025-05-26 13:20:41.057888
4	12	14	2025-05-26 14:13:58.693472
\.


--
-- TOC entry 5029 (class 0 OID 16453)
-- Dependencies: 222
-- Data for Name: properties; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.properties (property_id, agent_id, address, deposit, monthly_rent, maintenance_fee, construction_date, available_from, room_size, room_count, bathroom_count, floor, total_floors, heating_type, property_type, min_stay_months, has_bed, has_washing_machine, has_refrigerator, has_microwave, has_desk, has_closet, has_air_conditioner, created_at, updated_at, city, district, is_active) FROM stdin;
1	1	인하로47번길 71	1000000	500000	100000	2010-05-10	2025-06-01	35	1	1	10	20	central	house	6	t	t	t	f	t	t	t	2025-05-26 05:44:57.808799	2025-05-26 05:44:57.808799	Incheon	미추홀구	t
2	1	인하로67번길 24-8 1층	3000000	300000	150000	1995-08-15	2025-06-15	55	1	1	2	3	district	house	12	t	t	t	t	t	t	t	2025-05-26 05:44:57.808799	2025-05-26 05:44:57.808799	Incheon	미추홀구	t
3	2	인하로47번길 73	5000000	700000	50000	2005-09-01	2025-07-01	25	1	1	2	5	individual	house	3	t	t	f	f	f	f	f	2025-05-26 05:44:57.808799	2025-05-26 05:44:57.808799	Incheon	미추홀구	t
4	2	경인남길102번길 32	2000000	500000	120000	2018-03-01	2025-05-25	45	1	1	8	15	central	house	6	t	t	t	t	t	t	t	2025-05-26 05:44:57.808799	2025-05-26 05:44:57.808799	Incheon	미추홀구	t
5	3	인하로91번길 57-14	700000	450000	70000	2012-06-10	2025-06-10	30	1	1	3	10	individual	house	6	f	t	t	f	f	f	f	2025-05-26 05:44:57.808799	2025-05-26 05:44:57.808799	Incheon	미추홀구	t
6	3	경인남길 48	6000000	550000	100000	2017-10-05	2025-07-01	40	1	1	5	12	district	house	12	t	t	t	t	t	t	t	2025-05-26 05:44:57.808799	2025-05-26 05:44:57.808799	Incheon	미추홀구	t
7	1	인하로67번길 24-31 4층	20000000	1050000	150000	1995-08-15	2025-06-15	55	1	1	2	3	district	house	12	t	t	t	t	t	t	t	2025-05-26 05:44:57.808799	2025-05-26 05:44:57.808799	Incheon	미추홀구	t
8	2	인하로91번길 6	1000000	800000	50000	2005-09-01	2025-07-01	25	1	1	2	5	individual	house	3	t	t	f	f	f	f	f	2025-05-26 05:44:57.808799	2025-05-26 05:44:57.808799	Incheon	미추홀구	t
9	3	경인남길102번길 90	3000000	900000	120000	2018-03-01	2025-05-25	45	1	1	8	15	central	house	6	t	t	t	t	t	t	t	2025-05-26 05:44:57.808799	2025-05-26 05:44:57.808799	Incheon	미추홀구	t
10	1	인하로91번길 24	950000	950000	70000	2012-06-10	2025-06-10	30	1	1	3	10	individual	house	6	f	t	t	f	f	f	f	2025-05-26 05:44:57.808799	2025-05-26 05:44:57.808799	Incheon	미추홀구	t
11	2	경인남길118번길 52-1	700000	700000	100000	2017-10-05	2025-07-01	40	1	1	5	12	district	house	12	t	t	t	t	t	t	t	2025-05-26 05:44:57.808799	2025-05-26 05:44:57.808799	Incheon	미추홀구	t
12	3	인하로77번길 12	1000000	900000	100000	2010-05-10	2025-06-01	35	1	1	10	20	central	house	6	t	t	t	f	t	t	t	2025-05-26 05:44:57.808799	2025-05-26 05:44:57.808799	Incheon	미추홀구	t
13	4	해운대해변로298번길 29	900000	900000	100000	2010-05-10	2025-06-01	35	1	1	10	20	central	house	6	t	t	t	f	t	t	t	2025-05-26 05:44:57.808799	2025-05-26 05:44:57.808799	Busan	해운대구	t
14	4	해운대해변로298번길 25	20000000	1300000	150000	1995-08-15	2025-06-15	55	1	1	2	3	district	house	12	t	t	t	t	t	t	t	2025-05-26 05:44:57.808799	2025-05-26 05:44:57.808799	Busan	해운대구	t
\.


--
-- TOC entry 5031 (class 0 OID 16481)
-- Dependencies: 224
-- Data for Name: property_images; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.property_images (image_id, property_id, image_path, is_thumbnail, created_at) FROM stdin;
2	1	property_images1_2.png	f	2025-05-26 05:44:57.808799
3	1	property_images1_3.png	f	2025-05-26 05:44:57.808799
1	1	property_images1_1.png	t	2025-05-26 05:44:57.808799
4	2	property_images2_1.png	t	2025-05-26 05:44:57.808799
5	2	property_images2_2.png	f	2025-05-26 05:44:57.808799
6	3	property_images3_1.png	t	2025-05-26 05:44:57.808799
7	3	property_images3_2.png	f	2025-05-26 05:44:57.808799
8	3	property_images3_3.png	f	2025-05-26 05:44:57.808799
9	4	property_images4_1.png	t	2025-05-26 05:44:57.808799
10	4	property_images4_2.png	f	2025-05-26 05:44:57.808799
11	5	property_images5_1.png	t	2025-05-26 05:44:57.808799
12	5	property_images5_2.png	f	2025-05-26 05:44:57.808799
13	5	property_images5_3.png	f	2025-05-26 05:44:57.808799
14	6	property_images6_1.png	t	2025-05-26 05:44:57.808799
15	6	property_images6_2.png	f	2025-05-26 05:44:57.808799
16	6	property_images6_3.png	f	2025-05-26 05:44:57.808799
17	7	property_images7_1.png	t	2025-05-26 05:44:57.808799
18	7	property_images7_2.png	f	2025-05-26 05:44:57.808799
19	7	property_images7_3.png	f	2025-05-26 05:44:57.808799
20	8	property_images8_1.png	t	2025-05-26 05:44:57.808799
21	8	property_images8_2.png	f	2025-05-26 05:44:57.808799
22	8	property_images8_3.png	f	2025-05-26 05:44:57.808799
23	9	property_images9_1.png	t	2025-05-26 05:44:57.808799
24	9	property_images9_2.png	f	2025-05-26 05:44:57.808799
25	9	property_images9_3.png	f	2025-05-26 05:44:57.808799
26	10	property_images10_1.png	t	2025-05-26 05:44:57.808799
27	10	property_images10_2.png	f	2025-05-26 05:44:57.808799
28	10	property_images10_3.png	f	2025-05-26 05:44:57.808799
29	11	property_images11_1.png	t	2025-05-26 05:44:57.808799
30	11	property_images11_2.png	f	2025-05-26 05:44:57.808799
31	11	property_images11_3.png	f	2025-05-26 05:44:57.808799
32	12	property_images12_1.png	t	2025-05-26 05:44:57.808799
33	12	property_images12_2.png	f	2025-05-26 05:44:57.808799
34	12	property_images12_3.png	f	2025-05-26 05:44:57.808799
35	13	property_images13_1.png	t	2025-05-26 05:44:57.808799
36	13	property_images13_2.png	f	2025-05-26 05:44:57.808799
37	13	property_images13_3.png	f	2025-05-26 05:44:57.808799
38	14	property_images14_1.png	t	2025-05-26 05:44:57.808799
39	14	property_images14_2.png	f	2025-05-26 05:44:57.808799
40	14	property_images14_3.png	f	2025-05-26 05:44:57.808799
\.


--
-- TOC entry 5025 (class 0 OID 16422)
-- Dependencies: 218
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (user_id, username, password, email, phone_number, role, created_at, updated_at) FROM stdin;
7	test1	$2b$10$9SzXsEiwAkCwPP5ZFklRdewkvDfPYB/I8b01cMQgfkSkiKWnNlIEy	test1@gmail.com	010-1234-4567	user	2025-05-26 06:18:28.515201	2025-05-26 06:18:28.515201
1	agent1	$2b$10$9SzXsEiwAkCwPP5ZFklRdewkvDfPYB/I8b01cMQgfkSkiKWnNlIEy	agent1@rumos.com	010-1234-0001	agent	2025-05-26 05:44:57.808799	2025-05-26 05:44:57.808799
2	agent2	$2b$10$RdZkF8gk5McXIZV5DiJODeRk3dRFYyhgoVOV0v9Y6q41Y4m5XTL/y	agent2@rumos.com	010-1234-0002	agent	2025-05-26 05:44:57.808799	2025-05-26 05:44:57.808799
3	agent3	$2b$10$9SzXsEiwAkCwPP5ZFklRdewkvDfPYB/I8b01cMQgfkSkiKWnNlIEy	agent3@rumos.com	010-1234-0003	agent	2025-05-26 05:44:57.808799	2025-05-26 05:44:57.808799
4	agent4	$2b$10$RdZkF8gk5McXIZV5DiJODeRk3dRFYyhgoVOV0v9Y6q41Y4m5XTL/y	agent4@rumos.com	010-1234-0004	agent	2025-05-26 05:44:57.808799	2025-05-26 05:44:57.808799
5	agent5	$2b$10$9SzXsEiwAkCwPP5ZFklRdewkvDfPYB/I8b01cMQgfkSkiKWnNlIEy	agent5@rumos.com	010-1234-0005	agent	2025-05-26 05:44:57.808799	2025-05-26 05:44:57.808799
6	test	$2b$10$RdZkF8gk5McXIZV5DiJODeRk3dRFYyhgoVOV0v9Y6q41Y4m5XTL/y	test1@rumos.com	010-1234-1111	user	2025-05-26 05:56:07.947133	2025-05-26 05:56:07.947133
9	test2	$2b$10$QB9irJ6QXqh4O/yXi1E.HucuPetGLS3hF4Z/RDbEwnE5JHyWNZCUe	test2@gmail.com	010-2222-2222	user	2025-05-26 12:56:12.119403	2025-05-26 12:56:12.119403
10	test50	$2b$10$G7h2vtKSTc8uK3fB/TY74u5g2iEteqWfyPn3LFOtcy4gxx75jog22	test@gmail.com	010-1234-4567	user	2025-05-26 13:13:12.933558	2025-05-26 13:13:12.933558
11	test70	$2b$10$d2GRWv9QBisM5IK3V3uoYOV2ayg0WzIEtvRCZ9FtyNVz5NFhQHL32	testfd@gmail.com	010-4123-4567	user	2025-05-26 13:19:36.647062	2025-05-26 13:19:36.647062
12	test54	$2b$10$C9vDVczBxv8xwnuBm/b5M.8wAfQNgGb6l87jyXzUPBjYhtmHpN7ty	test12@gmail.com	010-7777-8888	user	2025-05-26 14:13:06.509552	2025-05-26 14:13:06.509552
\.


--
-- TOC entry 5056 (class 0 OID 0)
-- Dependencies: 219
-- Name: agents_agent_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.agents_agent_id_seq', 5, true);


--
-- TOC entry 5057 (class 0 OID 0)
-- Dependencies: 229
-- Name: board_categories_category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.board_categories_category_id_seq', 8, true);


--
-- TOC entry 5058 (class 0 OID 0)
-- Dependencies: 233
-- Name: board_comments_comment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.board_comments_comment_id_seq', 3, true);


--
-- TOC entry 5059 (class 0 OID 0)
-- Dependencies: 231
-- Name: board_posts_post_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.board_posts_post_id_seq', 6, true);


--
-- TOC entry 5060 (class 0 OID 0)
-- Dependencies: 227
-- Name: contact_requests_request_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.contact_requests_request_id_seq', 1, true);


--
-- TOC entry 5061 (class 0 OID 0)
-- Dependencies: 225
-- Name: favorites_favorite_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.favorites_favorite_id_seq', 4, true);


--
-- TOC entry 5062 (class 0 OID 0)
-- Dependencies: 221
-- Name: properties_property_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.properties_property_id_seq', 16, true);


--
-- TOC entry 5063 (class 0 OID 0)
-- Dependencies: 223
-- Name: property_images_image_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.property_images_image_id_seq', 40, true);


--
-- TOC entry 5064 (class 0 OID 0)
-- Dependencies: 217
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_user_id_seq', 12, true);


--
-- TOC entry 4845 (class 2606 OID 16446)
-- Name: agents agents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agents
    ADD CONSTRAINT agents_pkey PRIMARY KEY (agent_id);


--
-- TOC entry 4862 (class 2606 OID 16550)
-- Name: board_categories board_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.board_categories
    ADD CONSTRAINT board_categories_pkey PRIMARY KEY (category_id);


--
-- TOC entry 4866 (class 2606 OID 16583)
-- Name: board_comments board_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.board_comments
    ADD CONSTRAINT board_comments_pkey PRIMARY KEY (comment_id);


--
-- TOC entry 4864 (class 2606 OID 16562)
-- Name: board_posts board_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.board_posts
    ADD CONSTRAINT board_posts_pkey PRIMARY KEY (post_id);


--
-- TOC entry 4860 (class 2606 OID 16525)
-- Name: contact_requests contact_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contact_requests
    ADD CONSTRAINT contact_requests_pkey PRIMARY KEY (request_id);


--
-- TOC entry 4855 (class 2606 OID 16501)
-- Name: favorites favorites_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_pkey PRIMARY KEY (favorite_id);


--
-- TOC entry 4857 (class 2606 OID 16503)
-- Name: favorites favorites_user_id_property_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_user_id_property_id_key UNIQUE (user_id, property_id);


--
-- TOC entry 4850 (class 2606 OID 16474)
-- Name: properties properties_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.properties
    ADD CONSTRAINT properties_pkey PRIMARY KEY (property_id);


--
-- TOC entry 4853 (class 2606 OID 16488)
-- Name: property_images property_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.property_images
    ADD CONSTRAINT property_images_pkey PRIMARY KEY (image_id);


--
-- TOC entry 4839 (class 2606 OID 16434)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4841 (class 2606 OID 16430)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- TOC entry 4843 (class 2606 OID 16432)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 4858 (class 1259 OID 16597)
-- Name: idx_favorites_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_favorites_user_id ON public.favorites USING btree (user_id);


--
-- TOC entry 4846 (class 1259 OID 16594)
-- Name: idx_properties_city; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_properties_city ON public.properties USING btree (city);


--
-- TOC entry 4847 (class 1259 OID 16595)
-- Name: idx_properties_deposit; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_properties_deposit ON public.properties USING btree (deposit);


--
-- TOC entry 4848 (class 1259 OID 16596)
-- Name: idx_properties_monthly_rent; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_properties_monthly_rent ON public.properties USING btree (monthly_rent);


--
-- TOC entry 4851 (class 1259 OID 16598)
-- Name: idx_property_images_property_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_property_images_property_id ON public.property_images USING btree (property_id);


--
-- TOC entry 4867 (class 2606 OID 16447)
-- Name: agents agents_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agents
    ADD CONSTRAINT agents_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 4877 (class 2606 OID 16584)
-- Name: board_comments board_comments_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.board_comments
    ADD CONSTRAINT board_comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.board_posts(post_id) ON DELETE CASCADE;


--
-- TOC entry 4878 (class 2606 OID 16589)
-- Name: board_comments board_comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.board_comments
    ADD CONSTRAINT board_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 4875 (class 2606 OID 16568)
-- Name: board_posts board_posts_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.board_posts
    ADD CONSTRAINT board_posts_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.board_categories(category_id) ON DELETE SET NULL;


--
-- TOC entry 4876 (class 2606 OID 16563)
-- Name: board_posts board_posts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.board_posts
    ADD CONSTRAINT board_posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 4872 (class 2606 OID 16536)
-- Name: contact_requests contact_requests_agent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contact_requests
    ADD CONSTRAINT contact_requests_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.agents(agent_id) ON DELETE CASCADE;


--
-- TOC entry 4873 (class 2606 OID 16531)
-- Name: contact_requests contact_requests_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contact_requests
    ADD CONSTRAINT contact_requests_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(property_id) ON DELETE CASCADE;


--
-- TOC entry 4874 (class 2606 OID 16526)
-- Name: contact_requests contact_requests_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contact_requests
    ADD CONSTRAINT contact_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 4870 (class 2606 OID 16509)
-- Name: favorites favorites_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(property_id) ON DELETE CASCADE;


--
-- TOC entry 4871 (class 2606 OID 16504)
-- Name: favorites favorites_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 4868 (class 2606 OID 16475)
-- Name: properties properties_agent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.properties
    ADD CONSTRAINT properties_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.agents(agent_id) ON DELETE CASCADE;


--
-- TOC entry 4869 (class 2606 OID 16489)
-- Name: property_images property_images_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.property_images
    ADD CONSTRAINT property_images_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(property_id) ON DELETE CASCADE;


-- Completed on 2025-05-26 20:02:08

--
-- PostgreSQL database dump complete
--

