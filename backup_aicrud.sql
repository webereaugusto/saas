--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5 (Debian 17.5-1.pgdg120+1)
-- Dumped by pg_dump version 17.5 (Debian 17.5-1.pgdg120+1)

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
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'USER',
    'ADMIN'
);


ALTER TYPE public."Role" OWNER TO postgres;

--
-- Name: SubStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."SubStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'PAST_DUE',
    'CANCELED'
);


ALTER TYPE public."SubStatus" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Account; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Account" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    provider text NOT NULL,
    "providerAccountId" text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at integer,
    token_type text,
    scope text,
    id_token text,
    session_state text
);


ALTER TABLE public."Account" OWNER TO postgres;

--
-- Name: Chat; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Chat" (
    id text NOT NULL,
    title text NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Chat" OWNER TO postgres;

--
-- Name: Message; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Message" (
    id text NOT NULL,
    content text NOT NULL,
    role text NOT NULL,
    "chatId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Message" OWNER TO postgres;

--
-- Name: Session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Session" (
    id text NOT NULL,
    "sessionToken" text NOT NULL,
    "userId" text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Session" OWNER TO postgres;

--
-- Name: Subscription; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Subscription" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "stripeCustomerId" text,
    "stripePriceId" text,
    "stripeSubscriptionId" text,
    status public."SubStatus" DEFAULT 'INACTIVE'::public."SubStatus" NOT NULL,
    "currentPeriodEnd" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Subscription" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text,
    email text,
    "emailVerified" timestamp(3) without time zone,
    image text,
    password text,
    role public."Role" DEFAULT 'USER'::public."Role" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Data for Name: Account; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Account" (id, "userId", type, provider, "providerAccountId", refresh_token, access_token, expires_at, token_type, scope, id_token, session_state) FROM stdin;
\.


--
-- Data for Name: Chat; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Chat" (id, title, "userId", "createdAt", "updatedAt") FROM stdin;
cmazfuaj90002ggio8a1vv8il	"A lenda do futebol brasileiro"	cmazftxgt0000ggionbb605pi	2025-05-22 13:59:17.203	2025-05-22 13:59:25.172
cmazfurqf0008ggioa2n5q3s0	Joseph Pilates: O Criador do Pilates	cmazftxgt0000ggionbb605pi	2025-05-22 13:59:39.495	2025-05-22 13:59:47.958
\.


--
-- Data for Name: Message; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Message" (id, content, role, "chatId", "createdAt") FROM stdin;
cmazfufxx0004ggiosbi8ac9j	quem ├® pel├® ?	user	cmazfuaj90002ggio8a1vv8il	2025-05-22 13:59:24.214
cmazfuhsh0006ggiohd5c9tfd	Pel├® ├® um ex-jogador de futebol brasileiro, considerado por muitos como um dos maiores jogadores de todos os tempos. Ele ├® reconhecido por suas conquistas, habilidades e contribui├º├Áes para o esporte. Pel├® conquistou tr├¬s Copas do Mundo com a sele├º├úo brasileira e marcou mais de 1.000 gols ao longo de sua carreira. Ele ├® uma lenda do futebol e ├® amplamente respeitado e reverenciado no mundo esportivo.	assistant	cmazfuaj90002ggio8a1vv8il	2025-05-22 13:59:26.609
cmazfuxgi000aggiouetx7p46	quem ├® joseph pilates	user	cmazfurqf0008ggioa2n5q3s0	2025-05-22 13:59:46.913
cmazfuzg1000cggio78q2ngwu	Joseph Pilates foi um alem├úo que desenvolveu um m├®todo de exerc├¡cios f├¡sicos que hoje ├® conhecido como Pilates. Ele criou essa t├®cnica no in├¡cio do s├®culo XX, com o objetivo de fortalecer o corpo e a mente, melhorar a postura e aumentar a flexibilidade. O Pilates ├® hoje uma pr├ítica muito popular em todo o mundo, sendo utilizado por pessoas de todas as idades e condi├º├Áes f├¡sicas.	assistant	cmazfurqf0008ggioa2n5q3s0	2025-05-22 13:59:49.489
\.


--
-- Data for Name: Session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Session" (id, "sessionToken", "userId", expires) FROM stdin;
\.


--
-- Data for Name: Subscription; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Subscription" (id, "userId", "stripeCustomerId", "stripePriceId", "stripeSubscriptionId", status, "currentPeriodEnd", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, name, email, "emailVerified", image, password, role, "createdAt", "updatedAt") FROM stdin;
cmazftxgt0000ggionbb605pi	weber	webereaugusto@yahoo.com.br	\N	\N	$2b$10$epaxHHkpNE7KgpUE9NEgSuEyk/d/vp9I31t3UCvb7mjB1DY4uTXVC	USER	2025-05-22 13:59:00.263	2025-05-22 13:59:00.263
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
01f52c54-c2da-45d1-b344-c359df7b40ae	93d2814b4d4561311e2e4b83ef1ca919eda15c21e321005ee66e16f1289869ce	2025-05-22 13:56:32.072822+00	20250521193943_init	\N	\N	2025-05-22 13:56:32.041367+00	1
\.


--
-- Name: Account Account_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_pkey" PRIMARY KEY (id);


--
-- Name: Chat Chat_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Chat"
    ADD CONSTRAINT "Chat_pkey" PRIMARY KEY (id);


--
-- Name: Message Message_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_pkey" PRIMARY KEY (id);


--
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);


--
-- Name: Subscription Subscription_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Account_provider_providerAccountId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON public."Account" USING btree (provider, "providerAccountId");


--
-- Name: Session_sessionToken_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Session_sessionToken_key" ON public."Session" USING btree ("sessionToken");


--
-- Name: Subscription_stripeCustomerId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Subscription_stripeCustomerId_key" ON public."Subscription" USING btree ("stripeCustomerId");


--
-- Name: Subscription_stripeSubscriptionId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_key" ON public."Subscription" USING btree ("stripeSubscriptionId");


--
-- Name: Subscription_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Subscription_userId_key" ON public."Subscription" USING btree ("userId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: Account Account_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Chat Chat_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Chat"
    ADD CONSTRAINT "Chat_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Message Message_chatId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES public."Chat"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Session Session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Subscription Subscription_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

